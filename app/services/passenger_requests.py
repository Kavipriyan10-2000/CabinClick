from uuid import uuid4

from app.schemas.request_management import (
    PassengerRequestCreate,
    PassengerRequestListResponse,
    PassengerRequestRecord,
)


def list_passenger_requests(
    seat_number: str,
) -> PassengerRequestListResponse:
    return PassengerRequestListResponse(
        seat_number=seat_number,
        items=[
            PassengerRequestRecord(
                request_id=uuid4(),
                seat_number=seat_number,
                category="refreshment",
                source="typed",
                status="being_served",
                request_text="Water and an apple",
            ),
        ],
        message=(
            "Passenger request history placeholder. Persistence will be "
            "connected in a later implementation."
        ),
    )


def create_passenger_request(
    seat_number: str,
    payload: PassengerRequestCreate,
) -> PassengerRequestRecord:
    return PassengerRequestRecord(
        request_id=uuid4(),
        seat_number=seat_number,
        category=payload.category,
        source=payload.source,
        request_text=payload.request_text,
    )
