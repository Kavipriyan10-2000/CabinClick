import importlib.util

from fastapi import APIRouter, HTTPException, status

from app.schemas.request_management import (
    PassengerRequestCreate,
    PassengerRequestListResponse,
    PassengerRequestRecord,
)
from app.services.passenger_requests import (
    create_passenger_request,
    create_voice_passenger_request,
    list_passenger_requests,
)

router = APIRouter(tags=["passenger-requests"])
MULTIPART_AVAILABLE = importlib.util.find_spec("multipart") is not None


@router.get(
    "/seats/{seat_number}/requests",
    response_model=PassengerRequestListResponse,
)
def get_passenger_requests(
    seat_number: str,
) -> PassengerRequestListResponse:
    return list_passenger_requests(seat_number=seat_number)


@router.post(
    "/seats/{seat_number}/requests",
    response_model=PassengerRequestRecord,
    status_code=status.HTTP_201_CREATED,
)
def submit_passenger_request(
    seat_number: str,
    payload: PassengerRequestCreate,
) -> PassengerRequestRecord:
    return create_passenger_request(
        seat_number=seat_number,
        payload=payload,
    )


if MULTIPART_AVAILABLE:
    from fastapi import File, Form, UploadFile

    @router.post(
        "/seats/{seat_number}/voice-requests",
        response_model=PassengerRequestRecord,
        status_code=status.HTTP_201_CREATED,
    )
    async def submit_voice_passenger_request(
        seat_number: str,
        audio: UploadFile = File(...),
        source_language: str | None = Form(default=None),
    ) -> PassengerRequestRecord:
        audio_bytes = await audio.read()
        if not audio_bytes:
            raise HTTPException(status_code=400, detail="Audio file is empty.")

        return create_voice_passenger_request(
            seat_number=seat_number,
            audio_bytes=audio_bytes,
            mime_type=audio.content_type or "audio/webm",
            source_language_hint=source_language,
        )
