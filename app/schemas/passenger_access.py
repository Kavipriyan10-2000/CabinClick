from datetime import datetime, timezone
from enum import Enum
from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field

from app.schemas.language import LanguageCode


class PassengerAccessStatus(str, Enum):
    active = "active"


class PassengerScreenAction(str, Enum):
    create_request = "create_request"
    view_requests = "view_requests"


class PassengerSeatAccessRequest(BaseModel):
    qr_token: str = Field(
        ...,
        min_length=1,
        description="Opaque token encoded in the seat QR code.",
    )
    device_label: str | None = Field(
        default=None,
        description="Optional frontend device label for analytics or auditing.",
    )
    preferred_language: LanguageCode = Field(
        default=LanguageCode.en,
        description="Language hint captured from the passenger device. Allowed values: en, de.",
    )
    metadata: dict[str, Any] = Field(
        default_factory=dict,
        description="Extensible client metadata for the seat access flow.",
    )


class PassengerSeatAccessResponse(BaseModel):
    access_id: UUID
    status: PassengerAccessStatus = PassengerAccessStatus.active
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
    )
    flight_number: str
    seat_number: str
    cabin_section: str | None = Field(
        default=None,
        description="Optional cabin segment resolved from the seat map later on.",
    )
    available_actions: list[PassengerScreenAction] = Field(
        default_factory=lambda: [
            PassengerScreenAction.create_request,
            PassengerScreenAction.view_requests,
        ],
    )
    message: str
