from fastapi import APIRouter

from app.schemas.management import RequestSummaryResponse
from app.services.management import get_request_summary

router = APIRouter(prefix="/management", tags=["management"])


@router.get(
    "/requests/summary",
    response_model=RequestSummaryResponse,
)
def get_management_request_summary() -> RequestSummaryResponse:
    return get_request_summary()
