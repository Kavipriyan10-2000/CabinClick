from app.schemas.crew_operations import (
    CrewAccessRequest,
    CrewAccessResponse,
    CrewInstructionCompleteResponse,
    CrewInstructionListResponse,
    CrewInstructionRecord,
    CrewMemberListResponse,
    WorkingCrewMemberListResponse,
    WorkingCrewMemberRecord,
    CrewQueueRequestListResponse,
    CrewQueueRequestRecord,
    CrewMemberRole,
    CrewMemberSummary,
)
from app.schemas.language import LanguageCode
from app.schemas.request_catalog import request_label_for
from app.db.supabase import get_supabase_client
from app.services._flight_context import get_active_flight
from app.services.instruction_batcher import emit_crew_instruction_if_needed
from app.services.voice_requests import localize_instruction_for_crew, localize_text_for_crew


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
            preferred_language=record.get("preferred_language") or LanguageCode.en,
        )
        for record in (response.data or [])
    ]
    return CrewMemberListResponse(
        flight_id=flight["id"],
        flight_number=flight["flight_number"],
        members=members,
        message="Crew roster loaded from Supabase.",
    )


def list_working_crew_members() -> WorkingCrewMemberListResponse:
    flight = get_active_flight()
    response = (
        get_supabase_client()
        .table("crew_access_sessions")
        .select("id, created_at, device_id, crew_members(*)")
        .eq("flight_id", flight["id"])
        .eq("status", "active")
        .order("created_at", desc=True)
        .execute()
    )

    seen_member_codes: set[str] = set()
    members: list[WorkingCrewMemberRecord] = []
    for record in response.data or []:
        crew_member = record.get("crew_members") or {}
        crew_member_code = crew_member.get("crew_member_code")
        if not crew_member_code or crew_member_code in seen_member_codes:
            continue
        seen_member_codes.add(crew_member_code)
        members.append(
            WorkingCrewMemberRecord(
                access_id=record["id"],
                access_created_at=record["created_at"],
                crew_member_id=crew_member_code,
                full_name=crew_member["full_name"],
                role=crew_member["role"],
                device_id=record.get("device_id") or crew_member.get("device_id"),
                assigned_zone=crew_member.get("assigned_zone"),
                preferred_language=crew_member.get("preferred_language") or LanguageCode.en,
            )
        )

    return WorkingCrewMemberListResponse(
        flight_id=flight["id"],
        flight_number=flight["flight_number"],
        members=members,
        message="Working crew members loaded from active crew access sessions.",
    )


def list_crew_instructions(
    *,
    crew_member_code: str | None = None,
    preferred_language: LanguageCode | str = LanguageCode.en,
) -> CrewInstructionListResponse:
    flight = get_active_flight()
    supabase = get_supabase_client()
    emit_crew_instruction_if_needed()
    requested_language = (
        preferred_language.value
        if isinstance(preferred_language, LanguageCode)
        else preferred_language
    )
    crew_language = requested_language or _get_crew_member_language(
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
                language=language or LanguageCode.en,
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


def complete_crew_instruction(
    *,
    instruction_id: str,
) -> CrewInstructionCompleteResponse:
    flight = get_active_flight()
    supabase = get_supabase_client()
    request_links = (
        supabase.table("crew_instruction_requests")
        .select("request_id")
        .eq("instruction_id", instruction_id)
        .execute()
    )
    request_ids = [record["request_id"] for record in (request_links.data or [])]

    update_response = (
        supabase.table("crew_instructions")
        .update({"status": "completed"})
        .eq("flight_id", flight["id"])
        .eq("id", instruction_id)
        .execute()
    )
    records = update_response.data or []
    if not records:
        raise ValueError(f"Instruction {instruction_id} was not found.")

    if request_ids:
        (
            supabase.table("passenger_requests")
            .update({"status": "completed"})
            .in_("id", request_ids)
            .execute()
        )

    record = records[0]
    return CrewInstructionCompleteResponse(
        instruction_id=record["id"],
        status=record["status"],
        updated_at=record["updated_at"],
        message="Crew instruction marked as completed.",
    )


def list_queued_passenger_requests(
    *,
    crew_member_code: str | None = None,
    preferred_language: LanguageCode | str = LanguageCode.en,
) -> CrewQueueRequestListResponse:
    flight = get_active_flight()
    supabase = get_supabase_client()
    requested_language = (
        preferred_language.value
        if isinstance(preferred_language, LanguageCode)
        else preferred_language
    )
    crew_language = requested_language or _get_crew_member_language(
        supabase=supabase,
        flight_id=flight["id"],
        crew_member_code=crew_member_code,
    )
    response = (
        supabase.table("passenger_requests")
        .select("*")
        .eq("flight_id", flight["id"])
        .eq("status", "submitted")
        .order("created_at")
        .execute()
    )

    items = []
    for record in response.data or []:
        base_text = record.get("translated_text") or record["request_text"]
        display_text, language = localize_text_for_crew(
            text=base_text,
            target_language=crew_language,
            source_language="en" if record.get("translated_text") else record.get("source_language") or "en",
        )
        items.append(
            CrewQueueRequestRecord(
                request_id=record["id"],
                flight_id=record["flight_id"],
                seat_number=record["seat_number"],
                category=record["category"],
                category_label=_request_label(record["category"]),
                request_text=record["request_text"],
                display_text=display_text,
                language=language or LanguageCode.en,
                created_at=record["created_at"],
            )
        )

    return CrewQueueRequestListResponse(
        flight_id=flight["id"],
        flight_number=flight["flight_number"],
        items=items,
        message="Queued passenger requests loaded from Supabase.",
    )


def _get_crew_member_language(
    *,
    supabase,
    flight_id: str,
    crew_member_code: str | None,
) -> str:
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
        return LanguageCode.en.value
    return records[0].get("preferred_language") or LanguageCode.en.value


def _request_label(category: str) -> str:
    try:
        return request_label_for(category)
    except ValueError:
        return str(category)
