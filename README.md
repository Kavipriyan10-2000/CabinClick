# Cabin Crew Dispatch Backend

This repository now includes a starter FastAPI backend for an airline crew-assistance workflow. The backend is intentionally shallow so the frontend can integrate against stable HTTP contracts while the real QR validation, translation, request handling, and device delivery logic is added later.

## Implemented API surface

- `GET /api/v1/health`
  - Simple health check for local development and deployment probes.
- `POST /api/v1/flights/register`
  - Registers the active flight/app session for the current run.
- `POST /api/v1/seats/{seat_number}/access`
  - Passenger QR-entry route that opens the seat-specific experience without a traditional login flow.
- `GET /api/v1/seats/{seat_number}/requests`
  - Returns previous requests made from that seat.
- `POST /api/v1/seats/{seat_number}/requests`
  - Creates a new passenger request from the phone screen.
- `POST /api/v1/crew/access`
  - Registers crew access from the iPad or handheld device.
- `GET /api/v1/crew/members`
  - Returns the current crew roster.
- `GET /api/v1/crew/instructions`
  - Returns the crew-facing instruction feed for service execution.
- `GET /api/v1/management/requests/summary`
  - Returns a high-level request summary for management.

## Screen architecture

### Passenger screen

- QR-driven seat access scoped by `seat_number`
- Request history for the current seat
- New request submission

### Crew screen

- iPad access handshake
- Crew roster
- Instruction feed

### Management screen

- High-level request summary across the app

## Project structure

- `app/main.py`
  - FastAPI application entry point.
- `app/api/routes/`
  - Route handlers for health, flight registration, passenger flows, crew flows, and management.
- `app/schemas/`
  - Request and response models shared with the frontend.
- `app/services/`
  - Stub business-logic layer where the real implementation can be added later.
- `tests/test_api.py`
  - Basic contract tests for the starter routes.

## Run locally

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API will be available at `http://127.0.0.1:8000`, with Swagger docs at `http://127.0.0.1:8000/docs`.

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
