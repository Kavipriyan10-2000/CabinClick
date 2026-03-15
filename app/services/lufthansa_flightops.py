from datetime import datetime

from app.schemas.crew_operations import (
    CrewDeviceAssignment,
    LufthansaCrewListResponse,
    LufthansaCrewMemberRecord,
)
from app.schemas.flight_operations import LufthansaFlightTimingResponse


MOCK_CREW_MEMBERS = [
    LufthansaCrewMemberRecord(
        crew_member_code="1",
        full_name="Anna Schmidt",
        rank="FA",
        role="attendant",
    ),
    LufthansaCrewMemberRecord(
        crew_member_code="2",
        full_name="Max Weber",
        rank="FA",
        role="attendant",
    ),
]

MOCK_DEVICE_ASSIGNMENTS = [
    CrewDeviceAssignment(
        device_code="1",
        seat_scope="Rows 1-10 seats A-D",
        crew_member_code="1",
        full_name="Anna Schmidt",
    ),
    CrewDeviceAssignment(
        device_code="2",
        seat_scope="Rows 1-10 seats E-I",
        crew_member_code="2",
        full_name="Max Weber",
    ),
]


def get_mock_lufthansa_crew_list() -> LufthansaCrewListResponse:
    return LufthansaCrewListResponse(
        items=MOCK_CREW_MEMBERS,
        assignments=MOCK_DEVICE_ASSIGNMENTS,
        message="Mock Lufthansa crew list loaded.",
    )


def get_mock_takeoff_time() -> LufthansaFlightTimingResponse:
    return LufthansaFlightTimingResponse(
        flight_number="LH761",
        origin="DEL",
        destination="FRA",
        scheduled_time=datetime.fromisoformat("2026-02-28T02:15:00+00:00"),
        estimated_time=datetime.fromisoformat("2026-02-28T02:25:00+00:00"),
        actual_time=datetime.fromisoformat("2026-02-28T02:27:00+00:00"),
        status="departed",
        message="Mock Lufthansa takeoff time loaded.",
    )


def get_mock_landing_time() -> LufthansaFlightTimingResponse:
    return LufthansaFlightTimingResponse(
        flight_number="LH761",
        origin="DEL",
        destination="FRA",
        scheduled_time=datetime.fromisoformat("2026-02-28T10:05:00+00:00"),
        estimated_time=datetime.fromisoformat("2026-02-28T09:58:00+00:00"),
        actual_time=None,
        status="en_route",
        message="Mock Lufthansa landing time loaded.",
    )
