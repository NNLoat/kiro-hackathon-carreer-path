# User Stories — Career-Path Planner (Frontend)

**Persona**: Nam (see `personas.md`) — all stories are written from Nam's perspective.
**Breakdown**: User journey-based, each story tagged with its primary delivery **Phase**.
**Acceptance criteria**: EARS-style (WHEN/IF/THEN ... SHALL). Required error/empty/no-solution behaviors are folded into acceptance criteria (no separate edge-case stories).
**INVEST**: Stories are Independent, Negotiable, Valuable, Estimable, Small, Testable.

**Delivery phases**: Phase 1 = Login · Phase 2 = Profile · Phase 3 = Landing/Results.

---

## Cross-Cutting / Foundation Stories

### US-0.1 — App shell & routing  [Phase 1]
**As** Nam, **I want** to move between the login, landing, and profile pages, **so that** I can navigate the app predictably.
**Acceptance Criteria**
- WHEN I open the app without an active profile, THE app SHALL route me to `/login`.
- WHEN I have an active profile and visit `/` or `/profile`, THE app SHALL render that page.
- WHEN I have no active profile and attempt to open `/` or `/profile`, THE app SHALL redirect me to `/login`.
- WHILE I have an active profile, THE app SHALL show navigation to Landing and Profile and a Sign Out action.
- WHEN I activate Sign Out, THE app SHALL clear the active profile and return me to `/login`.
_Traceability_: FR-1.1–1.3, FR-2.4

### US-0.2 — Define the API contract  [Phase 1]
**As** Nam (via the team), **I want** a documented API contract for all data the frontend needs, **so that** the frontend can be built against stable schemas.
**Acceptance Criteria**
- THE contract SHALL define request/response and error schemas for: profile create/fetch/update, catalog retrieval (courses, skills, careers), course→skill mapping, radar data (required vs current), pathway generation, and saved plans.
- THE contract SHALL define a consistent error response shape usable by the frontend for error states.
- THE frontend SHALL consume the contract through a single typed API client layer that isolates transport details from UI components.
_Traceability_: FR-9.1–9.3, NFR-3.1, NFR-3.2

### US-0.3 — Typed stub mirrors the contract  [Phase 1]
**As** Nam (via the team), **I want** a typed stub/fixture layer that mirrors the API contract, **so that** the frontend is fully runnable before the real backend exists.
**Acceptance Criteria**
- THE stub layer SHALL implement every operation defined in the API contract with realistic fixture data.
- THE stub layer SHALL be swappable for real HTTP calls without changing UI components.
- WHEN the frontend runs against the stub, all pages SHALL function end-to-end.
_Traceability_: FR-9.4, NFR-3.4

---

## Phase 1 — Sign Up / Login

### US-1.1 — Sign in / create profile by username  [Phase 1]
**As** Nam, **I want** to enter a username to create or load my profile, **so that** I can start planning and have my data associated with me.
**Acceptance Criteria**
- WHEN I enter a username and submit, THE app SHALL call the profile contract to create the profile if new or load it if it exists.
- WHEN the profile call succeeds, THE app SHALL establish an active session (client-held identifier, no password) and route me to the Landing page.
- IF the username field is empty, THEN THE app SHALL prevent submission and indicate the field is required.
- IF the profile create/fetch call fails, THEN THE app SHALL display an error message and allow me to retry.
- WHILE the profile call is in progress, THE app SHALL show a loading state and disable duplicate submission.
_Traceability_: FR-2.1–2.4, NFR-1.2

### US-1.2 — Accessible login  [Phase 1]
**As** Nam, **I want** the login page to be keyboard and screen-reader friendly, **so that** I can sign in regardless of how I navigate.
**Acceptance Criteria**
- THE username field and submit control SHALL be reachable and operable by keyboard with a visible focus state.
- THE username field SHALL have a programmatically associated label.
- WHEN an error is shown, THE app SHALL convey it with text (not color alone) and associate it with the field for assistive technology.
_Traceability_: NFR-2.1, NFR-2.2

---

## Phase 2 — User Profile

### US-2.1 — View my saved profile  [Phase 2]
**As** Nam, **I want** to see my saved profile, **so that** I can confirm what the app knows about me.
**Acceptance Criteria**
- WHEN I open the Profile page with an active profile, THE app SHALL display my username, completed courses, selected interests/skills, and selected careers.
- WHILE the profile is loading, THE app SHALL show a loading state.
- IF the profile fails to load, THEN THE app SHALL show an error with a retry option.
- WHEN a section has no data yet, THE app SHALL show an empty state explaining how to add items.
_Traceability_: FR-8.1, NFR-1.2

### US-2.2 — Edit completed courses, interests, and careers  [Phase 2]
**As** Nam, **I want** to edit my completed courses, interests, and careers from my profile, **so that** my plan reflects reality.
**Acceptance Criteria**
- WHEN I add or remove a completed course, interest, or career and save, THE app SHALL persist the change via the profile contract.
- WHEN a save succeeds, THE app SHALL confirm success.
- IF a save fails, THEN THE app SHALL show an actionable error and preserve my unsaved edits so I can retry.
_Traceability_: FR-8.2, FR-8.4, NFR-1.2

