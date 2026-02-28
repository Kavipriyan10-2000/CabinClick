from fastapi import APIRouter, status

from app.schemas.request_management import (
    PassengerRequestCreate,
    PassengerRequestListResponse,
    PassengerRequestRecord,
)
from app.services.passenger_requests import (
    create_passenger_request,
    list_passenger_requests,
)

router = APIRouter(tags=["passenger-requests"])


@router.get(
    "/seats/{seat_number}/requests",
    response_model=PassengerRequestListResponse,
)
def get_passenger_requests(
    seat_number: str,
) -> PassengerRequestListResponse:
    return list_passenger_requests(seat_number=seat_number)


@router.post(
    "/seats/{seat_number}/requests",
    response_model=PassengerRequestRecord,
    status_code=status.HTTP_201_CREATED,
)
def submit_passenger_request(
    seat_number: str,
    payload: PassengerRequestCreate,
) -> PassengerRequestRecord:
    return create_passenger_request(
        seat_number=seat_number,
        payload=payload,
    )
