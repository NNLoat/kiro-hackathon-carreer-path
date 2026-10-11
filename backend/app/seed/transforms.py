"""Deterministic seeding transforms: dataset JSON -> catalog rows.

Pure functions implementing Functional Design doc section 1. Same input JSON always
produces identical catalog rows. No LLM, no randomness.
"""

from __future__ import annotations

import re

# Foundational skills used to assign a course "tier" for prerequisite synthesis (FD 1.5).
FOUNDATIONAL_SKILLS = {"SK-001", "SK-006", "SK-007", "SK-008", "SK-026", "SK-028"}

REQUIRED_LEVEL = 0.9
RECOMMENDED_LEVEL = 0.5


def slug(code: str) -> str:
    """Lowercase, non-alphanumerics -> '-', collapse repeats, trim. (FD 1.3)"""
    s = re.sub(r"[^a-z0-9]+", "-", code.lower())
    return s.strip("-")


def clamp(x: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, x))


def contribution_weights(teaches_skills: list[str]) -> list[dict]:
    """Position-weighted skill contributions. (FD 1.4)

    weight(i) = round(clamp(0.8 - 0.08*i, 0.3, 0.8), 2)
    """
    out = []
    for i, sid in enumerate(teaches_skills):
        w = round(clamp(0.8 - 0.08 * i, 0.3, 0.8), 2)
        out.append({"skill_id": sid, "weight": w})
    return out


def term_hash(course_id: str) -> int:
    return sum(ord(c) for c in course_id)


def synthesize_terms(course_id: str) -> list[str]:
    """Deterministic term assignment. (FD 1.6)"""
    h = term_hash(course_id) % 3
    if h == 0:
        return ["fall", "spring"]
    if h == 1:
        return ["fall"]
    return ["spring"]


def map_source(source_type: str) -> str:
    return "university" if source_type == "university-courseware" else "online"


def build_skills(skills_json: dict) -> list[dict]:
    return [
        {"id": s["skill_id"], "name": s["name"], "category": s["category"]}
        for s in skills_json["skills"]
    ]


def build_careers(careers_json: dict) -> list[dict]:
    out = []
    for c in careers_json["careers"]:
        levels: dict[str, float] = {}
        for sid in c.get("recommended_skills", []):
            levels[sid] = max(levels.get(sid, 0.0), RECOMMENDED_LEVEL)
        for sid in c.get("required_skills", []):
            levels[sid] = max(levels.get(sid, 0.0), REQUIRED_LEVEL)
        required = [
            {"skill_id": sid, "level": lvl}
            for sid, lvl in sorted(levels.items(), key=lambda kv: (-kv[1], kv[0]))
        ]
        out.append(
            {
                "id": c["career_id"],
                "title": c["title"],
                "description": c["description"],
                "required_skills": required,
            }
        )
    return out


def build_courses(map_json: dict) -> list[dict]:
    """Build course rows, including deterministic prerequisite synthesis (FD 1.3-1.6)."""
    raw = []
    for m in map_json["mappings"]:
        cid = slug(m["course_code"])
        source = map_source(m["source_type"])
        raw.append(
            {
                "id": cid,
                "code": m["course_code"],
                "title": m["title"],
                "source": source,
                "provider": m["provider"],
                "credits": 3 if source == "university" else None,
                "terms_offered": synthesize_terms(cid),
                "skill_contributions": contribution_weights(m["teaches_skills"]),
                "_teaches": list(m["teaches_skills"]),
            }
        )

    # Tier assignment: 0 if teaches any foundational skill, else 1.
    def tier(course: dict) -> int:
        return 0 if any(s in FOUNDATIONAL_SKILLS for s in course["_teaches"]) else 1

    tier0 = sorted([c for c in raw if tier(c) == 0], key=lambda c: c["id"])

    for c in raw:
        if tier(c) == 0:
            c["prerequisites"] = []
            continue
        # tier-1: pick the single tier-0 course with the largest skill overlap (tie: asc id).
        best = None
        best_overlap = 0
        my_skills = set(c["_teaches"])
        for t0 in tier0:  # already sorted ascending by id -> deterministic tie-break
            overlap = len(my_skills & set(t0["_teaches"]))
            if overlap > best_overlap:
                best_overlap = overlap
                best = t0
        c["prerequisites"] = [best["id"]] if best and best["id"] != c["id"] else []

    for c in raw:
        c.pop("_teaches", None)
    return raw
