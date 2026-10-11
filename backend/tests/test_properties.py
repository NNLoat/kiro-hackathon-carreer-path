"""Property-based tests (Hypothesis) for deterministic domain logic.

PBT-02: competency levels always within [0, 1]
PBT-03: competency monotonic (adding a contributing course never lowers a skill)
PBT-07: pathway respects prerequisites
PBT-08: radar axes cover every required skill; current in [0, 1]

Catalog data is loaded from the generated seed snapshot so properties are checked over the
realistic catalog.
"""

from __future__ import annotations

import json
from pathlib import Path

from hypothesis import given, settings
from hypothesis import strategies as st

from app.seed.transforms import (
    build_careers,
    build_courses,
    clamp,
    contribution_weights,
    synthesize_terms,
)
from app.services.competency import derive_competency
from app.services.pathway import generate_pathway
from app.services.radar import build_radar

SEED = Path(__file__).resolve().parent.parent / "seed_data"
DATA = Path(__file__).resolve().parent.parent.parent / "data" / "online_course"


def _load_seed(name: str):
    with (SEED / name).open() as f:
        return json.load(f)


COURSES = {c["id"]: c for c in _load_seed("courses.seed.json")}
CAREERS = {c["id"]: c for c in _load_seed("careers.seed.json")}
SKILLS = {s["id"]: s for s in _load_seed("skills.seed.json")}
COURSE_IDS = sorted(COURSES)
CAREER_IDS = sorted(CAREERS)

CONTRIBS = {
    cid: [(sc["skill_id"], sc["weight"]) for sc in c["skill_contributions"]]
    for cid, c in COURSES.items()
}
SKILL_NAMES = {sid: s["name"] for sid, s in SKILLS.items()}


def _required_tuples(career_id: str):
    return [(r["skill_id"], r["level"]) for r in CAREERS[career_id]["required_skills"]]


# --- PBT-02: competency bounded -------------------------------------------------------


@given(st.lists(st.sampled_from(COURSE_IDS), max_size=10))
def test_pbt02_competency_bounded(course_ids):
    levels = derive_competency(course_ids, CONTRIBS)
    for v in levels.values():
        assert 0.0 <= v <= 1.0


# --- PBT-03: competency monotonic -----------------------------------------------------


@given(
    st.lists(st.sampled_from(COURSE_IDS), max_size=8),
    st.sampled_from(COURSE_IDS),
)
def test_pbt03_competency_monotonic(base_ids, extra):
    before = derive_competency(base_ids, CONTRIBS)
    after = derive_competency(base_ids + [extra], CONTRIBS)
    for skill_id, lvl in before.items():
        assert after.get(skill_id, 0.0) >= lvl - 1e-9


# --- PBT-07: pathway respects prerequisites -------------------------------------------


@settings(max_examples=50, deadline=None)
@given(
    st.sampled_from(CAREER_IDS),
    st.lists(st.sampled_from(COURSE_IDS), max_size=6),
    st.sampled_from(["fall", "spring"]),
)
def test_pbt07_pathway_respects_prereqs(career_id, completed, start_term):
    comp = derive_competency(completed, CONTRIBS)
    plan = generate_pathway(
        career_id=career_id,
        required_skills=_required_tuples(career_id),
        completed_course_ids=completed,
        competency=comp,
        courses=COURSES,
        start_term=start_term,
    )
    # map course_id -> step order
    order_of: dict[str, int] = {}
    for step in plan.steps:
        for c in step["courses"]:
            order_of[c["course_id"]] = step["order"]
    scheduled = set(order_of)
    for step in plan.steps:
        for c in step["courses"]:
            for p in c["prerequisites"]:
                if p in scheduled:
                    assert order_of[p] < order_of[c["course_id"]]


# --- PBT-08: radar coverage -----------------------------------------------------------


@given(
    st.sampled_from(CAREER_IDS),
    st.lists(st.sampled_from(COURSE_IDS), max_size=8),
)
def test_pbt08_radar_covers_required(career_id, completed):
    comp = derive_competency(completed, CONTRIBS)
    required = _required_tuples(career_id)
    axes = build_radar(required, comp, SKILL_NAMES)
    axis_ids = {a["skill_id"] for a in axes}
    assert {sid for sid, _ in required} <= axis_ids
    for a in axes:
        assert 0.0 <= a["current"] <= 1.0
        assert 0.0 <= a["required"] <= 1.0


# --- transform unit properties --------------------------------------------------------


@given(st.lists(st.text(min_size=1, max_size=4), min_size=0, max_size=12))
def test_contribution_weights_bounded(skills):
    for item in contribution_weights(skills):
        assert 0.3 <= item["weight"] <= 0.8


def test_clamp():
    assert clamp(1.5, 0.0, 1.0) == 1.0
    assert clamp(-1.0, 0.0, 1.0) == 0.0
    assert clamp(0.5, 0.0, 1.0) == 0.5


def test_synthesize_terms_nonempty():
    for cid in COURSE_IDS:
        terms = synthesize_terms(cid)
        assert terms and set(terms) <= {"fall", "spring"}


def test_seed_determinism():
    """Regenerating from raw data yields the exact committed snapshot."""
    with (DATA / "skills.json").open() as f:
        skills_raw = json.load(f)
    with (DATA / "careers.json").open() as f:
        careers_raw = json.load(f)
    with (DATA / "course_skill_career_map.json").open() as f:
        map_raw = json.load(f)
    assert build_courses(map_raw) == list(COURSES.values())
    assert build_careers(careers_raw) == list(CAREERS.values())
    assert len(build_careers(careers_raw)) == 10


def test_prereqs_form_dag():
    """No course lists itself; prereq graph is acyclic (tier0 -> tier1 only)."""
    for cid, c in COURSES.items():
        assert cid not in c["prerequisites"]
        for p in c["prerequisites"]:
            # a prerequisite must itself have no prerequisites (tier-0)
            assert COURSES[p]["prerequisites"] == []
