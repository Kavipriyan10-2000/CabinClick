from datetime import datetime, timedelta, timezone
from uuid import uuid4

import pytest

from app.services import instruction_batcher


class FakeResponse:
    def __init__(self, data):
        self.data = data

    def execute(self):
        return self


class FakeSupabase:
    def __init__(self, tables):
        self.tables = tables
        self.current_table = None
        self.filters = []
        self.order_by = None
        self.limit_val = None
        self.update_payload = None
        self.in_field = None

    def table(self, name):
        self.current_table = name
        self.filters = []
        self.order_by = None
        self.limit_val = None
        self.update_payload = None
        self.in_field = None
        return self

    def select(self, *_):
        return self

    def eq(self, field, value):
        self.filters.append((field, value))
        return self

    def order(self, field, asc=True):
        self.order_by = (field, asc)
        return self

    def limit(self, value):
        self.limit_val = value
        return self

    def insert(self, rows):
        if not isinstance(rows, list):
            rows = [rows]
        inserted = []
        table_data = self.tables.setdefault(self.current_table, [])
        for row in rows:
            record = row.copy()
            record.setdefault("id", f"{self.current_table}-{len(table_data)+1}")
            now = datetime.now(timezone.utc).isoformat()
            record.setdefault("created_at", now)
            record.setdefault("updated_at", now)
            table_data.append(record)
            inserted.append(record)
        return FakeResponse(inserted)

    def update(self, payload):
        self.update_payload = payload
        return self

    def in_(self, field, values):
        self.in_field = (field, set(values))
        return self

    def execute(self):
        table_data = self.tables.get(self.current_table, [])
        if self.update_payload is not None and self.in_field:
            field, values = self.in_field
            updated = []
            for record in table_data:
                if record.get(field) in values:
                    record.update(self.update_payload)
                    updated.append(record.copy())
            return FakeResponse(updated)

        data = list(table_data)
        for field, value in self.filters:
            data = [record for record in data if record.get(field) == value]
        if self.order_by:
            key, asc = self.order_by
            data.sort(key=lambda record: record.get(key), reverse=not asc)
        if self.limit_val is not None:
            data = data[: self.limit_val]
        return FakeResponse([record.copy() for record in data])


@pytest.fixture
def fake_supabase(monkeypatch):
    tables = {
        "passenger_requests": [],
        "crew_instructions": [],
        "crew_instruction_requests": [],
    }

    client = FakeSupabase(tables)

    monkeypatch.setattr(
        "app.services.instruction_batcher.get_supabase_client",
        lambda: client,
    )
    monkeypatch.setattr(
        "app.services.instruction_batcher.get_active_flight",
        lambda: {"id": "flight-1", "flight_number": "AI101"},
    )

    return client


def make_request(i, minutes_ago=0):
    ts = datetime.now(timezone.utc) - timedelta(minutes=minutes_ago)
    return {
        "id": f"req-{i}",
        "flight_id": "flight-1",
        "seat_number": f"{10+i // 2}A",
        "request_text": f"Request {i}",
        "status": "submitted",
        "created_at": ts.isoformat(),
    }


def test_instruction_batches_by_size(fake_supabase):
    fake_supabase.tables["passenger_requests"].extend(
        [make_request(i) for i in range(10)]
    )

    instruction = instruction_batcher.emit_crew_instruction_if_needed()

    assert instruction is not None
    assert fake_supabase.tables["crew_instructions"]
    assert "Seat" in fake_supabase.tables["crew_instructions"][0]["instruction_text"]
    assert len(fake_supabase.tables["crew_instruction_requests"]) == 10
    assert all(
        record["status"] == "being_served"
        for record in fake_supabase.tables["passenger_requests"]
        if record["status"] == "being_served"
    )


def test_instruction_batches_by_timer(fake_supabase):
    fake_supabase.tables["passenger_requests"].extend(
        [make_request(i, minutes_ago=6) for i in range(3)]
    )

    instruction = instruction_batcher.emit_crew_instruction_if_needed()

    assert instruction is not None
    assert fake_supabase.tables["crew_instructions"]
    assert len(fake_supabase.tables["crew_instruction_requests"]) == 3