### US-2.3 — Save and revisit named plans  [Phase 2]
**As** Nam, **I want** to save a generated study plan with a name and view saved plans, **so that** I can compare and return to them.
**Acceptance Criteria**
- WHEN I save a plan with a name, THE app SHALL persist it via the contract and show it in my list of saved plans.
- WHEN I open a saved plan, THE app SHALL display its contents.
- IF saving or loading a plan fails, THEN THE app SHALL show an error with retry.
_Traceability_: FR-8.3, FR-8.4

---

## Phase 3 — Landing / Results

### US-3.1 — Search and multi-select completed courses  [Phase 3]
**As** Nam, **I want** to search a catalog and select the courses I've completed, **so that** the app knows my background.
**Acceptance Criteria**
- WHEN I type in the course search, THE app SHALL show matching catalog courses (university and online) via typeahead.
- WHEN I select a course, THE app SHALL add it to my completed-courses selection; WHEN I remove one, THE app SHALL remove it.
- WHILE the catalog is loading, THE app SHALL show a loading state; IF it fails to load, THEN THE app SHALL show an error with retry.
- WHEN no matches are found, THE app SHALL show an empty-result state.
_Traceability_: FR-3.1, FR-3.3, FR-3.4, FR-3.5, NFR-4.1

### US-3.2 — Search and multi-select skills/interests  [Phase 3]
**As** Nam, **I want** to search and select my skills/interests, **so that** recommendations reflect what I care about.
**Acceptance Criteria**
- WHEN I type in the skill/interest search, THE app SHALL show matching catalog entries via typeahead.
- WHEN I select or remove a skill/interest, THE app SHALL update my selection accordingly.
- WHILE the catalog is loading, THE app SHALL show a loading state; IF it fails to load, THEN THE app SHALL show an error with retry.
_Traceability_: FR-3.2, FR-3.3, FR-3.4, FR-3.5, NFR-4.1

### US-3.3 — Select one or more careers of interest  [Phase 3]
**As** Nam, **I want** to select one or more careers of interest, **so that** the app can compare my skills and build a pathway toward them.
**Acceptance Criteria**
- WHEN I select a career from the catalog, THE app SHALL mark it as selected and allow selecting additional careers.
- WHEN I deselect a career, THE app SHALL remove it from the selection.
- THE app SHALL clearly indicate which careers are currently selected.
_Traceability_: FR-4.1, FR-4.2

### US-3.4 — See my current skill competency derived from courses  [Phase 3]
**As** Nam, **I want** my current competency per skill derived automatically from my completed courses, **so that** I don't have to self-rate.
**Acceptance Criteria**
- THE app SHALL compute a normalized competency value per skill from my completed courses using the contract's weighted course→skill mapping.
- WHEN my set of completed courses changes, THE app SHALL recompute the derived competency.
_Traceability_: FR-5.1–5.3

### US-3.5 — Compare required vs. current skills in a radar chart  [Phase 3]
**As** Nam, **I want** a radar chart comparing a career's required skills to my current competency, **so that** I can see my gaps at a glance.
**Acceptance Criteria**
- WHEN I have selected at least one career, THE app SHALL render a radar chart overlaying that career's required skill levels and my current competency.
- WHEN I have selected multiple careers, THE app SHALL let me toggle which career's required profile is shown WHILE keeping my current-competency series visible.
- THE chart SHALL label axes with skill names and remain legible on small screens.
- THE app SHALL provide a text/table alternative of the same data, and SHALL NOT rely on color alone to distinguish series.
_Traceability_: FR-6.1–6.4, NFR-2.2, NFR-2.3, NFR-1.1

### US-3.6 — See a step-by-step study pathway  [Phase 3]
**As** Nam, **I want** an ordered, step-by-step study pathway toward my selected career, **so that** I know which courses to take first and when.
**Acceptance Criteria**
- WHEN I have selected a career (and have my courses/skills set), THE app SHALL render a stepwise pathway of recommended courses (university and online).
- THE pathway ordering SHALL respect course prerequisites, prioritize courses that close the largest skill gaps, and present a conflict-free term schedule.
- THE pathway SHALL be presented in sequential steps/terms showing what to take first and when.
- EACH pathway item SHALL show course identity, source (university/online), the skills it advances, and its prerequisites.
- WHEN my selections change, THE app SHALL recompute/refetch the pathway via the contract.
- IF no conflict-free ordering is possible under the constraints, THEN THE app SHALL surface the conflict clearly rather than failing silently.
_Traceability_: FR-7.1–7.6

### US-3.7 — Landing results stay responsive and accessible  [Phase 3]
**As** Nam, **I want** the Landing interactions to stay fast and accessible, **so that** exploring options feels smooth on any device.
**Acceptance Criteria**
- THE typeahead inputs SHALL be debounced and SHALL NOT block interaction on large catalogs.
- WHEN selections change, THE radar and pathway SHALL update without a full page reload.
- ALL interactive controls (search, career toggles, chart controls, pathway) SHALL be keyboard operable with visible focus.
_Traceability_: NFR-4.1, NFR-4.2, NFR-1.3, NFR-2.1

---

## Persona Mapping
All stories above map to the single primary persona **Nam**. Foundation stories (US-0.x) are enabling/technical stories written on Nam's behalf by the team to make Nam's journey possible.

## Story-to-Phase Summary
- **Phase 1 (Login)**: US-0.1, US-0.2, US-0.3, US-1.1, US-1.2
- **Phase 2 (Profile)**: US-2.1, US-2.2, US-2.3
- **Phase 3 (Landing)**: US-3.1, US-3.2, US-3.3, US-3.4, US-3.5, US-3.6, US-3.7
