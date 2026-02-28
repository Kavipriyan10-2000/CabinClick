from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_check() -> None:
    response = client.get("/api/v1/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_create_passenger_seat_access() -> None:
    response = client.post(
        "/api/v1/flights/AC101-2026-03-01/seats/14C/access",
        json={
            "qr_token": "seat-token-14C",
            "device_label": "iphone-safari",
            "preferred_language": "en",
        },
    )

    body = response.json()

    assert response.status_code == 201
    assert body["status"] == "active"
    assert body["flight_id"] == "AC101-2026-03-01"
    assert body["seat_number"] == "14C"


def test_list_passenger_requests() -> None:
    response = client.get("/api/v1/flights/AC101-2026-03-01/seats/14C/requests")

    body = response.json()

    assert response.status_code == 200
    assert body["flight_id"] == "AC101-2026-03-01"
    assert body["seat_number"] == "14C"
    assert body["items"] == []


def test_create_passenger_request() -> None:
    response = client.post(
        "/api/v1/flights/AC101-2026-03-01/seats/14C/requests",
        json={
            "category": "comfort",
            "request_text": "Please bring me a blanket.",
            "source": "typed",
        },
    )

    body = response.json()

    assert response.status_code == 201
    assert body["flight_id"] == "AC101-2026-03-01"
    assert body["seat_number"] == "14C"
    assert body["category"] == "comfort"
    assert body["status"] == "submitted"


def test_interpret_passenger_request() -> None:
    response = client.post(
        "/api/v1/passenger-requests/interpret",
        json={
            "passenger_id": "pax_184",
            "seat_number": "14C",
            "transcript": "I need water and a blanket.",
            "source_language": "en",
            "cabin_section": "economy",
        },
    )

    body = response.json()

    assert response.status_code == 202
    assert body["status"] == "queued"
    assert body["original_transcript"] == "I need water and a blanket."
    assert body["translated_text"] is None
    assert body["extracted_actions"] == []


def test_queue_crew_broadcast() -> None:
    response = client.post(
        "/api/v1/crew/broadcasts",
        json={
            "message": "Passenger in 14C requested water and a blanket.",
            "event_type": "passenger_request",
            "device_ids": ["crew-device-1", "crew-device-2"],
            "priority": "high",
            "payload": {"seat_number": "14C"},
        },
    )

    body = response.json()

    assert response.status_code == 202
    assert body["status"] == "queued"
    assert body["targeted_devices"] == ["crew-device-1", "crew-device-2"]


def test_list_crew_members() -> None:
    response = client.get("/api/v1/crew/flights/AC101-2026-03-01/members")

    body = response.json()

    assert response.status_code == 200
    assert body["flight_id"] == "AC101-2026-03-01"
    assert len(body["members"]) == 2


def test_create_crew_instruction() -> None:
    response = client.post(
        "/api/v1/crew/flights/AC101-2026-03-01/instructions",
        json={
            "title": "Serve seat 14C",
            "instruction_text": "Deliver a blanket and water to seat 14C.",
            "assignee_ids": ["crew-002"],
            "priority": "high",
        },
    )

    body = response.json()

    assert response.status_code == 201
    assert body["flight_id"] == "AC101-2026-03-01"
    assert body["title"] == "Serve seat 14C"
    assert body["status"] == "open"
