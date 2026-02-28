from fastapi import APIRouter, HTTPException, status

from app.schemas.passenger_access import (
    PassengerSeatAccessRequest,
    PassengerSeatAccessResponse,
)
from app.services.passenger_access import grant_seat_access

router = APIRouter(tags=["passenger-access"])


@router.post(
    "/seats/{seat_number}/access",
    response_model=PassengerSeatAccessResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_passenger_seat_access(
    seat_number: str,
    payload: PassengerSeatAccessRequest,
) -> PassengerSeatAccessResponse:
    try:
        return grant_seat_access(
            seat_number=seat_number,
            payload=payload,
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
