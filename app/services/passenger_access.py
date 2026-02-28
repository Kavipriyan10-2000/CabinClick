import hashlib

from app.db.supabase import get_supabase_client
from app.schemas.passenger_access import (
    PassengerSeatAccessRequest,
    PassengerSeatAccessResponse,
)
from app.services._flight_context import get_active_flight
from app.services.seat_layout import get_seat_zone, validate_seat_number


def grant_seat_access(
    seat_number: str,
    payload: PassengerSeatAccessRequest,
) -> PassengerSeatAccessResponse:
    validated_seat_number = validate_seat_number(seat_number)
    seat_zone = get_seat_zone(validated_seat_number)
    flight = get_active_flight()
    response = (
        get_supabase_client()
        .table("seat_access_sessions")
        .insert(
            {
                "flight_id": flight["id"],
                "seat_number": validated_seat_number,
                "qr_token_hash": hashlib.sha256(payload.qr_token.encode("utf-8")).hexdigest(),
                "device_label": payload.device_label,
                "preferred_language": payload.preferred_language,
                "metadata": payload.metadata,
            }
        )
        .execute()
    )
    record = response.data[0]

    return PassengerSeatAccessResponse(
        access_id=record["id"],
        flight_number=flight["flight_number"],
        seat_number=validated_seat_number,
        cabin_section=seat_zone,
        message=(
            "Seat access accepted and stored for the active flight."
        ),
    )
