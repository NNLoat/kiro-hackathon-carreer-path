"""Catalog models: Skill, Course, Career.

These are read-only at runtime and populated by startup seeding. Nested arrays are stored as
JSON columns, consistent with the small catalog size and PoC scope. All ids are strings.
"""

from __future__ import annotations

from sqlalchemy import JSON, Column
from sqlmodel import Field, SQLModel


# --- Nested value shapes (not tables) -------------------------------------------------


class SkillContribution(SQLModel):
    """How much a course advances a skill. weight in [0, 1]."""

    skill_id: str
    weight: float


class RequiredSkill(SQLModel):
    """Target competency a career expects for a skill. level in [0, 1]."""

    skill_id: str
    level: float


# --- Skill ----------------------------------------------------------------------------


class SkillBase(SQLModel):
    name: str
    category: str


class Skill(SkillBase, table=True):
    id: str = Field(primary_key=True)


class SkillRead(SkillBase):
    id: str


# --- Course ---------------------------------------------------------------------------


class CourseBase(SQLModel):
    code: str
    title: str
    source: str  # "university" | "online"
    provider: str
    credits: int | None = None


class Course(CourseBase, table=True):
    id: str = Field(primary_key=True)
    prerequisites: list[str] = Field(default_factory=list, sa_column=Column(JSON))
    terms_offered: list[str] = Field(default_factory=list, sa_column=Column(JSON))
    skill_contributions: list[dict] = Field(default_factory=list, sa_column=Column(JSON))


class CourseRead(CourseBase):
    id: str
    prerequisites: list[str]
    terms_offered: list[str]
    skill_contributions: list[SkillContribution]


# --- Career ---------------------------------------------------------------------------


class CareerBase(SQLModel):
    title: str
    description: str


class Career(CareerBase, table=True):
    id: str = Field(primary_key=True)
    required_skills: list[dict] = Field(default_factory=list, sa_column=Column(JSON))


class CareerRead(CareerBase):
    id: str
    required_skills: list[RequiredSkill]
