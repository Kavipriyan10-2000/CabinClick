from pydantic import BaseModel, Field


class RequestSummaryItem(BaseModel):
    category: str
    total_requests: int = Field(..., ge=0)


class RequestSummaryResponse(BaseModel):
    total_requests: int = Field(..., ge=0)
    active_seats: int = Field(..., ge=0)
    top_request_categories: list[RequestSummaryItem] = Field(default_factory=list)
    message: str
