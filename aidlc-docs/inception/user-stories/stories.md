# User Stories — Course & Career Navigator (Combined)

> Combined inception: keeps this repo's journey-based, phase-tagged frontend stories (authoritative UX) and augments them with backend-implementation stories, because the combined project builds the full stack (not frontend-only). EARS-style acceptance criteria. Persona: Nam/Alex (see `personas.md`).

**Delivery phases**: Phase 1 = Foundation + Login · Phase 2 = Profile · Phase 3 = Landing/Results · Phase 4 = Backend (implements the contract + seeds the dataset).

---

## Foundation
- **US-0.1 App shell & routing** — route guards; nav; sign out. _FR-1.x, FR-2.4_
- **US-0.2 Define the API contract** — adopt `backend/API-CONTRACT.md` as source of truth. _FR-9.1_
- **US-0.3 Typed stub mirrors the contract** — frontend runnable without backend; stub swappable for real HTTP. _FR-9.2_

## Phase 1 — Login
- **US-1.1 Sign in / create profile by username** — idempotent create-or-load; session key; errors + loading. _FR-2.1–2.3_
- **US-1.2 Accessible login** — keyboard + screen-reader friendly; error not by color alone. _NFR-2_

## Phase 2 — Profile
- **US-2.1 View saved profile** — username, completed courses, interests, careers; loading/empty/error. _FR-8.1_
- **US-2.2 Edit courses/interests/careers** — persist via contract; confirm/preserve edits on failure. _FR-8.2, 8.4_
- **US-2.3 Save & revisit named plans** — save pathway with a name; list and open saved plans. _FR-8.3_

## Phase 3 — Landing / Results
- **US-3.1 Search + multi-select completed courses** (university + online) via typeahead. _FR-3.1, 3.3–3.5_
- **US-3.2 Search + multi-select skills/interests** via typeahead. _FR-3.2–3.5_
- **US-3.3 Select one or more careers.** _FR-4.1–4.2_
- **US-3.4 Auto-derived current competency** from completed courses (weighted). _FR-5.1–5.3_
- **US-3.5 Radar chart (required vs current)** with career toggle + text/table alternative. _FR-6.1–6.4_
- **US-3.6 Stepwise study pathway** — prerequisites + skill-gap priority + conflict-free terms; surface conflicts. _FR-7.1–7.6_
- **US-3.7 Responsive & accessible Landing** — debounced inputs; update without reload; keyboard operable. _NFR-1, 2, 4_

## Phase 4 — Backend (combined-project additions)
- **US-4.1 Implement Profile endpoints** — `POST/GET/PUT /api/profiles...`; idempotent create-or-load; validation errors. _FR-9.1_
- **US-4.2 Implement Catalog endpoints** — skills/courses/careers search, seeded from the dataset. _FR-3.4, FR-9.1, FR-9.3_
- **US-4.3 Implement competency derivation** — `POST /api/skills/competency`; deterministic + monotonic normalization. _FR-5.x_
  - Acceptance: WHEN the same completed-course set is sent twice, THEN identical competency is returned (deterministic). WHEN a contributing course is added, THEN no skill's competency decreases (monotonic). (PBT-03)
- **US-4.4 Implement radar endpoint** — `POST /api/radar`; axes include every required skill; current=0 when no contributing course. _FR-6.1_
- **US-4.5 Implement pathway endpoint** — `POST /api/pathway`; prerequisite-respecting, gap-prioritized, conflict-free term scheduling; `conflicts` + `fully_schedulable` per contract §5.2. _FR-7.x_
  - Acceptance: THE returned steps SHALL never place two time-clashing courses in the same term; EVERY scheduled course's prerequisites SHALL appear in an earlier step or the completed set; IF unschedulable, THEN `fully_schedulable=false` with populated `conflicts`. (PBT-03)
- **US-4.6 Implement plan endpoints** — save/list/fetch named plans. _FR-8.3_
- **US-4.7 Seed catalog on startup** — load `backend/seed_data/*.json`; map SK-/CR-/course-code ids to contract string ids; derive weighted `skill_contributions` and `required_skills.level` deterministically. _FR-9.3, FR-9.4_

## Story-to-Phase Summary
- Phase 1: US-0.1, US-0.2, US-0.3, US-1.1, US-1.2
- Phase 2: US-2.1, US-2.2, US-2.3
- Phase 3: US-3.1 … US-3.7
- Phase 4: US-4.1 … US-4.7
