from app.db.supabase import get_supabase_client
from app.schemas.management import RequestSummaryCategory, RequestSummaryResponse
from app.services._flight_context import get_active_flight


def get_request_summary() -> RequestSummaryResponse:
    flight = get_active_flight()
    supabase = get_supabase_client()

    summary_response = (
        supabase.table("management_request_summary")
        .select("*")
        .eq("flight_id", flight["id"])
        .limit(1)
        .execute()
    )
    category_response = (
        supabase.table("management_request_category_summary")
        .select("*")
        .eq("flight_id", flight["id"])
        .order("total_requests", desc=True)
        .execute()
    )

    summary = summary_response.data[0] if summary_response.data else None
    categories = [
        RequestSummaryCategory(
            category=record["category"],
            total_requests=record["total_requests"],
        )
        for record in (category_response.data or [])
    ]

    return RequestSummaryResponse(
        flight_number=flight["flight_number"],
        total_requests=summary["total_requests"] if summary else 0,
        active_seats=summary["active_seats"] if summary else 0,
        submitted_requests=summary["submitted_requests"] if summary else 0,
        being_served_requests=summary["being_served_requests"] if summary else 0,
        completed_requests=summary["completed_requests"] if summary else 0,
        top_categories=categories,
        message="Management summary loaded from Supabase.",
    )
