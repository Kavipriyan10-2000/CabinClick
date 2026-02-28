from uuid import uuid4

from app.schemas.passenger_access import (
    PassengerSeatAccessRequest,
    PassengerSeatAccessResponse,
)


def grant_seat_access(
    seat_number: str,
    payload: PassengerSeatAccessRequest,
) -> PassengerSeatAccessResponse:
    return PassengerSeatAccessResponse(
        access_id=uuid4(),
        seat_number=seat_number,
        message=(
            "Seat access accepted. QR validation and passenger session "
            "management will be connected in a later implementation."
        ),
    )
