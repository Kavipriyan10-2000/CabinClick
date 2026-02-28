import pytest

from app.services.seat_layout import (
    SEAT_COUNTS_BY_ZONE,
    SEAT_VALIDATION_MESSAGE,
    get_seat_zone,
    validate_seat_number,
)


def test_validate_seat_number_normalizes_case_and_whitespace() -> None:
    assert validate_seat_number(" 10c ") == "10C"


@pytest.mark.parametrize(
    "seat_number",
    [
        "0A",
        "6A",
        "14A",
        "42A",
        "12B",
        "7",
        "ABC",
    ],
)
def test_validate_seat_number_rejects_invalid_values(seat_number: str) -> None:
    with pytest.raises(ValueError, match=SEAT_VALIDATION_MESSAGE):
        validate_seat_number(seat_number)


@pytest.mark.parametrize(
    ("seat_number", "expected_zone"),
    [
        ("1A", "A"),
        ("5J", "A"),
        ("10A", "B"),
        ("13J", "B"),
        ("30A", "C"),
        ("57J", "C"),
    ],
)
def test_get_seat_zone_uses_widebody_cabin_layout(
    seat_number: str,
    expected_zone: str,
) -> None:
    assert get_seat_zone(seat_number) == expected_zone


def test_seat_counts_by_zone_match_expected_layout() -> None:
    assert SEAT_COUNTS_BY_ZONE == {"A": 30, "B": 24, "C": 234}
