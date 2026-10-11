"""Deterministic study-pathway scheduler. (Functional Design section 4)

Pure function over catalog data. Produces a prerequisite-respecting, skill-gap-prioritized,
conflict-free term schedule, surfacing conflicts rather than failing.

A `CourseInfo` is a plain dict with keys:
    id, code, title, source, prerequisites (list[str]),
    terms_offered (list[str]), skill_contributions (list[{skill_id, weight}])
"""

from __future__ import annotations

from dataclasses import dataclass, field

SLOTS = 4
MAX_PER_STEP = 3
MAX_TERMS = 8
INTEREST_BONUS = 0.05


def _timeslot(course_id: str) -> int:
    return sum(ord(c) for c in course_id) % SLOTS


def _next_term(term: str) -> str:
    return "spring" if term == "fall" else "fall"


@dataclass
class _Scheduled:
    course: dict
    advances: list[dict]


@dataclass
class PathwayPlan:
    steps: list[dict] = field(default_factory=list)
    conflicts: list[dict] = field(default_factory=list)
    fully_schedulable: bool = True


def generate_pathway(
    career_id: str,
    required_skills: list[tuple[str, float]],
    completed_course_ids: list[str],
    competency: dict[str, float],
    courses: dict[str, dict],
    interest_skill_ids: list[str] | None = None,
    start_term: str | None = None,
) -> PathwayPlan:
    interest = set(interest_skill_ids or [])
    start_term = start_term or "fall"
    completed = set(completed_course_ids)

    # 1. gaps per required skill
    gap = {sid: max(0.0, lvl - competency.get(sid, 0.0)) for sid, lvl in required_skills}

    def course_weight(course: dict, skill_id: str) -> float:
        for sc in course["skill_contributions"]:
            if sc["skill_id"] == skill_id:
                return sc["weight"]
        return 0.0

    # 2. candidate courses: not completed, teach at least one gap>0 skill
    def gap_skills(course: dict) -> list[str]:
        return [sc["skill_id"] for sc in course["skill_contributions"] if gap.get(sc["skill_id"], 0.0) > 0]

    candidates = {
        cid: c
        for cid, c in courses.items()
        if cid not in completed and gap_skills(c)
    }

    # 3. include prerequisites needed to unlock candidates
    conflicts: list[dict] = []
    needed: dict[str, dict] = dict(candidates)
    frontier = list(candidates)
    while frontier:
        cid = frontier.pop()
        for pid in courses.get(cid, {}).get("prerequisites", []):
            if pid in completed:
                continue
            if pid not in courses:
                conflicts.append(
                    {
                        "type": "missing_prerequisite",
                        "course_ids": [cid, pid],
                        "message": f"Prerequisite {pid} of {cid} is not in the catalog.",
                    }
                )
                continue
            if pid not in needed:
                needed[pid] = courses[pid]
                frontier.append(pid)

    # 4. scores (interest bonus)
    def score(course: dict) -> float:
        s = sum(min(course_weight(course, sid), gap[sid]) for sid in gap_skills(course))
        if any(sc["skill_id"] in interest for sc in course["skill_contributions"]):
            s += INTEREST_BONUS
        return s

    scores = {cid: score(c) for cid, c in needed.items()}

    # 5. Kahn topological order; among ready nodes, highest score first, tie asc id.
    indeg: dict[str, int] = {}
    for cid, c in needed.items():
        prereqs_in = [p for p in c["prerequisites"] if p in needed]
        indeg[cid] = len(prereqs_in)

    scheduled_order: list[str] = []
    placed: set[str] = set(completed)
    while len(scheduled_order) < len(needed):
        ready = [cid for cid in needed if cid not in scheduled_order and indeg[cid] == 0]
        if not ready:
            # remaining have unmet prereqs within needed -> cycle or unschedulable
            remaining = [cid for cid in needed if cid not in scheduled_order]
            conflicts.append(
                {
                    "type": "unschedulable",
                    "course_ids": sorted(remaining),
                    "message": "Remaining courses have unresolved prerequisite ordering.",
                }
            )
            break
        ready.sort(key=lambda cid: (-scores[cid], cid))
        chosen = ready[0]
        scheduled_order.append(chosen)
        placed.add(chosen)
        for cid, c in needed.items():
            if chosen in c["prerequisites"] and cid not in scheduled_order:
                indeg[cid] -= 1

    # 6. term scheduling, conflict-free timeslots
    steps: list[dict] = []
    term = start_term
    step_order = 0
    done: set[str] = set(completed)
    pending = list(scheduled_order)

    terms_used = 0
    while pending and terms_used < MAX_TERMS:
        step_order += 1
        terms_used += 1
        used_slots: set[int] = set()
        this_step: list[dict] = []
        still_pending: list[str] = []
        for cid in pending:
            c = needed[cid]
            prereqs_ok = all(p in done or p in completed for p in c["prerequisites"] if p in needed)
            offered = term in c["terms_offered"]
            slot = _timeslot(cid)
            if (
                prereqs_ok
                and offered
                and slot not in used_slots
                and len(this_step) < MAX_PER_STEP
            ):
                used_slots.add(slot)
                advances = [
                    {"skill_id": sid, "gap_closed": round(min(course_weight(c, sid), gap[sid]), 4)}
                    for sid in gap_skills(c)
                ]
                this_step.append(
                    {
                        "course_id": cid,
                        "code": c["code"],
                        "title": c["title"],
                        "source": c["source"],
                        "prerequisites": c["prerequisites"],
                        "advances_skills": advances,
                    }
                )
            else:
                still_pending.append(cid)
        if this_step:
            steps.append({"order": step_order, "term": term, "courses": this_step})
            for pc in this_step:
                done.add(pc["course_id"])
        pending = still_pending
        term = _next_term(term)

    fully = True
    if pending:
        fully = False
        # classify why the still-pending courses could not be placed
        for cid in pending:
            c = needed[cid]
            if any((p not in done and p not in completed) for p in c["prerequisites"] if p in needed):
                ctype = "unschedulable"
                msg = f"{c['code']} could not be scheduled after prerequisites within {MAX_TERMS} terms."
            else:
                ctype = "term_clash"
                msg = f"{c['code']} clashes on its only offered term(s) {c['terms_offered']}."
            conflicts.append({"type": ctype, "course_ids": [cid], "message": msg})
    if conflicts:
        fully = False

    return PathwayPlan(steps=steps, conflicts=conflicts, fully_schedulable=fully)
