# Cabin Crew Dispatch Backend

This repository now includes a starter FastAPI backend for an airline crew-assistance workflow. The backend is intentionally shallow so the frontend can integrate against stable HTTP contracts while the real QR validation, translation, request handling, and device delivery logic is added later.

## Implemented API surface

- `GET /api/v1/health`
  - Simple health check for local development and deployment probes.
- `POST /api/v1/flights/{flight_id}/seats/{seat_number}/access`
  - Passenger QR-entry route that opens the seat-specific experience without a traditional login flow.
- `GET /api/v1/flights/{flight_id}/seats/{seat_number}/requests`
  - Returns previous requests made from that seat.
- `POST /api/v1/flights/{flight_id}/seats/{seat_number}/requests`
  - Creates a new passenger request from the phone screen.
- `POST /api/v1/passenger-requests/interpret`
  - Accepts a passenger transcript and returns a queued placeholder response for future translation and action extraction.
- `POST /api/v1/crew/broadcasts`
  - Accepts a structured message and device targets, then returns a queued placeholder response for future crew-device delivery.
- `GET /api/v1/crew/flights/{flight_id}/members`
  - Returns the roster of crew members serving that flight.
- `GET /api/v1/crew/flights/{flight_id}/requests`
  - Returns the crew-facing feed of passenger requests for that flight.
- `PATCH /api/v1/crew/requests/{request_id}/status`
  - Placeholder route for crew workflow actions such as triaged, in progress, or completed.
- `GET /api/v1/crew/flights/{flight_id}/instructions`
  - Returns the crew-facing instruction feed derived from passenger requests.
- `POST /api/v1/crew/flights/{flight_id}/instructions`
  - Creates an instruction that can be assigned to crew members or devices.
- `PATCH /api/v1/crew/instructions/{instruction_id}/status`
  - Placeholder route for instruction acknowledgement and completion updates.

## Screen architecture

### Passenger screen

- QR-driven seat access scoped by `flight_id` and `seat_number`
- Request history for the current seat
- New request submission
- Separate speech interpretation endpoint for later AI or NLP integration

### Crew screen

- Flight crew roster
- Flight request feed
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

## Environment

Copy `.env.example` to `.env.local` or export the variables directly. The FastAPI scaffold currently uses:

- `APP_NAME`
- `APP_VERSION`
- `API_V1_PREFIX`
- `CORS_ORIGINS`

The existing Supabase and GCP variables remain documented for the rest of the repository.
