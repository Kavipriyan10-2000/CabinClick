from datetime import datetime, timezone
from enum import Enum
from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field

from app.schemas.request_management import PassengerRequestRecord, PassengerRequestStatus


class CrewMemberRole(str, Enum):
    purser = "purser"
    lead = "lead"
    attendant = "attendant"


class CrewInstructionPriority(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"


class CrewInstructionStatus(str, Enum):
    open = "open"
    assigned = "assigned"
    acknowledged = "acknowledged"
    completed = "completed"


class CrewMemberSummary(BaseModel):
    crew_member_id: str
    full_name: str
    role: CrewMemberRole
    device_id: str | None = None
    assigned_zone: str | None = None


class CrewMemberListResponse(BaseModel):
    members: list[CrewMemberSummary] = Field(default_factory=list)
    message: str


class CrewRequestFeedResponse(BaseModel):
    items: list[PassengerRequestRecord] = Field(default_factory=list)
    message: str


class CrewRequestStatusUpdate(BaseModel):
    status: PassengerRequestStatus
    crew_member_id: str | None = Field(
        default=None,
        description="Crew member performing the status change.",
    )
    note: str | None = Field(
        default=None,
        description="Optional operational note attached to the status update.",
    )


class CrewRequestStatusUpdateResponse(BaseModel):
    request_id: str
    status: PassengerRequestStatus
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
    )
    message: str


class CrewInstructionCreate(BaseModel):
    title: str = Field(
        ...,
        min_length=1,
        description="Short title shown on the crew device.",
    )
    instruction_text: str = Field(
        ...,
        min_length=1,
        description="Operational instruction derived from passenger requests.",
    )
    request_ids: list[UUID] = Field(
        default_factory=list,
        description="Passenger requests connected to this instruction.",
    )
    assignee_ids: list[str] = Field(
        default_factory=list,
        description="Crew members or devices expected to handle the instruction.",
    )
    priority: CrewInstructionPriority = Field(
        default=CrewInstructionPriority.medium,
    )
    payload: dict[str, Any] = Field(
        default_factory=dict,
        description="Extensible structured data for downstream device handling.",
    )


class CrewInstructionRecord(BaseModel):
    instruction_id: UUID
    title: str
    instruction_text: str
    request_ids: list[UUID] = Field(default_factory=list)
    assignee_ids: list[str] = Field(default_factory=list)
    priority: CrewInstructionPriority = CrewInstructionPriority.medium
    status: CrewInstructionStatus = CrewInstructionStatus.open
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
    )


class CrewInstructionListResponse(BaseModel):
    items: list[CrewInstructionRecord] = Field(default_factory=list)
    message: str


class CrewInstructionStatusUpdate(BaseModel):
    status: CrewInstructionStatus
    crew_member_id: str | None = Field(
        default=None,
        description="Crew member acknowledging or completing the instruction.",
    )
    note: str | None = Field(
        default=None,
        description="Optional note captured during the workflow.",
    )


class CrewInstructionStatusUpdateResponse(BaseModel):
    instruction_id: str
    status: CrewInstructionStatus
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
    )
    message: str


class CrewQueueStatus(str, Enum):
    collecting = "collecting"
    being_served = "being_served"


class CrewQueueItem(BaseModel):
    item_name: str
    quantity: int = Field(..., ge=1)
    seat_numbers: list[str] = Field(default_factory=list)
    request_ids: list[UUID] = Field(default_factory=list)
    added_to_tray: bool = False


class CrewQueueRequestRecord(BaseModel):
    queue_request_id: UUID
    status: CrewQueueStatus = CrewQueueStatus.collecting
    crew_member_id: str | None = None
    tray_items: list[CrewQueueItem] = Field(default_factory=list)
    pending_items: list[CrewQueueItem] = Field(default_factory=list)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
    )


class CrewQueueStateResponse(BaseModel):
    active_request: CrewQueueRequestRecord
    message: str


class CrewQueueTraySelection(BaseModel):
    item_name: str
    seat_numbers: list[str] = Field(default_factory=list)
    request_ids: list[UUID] = Field(default_factory=list)
    quantity: int = Field(default=1, ge=1)


class CrewQueueAddToTrayRequest(BaseModel):
    crew_member_id: str
    selections: list[CrewQueueTraySelection] = Field(
        default_factory=list,
        description="Items the crew member has physically added to the tray.",
    )


class CrewQueueAddToTrayResponse(BaseModel):
    active_request: CrewQueueRequestRecord
    message: str


class CrewQueueDispatchRequest(BaseModel):
    crew_member_id: str
    note: str | None = Field(
        default=None,
        description="Optional note captured when the crew member leaves to serve.",
    )


class CrewQueueDispatchResponse(BaseModel):
    served_request: CrewQueueRequestRecord
    next_request: CrewQueueRequestRecord
    message: str
