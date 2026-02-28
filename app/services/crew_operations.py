from app.schemas.crew_operations import (
    CrewAccessRequest,
    CrewAccessResponse,
    CrewInstructionListResponse,
    CrewInstructionRecord,
    CrewMemberListResponse,
    CrewMemberRole,
    CrewMemberSummary,
)
from app.db.supabase import get_supabase_client
from app.services._flight_context import get_active_flight
from app.services.instruction_batcher import emit_crew_instruction_if_needed


def create_crew_access(payload: CrewAccessRequest) -> CrewAccessResponse:
    flight = get_active_flight()
    supabase = get_supabase_client()

    member_lookup = (
        supabase.table("crew_members")
        .select("*")
        .eq("flight_id", flight["id"])
        .eq("crew_member_code", payload.crew_member_code)
        .limit(1)
        .execute()
    )
    existing_members = member_lookup.data or []

    if existing_members:
        member = existing_members[0]
        member_update = (
            supabase.table("crew_members")
            .update(
                {
                    "device_id": payload.device_id,
                    "assigned_zone": payload.assigned_zone,
                }
            )
            .eq("id", member["id"])
            .execute()
        )
        member = member_update.data[0]
    else:
        member_insert = (
            supabase.table("crew_members")
            .insert(
                {
                    "flight_id": flight["id"],
                    "crew_member_code": payload.crew_member_code,
                    "full_name": payload.full_name or payload.crew_member_code,
                    "role": payload.role,
                    "device_id": payload.device_id,
                    "assigned_zone": payload.assigned_zone,
                }
            )
            .execute()
        )
        member = member_insert.data[0]

    access_insert = (
        supabase.table("crew_access_sessions")
        .insert(
            {
                "flight_id": flight["id"],
                "crew_member_id": member["id"],
                "device_id": payload.device_id,
                "status": "active",
            }
        )
        .execute()
    )
    access_record = access_insert.data[0]

    return CrewAccessResponse(
        access_id=access_record["id"],
        flight_id=flight["id"],
        flight_number=flight["flight_number"],
        crew_member_id=member["id"],
        crew_member_code=member["crew_member_code"],
        device_id=access_record["device_id"],
        status=access_record["status"],
        created_at=access_record["created_at"],
        message="Crew device access recorded for the active flight.",
    )


def list_crew_members() -> CrewMemberListResponse:
    flight = get_active_flight()
    response = (
        get_supabase_client()
        .table("crew_members")
        .select("*")
        .eq("flight_id", flight["id"])
        .order("created_at")
        .execute()
    )
    members = [
        CrewMemberSummary(
            crew_member_id=record["crew_member_code"],
            full_name=record["full_name"],
            role=record["role"],
            device_id=record["device_id"],
            assigned_zone=record["assigned_zone"],
        )
        for record in (response.data or [])
    ]
    return CrewMemberListResponse(
        flight_id=flight["id"],
        flight_number=flight["flight_number"],
        members=members,
        message="Crew roster loaded from Supabase.",
    )


def list_crew_instructions() -> CrewInstructionListResponse:
    flight = get_active_flight()
    emit_crew_instruction_if_needed()
    response = (
        get_supabase_client()
        .table("crew_instructions")
        .select("*")
        .eq("flight_id", flight["id"])
        .order("created_at", desc=True)
        .execute()
    )
    items = [
        CrewInstructionRecord(
            instruction_id=record["id"],
            flight_id=record["flight_id"],
            title=record["title"],
            instruction_text=record["instruction_text"],
            seat_numbers=record["seat_numbers"],
            priority=record["priority"],
            status=record["status"],
            created_at=record["created_at"],
            updated_at=record["updated_at"],
        )
        for record in (response.data or [])
    ]
    return CrewInstructionListResponse(
        flight_id=flight["id"],
        flight_number=flight["flight_number"],
        items=items,
        message="Crew instructions loaded from Supabase.",
    )
