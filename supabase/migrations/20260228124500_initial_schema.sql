create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_url text,
  phone text,
  role text not null default 'guest' check (role in ('guest', 'host', 'admin')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.cabins (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  slug text not null unique,
  description text,
  country text,
  city text,
  address text,
  price_per_night numeric(10,2) not null check (price_per_night >= 0),
  cleaning_fee numeric(10,2) not null default 0 check (cleaning_fee >= 0),
  max_guests integer not null check (max_guests > 0),
  bedrooms integer not null default 1 check (bedrooms > 0),
  baths numeric(3,1) not null default 1 check (baths > 0),
  cover_image_url text,
  amenities jsonb not null default '[]'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.cabin_images (
  id uuid primary key default gen_random_uuid(),
  cabin_id uuid not null references public.cabins (id) on delete cascade,
  image_url text not null,
  alt_text text,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  cabin_id uuid not null references public.cabins (id) on delete cascade,
  guest_id uuid not null references public.profiles (id) on delete cascade,
  start_date date not null,
  end_date date not null,
  guests_count integer not null check (guests_count > 0),
  total_price numeric(10,2) not null check (total_price >= 0),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled', 'completed')),
  special_requests text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint valid_booking_range check (end_date > start_date)
);

create index if not exists cabins_owner_id_idx on public.cabins (owner_id);
create index if not exists cabins_status_idx on public.cabins (status);
create index if not exists cabin_images_cabin_id_idx on public.cabin_images (cabin_id);
create index if not exists bookings_cabin_id_idx on public.bookings (cabin_id);
create index if not exists bookings_guest_id_idx on public.bookings (guest_id);
create index if not exists bookings_dates_idx on public.bookings (start_date, end_date);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

drop trigger if exists cabins_set_updated_at on public.cabins;
create trigger cabins_set_updated_at
before update on public.cabins
for each row execute procedure public.set_updated_at();

drop trigger if exists bookings_set_updated_at on public.bookings;
create trigger bookings_set_updated_at
before update on public.bookings
for each row execute procedure public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.cabins enable row level security;
alter table public.cabin_images enable row level security;
alter table public.bookings enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "cabins_select_published" on public.cabins;
create policy "cabins_select_published"
on public.cabins
for select
using (status = 'published' or auth.uid() = owner_id);

drop policy if exists "cabins_insert_authenticated" on public.cabins;
create policy "cabins_insert_authenticated"
on public.cabins
for insert
to authenticated
with check (auth.uid() = owner_id);

drop policy if exists "cabins_update_owner" on public.cabins;
create policy "cabins_update_owner"
on public.cabins
for update
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "cabins_delete_owner" on public.cabins;
create policy "cabins_delete_owner"
on public.cabins
for delete
using (auth.uid() = owner_id);

drop policy if exists "cabin_images_select_published" on public.cabin_images;
create policy "cabin_images_select_published"
on public.cabin_images
for select
using (
  exists (
    select 1
    from public.cabins
    where public.cabins.id = cabin_id
      and (public.cabins.status = 'published' or public.cabins.owner_id = auth.uid())
  )
);

drop policy if exists "cabin_images_manage_owner" on public.cabin_images;
create policy "cabin_images_manage_owner"
on public.cabin_images
for all
to authenticated
using (
  exists (
    select 1
    from public.cabins
    where public.cabins.id = cabin_id
      and public.cabins.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.cabins
    where public.cabins.id = cabin_id
      and public.cabins.owner_id = auth.uid()
  )
);

drop policy if exists "bookings_select_guest_or_owner" on public.bookings;
create policy "bookings_select_guest_or_owner"
on public.bookings
for select
using (
  auth.uid() = guest_id
  or exists (
    select 1
    from public.cabins
    where public.cabins.id = cabin_id
      and public.cabins.owner_id = auth.uid()
  )
);

drop policy if exists "bookings_insert_guest" on public.bookings;
create policy "bookings_insert_guest"
on public.bookings
for insert
to authenticated
with check (auth.uid() = guest_id);

drop policy if exists "bookings_update_guest_or_owner" on public.bookings;
create policy "bookings_update_guest_or_owner"
on public.bookings
for update
using (
  auth.uid() = guest_id
  or exists (
    select 1
    from public.cabins
    where public.cabins.id = cabin_id
      and public.cabins.owner_id = auth.uid()
  )
)
with check (
  auth.uid() = guest_id
  or exists (
    select 1
    from public.cabins
    where public.cabins.id = cabin_id
      and public.cabins.owner_id = auth.uid()
  )
);

