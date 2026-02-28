from uuid import uuid4

from app.schemas.broadcasts import CrewBroadcastRequest, CrewBroadcastResponse


def queue_crew_broadcast(
    payload: CrewBroadcastRequest,
) -> CrewBroadcastResponse:
    return CrewBroadcastResponse(
        broadcast_id=uuid4(),
        targeted_devices=payload.device_ids,
        message=(
            "Broadcast accepted. Device delivery will be connected in a later "
            "implementation."
        ),
    )
