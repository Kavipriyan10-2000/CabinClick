from datetime import datetime, timezone
from enum import Enum
from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field


class RequestPriority(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"


class PipelineStatus(str, Enum):
    queued = "queued"


class ExtractedAction(BaseModel):
    action_type: str = Field(
        ...,
        description="Future action label, such as blanket_request or medical_support.",
    )
    description: str | None = Field(
        default=None,
        description="Human-readable explanation for the crew.",
    )
    target_zone: str | None = Field(
        default=None,
        description="Future target zone, aisle, or cabin section.",
    )
    priority: RequestPriority = Field(default=RequestPriority.medium)
    parameters: dict[str, Any] = Field(default_factory=dict)


class PassengerSpeechRequest(BaseModel):
    passenger_id: str = Field(
        ...,
        description="Frontend or airline-specific passenger identifier.",
    )
    seat_number: str = Field(
        ...,
        description="Passenger seat location, for example 12A.",
    )
    transcript: str = Field(
        ...,
        min_length=1,
        description="Raw speech transcript captured by the frontend.",
    )
    source_language: str | None = Field(
        default=None,
        description="Language reported by the client before translation.",
    )
    cabin_section: str | None = Field(
        default=None,
        description="Cabin segment such as first, business, or economy.",
    )
    metadata: dict[str, Any] = Field(
        default_factory=dict,
        description="Extensible client payload for future routing hints.",
    )


class PassengerSpeechResponse(BaseModel):
    request_id: UUID
    status: PipelineStatus = PipelineStatus.queued
    received_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
    )
    original_transcript: str
    translated_text: str | None = Field(
        default=None,
        description="Placeholder for future translated output.",
    )
    extracted_actions: list[ExtractedAction] = Field(
        default_factory=list,
        description="Placeholder list for future action extraction results.",
    )
    message: str
