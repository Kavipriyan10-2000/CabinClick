from fastapi import APIRouter, status

from app.schemas.passenger_requests import (
    PassengerSpeechRequest,
    PassengerSpeechResponse,
)
from app.schemas.request_management import (
    PassengerRequestCreate,
    PassengerRequestListResponse,
    PassengerRequestRecord,
)
from app.services.passenger_requests import (
    create_passenger_request,
    interpret_passenger_speech,
    list_passenger_requests,
)

router = APIRouter(tags=["passenger-requests"])


@router.get(
    "/flights/{flight_id}/seats/{seat_number}/requests",
    response_model=PassengerRequestListResponse,
)
def get_passenger_requests(
    flight_id: str,
    seat_number: str,
) -> PassengerRequestListResponse:
    return list_passenger_requests(flight_id=flight_id, seat_number=seat_number)


@router.post(
    "/flights/{flight_id}/seats/{seat_number}/requests",
    response_model=PassengerRequestRecord,
    status_code=status.HTTP_201_CREATED,
)
def submit_passenger_request(
    flight_id: str,
    seat_number: str,
    payload: PassengerRequestCreate,
) -> PassengerRequestRecord:
    return create_passenger_request(
        flight_id=flight_id,
        seat_number=seat_number,
        payload=payload,
    )


@router.post(
    "/passenger-requests/interpret",
    response_model=PassengerSpeechResponse,
    status_code=status.HTTP_202_ACCEPTED,
)
def interpret_passenger_request(
    payload: PassengerSpeechRequest,
) -> PassengerSpeechResponse:
    return interpret_passenger_speech(payload)
