"""Catalog access + search over the database, and adapters to service inputs."""

from __future__ import annotations

from sqlmodel import Session, select

from app.models.catalog import Career, Course, Skill


def _match(text: str, query: str | None) -> bool:
    return query is None or query.strip() == "" or query.lower() in text.lower()


def search_skills(session: Session, query: str | None, limit: int | None) -> list[Skill]:
    rows = session.exec(select(Skill).order_by(Skill.id)).all()
    rows = [s for s in rows if _match(f"{s.name} {s.category}", query)]
    return rows[:limit] if limit else rows


def search_courses(
    session: Session, query: str | None, source: str | None, limit: int | None
) -> list[Course]:
    rows = session.exec(select(Course).order_by(Course.id)).all()
    rows = [c for c in rows if _match(f"{c.code} {c.title} {c.provider}", query)]
    if source:
        rows = [c for c in rows if c.source == source]
    return rows[:limit] if limit else rows


def search_careers(session: Session, query: str | None, limit: int | None) -> list[Career]:
    rows = session.exec(select(Career).order_by(Career.id)).all()
    rows = [c for c in rows if _match(f"{c.title} {c.description}", query)]
    return rows[:limit] if limit else rows


# --- adapters to service inputs -------------------------------------------------------


def course_contribs_map(session: Session) -> dict[str, list[tuple[str, float]]]:
    rows = session.exec(select(Course)).all()
    return {
        c.id: [(sc["skill_id"], sc["weight"]) for sc in c.skill_contributions]
        for c in rows
    }


def courses_dict(session: Session) -> dict[str, dict]:
    rows = session.exec(select(Course)).all()
    return {
        c.id: {
            "id": c.id,
            "code": c.code,
            "title": c.title,
            "source": c.source,
            "prerequisites": list(c.prerequisites),
            "terms_offered": list(c.terms_offered),
            "skill_contributions": list(c.skill_contributions),
        }
        for c in rows
    }


def skill_names_map(session: Session) -> dict[str, str]:
    return {s.id: s.name for s in session.exec(select(Skill)).all()}


def required_skills_tuples(career: Career) -> list[tuple[str, float]]:
    return [(r["skill_id"], r["level"]) for r in career.required_skills]
