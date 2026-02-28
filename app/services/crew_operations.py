from uuid import uuid4

from app.schemas.crew_operations import (
    CrewAccessRequest,
    CrewAccessResponse,
    CrewInstructionListResponse,
    CrewInstructionRecord,
    CrewMemberListResponse,
    CrewMemberRole,
    CrewMemberSummary,
)


def create_crew_access(payload: CrewAccessRequest) -> CrewAccessResponse:
    return CrewAccessResponse(
        access_id=uuid4(),
        crew_member_id=payload.crew_member_id,
        device_id=payload.device_id,
        message="Crew iPad access accepted.",
    )


def list_crew_members() -> CrewMemberListResponse:
    return CrewMemberListResponse(
        members=[
            CrewMemberSummary(
                crew_member_id="crew-001",
                full_name="Aisha Khan",
                role=CrewMemberRole.lead,
                device_id="crew-device-1",
                assigned_zone="Forward cabin",
            ),
            CrewMemberSummary(
                crew_member_id="crew-002",
                full_name="Daniel Perez",
                role=CrewMemberRole.attendant,
                device_id="crew-device-2",
                assigned_zone="Mid cabin",
            ),
        ],
        message=(
            "Crew roster placeholder. Real flight assignment data will be "
            "connected later."
        ),
    )


def list_crew_instructions() -> CrewInstructionListResponse:
    return CrewInstructionListResponse(
        items=[
            CrewInstructionRecord(
                instruction_id=uuid4(),
                title="Serve forward cabin refreshments",
                instruction_text="Deliver water and apples to waiting passengers.",
                seat_numbers=["10A", "12C", "14C"],
            ),
        ],
        message=(
            "Crew instruction feed placeholder. Instruction storage and "
            "assignment will be connected in a later implementation."
        ),
    )
