from app.db.supabase import get_supabase_client
from app.schemas.flight_operations import (
    FlightRegistrationRequest,
    FlightRegistrationResponse,
)


def register_flight(
    payload: FlightRegistrationRequest,
) -> FlightRegistrationResponse:
    supabase = get_supabase_client()

    (
        supabase.table("flights")
        .update({"status": "completed"})
        .eq("status", "active")
        .execute()
    )

    response = (
        supabase.table("flights")
        .insert(
            {
                "flight_number": payload.flight_number,
                "origin": payload.origin,
                "destination": payload.destination,
                "departure_date": payload.departure_date.isoformat(),
                "status": "active",
            }
        )
        .execute()
    )
    record = response.data[0]

    return FlightRegistrationResponse(
        flight_id=record["id"],
        flight_number=record["flight_number"],
        origin=record["origin"],
        destination=record["destination"],
        departure_date=record["departure_date"],
        status=record["status"],
        created_at=record["created_at"],
        message="Flight registered for the current app session.",
    )
