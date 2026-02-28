from fastapi import APIRouter, status

from app.schemas.broadcasts import CrewBroadcastRequest, CrewBroadcastResponse
from app.services.broadcasts import queue_crew_broadcast

router = APIRouter(prefix="/crew/broadcasts", tags=["crew-broadcasts"])


@router.post(
    "",
    response_model=CrewBroadcastResponse,
    status_code=status.HTTP_202_ACCEPTED,
)
def broadcast_to_crew_devices(
    payload: CrewBroadcastRequest,
) -> CrewBroadcastResponse:
    return queue_crew_broadcast(payload)
