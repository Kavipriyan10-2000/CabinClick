from uuid import uuid4

from app.schemas.passenger_requests import (
    PassengerSpeechRequest,
    PassengerSpeechResponse,
)
from app.schemas.request_management import (
    PassengerRequestCreate,
    PassengerRequestListResponse,
    PassengerRequestRecord,
)


def interpret_passenger_speech(
    payload: PassengerSpeechRequest,
) -> PassengerSpeechResponse:
    return PassengerSpeechResponse(
        request_id=uuid4(),
        original_transcript=payload.transcript,
        message=(
            "Passenger speech accepted. Translation and action extraction "
            "will be added in a later implementation."
        ),
    )


def list_passenger_requests(
    flight_id: str,
    seat_number: str,
) -> PassengerRequestListResponse:
    return PassengerRequestListResponse(
        flight_id=flight_id,
        seat_number=seat_number,
        message=(
            "Passenger request history placeholder. Persistence will be "
            "connected in a later implementation."
        ),
    )


def create_passenger_request(
    flight_id: str,
    seat_number: str,
    payload: PassengerRequestCreate,
) -> PassengerRequestRecord:
    return PassengerRequestRecord(
        request_id=uuid4(),
        flight_id=flight_id,
        seat_number=seat_number,
        category=payload.category,
        source=payload.source,
        request_text=payload.request_text,
    )
