# Requirements — Course & Career Navigator (Combined)

> Combined inception: merges the frontend-derived requirements in this repo with the dataset + concept inception from the AI-DLC workspace. Frontend design is authoritative; the dataset (`Dataset/`, seeded via `backend/seed_data/`) provides catalog content. See `../combined-inception.md` for the full reconciliation rationale.

## Intent Analysis
- **Request Type**: Full-stack build combining this repo's frontend design with a dataset-backed backend.
- **Scope**: React/TS frontend (as designed in this repo) + FastAPI/PostgreSQL backend implementing `backend/API-CONTRACT.md`, seeded from the dataset.
- **Complexity**: Moderate–Complex (multi-page UI, radar visualization, pathway scheduling, weighted competency model).
- **Maturity**: PoC/prototype (no real auth; Security/Resiliency baselines off; PBT Partial).

## Problem / Build / Success
- **Problem**: Planning registration and career paths is hard; information is not centralized.
- **Build**: Recommend course plans and conflict-free schedules; suggest career paths and skills by interest and completed courses.
- **Success**: Enter interests + completed courses → stepwise study pathway + career roadmap (radar + careers).

## Functional Requirements

### App Shell & Routing (frontend)
- FR-1.1: Client-side routing across `/login`, `/` (landing/results), `/profile`.
- FR-1.2: Protected routes redirect to `/login` when no active profile.
- FR-1.3: Persistent navigation between Landing and Profile, plus Sign Out.

### Login / Profile (username-only)
- FR-2.1: Enter a username to create a new profile or load an existing one.
- FR-2.2: Idempotent create-or-load via `POST /api/profiles`; client holds the returned profile id/username as the session key (no password/token).
- FR-2.3: On failure, show an error and allow retry.
- FR-8.1–8.4: Profile page displays and edits completed courses, interests, careers; saves/names and lists generated plans; confirms success/shows actionable errors.

### Catalog Input (frontend UI; content from dataset)
- FR-3.1: Typeahead multi-select of completed courses (sources: university AND online).
- FR-3.2: Typeahead multi-select of skills/interests.
- FR-3.3: Each selection removable.
- FR-3.4: Catalog retrieved via `GET /api/catalog/{skills|courses|careers}`; backed by PostgreSQL seeded from the dataset.
- FR-3.5: Loading/error/empty states for catalog operations.

### Career Selection (frontend)
- FR-4.1: Select one or more careers from the catalog.
- FR-4.2: Clearly indicate selected careers; allow deselection.

### Skill Competency Derivation (weighted)
- FR-5.1: Current competency per skill derived from completed courses using weighted `skill_contributions` (0..1).
- FR-5.2: Recompute when completed courses change.
- FR-5.3: Normalized, deterministic, monotonic competency per skill (`POST /api/skills/competency`).

### Radar Chart (frontend)
- FR-6.1: Radar chart overlaying a career's required skill levels vs the user's current competency (`POST /api/radar`).
- FR-6.2: Toggle between selected careers while keeping the current-competency series visible.
- FR-6.3: Axes labeled with skill names; legible/responsive on small screens.
- FR-6.4: Accessible text/table alternative of the same data.

### Study Pathway (merged — scheduling concept + gap-priority)
- FR-7.1: Stepwise study pathway of recommended courses (university + online) toward the selected career (`POST /api/pathway`).
- FR-7.2: Ordering respects (a) prerequisites, (b) skill-gap priority (largest gap-closing first), (c) conflict-free term scheduling.
- FR-7.3: Sequential steps/terms show what to take first and when.
- FR-7.4: Each item shows course identity, source (university/online), skills advanced (with gap_closed), and prerequisites.
- FR-7.5: Recompute/refetch when selections change.
- FR-7.6: If no conflict-free ordering is possible, return the best-effort ordering with `conflicts` populated and `fully_schedulable: false`; the UI surfaces conflicts rather than failing silently.

### API Contract & Backend (combined-project scope expansion)
- FR-9.1: The backend SHALL implement every endpoint in `backend/API-CONTRACT.md` (profiles, catalog, competency, radar, pathway, plans) with the defined request/response and error shapes.
- FR-9.2: The frontend SHALL consume the contract through a single typed API client; a typed stub mirroring the contract SHALL remain available so the UI runs without the backend.
- FR-9.3: The backend SHALL seed PostgreSQL from `backend/seed_data/` (the dataset) on startup.
- FR-9.4: Catalog ids SHALL be stable strings mapped from the dataset's SK-/CR-/course-code identifiers during seeding.

## Non-Functional Requirements
- NFR-1 Usability: responsive; clear loading/empty/error states; primary flows without full reload within a route.
- NFR-2 Accessibility (WCAG 2.1 AA): keyboard nav + visible focus; contrast + non-color cues; radar text/table alternative; preserve library ARIA; (full conformance needs manual AT testing).
- NFR-3 Architecture: UI decoupled via typed API client; domain types defined once and shared; Tailwind v4 + chosen headless component library; stub swappable for real HTTP without UI changes; backend split into catalog/competency/pathway services.
- NFR-4 Performance: debounced typeahead; immediate radar/pathway re-render for the small seeded catalog.
- NFR-5 Testability (PBT Partial): fast-check on frontend pure logic; Hypothesis on backend pure logic (competency normalization, skill-gap, pathway scheduler); invariants (PBT-03), round-trips (PBT-02), quality generators (PBT-07), shrinking + seed reproducibility (PBT-08), framework selection (PBT-09). Example-based tests complement PBT.
- NFR-6 Maturity: no real auth; Security + Resiliency baselines NOT enforced.

## Catalog Content (dataset)
- Courses: `computer_science_courses.json` (MIT OCW, Harvard CS50, Stanford) + online-platform courses in `course_skill_career_map.json` (Coursera/edX/Udacity — reference metadata only).
- Skills: `skills.json` (29 skills, SK-###).
- Careers: `careers.json` (10 careers, CR-###, with required/recommended skills).
- Join: `course_skill_career_map.json` (course → teaches_skills → matching_careers).
- Licensing: openly-licensed sources (CC BY-NC-SA, O*NET CC BY 4.0); online platforms are link-out reference only. Attribution surfaced in the app.

## Assumptions / To Finalize in Functional Design
- A1: `terms_offered` and per-course synthesized timeslots are generated deterministically from course metadata.
- A2: `skill_contributions` weights are derived deterministically from `teaches_skills` (equal-weight default), normalized to 0..1.
- A3: Career `required_skills.level`: `required_skills` → high (e.g., 0.8), `recommended_skills` → moderate (e.g., 0.5); exact values set in Functional Design.
- A4: Competency normalization: deterministic + monotonic with diminishing returns, capped at 1.0.

## Success Criteria
See `../combined-inception.md` §10 (SC-1 … SC-7).
