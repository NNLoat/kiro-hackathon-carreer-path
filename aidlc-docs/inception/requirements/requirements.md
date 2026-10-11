# Requirements — Career-Path Planner (Frontend)

## Intent Analysis

- **User Request**: Design and build the frontend for a career-path planning application. Users enter interests/skills and completed courses, select careers of interest, see required-vs-current skills in a radar chart, and receive a step-by-step study pathway (university + online courses) ordered so they know what to take first and when.
- **Request Type**: New Feature (greenfield frontend on a brownfield monorepo starter)
- **Scope Estimate**: Multiple Components (routing, 3 pages, catalog selection, charting, pathway visualization, typed API client + contract)
- **Complexity Estimate**: Moderate-to-Complex (multi-page app, data visualization, pathway/scheduling model surfaced in UI)
- **Engagement Boundary**: Frontend + **API contract definition only**. This work builds the frontend and defines the request/response schemas it consumes. It does **NOT** implement backend logic, real authentication, or database persistence. (Decision CQ2=A)

## Problem / Build / Success (from user)

- **Problem**: Planning registration and career paths is hard; information is not centralized.
- **Build**: Recommend course plans and conflict-free schedules; suggest career paths and skills by interest and completed courses.
- **Success**: Enter interests + completed courses -> study plan + career roadmap.

## Decisions Captured (from clarifying questions)

| # | Topic | Decision |
|---|---|---|
| Q1 / CQ2 | Data source / backend boundary | Frontend calls a defined backend API contract; **contract is designed here, backend logic implemented later** |
| Q2 | Course/skill input | Search + multi-select from a predefined catalog (typeahead) |
| Q3 | Current skill level | Auto-derived from completed courses (each course maps to skills with weights) |
| Q4 | Multiple careers in radar | Single radar chart; user **toggles between careers** |
| Q5 | Pathway ordering | Prerequisites + skill-gap priority + conflict-free term scheduling |
| Q6 / CQ3 | Accounts/persistence | Minimal **username-only profile**, server-side save; **no real password/auth** (prototype-grade) |
| Q7 (refined) | UI structure | Multi-page app with routing: Login, Landing (results), Profile. Career-path flow lives on the Landing page |
| Q8 / CQ1 | Target + styling | Responsive web; headless component library (Radix/shadcn-style) on Tailwind v4 |
| Q9 | Charting | AI selects best-fit radar chart library (to be decided in design, with justification) |
| Q10 | Accessibility | WCAG 2.1 AA target |
| Ext | Security / Resiliency | Not enforced |
| Ext | Property-Based Testing | Partial (blocking: PBT-02, 03, 07, 08, 09) |

## Pages (initial scope)

1. **Sign Up / Login** — enter a username to create or load a profile.
2. **Landing (Results)** — the core experience: input completed courses + interests, select careers, view radar chart, view study pathway.
3. **User Profile** — view/edit saved profile: completed courses, interests, selected careers, saved plans.

---

## Functional Requirements

### FR-1: Routing & App Shell
- FR-1.1: The app SHALL provide client-side routing across three routes: `/login`, `/` (landing/results), and `/profile`.
- FR-1.2: WHEN no active profile exists, the app SHALL redirect protected routes (`/`, `/profile`) to `/login`.
- FR-1.3: The app SHALL provide a persistent navigation affordance to move between Landing and Profile, and to sign out.

### FR-2: Sign Up / Login (minimal profile)
- FR-2.1: The Login page SHALL let a user enter a username to create a new profile or load an existing one.
- FR-2.2: WHEN a username is submitted, the app SHALL call the profile API contract to create/fetch the profile and establish an active session (client-held identifier; no password).
- FR-2.3: IF the profile lookup/creation fails, THEN the app SHALL display an error message and allow retry.
- FR-2.4: The app SHALL treat the active profile identifier as the key for all subsequent profile reads/writes.

