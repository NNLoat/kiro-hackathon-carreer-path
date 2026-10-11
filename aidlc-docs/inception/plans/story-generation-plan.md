# User Story Generation Plan — Career-Path Planner (Frontend)

Role: Product Owner. This plan defines HOW we will convert the approved requirements into user stories
and personas. Please answer the embedded questions (fill the `[Answer]:` tags), then I'll analyze the
answers and request your approval of this plan before generating stories.

## Delivery Phasing (confirmed with user)
- **Phase 1**: Sign Up / Login (easiest)
- **Phase 2**: User Profile
- **Phase 3**: Landing / Results (most complex — multiple visualizations)

Stories will be organized and sequenced to match this phasing.

---

## Clarifying Questions

## Question 1
Which story breakdown approach should we use?

A) Feature-based — stories grouped by feature/page (Login, Profile, Landing), matching the delivery phases

B) User journey-based — stories follow end-to-end user workflows across pages

C) Persona-based — stories grouped by user type

D) Hybrid — feature/phase-based grouping, but each story written from a persona's perspective (recommended: matches your phasing while staying user-centered)

X) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 2
How many user personas should we define?

A) One primary persona (e.g., a university student planning courses) — keep it simple

B) Two personas (e.g., a current university student + a career-switcher using online courses)

C) Three or more (students, career-switchers, advisors/mentors)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 3
What granularity do you want for stories?

A) Coarse — one story per major capability per page (fewer, larger stories)

B) Medium — stories split by distinct interaction (e.g., "search courses", "select careers", "toggle radar", "view pathway") — INVEST-sized (recommended)

C) Fine — very small stories per control/state

X) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 4
What format for acceptance criteria?

A) Given/When/Then (BDD style) — pairs well with testing

B) Checklist of testable conditions (bullet list)

C) EARS-style (WHEN/IF/THEN ... SHALL), consistent with the requirements doc

X) Other (please describe after [Answer]: tag below)

[Answer]: C

## Question 5
Should we include stories for non-happy-path/edge cases (errors, empty states, failed loads, no conflict-free pathway)?

A) Yes — include explicit error/empty-state stories alongside happy-path (recommended for WCAG + robustness)

B) No — happy-path stories only for now; capture edge cases later

X) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 6
How should we represent the API-contract dependency in stories (since backend logic is out of scope)?

A) Add explicit stories for "define the API contract" the frontend consumes, plus a "typed stub mirrors contract" story

B) Keep contract work as acceptance-criteria notes within feature stories (no standalone contract stories)

C) Both — standalone contract/stub stories AND contract notes referenced in feature stories (recommended for traceability)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Plan Execution Checklist (what I'll do after approval)
- [x] Generate `personas.md` with the agreed number of personas (archetypes, goals, pain points)
- [x] Generate `stories.md` with user stories following INVEST criteria
- [x] Organize stories by the confirmed delivery phases (Login -> Profile -> Landing)
- [x] Write acceptance criteria in the chosen format for each story
- [x] Include error/empty-state stories per Q5 decision (folded into AC)
- [x] Represent API-contract dependency per Q6 decision
- [x] Map personas to relevant stories
- [x] Add traceability references from stories back to requirement IDs (FR-*/NFR-*)
