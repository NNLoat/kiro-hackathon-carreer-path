"""Analysis endpoints: competency, radar, pathway (API-CONTRACT sections 4-5)."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.api.errors import AppError
from app.db.session import get_session
from app.models.catalog import Career
from app.models.schemas import (
    CompetencyRequest,
    PathwayRequest,
    RadarRequest,
)
from app.services import catalog as cat
from app.services.competency import competency_list, derive_competency
from app.services.pathway import generate_pathway
from app.services.radar import build_radar

router = APIRouter(tags=["analysis"])


def _get_career(session: Session, career_id: str) -> Career:
    career = session.get(Career, career_id)
    if career is None:
        raise AppError("not_found", f"Career {career_id} not found", 404)
    return career


@router.post("/skills/competency")
def competency(payload: CompetencyRequest, session: Session = Depends(get_session)) -> dict:
    contribs = cat.course_contribs_map(session)
    levels = derive_competency(payload.completed_course_ids, contribs)
    return {"competency": competency_list(levels)}


@router.post("/radar")
def radar(payload: RadarRequest, session: Session = Depends(get_session)) -> dict:
    career = _get_career(session, payload.career_id)
    contribs = cat.course_contribs_map(session)
    levels = derive_competency(payload.completed_course_ids, contribs)
    axes = build_radar(
        cat.required_skills_tuples(career),
        levels,
        cat.skill_names_map(session),
    )
    return {"career_id": career.id, "axes": axes}


@router.post("/pathway")
def pathway(payload: PathwayRequest, session: Session = Depends(get_session)) -> dict:
    career = _get_career(session, payload.career_id)
    contribs = cat.course_contribs_map(session)
    levels = derive_competency(payload.completed_course_ids, contribs)
    plan = generate_pathway(
        career_id=career.id,
        required_skills=cat.required_skills_tuples(career),
        completed_course_ids=payload.completed_course_ids,
        competency=levels,
        courses=cat.courses_dict(session),
        interest_skill_ids=payload.interest_skill_ids,
        start_term=payload.start_term,
    )
    return {
        "career_id": career.id,
        "steps": plan.steps,
        "conflicts": plan.conflicts,
        "fully_schedulable": plan.fully_schedulable,
    }
