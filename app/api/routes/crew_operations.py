from fastapi import APIRouter, status

from app.schemas.crew_operations import (
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
    create_crew_instruction,
    list_crew_instructions,
    list_crew_members,
    list_flight_requests_for_crew,
    update_crew_instruction_status,
    update_passenger_request_status,
)

router = APIRouter(prefix="/crew", tags=["crew"])


@router.get(
    "/flights/{flight_id}/members",
    response_model=CrewMemberListResponse,
)
def get_flight_crew_members(flight_id: str) -> CrewMemberListResponse:
    return list_crew_members(flight_id=flight_id)


@router.get(
    "/flights/{flight_id}/requests",
    response_model=CrewRequestFeedResponse,
)
def get_flight_requests(flight_id: str) -> CrewRequestFeedResponse:
    return list_flight_requests_for_crew(flight_id=flight_id)


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
    "/flights/{flight_id}/instructions",
    response_model=CrewInstructionListResponse,
)
def get_flight_instructions(flight_id: str) -> CrewInstructionListResponse:
    return list_crew_instructions(flight_id=flight_id)


@router.post(
    "/flights/{flight_id}/instructions",
    response_model=CrewInstructionRecord,
    status_code=status.HTTP_201_CREATED,
)
def post_crew_instruction(
    flight_id: str,
    payload: CrewInstructionCreate,
) -> CrewInstructionRecord:
    return create_crew_instruction(flight_id=flight_id, payload=payload)


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
