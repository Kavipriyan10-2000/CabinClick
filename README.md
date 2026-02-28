# Cabin Crew Dispatch Backend

This repository now includes a starter FastAPI backend for an airline crew-assistance workflow. The backend is intentionally shallow so the frontend can integrate against stable HTTP contracts while the real QR validation, translation, request handling, and device delivery logic is added later.

## Implemented API surface

- `GET /api/v1/health`
  - Simple health check for local development and deployment probes.
- `POST /api/v1/seats/{seat_number}/access`
  - Passenger QR-entry route that opens the seat-specific experience without a traditional login flow.
- `GET /api/v1/seats/{seat_number}/requests/new`
  - Dummy route for the "new request" button that currently returns `apple`, `water`, and a custom text field.
- `GET /api/v1/seats/{seat_number}/requests`
  - Returns previous requests made from that seat.
- `POST /api/v1/seats/{seat_number}/requests`
  - Creates a new passenger request from the phone screen.
- `POST /api/v1/passenger-requests/interpret`
  - Accepts a passenger transcript and returns a queued placeholder response for future translation and action extraction.
- `POST /api/v1/crew/broadcasts`
  - Accepts a structured message and device targets, then returns a queued placeholder response for future crew-device delivery.
- `GET /api/v1/crew/members`
  - Returns the current crew roster.
- `GET /api/v1/crew/requests`
  - Returns the crew-facing feed of passenger requests.
- `GET /api/v1/crew/queue/current`
  - Returns the current `request-in-progress` object that is collecting passenger instructions.
- `POST /api/v1/crew/queue/current/tray-items`
  - Adds selected items to the crew member's tray inside the active `request-in-progress` object.
- `POST /api/v1/crew/queue/current/dispatch`
  - Marks the active request object as `being_served` and returns the next request object for remaining and new instructions.
- `PATCH /api/v1/crew/requests/{request_id}/status`
  - Placeholder route for crew workflow actions such as triaged, in progress, or completed.
- `GET /api/v1/crew/instructions`
  - Returns the crew-facing instruction feed derived from passenger requests.
- `POST /api/v1/crew/instructions`
  - Creates an instruction that can be assigned to crew members or devices.
- `PATCH /api/v1/crew/instructions/{instruction_id}/status`
  - Placeholder route for instruction acknowledgement and completion updates.

## Screen architecture

### Passenger screen

- QR-driven seat access scoped by `seat_number`
- Request history for the current seat
- New request submission
- Separate speech interpretation endpoint for later AI or NLP integration

### Crew screen

- Flight crew roster
- Flight request feed
- Current request-in-progress queue object
- Add selected items to tray
- Dispatch the tray and roll remaining/new items into the next object
- Instruction feed
- Instruction creation and status updates
- Request status updates

## Project structure

- `app/main.py`
  - FastAPI application entry point.
- `app/api/routes/`
  - Route handlers for health, passenger seat access, requests, crew operations, and broadcasts.
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

## Supabase Wiring

The backend now loads Supabase configuration from `.env.local` through [config.py](/Users/akshitbhatia/PycharmProjects/CabinClick/app/core/config.py) and exposes a reusable client in [supabase.py](/Users/akshitbhatia/PycharmProjects/CabinClick/app/db/supabase.py).

Current behavior:

- The backend prefers `SUPABASE_SERVICE_ROLE_KEY` when present.
- If no service-role key is set, it falls back to `SUPABASE_ANON_KEY`.
- Your current `.env.local` already contains the project URL, publishable key, and anon key.

Recommended next step:

- Ask your teammate for `SUPABASE_SERVICE_ROLE_KEY` so the backend can safely perform server-side writes without depending on public-key access rules.

## Testing In Swagger Docs

After starting the server and opening `/docs`, test the queue flow in this order:

1. Open `GET /api/v1/crew/queue/current` and click `Try it out`, then `Execute`.
2. Open `POST /api/v1/crew/queue/current/tray-items` and send a body like:

```json
{
  "crew_member_id": "crew-002",
  "selections": [
    {
      "item_name": "water",
      "quantity": 2,
      "seat_numbers": ["10A", "12C"]
    },
    {
      "item_name": "apple",
      "quantity": 1,
      "seat_numbers": ["12C"]
    }
  ]
}
```

3. Open `POST /api/v1/crew/queue/current/dispatch` and send:

```json
{
  "crew_member_id": "crew-002",
  "note": "Leaving galley with current tray."
}
```

The dispatch response will show:

- `served_request` with status `being_served`
- `next_request` with status `collecting`
- remaining and newly arrived items inside `next_request.pending_items`

## Environment

Copy `.env.example` to `.env.local` or export the variables directly. The FastAPI scaffold currently uses:

- `APP_NAME`
- `APP_VERSION`
- `API_V1_PREFIX`
- `CORS_ORIGINS`

The existing Supabase and GCP variables remain documented for the rest of the repository.