### FR-3: Course & Skill/Interest Input (Landing)
- FR-3.1: The Landing page SHALL provide a searchable typeahead to find and multi-select **completed courses** from a catalog (university and online).
- FR-3.2: The Landing page SHALL provide a searchable typeahead to find and multi-select **skills/interests** from a catalog.
- FR-3.3: Each selected course/skill SHALL be removable from the selection.
- FR-3.4: The catalog data (courses, skills, careers) SHALL be retrieved via the defined API contract.
- FR-3.5: WHILE the catalog is loading, the UI SHALL show a loading state; IF the catalog fails to load, THEN it SHALL show an error with retry.

### FR-4: Career Selection (Landing)
- FR-4.1: The Landing page SHALL let the user select one or more careers of interest from the catalog.
- FR-4.2: The UI SHALL clearly indicate which careers are currently selected and allow deselection.

### FR-5: Skill Competency Derivation
- FR-5.1: The user's current competency per skill SHALL be derived from their completed courses, where each course contributes weighted skill values per the API contract's course->skill mapping.
- FR-5.2: WHEN the set of completed courses changes, the derived competency SHALL update accordingly.
- FR-5.3: The derivation SHALL produce a normalized competency value per skill suitable for radar display.

### FR-6: Radar Chart (Required vs Current)
- FR-6.1: The Landing page SHALL render a radar chart comparing **required skill levels for a career** against the **user's current competency**.
- FR-6.2: WHEN multiple careers are selected, the chart SHALL let the user **toggle** which career's required profile is shown; the user's current competency series SHALL remain visible across toggles.
- FR-6.3: The chart SHALL label axes with skill names and remain legible on small screens (responsive).
- FR-6.4: The chart SHALL expose a text/table alternative of the same data for accessibility (WCAG 2.1 AA).

### FR-7: Study Pathway (Stepwise)
- FR-7.1: The Landing page SHALL render a **step-by-step study pathway** of recommended courses (university + online) toward the selected career goal.
- FR-7.2: The pathway ordering SHALL respect: (a) course prerequisites, (b) skill-gap priority (courses closing the largest gaps toward the career ranked earlier), and (c) conflict-free term scheduling.
- FR-7.3: The pathway SHALL be presented in sequential steps/terms so the user can see what to take first and when.
- FR-7.4: Each pathway item SHALL display course identity, source (university/online), the skills it advances, and its prerequisites.
- FR-7.5: WHEN the user's selections (courses/skills/careers) change, the pathway SHALL recompute/refetch via the API contract.
- FR-7.6: IF no conflict-free ordering is possible under the given constraints, THEN the UI SHALL surface this clearly (e.g., flagged conflicts) rather than failing silently.

### FR-8: User Profile Page
- FR-8.1: The Profile page SHALL display the saved profile: username, completed courses, selected interests/skills, and selected careers.
- FR-8.2: The Profile page SHALL allow editing of completed courses, interests, and careers, and SHALL persist changes via the API contract.
- FR-8.3: The Profile page SHALL allow the user to save/name a generated plan (study pathway) and view previously saved plans.
- FR-8.4: WHEN a save succeeds/fails, the UI SHALL confirm success or show an actionable error.

### FR-9: API Contract (deliverable artifact)
- FR-9.1: This engagement SHALL produce a documented API contract (endpoint shapes, request/response schemas, error shapes) covering: profile create/fetch/update, catalog retrieval (courses/skills/careers), course->skill mapping, radar data (required vs current), pathway generation, and saved plans.
- FR-9.2: The frontend SHALL be built against this contract through a typed API client layer, isolating transport details from UI components.
- FR-9.3: The contract SHALL define error response shapes so the frontend can render consistent error states.
- FR-9.4: Because backend logic is out of scope, the frontend SHALL be developed against the contract via a typed stub/fixture layer that mirrors it (so UI is runnable without the real backend). The existing Vite `/api` proxy remains the integration seam for the real backend later.

---

## Non-Functional Requirements

