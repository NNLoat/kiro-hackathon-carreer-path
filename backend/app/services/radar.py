"""Deterministic radar assembly. (Functional Design section 3)

Pure function: builds one axis per career-required skill, pairing the required target level
with the user's current competency (0 when absent).
"""

from __future__ import annotations


def build_radar(
    required_skills: list[tuple[str, float]],  # (skill_id, required_level)
    competency: dict[str, float],
    skill_names: dict[str, str],
) -> list[dict]:
    """Return axes covering every required skill (PBT-08).

    Ordered by descending required, then ascending skill_id.
    """
    axes = []
    for skill_id, required in required_skills:
        axes.append(
            {
                "skill_id": skill_id,
                "skill_name": skill_names.get(skill_id, skill_id),
                "required": required,
                "current": competency.get(skill_id, 0.0),
            }
        )
    axes.sort(key=lambda a: (-a["required"], a["skill_id"]))
    return axes
