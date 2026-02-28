from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_check() -> None:
    response = client.get("/api/v1/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_register_flight() -> None:
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
    assert body["status"] == "registered"


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


def test_list_passenger_requests() -> None:
    response = client.get("/api/v1/seats/14C/requests")

    body = response.json()

    assert response.status_code == 200
    assert body["seat_number"] == "14C"
    assert len(body["items"]) == 1
    assert body["items"][0]["status"] == "being_served"


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


def test_create_crew_access() -> None:
    response = client.post(
        "/api/v1/crew/access",
        json={
            "crew_member_id": "crew-002",
            "device_id": "ipad-01",
        },
    )

    body = response.json()

    assert response.status_code == 201
    assert body["crew_member_id"] == "crew-002"
    assert body["status"] == "active"


def test_list_crew_members() -> None:
    response = client.get("/api/v1/crew/members")

    body = response.json()

    assert response.status_code == 200
    assert len(body["members"]) == 2


def test_list_crew_instructions() -> None:
    response = client.get("/api/v1/crew/instructions")

    body = response.json()

    assert response.status_code == 200
    assert len(body["items"]) == 1
    assert body["items"][0]["title"] == "Serve forward cabin refreshments"


def test_get_management_request_summary() -> None:
    response = client.get("/api/v1/management/requests/summary")

    body = response.json()

    assert response.status_code == 200
    assert body["total_requests"] == 18
    assert body["active_seats"] == 11
