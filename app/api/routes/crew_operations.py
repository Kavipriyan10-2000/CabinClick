from fastapi import APIRouter, status

from app.schemas.crew_operations import (
    CrewAccessRequest,
    CrewAccessResponse,
    CrewInstructionListResponse,
    CrewMemberListResponse,
)
from app.services.crew_operations import (
    create_crew_access,
    list_crew_instructions,
    list_crew_members,
)

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
    "/instructions",
    response_model=CrewInstructionListResponse,
)
def get_instructions() -> CrewInstructionListResponse:
    return list_crew_instructions()
