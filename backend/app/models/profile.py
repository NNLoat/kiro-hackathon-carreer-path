"""Profile and Plan models (writable).

Profiles are username-only (prototype auth: no password). Plans store a saved PathwayResult.
List fields and the pathway are JSON columns. Ids are strings generated at creation time.
"""

from __future__ import annotations

import uuid

from sqlalchemy import JSON, Column
from sqlmodel import Field, SQLModel


def _profile_id() -> str:
    return f"prof_{uuid.uuid4().hex[:12]}"


def _plan_id() -> str:
    return f"plan_{uuid.uuid4().hex[:12]}"


# --- Profile --------------------------------------------------------------------------


class Profile(SQLModel, table=True):
    id: str = Field(default_factory=_profile_id, primary_key=True)
    username: str = Field(index=True, unique=True)
    completed_course_ids: list[str] = Field(default_factory=list, sa_column=Column(JSON))
    interest_skill_ids: list[str] = Field(default_factory=list, sa_column=Column(JSON))
    selected_career_ids: list[str] = Field(default_factory=list, sa_column=Column(JSON))


class ProfileCreate(SQLModel):
    username: str


class ProfileUpdate(SQLModel):
    completed_course_ids: list[str]
    interest_skill_ids: list[str]
    selected_career_ids: list[str]


class ProfileRead(SQLModel):
    id: str
    username: str
    completed_course_ids: list[str]
    interest_skill_ids: list[str]
    selected_career_ids: list[str]


# --- Plan -----------------------------------------------------------------------------


class Plan(SQLModel, table=True):
    id: str = Field(default_factory=_plan_id, primary_key=True)
    profile_id: str = Field(index=True, foreign_key="profile.id")
    name: str
    career_id: str
    pathway: dict = Field(default_factory=dict, sa_column=Column(JSON))


class PlanCreate(SQLModel):
    name: str
    career_id: str
    pathway: dict


class PlanRead(SQLModel):
    id: str
    profile_id: str
    name: str
    career_id: str
    pathway: dict
