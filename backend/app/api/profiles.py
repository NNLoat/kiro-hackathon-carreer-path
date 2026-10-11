"""Profile and Plan endpoints (API-CONTRACT sections 2 and 6)."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Response
from sqlmodel import Session, select

from app.api.errors import AppError
from app.db.session import get_session
from app.models.catalog import Career, Course, Skill
from app.models.profile import (
    Plan,
    PlanCreate,
    PlanRead,
    Profile,
    ProfileCreate,
    ProfileRead,
    ProfileUpdate,
)

router = APIRouter(prefix="/profiles", tags=["profiles"])


def _get_profile(session: Session, profile_id: str) -> Profile:
    profile = session.get(Profile, profile_id)
    if profile is None:
        raise AppError("not_found", f"Profile {profile_id} not found", 404)
    return profile


@router.post("")
def create_or_load_profile(
    payload: ProfileCreate, response: Response, session: Session = Depends(get_session)
) -> ProfileRead:
    username = payload.username.strip()
    if not username:
        raise AppError("validation_error", "username must not be empty", 422)
    existing = session.exec(select(Profile).where(Profile.username == username)).first()
    if existing is not None:
        response.status_code = 200
        return ProfileRead.model_validate(existing.model_dump())
    profile = Profile(username=username)
    session.add(profile)
    session.commit()
    session.refresh(profile)
    response.status_code = 201
    return ProfileRead.model_validate(profile.model_dump())


@router.get("/{profile_id}")
def get_profile(profile_id: str, session: Session = Depends(get_session)) -> ProfileRead:
    profile = _get_profile(session, profile_id)
    return ProfileRead.model_validate(profile.model_dump())


def _validate_ids(session: Session, payload: ProfileUpdate) -> None:
    for cid in payload.completed_course_ids:
        if session.get(Course, cid) is None:
            raise AppError("validation_error", f"Unknown course id {cid}", 422)
    for sid in payload.interest_skill_ids:
        if session.get(Skill, sid) is None:
            raise AppError("validation_error", f"Unknown skill id {sid}", 422)
    for crid in payload.selected_career_ids:
        if session.get(Career, crid) is None:
            raise AppError("validation_error", f"Unknown career id {crid}", 422)


@router.put("/{profile_id}")
def update_profile(
    profile_id: str, payload: ProfileUpdate, session: Session = Depends(get_session)
) -> ProfileRead:
    profile = _get_profile(session, profile_id)
    _validate_ids(session, payload)
    profile.completed_course_ids = payload.completed_course_ids
    profile.interest_skill_ids = payload.interest_skill_ids
    profile.selected_career_ids = payload.selected_career_ids
    session.add(profile)
    session.commit()
    session.refresh(profile)
    return ProfileRead.model_validate(profile.model_dump())


# --- Plans ----------------------------------------------------------------------------


@router.post("/{profile_id}/plans", status_code=201)
def create_plan(
    profile_id: str, payload: PlanCreate, session: Session = Depends(get_session)
) -> PlanRead:
    _get_profile(session, profile_id)
    plan = Plan(
        profile_id=profile_id,
        name=payload.name,
        career_id=payload.career_id,
        pathway=payload.pathway,
    )
    session.add(plan)
    session.commit()
    session.refresh(plan)
    return PlanRead.model_validate(plan.model_dump())


@router.get("/{profile_id}/plans")
def list_plans(profile_id: str, session: Session = Depends(get_session)) -> dict:
    _get_profile(session, profile_id)
    rows = session.exec(select(Plan).where(Plan.profile_id == profile_id).order_by(Plan.id)).all()
    return {"items": [PlanRead.model_validate(p.model_dump()) for p in rows]}


@router.get("/{profile_id}/plans/{plan_id}")
def get_plan(profile_id: str, plan_id: str, session: Session = Depends(get_session)) -> PlanRead:
    _get_profile(session, profile_id)
    plan = session.get(Plan, plan_id)
    if plan is None or plan.profile_id != profile_id:
        raise AppError("not_found", f"Plan {plan_id} not found", 404)
    return PlanRead.model_validate(plan.model_dump())
