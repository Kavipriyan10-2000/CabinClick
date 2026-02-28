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
        .order("created_at")
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
    aggregate_summary = _build_aggregate_summary(selected)
    instruction_text = " | ".join(
        part
        for part in [
            aggregate_summary,
            "; ".join(_format_request_for_instruction(record) for record in selected),
        ]
        if part
    )
    instruction_record = (
        supabase.table("crew_instructions")
        .insert(
            {
                "flight_id": flight["id"],
                "title": _build_instruction_title(selected, aggregate_summary),
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


def _format_request_for_instruction(record: dict[str, Any]) -> str:
    summary = record.get("translated_text") or record["request_text"]
    return f"Seat {record['seat_number']}: {summary}"


def _build_instruction_title(
    records: list[dict[str, Any]],
    aggregate_summary: str,
) -> str:
    if aggregate_summary:
        return f"Serve {len(records)} request(s) - {aggregate_summary}"
    return f"Serve {len(records)} request(s)"


def _build_aggregate_summary(records: list[dict[str, Any]]) -> str:
    item_totals: dict[str, int] = {}
    fallback_requests = 0

    for record in records:
        action_items = ((record.get("metadata") or {}).get("action_items")) or []
        if not action_items:
            fallback_requests += 1
            continue

        for action_item in action_items:
            label = (
                action_item.get("normalized_item")
                or action_item.get("item")
                or "item"
            )
            quantity = action_item.get("quantity") or 1
            item_totals[label] = item_totals.get(label, 0) + int(quantity)

    parts = [f"{quantity} {label}" for label, quantity in sorted(item_totals.items())]
    if fallback_requests:
        parts.append(f"{fallback_requests} uncategorized request(s)")
    return f"Totals: {', '.join(parts)}" if parts else ""
