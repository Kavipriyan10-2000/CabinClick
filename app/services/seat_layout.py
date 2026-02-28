import re

SEAT_PATTERN = re.compile(r"^([1-9]|[12][0-9]|3[0-3])[ABC]$")

ZONE_A_MAX_ROW = 11
ZONE_B_MAX_ROW = 22

SEAT_COUNTS_BY_ZONE = {
    "A": 33,
    "B": 33,
    "C": 33,
}


def normalize_seat_number(seat_number: str) -> str:
    return seat_number.strip().upper()


def validate_seat_number(seat_number: str) -> str:
    normalized = normalize_seat_number(seat_number)
    if not SEAT_PATTERN.fullmatch(normalized):
        raise ValueError(
            "Unsupported seat number. Expected rows 1-33 and columns A-C.",
        )
    return normalized


def get_seat_zone(seat_number: str) -> str:
    normalized = validate_seat_number(seat_number)
    row = int(normalized[:-1])
    if row <= ZONE_A_MAX_ROW:
        return "A"
    if row <= ZONE_B_MAX_ROW:
        return "B"
    return "C"
