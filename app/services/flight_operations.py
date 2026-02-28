from uuid import uuid4

from app.schemas.flight_operations import (
    FlightRegistrationRequest,
    FlightRegistrationResponse,
)


def register_flight(
    payload: FlightRegistrationRequest,
) -> FlightRegistrationResponse:
    return FlightRegistrationResponse(
        flight_id=uuid4(),
        flight_number=payload.flight_number,
        origin=payload.origin,
        destination=payload.destination,
        departure_date=payload.departure_date,
        message="Flight registered for the current app session.",
    )
