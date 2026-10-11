"""Idempotent catalog seeding into the database.

Reads the generated snapshot under backend/seed_data/*.json and upserts Skill/Course/Career
rows. Safe to run on every startup: existing rows are updated in place, new rows inserted.
"""

from __future__ import annotations

import json
from pathlib import Path

from sqlmodel import Session, select

from app.models.catalog import Career, Course, Skill

SEED_DIR = Path(__file__).resolve().parent.parent.parent / "seed_data"


def _load(name: str) -> list[dict]:
    path = SEED_DIR / name
    with path.open() as f:
        return json.load(f)


def seed_catalog(session: Session) -> None:
    """Upsert skills, courses, careers from the seed snapshot. Idempotent."""
    skills = _load("skills.seed.json")
    courses = _load("courses.seed.json")
    careers = _load("careers.seed.json")

    for s in skills:
        existing = session.get(Skill, s["id"])
        if existing is None:
            session.add(Skill(**s))
        else:
            existing.name = s["name"]
            existing.category = s["category"]
            session.add(existing)

    for c in courses:
        existing = session.get(Course, c["id"])
        if existing is None:
            session.add(Course(**c))
        else:
            for k, v in c.items():
                setattr(existing, k, v)
            session.add(existing)

    for c in careers:
        existing = session.get(Career, c["id"])
        if existing is None:
            session.add(Career(**c))
        else:
            existing.title = c["title"]
            existing.description = c["description"]
            existing.required_skills = c["required_skills"]
            session.add(existing)

    session.commit()


def catalog_is_empty(session: Session) -> bool:
    return session.exec(select(Skill)).first() is None
