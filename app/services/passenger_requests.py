from app.schemas.request_management import (
    PassengerRequestCreate,
    PassengerRequestListResponse,
    PassengerRequestRecord,
)
from app.services._flight_context import get_active_flight
from app.db.supabase import get_supabase_client
from app.services.instruction_batcher import emit_crew_instruction_if_needed


def list_passenger_requests(
    seat_number: str,
) -> PassengerRequestListResponse:
    flight = get_active_flight()
    response = (
        get_supabase_client()
        .table("passenger_requests")
        .select("*")
        .eq("flight_id", flight["id"])
        .eq("seat_number", seat_number)
        .order("created_at", desc=True)
        .execute()
    )
    items = [
        PassengerRequestRecord(
            request_id=record["id"],
            flight_id=record["flight_id"],
            seat_number=record["seat_number"],
            category=record["category"],
            source=record["source"],
            status=record["status"],
            request_text=record["request_text"],
            created_at=record["created_at"],
            updated_at=record["updated_at"],
        )
        for record in (response.data or [])
    ]
    return PassengerRequestListResponse(
        flight_id=flight["id"],
        seat_number=seat_number,
        items=items,
        message=(
            "Passenger request history loaded from Supabase."
        ),
    )


def create_passenger_request(
    seat_number: str,
    payload: PassengerRequestCreate,
) -> PassengerRequestRecord:
    flight = get_active_flight()
    access_session_response = (
        get_supabase_client()
        .table("seat_access_sessions")
        .select("id")
        .eq("flight_id", flight["id"])
        .eq("seat_number", seat_number)
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )
    access_sessions = access_session_response.data or []
    seat_access_session_id = access_sessions[0]["id"] if access_sessions else None

    response = (
        get_supabase_client()
        .table("passenger_requests")
        .insert(
            {
                "flight_id": flight["id"],
                "seat_access_session_id": seat_access_session_id,
                "seat_number": seat_number,
                "category": payload.category,
                "source": payload.source,
                "request_text": payload.request_text,
                "status": "submitted",
                "source_language": payload.source_language,
                "metadata": payload.metadata,
            }
        )
        .execute()
    )
    record = response.data[0]

    return PassengerRequestRecord(
        request_id=record["id"],
        flight_id=record["flight_id"],
        seat_number=seat_number,
        category=payload.category,
        source=payload.source,
        status=record["status"],
        request_text=payload.request_text,
        created_at=record["created_at"],
        updated_at=record["updated_at"],
    )

    emit_crew_instruction_if_needed()
