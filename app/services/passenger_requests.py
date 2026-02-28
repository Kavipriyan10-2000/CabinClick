from uuid import uuid4

from app.schemas.passenger_requests import (
    PassengerSpeechRequest,
    PassengerSpeechResponse,
)
from app.schemas.request_management import (
    PassengerNewRequestDraftResponse,
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


def build_new_passenger_request_draft(
    seat_number: str,
) -> PassengerNewRequestDraftResponse:
    return PassengerNewRequestDraftResponse(
        seat_number=seat_number,
        selected_items=["apple", "water"],
        custom_text="Passenger custom text",
        message=(
            "Dummy new request payload returned for the passenger request screen."
        ),
    )


def list_passenger_requests(
    seat_number: str,
) -> PassengerRequestListResponse:
    return PassengerRequestListResponse(
        seat_number=seat_number,
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
