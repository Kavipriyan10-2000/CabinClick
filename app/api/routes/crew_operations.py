from fastapi import APIRouter, HTTPException, Query, status

from app.schemas.crew_operations import (
    CrewAccessRequest,
    CrewAccessResponse,
    CrewInstructionCompleteResponse,
    CrewInstructionListResponse,
    CrewMemberListResponse,
    CrewQueueRequestListResponse,
    LufthansaCrewListResponse,
    WorkingCrewMemberListResponse,
)
from app.schemas.language import LanguageCode
from app.services.crew_operations import (
    complete_crew_instruction,
    create_crew_access,
    list_crew_instructions,
    list_crew_members,
    list_queued_passenger_requests,
    list_working_crew_members,
)
from app.services.lufthansa_flightops import get_mock_lufthansa_crew_list

router = APIRouter(prefix="/crew", tags=["crew"])


@router.post(
    "/access",
    response_model=CrewAccessResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_ipad_access(
    payload: CrewAccessRequest,
) -> CrewAccessResponse:
    return create_crew_access(payload)


@router.get(
    "/members",
    response_model=CrewMemberListResponse,
)
def get_crew_members() -> CrewMemberListResponse:
    return list_crew_members()


@router.get(
    "/working-members",
    response_model=WorkingCrewMemberListResponse,
)
def get_working_crew_members() -> WorkingCrewMemberListResponse:
    return list_working_crew_members()


@router.get(
    "/instructions",
    response_model=CrewInstructionListResponse,
)
def get_instructions(
    crew_member_code: str | None = Query(default=None),
    preferred_language: LanguageCode = Query(default=LanguageCode.en),
) -> CrewInstructionListResponse:
    return list_crew_instructions(
        crew_member_code=crew_member_code,
        preferred_language=preferred_language.value,
    )


@router.get(
    "/request-queue",
    response_model=CrewQueueRequestListResponse,
)
def get_request_queue(
    crew_member_code: str | None = Query(default=None),
    preferred_language: LanguageCode = Query(default=LanguageCode.en),
) -> CrewQueueRequestListResponse:
    return list_queued_passenger_requests(
        crew_member_code=crew_member_code,
        preferred_language=preferred_language.value,
    )


@router.patch(
    "/instructions/{instruction_id}/complete",
    response_model=CrewInstructionCompleteResponse,
)
def close_instruction(
    instruction_id: str,
) -> CrewInstructionCompleteResponse:
    try:
        return complete_crew_instruction(instruction_id=instruction_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get(
    "/lufthansa/crew-list",
    response_model=LufthansaCrewListResponse,
)
def get_lufthansa_crew_list() -> LufthansaCrewListResponse:
    return get_mock_lufthansa_crew_list()
