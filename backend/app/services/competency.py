"""Deterministic competency derivation. (Functional Design section 2)

Pure functions over catalog data: no DB, no randomness. Operates on a mapping of
course_id -> list[(skill_id, weight)] so it is trivially testable with Hypothesis.
"""

from __future__ import annotations

CourseContribs = dict[str, list[tuple[str, float]]]


def derive_competency(
    completed_course_ids: list[str],
    course_contribs: CourseContribs,
) -> dict[str, float]:
    """Return {skill_id: level} with level = 1 - prod(1 - w_j), rounded to 4 dp.

    - Only skills with at least one contributing completed course appear.
    - level in [0, 1] (PBT-02); adding a contributing course never lowers a skill (PBT-03).
    """
    # Accumulate 'remaining' = product of (1 - w) per skill.
    remaining: dict[str, float] = {}
    for cid in completed_course_ids:
        for skill_id, weight in course_contribs.get(cid, []):
            w = max(0.0, min(1.0, weight))
            remaining[skill_id] = remaining.get(skill_id, 1.0) * (1.0 - w)

    return {sid: round(1.0 - r, 4) for sid, r in remaining.items()}


def competency_list(level_map: dict[str, float]) -> list[dict]:
    """Stable serialization: ascending skill_id."""
    return [
        {"skill_id": sid, "level": level_map[sid]}
        for sid in sorted(level_map)
    ]
