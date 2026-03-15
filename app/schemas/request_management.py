from datetime import datetime, timezone
from enum import Enum
from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field, field_validator

from app.schemas.language import LanguageCode
from app.schemas.request_catalog import RequestCode, normalize_request_code


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
    category: RequestCode = Field(
        ...,
        description="Predefined onboard request item code.",
    )
    quantity: int = Field(default=1, ge=1)
    request_text: str = Field(
        ...,
        min_length=1,
        description="Passenger-facing request text submitted from the phone screen.",
    )
    source: PassengerRequestSource = Field(default=PassengerRequestSource.typed)
    source_language: LanguageCode = Field(
        default=LanguageCode.en,
        description="Language declared by the client. Allowed values: en, de.",
    )
    metadata: dict[str, Any] = Field(
        default_factory=dict,
        description="Extensible payload for future request context.",
    )

    @field_validator("category", mode="before")
    @classmethod
    def normalize_category(cls, value: RequestCode | str) -> RequestCode:
        return normalize_request_code(value)


class PassengerVoiceActionItem(BaseModel):
    item: str = Field(..., min_length=1)
    quantity: int = Field(default=1, ge=1)
    notes: str | None = None
    normalized_item: RequestCode = Field(
        ...,
        description="Language-neutral onboard request code for backend processing.",
    )

    @field_validator("normalized_item", mode="before")
    @classmethod
    def normalize_item_code(cls, value: RequestCode | str) -> RequestCode:
        return normalize_request_code(value)


class PassengerVoiceRequestResponse(BaseModel):
    category: RequestCode
    source_language: LanguageCode = LanguageCode.en
    passenger_message: str
    crew_summary: str
    action_items: list[PassengerVoiceActionItem] = Field(default_factory=list)
    metadata: dict[str, Any] = Field(default_factory=dict)

    @field_validator("category", mode="before")
    @classmethod
    def normalize_voice_category(cls, value: RequestCode | str) -> RequestCode:
        return normalize_request_code(value)


class PassengerRequestRecord(BaseModel):
    request_id: UUID
    flight_id: UUID
    seat_number: str
    category: str
    category_label: str
    source: PassengerRequestSource
    status: PassengerRequestStatus = PassengerRequestStatus.submitted
    request_text: str
    source_language: LanguageCode = LanguageCode.en
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
