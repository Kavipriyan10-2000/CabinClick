from datetime import datetime, timezone
from enum import Enum
from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field


class PassengerRequestSource(str, Enum):
    typed = "typed"
    speech = "speech"
    quick_action = "quick_action"


class PassengerRequestStatus(str, Enum):
    submitted = "submitted"
    being_served = "being_served"
    completed = "completed"
    cancelled = "cancelled"


class PassengerRequestCreate(BaseModel):
    category: str = Field(
        ...,
        description="Short request category such as food, medical, or seat_help.",
    )
    request_text: str = Field(
        ...,
        min_length=1,
        description="Passenger-facing request text submitted from the phone screen.",
    )
    source: PassengerRequestSource = Field(default=PassengerRequestSource.typed)
    source_language: str | None = Field(
        default=None,
        description="Language declared by the client when known.",
    )
    metadata: dict[str, Any] = Field(
        default_factory=dict,
        description="Extensible payload for future request context.",
    )


class PassengerVoiceActionItem(BaseModel):
    item: str = Field(..., min_length=1)
    quantity: int = Field(default=1, ge=1)
    notes: str | None = None
    normalized_item: str | None = Field(
        default=None,
        description="Language-neutral item label for backend processing.",
    )


class PassengerVoiceRequestResponse(BaseModel):
    category: str
    source_language: str | None = None
    passenger_message: str
    crew_summary: str
    action_items: list[PassengerVoiceActionItem] = Field(default_factory=list)
    metadata: dict[str, Any] = Field(default_factory=dict)


class PassengerRequestRecord(BaseModel):
    request_id: UUID
    flight_id: UUID
    seat_number: str
    category: str
    source: PassengerRequestSource
    status: PassengerRequestStatus = PassengerRequestStatus.submitted
    request_text: str
    source_language: str | None = None
    translated_text: str | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
    )


class PassengerRequestListResponse(BaseModel):
    flight_id: UUID
    seat_number: str
    items: list[PassengerRequestRecord] = Field(default_factory=list)
    message: str
