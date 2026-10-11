# Units of Work — Career-Path Planner (Frontend)

**Nature**: Single deployable frontend (one Vite app). Units are logical modules/milestones built in
sequence (per-unit design + code + test loop), NOT separate deployable services.

**Build model**: Each unit is fully designed, coded, and tested (example-based + applicable PBT) before
the next begins.

## Code Organization Strategy (greenfield frontend within existing repo)
Feature-based layout under `frontend/src/`:
```
frontend/src/
  app/            # shell: AppRouter, AppProviders, RequireProfile      [Unit 1]
  lib/            # types, wire, mappers, apiClient(+Http/Stub),
                  # queryHooks, SessionContext                           [Unit 1]
  components/     # shared Radix+Tailwind UI (Button, Field, Combobox,
                  # Chip, Toast, Spinner, ErrorState, EmptyState, AppNav)[Unit 1 seed; grows per unit]
  features/
    auth/         # LoginPage, UsernameForm                             [Unit 1]
    profile/      # ProfilePage, ProfileSummary, ProfileEditor,
                  # SavedPlansList                                       [Unit 2]
    landing/      # LandingPage, CourseSelector, SkillSelector,
                  # CareerSelector, CareerToggle, RadarChart,
                  # RadarDataTable, StudyPathway, PathwayStepCard,
                  # PathwayConflicts                                     [Unit 3]
  domain/         # competency, skillGap, radar (pure, PBT)             [Unit 3]
  test/           # vitest setup (exists)
```

## Unit 1 — Foundation + Login
- **Purpose**: Deliver a runnable, navigable app shell and the login/create-profile flow.
- **Responsibilities**:
  - Shared `lib/`: `types`, `wire`, `mappers`, `ApiClient` interface + `HttpApiClient` + `StubApiClient`,
    `createApiClient()` (VITE_USE_STUB), `queryHooks`, `SessionContext`.
  - `app/`: `AppRouter` (`/login`, `/`, `/profile`), `AppProviders` (QueryClient + Session), `RequireProfile` guard.
  - Seed `components/` primitives needed by login (Button, Field, Toast, Spinner, ErrorState).
  - `features/auth/`: `LoginPage`, `UsernameForm`.
- **Delivers**: App boots, routes work, guard redirects, user can create/load a profile and land on `/`.
- **Tech additions**: react-router-dom, @tanstack/react-query, Radix primitives, fast-check (dev).
- **Pure logic to PBT**: `mappers` round-trips (PBT-02).

## Unit 2 — Profile
- **Purpose**: View and edit the saved profile; manage saved plans.
- **Responsibilities**:
  - `features/profile/`: `ProfilePage`, `ProfileSummary`, `ProfileEditor` (reuses Combobox), `SavedPlansList`.
  - Reuse `queryHooks` (useProfile/useUpdateProfile/usePlans), `SessionContext`, shared UI.
  - Grow `components/` as needed (e.g., Combobox if not already built; EmptyState).
- **Delivers**: Profile view with loading/empty/error states; edit+save with feedback; list/open plans.
- **Pure logic to PBT**: none new (mappers already covered).

## Unit 3 — Landing / Results (most complex)
- **Purpose**: The core experience — selection, radar, and stepwise pathway.
- **Responsibilities**:
  - `features/landing/`: `LandingPage`, `CourseSelector`, `SkillSelector`, `CareerSelector`, `CareerToggle`,
    `RadarChart` (Chart.js), `RadarDataTable` (a11y), `StudyPathway`, `PathwayStepCard`, `PathwayConflicts`.
  - `domain/`: `deriveCompetency`, `computeSkillGaps`, `buildRadarAxes` (pure).
  - Wire `useRadar`/`usePathway`; recompute on selection changes; surface conflicts (FR-7.6).
  - Tech addition: chart.js + react-chartjs-2.
- **Delivers**: SC-2..SC-5 end-to-end against the stub.
- **Pure logic to PBT** (Partial-enforced): `deriveCompetency` (invariants PBT-03: 0..1 range, monotonic;
  generators PBT-07), `computeSkillGaps` (invariants), `buildRadarAxes`; mappers round-trips (PBT-02).

## Validation
- All stories assigned (see unit-of-work-story-map.md).
- Dependencies acyclic and respect build order (see unit-of-work-dependency.md).
