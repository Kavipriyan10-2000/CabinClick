from datetime import datetime, timezone
from enum import Enum
from uuid import UUID

from pydantic import BaseModel, Field


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


class CrewAccessStatus(str, Enum):
    active = "active"


class CrewAccessRequest(BaseModel):
    crew_member_id: str = Field(..., min_length=1)
    device_id: str = Field(..., min_length=1)


class CrewAccessResponse(BaseModel):
    access_id: UUID
    crew_member_id: str
    device_id: str
    status: CrewAccessStatus = CrewAccessStatus.active
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
    )
    message: str


class CrewInstructionRecord(BaseModel):
    instruction_id: UUID
    title: str
    instruction_text: str
    seat_numbers: list[str] = Field(default_factory=list)
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
