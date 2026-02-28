import pytest

from app.services.seat_layout import (
    SEAT_COUNTS_BY_ZONE,
    get_seat_zone,
    validate_seat_number,
)


def test_validate_seat_number_normalizes_case_and_whitespace() -> None:
    assert validate_seat_number(" 14b ") == "14B"


@pytest.mark.parametrize(
    "seat_number",
    [
        "0A",
        "34A",
        "12D",
        "7",
        "ABC",
    ],
)
def test_validate_seat_number_rejects_invalid_values(seat_number: str) -> None:
    with pytest.raises(
        ValueError,
        match="Unsupported seat number. Expected rows 1-33 and columns A-C.",
    ):
        validate_seat_number(seat_number)


@pytest.mark.parametrize(
    ("seat_number", "expected_zone"),
    [
        ("1A", "A"),
        ("11C", "A"),
        ("12A", "B"),
        ("22C", "B"),
        ("23A", "C"),
        ("33C", "C"),
    ],
)
def test_get_seat_zone_uses_33x33x33_layout(
    seat_number: str,
    expected_zone: str,
) -> None:
    assert get_seat_zone(seat_number) == expected_zone


def test_seat_counts_by_zone_match_expected_layout() -> None:
    assert SEAT_COUNTS_BY_ZONE == {"A": 33, "B": 33, "C": 33}
