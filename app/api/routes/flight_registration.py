from fastapi import APIRouter, status

from app.schemas.flight_operations import (
    FlightRegistrationRequest,
    FlightRegistrationResponse,
)
from app.services.flight_operations import register_flight

router = APIRouter(prefix="/flights", tags=["flights"])


@router.post(
    "/register",
    response_model=FlightRegistrationResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_flight_registration(
    payload: FlightRegistrationRequest,
) -> FlightRegistrationResponse:
    return register_flight(payload)