### NFR-1: Usability & UX
- NFR-1.1: The app SHALL be responsive across mobile and desktop breakpoints.
- NFR-1.2: Interactive controls (typeahead, career toggles, chart, pathway) SHALL provide clear loading, empty, and error states.
- NFR-1.3: Primary flows (login -> input -> results) SHALL be completable without a page reload where practical within a route.

### NFR-2: Accessibility (WCAG 2.1 AA)
- NFR-2.1: All interactive elements SHALL be keyboard navigable with visible focus states.
- NFR-2.2: Color contrast SHALL meet WCAG 2.1 AA; information SHALL NOT be conveyed by color alone (radar series need non-color cues/labels).
- NFR-2.3: The radar chart SHALL have an accessible text/table equivalent (per FR-6.4).
- NFR-2.4: Components adopted from the headless library SHALL preserve their built-in ARIA semantics.
- NFR-2.5: Full WCAG conformance requires manual assistive-technology testing and expert review; automated checks are necessary but not sufficient.

### NFR-3: Architecture & Maintainability
- NFR-3.1: UI components SHALL be decoupled from data access via a typed API client layer (per FR-9.2).
- NFR-3.2: Domain types (Course, Skill, Career, Profile, PathwayStep, RadarSeries, Plan) SHALL be defined once and shared across the app.
- NFR-3.3: Styling SHALL use Tailwind v4 plus the chosen headless component library; no competing CSS frameworks.
- NFR-3.4: The stub/fixture layer SHALL be swappable for real HTTP calls without changing UI components.

### NFR-4: Performance
- NFR-4.1: Typeahead search over the catalog SHALL remain responsive (debounced input; no blocking the main thread on large lists).
- NFR-4.2: Radar and pathway re-render on selection change SHALL feel immediate for typical catalog sizes.

### NFR-5: Testability (incl. Property-Based Testing — Partial)
- NFR-5.1: The frontend SHALL use the existing Vitest + Testing Library setup for component and unit tests.
- NFR-5.2: A property-based testing framework (fast-check, integrating with Vitest) SHALL be added and documented (PBT-09).
- NFR-5.3: Pure logic — skill-competency derivation (FR-5), skill-gap computation, and any contract serialization/normalization — SHALL have property-based tests covering invariants (PBT-03), round-trips where applicable (PBT-02), and quality generators for domain types (PBT-07), with shrinking + seed reproducibility (PBT-08).
- NFR-5.4: Business-critical paths SHALL also have example-based tests; PBT complements rather than replaces them.

### NFR-6: Out of Scope (explicit)
- NFR-6.1: Backend endpoint implementation, database schema/persistence, and real authentication/authorization are OUT of scope (contract-only).
- NFR-6.2: Security baseline and Resiliency baseline extensions are NOT enforced for this engagement.

---

## Success Criteria

- SC-1: A user can enter a username and reach the Landing page.
- SC-2: A user can search and multi-select completed courses and interests from the catalog.
- SC-3: A user can select one or more careers.
- SC-4: The radar chart shows required-vs-current skills and the user can toggle between selected careers.
- SC-5: A step-by-step study pathway is displayed, ordered by prerequisites, skill-gap priority, and conflict-free term scheduling, showing what to take first and when.
- SC-6: The profile page shows and edits the saved profile and saved plans.
- SC-7: A documented API contract exists and the frontend runs against a typed stub mirroring it.

## Key Requirements Summary

This is a responsive, accessible (WCAG 2.1 AA) multi-page React/TypeScript frontend with three pages (Login, Landing/Results, Profile). It centers on catalog-driven course/skill/career selection, an auto-derived skill-competency model visualized as a toggleable required-vs-current radar chart, and a prerequisite-aware, skill-gap-prioritized, conflict-free study pathway. The engagement delivers the frontend plus a documented API contract (consumed via a typed client with a swappable stub layer); backend logic, real auth, and persistence are out of scope.
