from fastapi import APIRouter, status

from app.schemas.flight_operations import (
    FlightRegistrationRequest,
    FlightRegistrationResponse,
    LufthansaFlightTimingResponse,
)
from app.services.flight_operations import register_flight
from app.services.lufthansa_flightops import (
    get_mock_landing_time,
    get_mock_takeoff_time,
)

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


@router.get(
    "/lufthansa/takeoff-time",
    response_model=LufthansaFlightTimingResponse,
)
def get_lufthansa_takeoff_time() -> LufthansaFlightTimingResponse:
    return get_mock_takeoff_time()


@router.get(
    "/lufthansa/landing-time",
    response_model=LufthansaFlightTimingResponse,
)
def get_lufthansa_landing_time() -> LufthansaFlightTimingResponse:
    return get_mock_landing_time()
