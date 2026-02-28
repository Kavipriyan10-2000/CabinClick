create extension if not exists "pgcrypto";

drop trigger if exists on_auth_user_created on auth.users;

drop table if exists public.bookings cascade;
drop table if exists public.cabin_images cascade;
drop table if exists public.cabins cascade;
drop table if exists public.profiles cascade;

drop function if exists public.handle_new_user() cascade;
drop function if exists public.set_updated_at() cascade;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.flights (
  id uuid primary key default gen_random_uuid(),
  flight_number text not null,
  origin text not null,
  destination text not null,
  departure_date date not null,
  status text not null default 'registered' check (
    status in ('registered', 'active', 'completed', 'cancelled')
  ),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (flight_number, departure_date)
);

create table if not exists public.seat_access_sessions (
  id uuid primary key default gen_random_uuid(),
  flight_id uuid not null references public.flights (id) on delete cascade,
  seat_number text not null,
  qr_token_hash text not null,
  device_label text,
  preferred_language text,
  status text not null default 'active' check (
    status in ('active', 'expired')
  ),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.passenger_requests (
  id uuid primary key default gen_random_uuid(),
  flight_id uuid not null references public.flights (id) on delete cascade,
  seat_access_session_id uuid references public.seat_access_sessions (id) on delete set null,
  seat_number text not null,
  category text not null,
  source text not null default 'typed' check (
    source in ('typed', 'speech', 'quick_action')
  ),
  request_text text not null,
  status text not null default 'submitted' check (
    status in ('submitted', 'being_served', 'completed', 'cancelled')
  ),
  source_language text,
  translated_text text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.crew_members (
  id uuid primary key default gen_random_uuid(),
  flight_id uuid not null references public.flights (id) on delete cascade,
  crew_member_code text not null,
  full_name text not null,
  role text not null check (
    role in ('purser', 'lead', 'attendant')
  ),
  device_id text,
  assigned_zone text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (flight_id, crew_member_code)
);

create table if not exists public.crew_access_sessions (
  id uuid primary key default gen_random_uuid(),
  flight_id uuid not null references public.flights (id) on delete cascade,
  crew_member_id uuid not null references public.crew_members (id) on delete cascade,
  device_id text not null,
  status text not null default 'active' check (
    status in ('active', 'inactive')
  ),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.crew_instructions (
  id uuid primary key default gen_random_uuid(),
  flight_id uuid not null references public.flights (id) on delete cascade,
  crew_member_id uuid references public.crew_members (id) on delete set null,
  title text not null,
  instruction_text text not null,
  seat_numbers text[] not null default '{}',
  priority text not null default 'medium' check (
    priority in ('low', 'medium', 'high')
  ),
  status text not null default 'open' check (
    status in ('open', 'assigned', 'acknowledged', 'completed')
  ),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.crew_instruction_requests (
  instruction_id uuid not null references public.crew_instructions (id) on delete cascade,
  request_id uuid not null references public.passenger_requests (id) on delete cascade,
  primary key (instruction_id, request_id)
);

create index if not exists flights_status_idx on public.flights (status);
create index if not exists seat_access_sessions_flight_seat_idx
  on public.seat_access_sessions (flight_id, seat_number, created_at desc);
create index if not exists passenger_requests_flight_status_idx
  on public.passenger_requests (flight_id, status, created_at desc);
create index if not exists passenger_requests_flight_seat_idx
  on public.passenger_requests (flight_id, seat_number, created_at desc);
create index if not exists crew_members_flight_idx
  on public.crew_members (flight_id);
create index if not exists crew_access_sessions_flight_idx
  on public.crew_access_sessions (flight_id, created_at desc);
create index if not exists crew_instructions_flight_status_idx
  on public.crew_instructions (flight_id, status, created_at desc);
create index if not exists crew_instruction_requests_request_idx
  on public.crew_instruction_requests (request_id);

drop trigger if exists flights_set_updated_at on public.flights;
create trigger flights_set_updated_at
before update on public.flights
for each row execute procedure public.set_updated_at();

drop trigger if exists seat_access_sessions_set_updated_at on public.seat_access_sessions;
create trigger seat_access_sessions_set_updated_at
before update on public.seat_access_sessions
for each row execute procedure public.set_updated_at();

drop trigger if exists passenger_requests_set_updated_at on public.passenger_requests;
create trigger passenger_requests_set_updated_at
before update on public.passenger_requests
for each row execute procedure public.set_updated_at();

drop trigger if exists crew_members_set_updated_at on public.crew_members;
create trigger crew_members_set_updated_at
before update on public.crew_members
for each row execute procedure public.set_updated_at();

drop trigger if exists crew_instructions_set_updated_at on public.crew_instructions;
create trigger crew_instructions_set_updated_at
before update on public.crew_instructions
for each row execute procedure public.set_updated_at();

grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update, delete on table public.flights to anon, authenticated, service_role;
grant select, insert, update, delete on table public.seat_access_sessions to anon, authenticated, service_role;
grant select, insert, update, delete on table public.passenger_requests to anon, authenticated, service_role;
grant select, insert, update, delete on table public.crew_members to anon, authenticated, service_role;
grant select, insert, update, delete on table public.crew_access_sessions to anon, authenticated, service_role;
grant select, insert, update, delete on table public.crew_instructions to anon, authenticated, service_role;
grant select, insert, update, delete on table public.crew_instruction_requests to anon, authenticated, service_role;

create or replace view public.management_request_summary as
select
  f.id as flight_id,
  f.flight_number,
  f.departure_date,
  count(pr.id) as total_requests,
  count(distinct pr.seat_number) as active_seats,
  count(*) filter (where pr.status = 'submitted') as submitted_requests,
  count(*) filter (where pr.status = 'being_served') as being_served_requests,
  count(*) filter (where pr.status = 'completed') as completed_requests
from public.flights f
left join public.passenger_requests pr on pr.flight_id = f.id
group by f.id, f.flight_number, f.departure_date;

create or replace view public.management_request_category_summary as
select
  pr.flight_id,
  pr.category,
  count(*) as total_requests
from public.passenger_requests pr
group by pr.flight_id, pr.category;

grant select on table public.management_request_summary to anon, authenticated, service_role;
grant select on table public.management_request_category_summary to anon, authenticated, service_role;
