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
from app.services.voice_requests import localize_instruction_for_crew


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
                    "preferred_language": payload.preferred_language,
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
                    "preferred_language": payload.preferred_language,
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
            preferred_language=record.get("preferred_language"),
        )
        for record in (response.data or [])
    ]
    return CrewMemberListResponse(
        flight_id=flight["id"],
        flight_number=flight["flight_number"],
        members=members,
        message="Crew roster loaded from Supabase.",
    )


def list_crew_instructions(
    *,
    crew_member_code: str | None = None,
    preferred_language: str | None = None,
) -> CrewInstructionListResponse:
    flight = get_active_flight()
    supabase = get_supabase_client()
    emit_crew_instruction_if_needed()
    crew_language = preferred_language or _get_crew_member_language(
        supabase=supabase,
        flight_id=flight["id"],
        crew_member_code=crew_member_code,
    )
    response = (
        supabase
        .table("crew_instructions")
        .select("*")
        .eq("flight_id", flight["id"])
        .order("created_at", desc=True)
        .execute()
    )
    items = []
    for record in response.data or []:
        title, instruction_text, language = localize_instruction_for_crew(
            title=record["title"],
            instruction_text=record["instruction_text"],
            target_language=crew_language,
        )
        items.append(
            CrewInstructionRecord(
                instruction_id=record["id"],
                flight_id=record["flight_id"],
                title=title,
                instruction_text=instruction_text,
                language=language,
                seat_numbers=record["seat_numbers"],
                priority=record["priority"],
                status=record["status"],
                created_at=record["created_at"],
                updated_at=record["updated_at"],
            )
        )
    return CrewInstructionListResponse(
        flight_id=flight["id"],
        flight_number=flight["flight_number"],
        items=items,
        message="Crew instructions loaded from Supabase.",
    )


def _get_crew_member_language(
    *,
    supabase,
    flight_id: str,
    crew_member_code: str | None,
) -> str | None:
    if not crew_member_code:
        return None

    response = (
        supabase.table("crew_members")
        .select("preferred_language")
        .eq("flight_id", flight_id)
        .eq("crew_member_code", crew_member_code)
        .limit(1)
        .execute()
    )
    records = response.data or []
    if not records:
        return None
    return records[0].get("preferred_language")
