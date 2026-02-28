from collections.abc import Mapping
from typing import Any

from fastapi import HTTPException

from app.db.supabase import get_supabase_client


def get_active_flight() -> Mapping[str, Any]:
    response = (
        get_supabase_client()
        .table("flights")
        .select("*")
        .eq("status", "active")
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )
    flights = response.data or []
    if not flights:
        raise HTTPException(status_code=404, detail="No active flight registered.")
    return flights[0]
