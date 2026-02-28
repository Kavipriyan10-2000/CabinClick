from uuid import uuid4

from app.schemas.crew_operations import (
    CrewInstructionCreate,
    CrewInstructionListResponse,
    CrewInstructionRecord,
    CrewInstructionStatusUpdate,
    CrewInstructionStatusUpdateResponse,
    CrewMemberListResponse,
    CrewMemberRole,
    CrewMemberSummary,
    CrewRequestFeedResponse,
    CrewRequestStatusUpdate,
    CrewRequestStatusUpdateResponse,
)


def list_crew_members(flight_id: str) -> CrewMemberListResponse:
    return CrewMemberListResponse(
        flight_id=flight_id,
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


def list_flight_requests_for_crew(flight_id: str) -> CrewRequestFeedResponse:
    return CrewRequestFeedResponse(
        flight_id=flight_id,
        message=(
            "Crew request feed placeholder. Request aggregation will be "
            "connected in a later implementation."
        ),
    )


def update_passenger_request_status(
    request_id: str,
    payload: CrewRequestStatusUpdate,
) -> CrewRequestStatusUpdateResponse:
    return CrewRequestStatusUpdateResponse(
        request_id=request_id,
        status=payload.status,
        message=(
            "Passenger request status accepted. Persistence and workflow "
            "transitions will be connected later."
        ),
    )


def list_crew_instructions(flight_id: str) -> CrewInstructionListResponse:
    return CrewInstructionListResponse(
        flight_id=flight_id,
        message=(
            "Crew instruction feed placeholder. Instruction storage and "
            "assignment will be connected in a later implementation."
        ),
    )


def create_crew_instruction(
    flight_id: str,
    payload: CrewInstructionCreate,
) -> CrewInstructionRecord:
    return CrewInstructionRecord(
        instruction_id=uuid4(),
        flight_id=flight_id,
        title=payload.title,
        instruction_text=payload.instruction_text,
        request_ids=payload.request_ids,
        assignee_ids=payload.assignee_ids,
        priority=payload.priority,
    )


def update_crew_instruction_status(
    instruction_id: str,
    payload: CrewInstructionStatusUpdate,
) -> CrewInstructionStatusUpdateResponse:
    return CrewInstructionStatusUpdateResponse(
        instruction_id=instruction_id,
        status=payload.status,
        message=(
            "Crew instruction status accepted. Persistence and delivery "
            "acknowledgements will be connected later."
        ),
    )
