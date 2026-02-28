from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_check() -> None:
    response = client.get("/api/v1/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_create_passenger_seat_access() -> None:
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
    assert body["seat_number"] == "14C"


def test_get_new_passenger_request_draft() -> None:
    response = client.get("/api/v1/seats/14C/requests/new")

    body = response.json()

    assert response.status_code == 200
    assert body["seat_number"] == "14C"
    assert body["selected_items"] == ["apple", "water"]
    assert body["custom_text"] == "Passenger custom text"


def test_list_passenger_requests() -> None:
    response = client.get("/api/v1/seats/14C/requests")

    body = response.json()

    assert response.status_code == 200
    assert body["seat_number"] == "14C"
    assert body["items"] == []


def test_create_passenger_request() -> None:
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
    response = client.get("/api/v1/crew/members")

    body = response.json()

    assert response.status_code == 200
    assert len(body["members"]) == 2


def test_get_current_queue_request() -> None:
    response = client.get("/api/v1/crew/queue/current")

    body = response.json()

    assert response.status_code == 200
    assert body["active_request"]["status"] == "collecting"
    assert len(body["active_request"]["pending_items"]) >= 1


def test_add_items_to_queue_tray() -> None:
    response = client.post(
        "/api/v1/crew/queue/current/tray-items",
        json={
            "crew_member_id": "crew-002",
            "selections": [
                {
                    "item_name": "water",
                    "quantity": 2,
                    "seat_numbers": ["10A", "12C"],
                },
                {
                    "item_name": "apple",
                    "quantity": 1,
                    "seat_numbers": ["12C"],
                },
            ],
        },
    )

    body = response.json()

    assert response.status_code == 200
    assert body["active_request"]["crew_member_id"] == "crew-002"
    assert len(body["active_request"]["tray_items"]) == 2
    assert body["active_request"]["tray_items"][0]["added_to_tray"] is True


def test_dispatch_queue_request() -> None:
    response = client.post(
        "/api/v1/crew/queue/current/dispatch",
        json={
            "crew_member_id": "crew-002",
            "note": "Leaving galley with current tray.",
        },
    )

    body = response.json()

    assert response.status_code == 200
    assert body["served_request"]["status"] == "being_served"
    assert body["next_request"]["status"] == "collecting"
    assert len(body["next_request"]["pending_items"]) >= 1


def test_create_crew_instruction() -> None:
    response = client.post(
        "/api/v1/crew/instructions",
        json={
            "title": "Serve seat 14C",
            "instruction_text": "Deliver a blanket and water to seat 14C.",
            "assignee_ids": ["crew-002"],
            "priority": "high",
        },
    )

    body = response.json()

    assert response.status_code == 201
    assert body["title"] == "Serve seat 14C"
    assert body["status"] == "open"
