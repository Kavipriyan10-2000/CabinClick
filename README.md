# Cabin Crew Dispatch Backend

This repository now includes a FastAPI backend for an airline crew-assistance workflow, wired to a Supabase schema for the MVP flows.

## Implemented API surface

- `GET /api/v1/health`
  - Simple health check for local development and deployment probes.
- `POST /api/v1/flights/register`
  - Registers the active flight for the current app session.
- `POST /api/v1/seats/{seat_number}/access`
  - Passenger QR-entry route that stores seat access for the active flight.
- `GET /api/v1/seats/{seat_number}/requests`
  - Returns previous requests made from that seat on the active flight.
- `POST /api/v1/seats/{seat_number}/requests`
  - Creates a new passenger request in Supabase.
- `POST /api/v1/seats/{seat_number}/voice-requests`
  - Uploads passenger audio, converts it into structured actions plus a passenger-language message, and stores the request.
- `POST /api/v1/crew/access`
  - Registers crew iPad access for the active flight.
- `GET /api/v1/crew/members`
  - Returns the crew roster for the active flight.
- `GET /api/v1/crew/instructions`
  - Returns the instruction feed for the active flight.
- `GET /api/v1/management/requests/summary`
  - Returns a management summary derived from Supabase views.

## Screen architecture

### Passenger screen

- QR-driven seat access scoped by `seat_number`
- Request history for the current seat
- New request submission
- Voice request submission with AI extraction

### Crew screen

- iPad access handshake
- Crew roster
- Instruction feed localized to the crew device language

### Management screen

- Request summary across the active flight

## Project structure

- `app/main.py`
  - FastAPI application entry point.
- `app/api/routes/`
  - Route handlers for health, flights, passenger access, crew operations, and management.
- `app/schemas/`
  - Request and response models shared with the frontend.
- `app/services/`
  - Supabase-backed service layer for the MVP routes.
- `tests/test_api.py`
  - Route contract tests that patch the service layer.

## Run locally

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API will be available at `http://127.0.0.1:8000`, with Swagger docs at `http://127.0.0.1:8000/docs`.

## Supabase Wiring

The backend now loads Supabase configuration from `.env.local` through [config.py](/Users/akshitbhatia/PycharmProjects/CabinClick/app/core/config.py) and exposes a reusable client in [supabase.py](/Users/akshitbhatia/PycharmProjects/CabinClick/app/db/supabase.py).

Current behavior:

- The backend prefers `SUPABASE_SERVICE_ROLE_KEY` when present.
- If no service-role key is set, it falls back to `SUPABASE_ANON_KEY`.
- Your current `.env.local` already contains the project URL, publishable key, and anon key.

For the hackathon MVP, the migration grants table access to `anon`, `authenticated`, and `service_role` so the backend can function even if you only have the anon key. `SUPABASE_SERVICE_ROLE_KEY` is still the safer backend option.

## Supabase Schema

The airline MVP schema now lives in [20260228170000_airline_mvp_schema.sql](/Users/akshitbhatia/PycharmProjects/CabinClick/supabase/migrations/20260228170000_airline_mvp_schema.sql). It creates:

- `flights`
- `seat_access_sessions`
- `passenger_requests`
- `crew_members`
- `crew_access_sessions`
- `crew_instructions`
- `crew_instruction_requests`
- `management_request_summary` and `management_request_category_summary` views

The old cabin/bootstrap tables are explicitly dropped in that migration because they do not belong to this project anymore.

## Auto-Instructions

Passenger submissions now drive instruction creation automatically:

- On every `POST /api/v1/seats/{seat_number}/requests`, the backend checks pending requests.
- If there are 10+ pending requests or the oldest pending request has been waiting 5+ minutes, those requests are bundled into one `crew_instructions` row (max 10 per instruction).
- The linked requests are marked `being_served`, and the crew devices read those rows via `GET /api/v1/crew/instructions`.
- Voice requests keep the passenger-facing text in the original language, store an English crew summary in `translated_text`, and preserve structured action items in `metadata.action_items`.
- Crew devices can pass `crew_member_code` or `preferred_language` to `GET /api/v1/crew/instructions` so the response text is localized for that device.

The same check runs before each `GET /api/v1/crew/instructions`, so the crew device will see a fresh instruction once the criteria are met.

## Testing In Swagger Docs

After starting the server and opening `/docs`, test the MVP flow in this order:

1. `POST /api/v1/flights/register`
2. `POST /api/v1/seats/14C/access`
3. `POST /api/v1/seats/14C/requests`
4. `GET /api/v1/seats/14C/requests`
5. `POST /api/v1/crew/access`
6. `GET /api/v1/crew/members`
7. `GET /api/v1/crew/instructions`
8. `GET /api/v1/management/requests/summary`

## Environment

Copy `.env.example` to `.env.local` or export the variables directly. The FastAPI scaffold currently uses:

- `APP_NAME`
- `APP_VERSION`
- `API_V1_PREFIX`
- `CORS_ORIGINS`

The existing Supabase and GCP variables remain documented for the rest of the repository.

Additional AI-specific variables used by the voice flow:

- `DEFAULT_LANGUAGE`
- `GEMINI_API_KEY`
- `GEMINI_MODEL`
