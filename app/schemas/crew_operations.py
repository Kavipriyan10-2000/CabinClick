from datetime import datetime, timezone
from enum import Enum
from uuid import UUID

from pydantic import BaseModel, Field

from app.schemas.language import LanguageCode


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
    preferred_language: LanguageCode = LanguageCode.en


class CrewMemberListResponse(BaseModel):
    flight_id: UUID
    flight_number: str
    members: list[CrewMemberSummary] = Field(default_factory=list)
    message: str


class WorkingCrewMemberRecord(CrewMemberSummary):
    access_id: UUID
    access_created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
    )


class WorkingCrewMemberListResponse(BaseModel):
    flight_id: UUID
    flight_number: str
    members: list[WorkingCrewMemberRecord] = Field(default_factory=list)
    message: str


class CrewAccessStatus(str, Enum):
    active = "active"


class CrewAccessRequest(BaseModel):
    crew_member_code: str = Field(..., min_length=1)
    device_id: str = Field(..., min_length=1)
    full_name: str | None = None
    role: CrewMemberRole = CrewMemberRole.attendant
    assigned_zone: str | None = None
    preferred_language: LanguageCode = LanguageCode.en


class CrewAccessResponse(BaseModel):
    access_id: UUID
    flight_id: UUID
    flight_number: str
    crew_member_id: UUID
    crew_member_code: str
    device_id: str
    status: CrewAccessStatus = CrewAccessStatus.active
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
    )
    message: str


class CrewInstructionRecord(BaseModel):
    instruction_id: UUID
    flight_id: UUID
    title: str
    instruction_text: str
    language: LanguageCode = LanguageCode.en
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
    flight_id: UUID
    flight_number: str
    items: list[CrewInstructionRecord] = Field(default_factory=list)
    message: str


class CrewInstructionCompleteResponse(BaseModel):
    instruction_id: UUID
    status: CrewInstructionStatus = CrewInstructionStatus.completed
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
    )
    message: str


class CrewQueueRequestRecord(BaseModel):
    request_id: UUID
    flight_id: UUID
    seat_number: str
    category: str
    category_label: str
    request_text: str
    display_text: str
    language: LanguageCode = LanguageCode.en
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
    )


class CrewQueueRequestListResponse(BaseModel):
    flight_id: UUID
    flight_number: str
    items: list[CrewQueueRequestRecord] = Field(default_factory=list)
    message: str


class LufthansaCrewMemberRecord(BaseModel):
    crew_member_code: str
    full_name: str
    rank: str | None = None
    role: str | None = None


class CrewDeviceAssignment(BaseModel):
    device_code: str
    seat_scope: str
    crew_member_code: str | None = None
    full_name: str | None = None


class LufthansaCrewListResponse(BaseModel):
    items: list[LufthansaCrewMemberRecord] = Field(default_factory=list)
    assignments: list[CrewDeviceAssignment] = Field(default_factory=list)
    message: str
