from app.schemas.request_management import (
    PassengerRequestCreate,
    PassengerRequestListResponse,
    PassengerRequestRecord,
    PassengerRequestSource,
)
from app.schemas.language import LanguageCode
from app.services._flight_context import get_active_flight
from app.db.supabase import get_supabase_client
from app.services.instruction_batcher import emit_crew_instruction_if_needed
from app.services.seat_layout import validate_seat_number
from app.services.voice_requests import interpret_passenger_audio


def list_passenger_requests(
    seat_number: str,
) -> PassengerRequestListResponse:
    validated_seat_number = validate_seat_number(seat_number)
    flight = get_active_flight()
    response = (
        get_supabase_client()
        .table("passenger_requests")
        .select("*")
        .eq("flight_id", flight["id"])
        .eq("seat_number", validated_seat_number)
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
            source_language=record.get("source_language") or LanguageCode.en,
            translated_text=record.get("translated_text"),
            metadata=record.get("metadata") or {},
            created_at=record["created_at"],
            updated_at=record["updated_at"],
        )
        for record in (response.data or [])
    ]
    return PassengerRequestListResponse(
        flight_id=flight["id"],
        seat_number=validated_seat_number,
        items=items,
        message=(
            "Passenger request history loaded from Supabase."
        ),
    )


def create_passenger_request(
    seat_number: str,
    payload: PassengerRequestCreate,
) -> PassengerRequestRecord:
    return _create_passenger_request_record(
        seat_number=seat_number,
        payload=payload,
    )


def create_voice_passenger_request(
    *,
    seat_number: str,
    audio_bytes: bytes,
    mime_type: str,
    source_language_hint: LanguageCode | str = LanguageCode.en,
) -> PassengerRequestRecord:
    voice_result = interpret_passenger_audio(
        audio_bytes=audio_bytes,
        mime_type=mime_type,
        source_language_hint=(
            source_language_hint.value
            if isinstance(source_language_hint, LanguageCode)
            else source_language_hint
        ),
    )
    payload = PassengerRequestCreate(
        category=voice_result.category,
        request_text=voice_result.passenger_message,
        source=PassengerRequestSource.speech,
        source_language=voice_result.source_language,
        metadata={
            **voice_result.metadata,
            "action_items": [
                item.model_dump(exclude_none=True)
                for item in voice_result.action_items
            ],
            "passenger_message": voice_result.passenger_message,
        },
    )
    return _create_passenger_request_record(
        seat_number=seat_number,
        payload=payload,
        translated_text=voice_result.crew_summary,
    )


def _create_passenger_request_record(
    *,
    seat_number: str,
    payload: PassengerRequestCreate,
    translated_text: str | None = None,
) -> PassengerRequestRecord:
    validated_seat_number = validate_seat_number(seat_number)
    flight = get_active_flight()
    access_session_response = (
        get_supabase_client()
        .table("seat_access_sessions")
        .select("id")
        .eq("flight_id", flight["id"])
        .eq("seat_number", validated_seat_number)
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
                "seat_number": validated_seat_number,
                "category": payload.category,
                "source": payload.source,
                "request_text": payload.request_text,
                "status": "submitted",
                "source_language": payload.source_language,
                "translated_text": translated_text,
                "metadata": payload.metadata,
            }
        )
        .execute()
    )
    record = response.data[0]
    emit_crew_instruction_if_needed()

    return PassengerRequestRecord(
        request_id=record["id"],
        flight_id=record["flight_id"],
        seat_number=validated_seat_number,
        category=payload.category,
        source=payload.source,
        status=record["status"],
        request_text=payload.request_text,
        source_language=record.get("source_language") or LanguageCode.en,
        translated_text=record.get("translated_text"),
        metadata=record.get("metadata") or {},
        created_at=record["created_at"],
        updated_at=record["updated_at"],
    )
