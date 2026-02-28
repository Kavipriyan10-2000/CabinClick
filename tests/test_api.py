import pytest
from fastapi.testclient import TestClient
from uuid import uuid4

from app.main import app
from app.api.routes import passenger_requests as passenger_requests_route

client = TestClient(app)


@pytest.fixture(autouse=True)
def disable_instruction_batcher(monkeypatch):
    monkeypatch.setattr(
        "app.services.passenger_requests.emit_crew_instruction_if_needed",
        lambda: None,
    )
    monkeypatch.setattr(
        "app.services.crew_operations.emit_crew_instruction_if_needed",
        lambda: None,
    )


def test_health_check() -> None:
    response = client.get("/api/v1/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_register_flight(monkeypatch) -> None:
    def fake_register_flight(payload):
        return {
            "flight_id": str(uuid4()),
            "flight_number": payload.flight_number,
            "origin": payload.origin,
            "destination": payload.destination,
            "departure_date": payload.departure_date.isoformat(),
            "status": "active",
            "created_at": "2026-02-28T12:00:00+00:00",
            "message": "Flight registered for the current app session.",
        }

    monkeypatch.setattr(
        "app.api.routes.flight_registration.register_flight",
        fake_register_flight,
    )

    response = client.post(
        "/api/v1/flights/register",
        json={
            "flight_number": "AI101",
            "origin": "DEL",
            "destination": "LHR",
            "departure_date": "2026-03-01",
        },
    )

    body = response.json()

    assert response.status_code == 201
    assert body["flight_number"] == "AI101"
    assert body["status"] == "active"


def test_create_passenger_seat_access(monkeypatch) -> None:
    def fake_grant_seat_access(seat_number, payload):
        return {
            "access_id": str(uuid4()),
            "status": "active",
            "created_at": "2026-02-28T12:00:00+00:00",
            "flight_number": "AI101",
            "seat_number": seat_number,
            "cabin_section": None,
            "available_actions": ["create_request", "view_requests"],
            "message": "Seat access accepted and stored for the active flight.",
        }

    monkeypatch.setattr(
        "app.api.routes.passenger_access.grant_seat_access",
        fake_grant_seat_access,
    )

    response = client.post(
        "/api/v1/seats/14C/access",
        json={
            "qr_token": "seat-token-14C",
            "device_label": "iphone-safari",
            "preferred_language": "en",
        },
    )

    body = response.json()

    assert response.status_code == 201
    assert body["status"] == "active"
    assert body["flight_number"] == "AI101"
    assert body["seat_number"] == "14C"


def test_list_passenger_requests(monkeypatch) -> None:
    flight_id = str(uuid4())

    def fake_list_passenger_requests(seat_number):
        return {
            "flight_id": flight_id,
            "seat_number": seat_number,
            "items": [
                {
                    "request_id": str(uuid4()),
                    "flight_id": flight_id,
                    "seat_number": seat_number,
                    "category": "refreshment",
                    "source": "typed",
                    "status": "being_served",
                    "request_text": "Water please",
                    "source_language": "en",
                    "translated_text": "Water please",
                    "metadata": {"action_items": [{"item": "Water", "quantity": 1}]},
                    "created_at": "2026-02-28T12:00:00+00:00",
                    "updated_at": "2026-02-28T12:05:00+00:00",
                }
            ],
            "message": "Passenger request history loaded from Supabase.",
        }

    monkeypatch.setattr(
        "app.api.routes.passenger_requests.list_passenger_requests",
        fake_list_passenger_requests,
    )

    response = client.get("/api/v1/seats/14C/requests")

    body = response.json()

    assert response.status_code == 200
    assert body["seat_number"] == "14C"
    assert body["items"][0]["status"] == "being_served"


def test_create_passenger_request(monkeypatch) -> None:
    flight_id = str(uuid4())

    def fake_create_passenger_request(seat_number, payload):
        return {
            "request_id": str(uuid4()),
            "flight_id": flight_id,
            "seat_number": seat_number,
            "category": payload.category,
            "source": payload.source,
            "status": "submitted",
            "request_text": payload.request_text,
            "source_language": payload.source_language,
            "translated_text": None,
            "metadata": payload.metadata,
            "created_at": "2026-02-28T12:00:00+00:00",
            "updated_at": "2026-02-28T12:00:00+00:00",
        }

    monkeypatch.setattr(
        "app.api.routes.passenger_requests.create_passenger_request",
        fake_create_passenger_request,
    )

    response = client.post(
        "/api/v1/seats/14C/requests",
        json={
            "category": "comfort",
            "request_text": "Please bring me a blanket.",
            "source": "typed",
        },
    )

    body = response.json()

    assert response.status_code == 201
    assert body["seat_number"] == "14C"
    assert body["category"] == "comfort"
    assert body["status"] == "submitted"


def test_create_voice_passenger_request(monkeypatch) -> None:
    if not passenger_requests_route.MULTIPART_AVAILABLE:
        pytest.skip("python-multipart is not installed in the test environment")

    flight_id = str(uuid4())

    def fake_create_voice_passenger_request(
        seat_number,
        audio_bytes,
        mime_type,
        source_language_hint,
    ):
        assert seat_number == "14C"
        assert audio_bytes == b"voice-bytes"
        assert mime_type == "audio/webm"
        assert source_language_hint == "de"
        return {
            "request_id": str(uuid4()),
            "flight_id": flight_id,
            "seat_number": seat_number,
            "category": "refreshment",
            "source": "speech",
            "status": "submitted",
            "request_text": "Zwei Wasser, bitte.",
            "source_language": "de",
            "translated_text": "Seat requested 2 waters.",
            "metadata": {
                "passenger_message": "Zwei Wasser, bitte.",
                "action_items": [
                    {
                        "item": "Wasser",
                        "quantity": 2,
                        "normalized_item": "water",
                    }
                ],
            },
            "created_at": "2026-02-28T12:00:00+00:00",
            "updated_at": "2026-02-28T12:00:00+00:00",
        }

    monkeypatch.setattr(
        "app.api.routes.passenger_requests.create_voice_passenger_request",
        fake_create_voice_passenger_request,
    )

    response = client.post(
        "/api/v1/seats/14C/voice-requests",
        files={"audio": ("request.webm", b"voice-bytes", "audio/webm")},
        data={"source_language": "de"},
    )

    body = response.json()

    assert response.status_code == 201
    assert body["source"] == "speech"
    assert body["source_language"] == "de"
    assert body["translated_text"] == "Seat requested 2 waters."


def test_create_crew_access(monkeypatch) -> None:
    flight_id = str(uuid4())
    crew_member_id = str(uuid4())

    def fake_create_crew_access(payload):
        return {
            "access_id": str(uuid4()),
            "flight_id": flight_id,
            "flight_number": "AI101",
            "crew_member_id": crew_member_id,
            "crew_member_code": payload.crew_member_code,
            "device_id": payload.device_id,
            "status": "active",
            "created_at": "2026-02-28T12:00:00+00:00",
            "message": "Crew device access recorded for the active flight.",
        }

    monkeypatch.setattr(
        "app.api.routes.crew_operations.create_crew_access",
        fake_create_crew_access,
    )

    response = client.post(
        "/api/v1/crew/access",
        json={
            "crew_member_code": "crew-002",
            "device_id": "ipad-01",
            "full_name": "Daniel Perez",
            "role": "attendant",
            "assigned_zone": "Mid cabin",
        },
    )

    body = response.json()

    assert response.status_code == 201
    assert body["crew_member_code"] == "crew-002"
    assert body["status"] == "active"


def test_list_crew_members(monkeypatch) -> None:
    flight_id = str(uuid4())

    def fake_list_crew_members():
        return {
            "flight_id": flight_id,
            "flight_number": "AI101",
            "members": [
                {
                    "crew_member_id": "crew-001",
                    "full_name": "Aisha Khan",
                    "role": "lead",
                    "device_id": "ipad-01",
                    "assigned_zone": "Forward cabin",
                    "preferred_language": "de",
                }
            ],
            "message": "Crew roster loaded from Supabase.",
        }

    monkeypatch.setattr(
        "app.api.routes.crew_operations.list_crew_members",
        fake_list_crew_members,
    )

    response = client.get("/api/v1/crew/members")

    body = response.json()

    assert response.status_code == 200
    assert body["flight_number"] == "AI101"
    assert len(body["members"]) == 1


def test_list_crew_instructions(monkeypatch) -> None:
    flight_id = str(uuid4())

    def fake_list_crew_instructions(crew_member_code=None, preferred_language=None):
        assert crew_member_code == "crew-001"
        assert preferred_language == "de"
        return {
            "flight_id": flight_id,
            "flight_number": "AI101",
            "items": [
                {
                    "instruction_id": str(uuid4()),
                    "flight_id": flight_id,
                    "title": "Refreshments servieren",
                    "instruction_text": "Bringen Sie Wasser und Apfel zu den Passagieren.",
                    "language": "de",
                    "seat_numbers": ["10A", "12C"],
                    "priority": "medium",
                    "status": "open",
                    "created_at": "2026-02-28T12:00:00+00:00",
                    "updated_at": "2026-02-28T12:00:00+00:00",
                }
            ],
            "message": "Crew instructions loaded from Supabase.",
        }

    monkeypatch.setattr(
        "app.api.routes.crew_operations.list_crew_instructions",
        fake_list_crew_instructions,
    )

    response = client.get(
        "/api/v1/crew/instructions?crew_member_code=crew-001&preferred_language=de"
    )

    body = response.json()

    assert response.status_code == 200
    assert body["items"][0]["title"] == "Refreshments servieren"
    assert body["items"][0]["language"] == "de"


def test_list_crew_request_queue(monkeypatch) -> None:
    flight_id = str(uuid4())

    def fake_list_queued_passenger_requests(
        crew_member_code=None,
        preferred_language=None,
    ):
        assert crew_member_code == "crew-001"
        assert preferred_language == "de"
        return {
            "flight_id": flight_id,
            "flight_number": "AI101",
            "items": [
                {
                    "request_id": str(uuid4()),
                    "flight_id": flight_id,
                    "seat_number": "14C",
                    "category": "refreshment",
                    "request_text": "Zwei Wasser, bitte.",
                    "display_text": "Zwei Wasser, bitte.",
                    "language": "de",
                    "created_at": "2026-02-28T12:00:00+00:00",
                }
            ],
            "message": "Queued passenger requests loaded from Supabase.",
        }

    monkeypatch.setattr(
        "app.api.routes.crew_operations.list_queued_passenger_requests",
        fake_list_queued_passenger_requests,
    )

    response = client.get(
        "/api/v1/crew/request-queue?crew_member_code=crew-001&preferred_language=de"
    )

    body = response.json()

    assert response.status_code == 200
    assert body["items"][0]["seat_number"] == "14C"
    assert body["items"][0]["display_text"] == "Zwei Wasser, bitte."


def test_complete_crew_instruction(monkeypatch) -> None:
    instruction_id = str(uuid4())

    def fake_complete_crew_instruction(*, instruction_id):
        return {
            "instruction_id": instruction_id,
            "status": "completed",
            "updated_at": "2026-02-28T12:10:00+00:00",
            "message": "Crew instruction marked as completed.",
        }

    monkeypatch.setattr(
        "app.api.routes.crew_operations.complete_crew_instruction",
        fake_complete_crew_instruction,
    )

    response = client.patch(f"/api/v1/crew/instructions/{instruction_id}/complete")

    body = response.json()

    assert response.status_code == 200
    assert body["instruction_id"] == instruction_id
    assert body["status"] == "completed"


def test_get_management_request_summary(monkeypatch) -> None:
    def fake_get_request_summary():
        return {
            "flight_number": "AI101",
            "total_requests": 12,
            "active_seats": 7,
            "submitted_requests": 5,
            "being_served_requests": 4,
            "completed_requests": 3,
            "top_categories": [
                {"category": "refreshment", "total_requests": 8},
                {"category": "comfort", "total_requests": 4},
            ],
            "message": "Management summary loaded from Supabase.",
        }

    monkeypatch.setattr(
        "app.api.routes.management.get_request_summary",
        fake_get_request_summary,
    )

    response = client.get("/api/v1/management/requests/summary")
    body = response.json()

    assert response.status_code == 200
    assert body["flight_number"] == "AI101"
    assert body["total_requests"] == 12
