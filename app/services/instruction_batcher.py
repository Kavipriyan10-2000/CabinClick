from datetime import datetime, timezone, timedelta
from typing import Any

from app.db.supabase import get_supabase_client
from app.services._flight_context import get_active_flight


def _parse_timestamp(value: str) -> datetime:
    if value.endswith("Z"):
        value = value[:-1] + "+00:00"
    return datetime.fromisoformat(value)


def emit_crew_instruction_if_needed() -> Any | None:
    flight = get_active_flight()
    supabase = get_supabase_client()
    pending = (
        supabase.table("passenger_requests")
        .select("*")
        .eq("flight_id", flight["id"])
        .eq("status", "submitted")
        .order("created_at", asc=True)
        .execute()
    )
    items = pending.data or []

    if not items:
        return None

    oldest = _parse_timestamp(items[0]["created_at"])
    now = datetime.now(timezone.utc)
    enough_items = len(items) >= 10
    exceeded_timer = (now - oldest) >= timedelta(minutes=5)
    if not (enough_items or exceeded_timer):
        return None

    selected = items[:10]
    seat_numbers = sorted({record["seat_number"] for record in selected})
    instruction_text = "; ".join(record["request_text"] for record in selected)
    instruction_record = (
        supabase.table("crew_instructions")
        .insert(
            {
                "flight_id": flight["id"],
                "title": f"Serve {len(selected)} request(s)",
                "instruction_text": instruction_text,
                "seat_numbers": seat_numbers,
            }
        )
        .execute()
    )
    instruction = instruction_record.data[0]

    assignments = [
        {"instruction_id": instruction["id"], "request_id": record["id"]}
        for record in selected
    ]
    if assignments:
        supabase.table("crew_instruction_requests").insert(assignments).execute()
        supabase.table("passenger_requests").update({"status": "being_served"}).in_(
            "id", [record["id"] for record in selected]
        ).execute()

    return instruction
