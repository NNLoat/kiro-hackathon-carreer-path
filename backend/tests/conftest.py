"""Shared test fixtures.

Tests run without Docker/Postgres by backing the app with an in-memory SQLite engine and
seeding the catalog from the generated snapshot. Service-level (PBT) tests use the seeded
catalog data directly without the HTTP layer.
"""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

import app.models  # noqa: F401  (register tables)
from app.db.session import get_session
from app.main import app as fastapi_app
from app.seed.loader import seed_catalog


@pytest.fixture()
def engine():
    eng = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(eng)
    with Session(eng) as session:
        seed_catalog(session)
    return eng


@pytest.fixture()
def session(engine):
    with Session(engine) as s:
        yield s


@pytest.fixture()
def client(engine):
    def _override_get_session():
        with Session(engine) as s:
            yield s

    # Bypass the real lifespan (which seeds against Postgres) by not using the context manager
    # form of TestClient; instead override the DB dependency to the SQLite engine.
    fastapi_app.dependency_overrides[get_session] = _override_get_session
    client = TestClient(fastapi_app)
    yield client
    fastapi_app.dependency_overrides.clear()
