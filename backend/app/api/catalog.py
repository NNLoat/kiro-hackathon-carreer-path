"""Catalog endpoints (API-CONTRACT section 3)."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from app.db.session import get_session
from app.models.catalog import CareerRead, CourseRead, SkillRead
from app.services import catalog as svc

router = APIRouter(prefix="/catalog", tags=["catalog"])


@router.get("/skills")
def list_skills(
    query: str | None = None,
    limit: int | None = Query(default=None, ge=1),
    session: Session = Depends(get_session),
) -> dict:
    rows = svc.search_skills(session, query, limit)
    return {"items": [SkillRead.model_validate(r.model_dump()) for r in rows]}


@router.get("/courses")
def list_courses(
    query: str | None = None,
    source: str | None = Query(default=None, pattern="^(university|online)$"),
    limit: int | None = Query(default=None, ge=1),
    session: Session = Depends(get_session),
) -> dict:
    rows = svc.search_courses(session, query, source, limit)
    return {"items": [CourseRead.model_validate(r.model_dump()) for r in rows]}


@router.get("/careers")
def list_careers(
    query: str | None = None,
    limit: int | None = Query(default=None, ge=1),
    session: Session = Depends(get_session),
) -> dict:
    rows = svc.search_careers(session, query, limit)
    return {"items": [CareerRead.model_validate(r.model_dump()) for r in rows]}
