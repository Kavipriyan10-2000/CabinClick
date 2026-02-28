import re

SEAT_PATTERN = re.compile(r"^([1-9]|[1-5][0-9])[A-Z]$")

BUSINESS_ROWS = tuple(range(1, 6))
PREMIUM_ECONOMY_ROWS = tuple(range(10, 14))
ECONOMY_ROWS = tuple((*range(30, 42), *range(44, 58)))

BUSINESS_COLUMNS = frozenset({"A", "C", "D", "F", "G", "J"})
ECONOMY_COLUMNS = frozenset({"A", "B", "C", "D", "E", "F", "G", "H", "J"})

ROW_TO_ZONE = {
    **{row: "A" for row in BUSINESS_ROWS},
    **{row: "B" for row in PREMIUM_ECONOMY_ROWS},
    **{row: "C" for row in ECONOMY_ROWS},
}

ROW_TO_ALLOWED_COLUMNS = {
    **{row: BUSINESS_COLUMNS for row in BUSINESS_ROWS},
    **{row: BUSINESS_COLUMNS for row in PREMIUM_ECONOMY_ROWS},
    **{row: ECONOMY_COLUMNS for row in ECONOMY_ROWS},
}

SEAT_VALIDATION_MESSAGE = (
    "Unsupported seat number. Use Business rows 1-5, Premium Economy rows 10-13, "
    "or Economy rows 30-41 and 44-57 with valid cabin columns."
)

SEAT_COUNTS_BY_ZONE = {
    "A": len(BUSINESS_ROWS) * len(BUSINESS_COLUMNS),
    "B": len(PREMIUM_ECONOMY_ROWS) * len(BUSINESS_COLUMNS),
    "C": len(ECONOMY_ROWS) * len(ECONOMY_COLUMNS),
}


def normalize_seat_number(seat_number: str) -> str:
    return seat_number.strip().upper()


def validate_seat_number(seat_number: str) -> str:
    normalized = normalize_seat_number(seat_number)
    if not SEAT_PATTERN.fullmatch(normalized):
        raise ValueError(SEAT_VALIDATION_MESSAGE)

    row = int(normalized[:-1])
    col = normalized[-1]
    allowed_columns = ROW_TO_ALLOWED_COLUMNS.get(row)
    if not allowed_columns or col not in allowed_columns:
        raise ValueError(SEAT_VALIDATION_MESSAGE)

    return normalized


def get_seat_zone(seat_number: str) -> str:
    normalized = validate_seat_number(seat_number)
    row = int(normalized[:-1])
    return ROW_TO_ZONE[row]
