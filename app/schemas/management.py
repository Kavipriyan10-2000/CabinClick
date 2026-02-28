from pydantic import BaseModel, Field


class RequestSummaryCategory(BaseModel):
    category: str
    total_requests: int = Field(..., ge=0)


class RequestSummaryResponse(BaseModel):
    flight_number: str
    total_requests: int = Field(..., ge=0)
    active_seats: int = Field(..., ge=0)
    submitted_requests: int = Field(..., ge=0)
    being_served_requests: int = Field(..., ge=0)
    completed_requests: int = Field(..., ge=0)
    top_categories: list[RequestSummaryCategory] = Field(default_factory=list)
    message: str
