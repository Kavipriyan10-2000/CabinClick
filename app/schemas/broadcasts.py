from datetime import datetime, timezone
from enum import Enum
from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field


class BroadcastPriority(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"


class BroadcastStatus(str, Enum):
    queued = "queued"


class CrewBroadcastRequest(BaseModel):
    message: str = Field(
        ...,
        min_length=1,
        description="Crew-facing message that should reach the target devices.",
    )
    event_type: str = Field(
        ...,
        description="Short event name, such as passenger_request or service_alert.",
    )
    device_ids: list[str] = Field(
        ...,
        min_length=1,
        description="Explicit list of crew handheld device identifiers.",
    )
    request_id: UUID | None = Field(
        default=None,
        description="Optional link back to the originating passenger request.",
    )
    priority: BroadcastPriority = Field(default=BroadcastPriority.medium)
    payload: dict[str, Any] = Field(
        default_factory=dict,
        description="Extensible structured data for the receiving device.",
    )


class CrewBroadcastResponse(BaseModel):
    broadcast_id: UUID
    status: BroadcastStatus = BroadcastStatus.queued
    queued_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
    )
    targeted_devices: list[str]
    message: str
