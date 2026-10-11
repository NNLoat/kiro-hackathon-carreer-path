"""Generate backend/seed_data/*.seed.json from the raw dataset under data/online_course/.

Deterministic: run anytime to regenerate the catalog snapshot shipped with the backend.

    python -m seed_data.generate            # from backend/
"""

from __future__ import annotations

import json
from pathlib import Path

from app.seed.transforms import build_careers, build_courses, build_skills

HERE = Path(__file__).resolve().parent
BACKEND = HERE.parent
REPO = BACKEND.parent
DATA = REPO / "data" / "online_course"


def _read(name: str) -> dict:
    with (DATA / name).open() as f:
        return json.load(f)


def _write(name: str, obj: object) -> None:
    with (HERE / name).open("w") as f:
        json.dump(obj, f, indent=2, ensure_ascii=False)
        f.write("\n")


def main() -> None:
    skills = _read("skills.json")
    careers = _read("careers.json")
    course_map = _read("course_skill_career_map.json")

    _write("skills.seed.json", build_skills(skills))
    _write("courses.seed.json", build_courses(course_map))
    _write("careers.seed.json", build_careers(careers))
    print("Generated seed_data snapshot.")


if __name__ == "__main__":
    main()
