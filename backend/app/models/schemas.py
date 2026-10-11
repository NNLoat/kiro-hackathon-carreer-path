"""Request/response DTOs for analysis endpoints and the error envelope.

These mirror backend/API-CONTRACT.md sections 1.1, 4 and 5. None are tables.
"""

from __future__ import annotations

from pydantic import BaseModel
from sqlmodel import SQLModel


# --- Error envelope (contract 1.1) ----------------------------------------------------


class ErrorBody(BaseModel):
    code: str
    message: str
    details: object | None = None


class ErrorEnvelope(BaseModel):
    error: ErrorBody


# --- Competency (contract 4) ----------------------------------------------------------


class CompetencyRequest(SQLModel):
    completed_course_ids: list[str]


class SkillLevel(SQLModel):
    skill_id: str
    level: float


class CompetencyResult(SQLModel):
    competency: list[SkillLevel]


# --- Radar (contract 4) ---------------------------------------------------------------


class RadarRequest(SQLModel):
    career_id: str
    completed_course_ids: list[str]


class RadarAxis(SQLModel):
    skill_id: str
    skill_name: str
    required: float
    current: float


class RadarResult(SQLModel):
    career_id: str
    axes: list[RadarAxis]


# --- Pathway (contract 5) -------------------------------------------------------------


class PathwayRequest(SQLModel):
    career_id: str
    completed_course_ids: list[str]
    interest_skill_ids: list[str] = []
    start_term: str | None = None


class AdvancedSkill(SQLModel):
    skill_id: str
    gap_closed: float


class PathwayCourse(SQLModel):
    course_id: str
    code: str
    title: str
    source: str
    prerequisites: list[str]
    advances_skills: list[AdvancedSkill]


class PathwayStep(SQLModel):
    order: int
    term: str
    courses: list[PathwayCourse]


class Conflict(SQLModel):
    type: str  # "term_clash" | "missing_prerequisite" | "unschedulable"
    course_ids: list[str]
    message: str


class PathwayResult(SQLModel):
    career_id: str
    steps: list[PathwayStep]
    conflicts: list[Conflict]
    fully_schedulable: bool


# --- Catalog list envelopes -----------------------------------------------------------


class SkillList(SQLModel):
    items: list


class CourseList(SQLModel):
    items: list


class CareerList(SQLModel):
    items: list


class PlanList(SQLModel):
    items: list
