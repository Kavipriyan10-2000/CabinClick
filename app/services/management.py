from app.schemas.management import RequestSummaryItem, RequestSummaryResponse


def get_request_summary() -> RequestSummaryResponse:
    return RequestSummaryResponse(
        total_requests=18,
        active_seats=11,
        top_request_categories=[
            RequestSummaryItem(category="refreshment", total_requests=9),
            RequestSummaryItem(category="comfort", total_requests=6),
            RequestSummaryItem(category="assistance", total_requests=3),
        ],
        message="Management request summary placeholder.",
    )
