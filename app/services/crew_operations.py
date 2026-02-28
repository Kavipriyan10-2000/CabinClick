from uuid import uuid4

from app.schemas.crew_operations import (
    CrewQueueAddToTrayRequest,
    CrewQueueAddToTrayResponse,
    CrewQueueDispatchRequest,
    CrewQueueDispatchResponse,
    CrewQueueItem,
    CrewQueueRequestRecord,
    CrewQueueStateResponse,
    CrewQueueStatus,
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


def _sample_pending_queue_items() -> list[CrewQueueItem]:
    return [
        CrewQueueItem(
            item_name="water",
            quantity=3,
            seat_numbers=["10A", "12C", "15D"],
            request_ids=[uuid4(), uuid4(), uuid4()],
            added_to_tray=False,
        ),
        CrewQueueItem(
            item_name="apple",
            quantity=2,
            seat_numbers=["12C", "18A"],
            request_ids=[uuid4(), uuid4()],
            added_to_tray=False,
        ),
        CrewQueueItem(
            item_name="custom assistance",
            quantity=1,
            seat_numbers=["14C"],
            request_ids=[uuid4()],
            added_to_tray=False,
        ),
    ]


def get_active_queue_request() -> CrewQueueStateResponse:
    return CrewQueueStateResponse(
        active_request=CrewQueueRequestRecord(
            queue_request_id=uuid4(),
            status=CrewQueueStatus.collecting,
            pending_items=_sample_pending_queue_items(),
        ),
        message=(
            "Current request-in-progress placeholder. Incoming passenger "
            "requests are grouped here until the crew member dispatches."
        ),
    )


def add_items_to_queue_tray(
    payload: CrewQueueAddToTrayRequest,
) -> CrewQueueAddToTrayResponse:
    tray_items = [
        CrewQueueItem(
            item_name=selection.item_name,
            quantity=selection.quantity,
            seat_numbers=selection.seat_numbers,
            request_ids=selection.request_ids,
            added_to_tray=True,
        )
        for selection in payload.selections
    ]

    pending_items = [
        CrewQueueItem(
            item_name="water",
            quantity=1,
            seat_numbers=["15D"],
            request_ids=[uuid4()],
            added_to_tray=False,
        ),
        CrewQueueItem(
            item_name="custom assistance",
            quantity=1,
            seat_numbers=["14C"],
            request_ids=[uuid4()],
            added_to_tray=False,
        ),
    ]

    return CrewQueueAddToTrayResponse(
        active_request=CrewQueueRequestRecord(
            queue_request_id=uuid4(),
            status=CrewQueueStatus.collecting,
            crew_member_id=payload.crew_member_id,
            tray_items=tray_items,
            pending_items=pending_items,
        ),
        message=(
            "Selected items were added to the request-in-progress tray. "
            "Unselected instructions remain pending."
        ),
    )


def dispatch_queue_request(
    payload: CrewQueueDispatchRequest,
) -> CrewQueueDispatchResponse:
    served_request = CrewQueueRequestRecord(
        queue_request_id=uuid4(),
        status=CrewQueueStatus.being_served,
        crew_member_id=payload.crew_member_id,
        tray_items=[
            CrewQueueItem(
                item_name="water",
                quantity=2,
                seat_numbers=["10A", "12C"],
                request_ids=[uuid4(), uuid4()],
                added_to_tray=True,
            ),
            CrewQueueItem(
                item_name="apple",
                quantity=1,
                seat_numbers=["12C"],
                request_ids=[uuid4()],
                added_to_tray=True,
            ),
        ],
        pending_items=[],
    )

    next_request = CrewQueueRequestRecord(
        queue_request_id=uuid4(),
        status=CrewQueueStatus.collecting,
        pending_items=[
            CrewQueueItem(
                item_name="water",
                quantity=1,
                seat_numbers=["15D"],
                request_ids=[uuid4()],
                added_to_tray=False,
            ),
            CrewQueueItem(
                item_name="custom assistance",
                quantity=1,
                seat_numbers=["14C"],
                request_ids=[uuid4()],
                added_to_tray=False,
            ),
            CrewQueueItem(
                item_name="juice",
                quantity=1,
                seat_numbers=["20B"],
                request_ids=[uuid4()],
                added_to_tray=False,
            ),
        ],
    )

    return CrewQueueDispatchResponse(
        served_request=served_request,
        next_request=next_request,
        message=(
            "The current request-in-progress was marked being_served. "
            "Remaining and new instructions were moved into the next request."
        ),
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


def list_requests_for_crew() -> CrewRequestFeedResponse:
    return CrewRequestFeedResponse(
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


def list_crew_instructions() -> CrewInstructionListResponse:
    return CrewInstructionListResponse(
        message=(
            "Crew instruction feed placeholder. Instruction storage and "
            "assignment will be connected in a later implementation."
        ),
    )


def create_crew_instruction(payload: CrewInstructionCreate) -> CrewInstructionRecord:
    return CrewInstructionRecord(
        instruction_id=uuid4(),
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
