from fastapi import APIRouter, status

from app.schemas.crew_operations import (
    CrewQueueAddToTrayRequest,
    CrewQueueAddToTrayResponse,
    CrewQueueDispatchRequest,
    CrewQueueDispatchResponse,
    CrewQueueStateResponse,
    CrewInstructionCreate,
    CrewInstructionListResponse,
    CrewInstructionRecord,
    CrewInstructionStatusUpdate,
    CrewInstructionStatusUpdateResponse,
    CrewMemberListResponse,
    CrewRequestFeedResponse,
    CrewRequestStatusUpdate,
    CrewRequestStatusUpdateResponse,
)
from app.services.crew_operations import (
    add_items_to_queue_tray,
    create_crew_instruction,
    dispatch_queue_request,
    get_active_queue_request,
    list_crew_instructions,
    list_crew_members,
    list_requests_for_crew,
    update_crew_instruction_status,
    update_passenger_request_status,
)

router = APIRouter(prefix="/crew", tags=["crew"])


@router.get(
    "/members",
    response_model=CrewMemberListResponse,
)
def get_crew_members() -> CrewMemberListResponse:
    return list_crew_members()


@router.get(
    "/requests",
    response_model=CrewRequestFeedResponse,
)
def get_requests() -> CrewRequestFeedResponse:
    return list_requests_for_crew()


@router.get(
    "/queue/current",
    response_model=CrewQueueStateResponse,
)
def get_current_queue_request() -> CrewQueueStateResponse:
    return get_active_queue_request()


@router.post(
    "/queue/current/tray-items",
    response_model=CrewQueueAddToTrayResponse,
)
def post_queue_tray_items(
    payload: CrewQueueAddToTrayRequest,
) -> CrewQueueAddToTrayResponse:
    return add_items_to_queue_tray(payload=payload)


@router.post(
    "/queue/current/dispatch",
    response_model=CrewQueueDispatchResponse,
)
def post_queue_dispatch(
    payload: CrewQueueDispatchRequest,
) -> CrewQueueDispatchResponse:
    return dispatch_queue_request(payload=payload)


@router.patch(
    "/requests/{request_id}/status",
    response_model=CrewRequestStatusUpdateResponse,
)
def patch_passenger_request_status(
    request_id: str,
    payload: CrewRequestStatusUpdate,
) -> CrewRequestStatusUpdateResponse:
    return update_passenger_request_status(request_id=request_id, payload=payload)


@router.get(
    "/instructions",
    response_model=CrewInstructionListResponse,
)
def get_instructions() -> CrewInstructionListResponse:
    return list_crew_instructions()


@router.post(
    "/instructions",
    response_model=CrewInstructionRecord,
    status_code=status.HTTP_201_CREATED,
)
def post_crew_instruction(
    payload: CrewInstructionCreate,
) -> CrewInstructionRecord:
    return create_crew_instruction(payload=payload)


@router.patch(
    "/instructions/{instruction_id}/status",
    response_model=CrewInstructionStatusUpdateResponse,
)
def patch_crew_instruction_status(
    instruction_id: str,
    payload: CrewInstructionStatusUpdate,
) -> CrewInstructionStatusUpdateResponse:
    return update_crew_instruction_status(
        instruction_id=instruction_id,
        payload=payload,
    )
