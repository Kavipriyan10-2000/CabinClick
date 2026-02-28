from datetime import datetime, timezone
from enum import Enum
from uuid import UUID

from pydantic import BaseModel, Field


class FlightStatus(str, Enum):
    registered = "registered"


class FlightRegistrationRequest(BaseModel):
    flight_number: str = Field(..., min_length=1)
    origin: str = Field(..., min_length=1)
    destination: str = Field(..., min_length=1)
    departure_date: str = Field(..., min_length=1)


class FlightRegistrationResponse(BaseModel):
    flight_id: UUID
    flight_number: str
    origin: str
    destination: str
    departure_date: str
    status: FlightStatus = FlightStatus.registered
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
    )
    message: str
