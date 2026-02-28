from fastapi import APIRouter, status

from app.schemas.passenger_access import (
    PassengerSeatAccessRequest,
    PassengerSeatAccessResponse,
)
from app.services.passenger_access import grant_seat_access

router = APIRouter(tags=["passenger-access"])


@router.post(
    "/flights/{flight_id}/seats/{seat_number}/access",
    response_model=PassengerSeatAccessResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_passenger_seat_access(
    flight_id: str,
    seat_number: str,
    payload: PassengerSeatAccessRequest,
) -> PassengerSeatAccessResponse:
    return grant_seat_access(
        flight_id=flight_id,
        seat_number=seat_number,
        payload=payload,
    )
