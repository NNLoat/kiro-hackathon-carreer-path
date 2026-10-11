# Components — Career-Path Planner (Frontend)

High-level component identification. Detailed business rules are deferred to Functional Design (per unit).

**Stack decisions**: React Router, TanStack Query, React Context + hooks, Radix UI primitives + Tailwind v4,
Chart.js (react-chartjs-2) for the radar, dedicated pure `domain/` module, env-flag-selected API client
behind one typed interface, feature-based folder structure.

## Proposed Folder Structure
```
frontend/src/
  app/            # app shell: router, providers (QueryClient, SessionProvider)
  components/     # shared UI primitives (Button, Field, Combobox, Toast, Spinner) on Radix+Tailwind
  domain/         # pure, framework-agnostic TS logic (PBT target)
  lib/            # api client interface, http client, stub client, query hooks, types
  features/
    auth/         # Login page + session
    profile/      # Profile page + plans
    landing/      # Landing/Results page: selectors, radar, pathway
  test/           # existing vitest setup
```

## 1. Shared UI Components (`components/`)
| Component | Purpose | Key responsibilities |
|---|---|---|
| `Button` | Accessible button | Variants, disabled/loading state, keyboard/focus |
| `Field` | Labeled form field wrapper | Associates label + error text with input (a11y) |
| `Combobox` | Accessible typeahead multi-select (Radix) | Search, keyboard nav, selected chips, remove |
| `Chip` / `TagList` | Show/remove selected items | Remove affordance, keyboard operable |
| `Toast` | Transient success/error feedback | ARIA live region |
| `Spinner` / `LoadingState` | Loading indicator | Accessible busy status |
| `ErrorState` | Inline error + retry | Renders error envelope message, retry action |
| `EmptyState` | Empty/placeholder | Guidance text |
| `AppNav` | Persistent navigation | Links to Landing/Profile, Sign Out |

## 2. App Shell (`app/`)
| Component | Purpose |
|---|---|
| `AppRouter` | Defines routes `/login`, `/`, `/profile`; guards protected routes |
| `RequireProfile` | Route guard: redirects to `/login` when no active profile |
| `AppProviders` | Wraps app in QueryClientProvider + SessionProvider |

## 3. Auth Feature (`features/auth/`)  — Unit 1
| Component | Purpose |
|---|---|
| `LoginPage` | Username entry to create/load profile (US-1.1, US-1.2) |
| `UsernameForm` | Accessible form: validation, submit, loading, error |

## 4. Profile Feature (`features/profile/`)  — Unit 2
| Component | Purpose |
|---|---|
| `ProfilePage` | View/edit saved profile; list saved plans (US-2.1–2.3) |
| `ProfileSummary` | Shows username, completed courses, interests, careers |
| `ProfileEditor` | Edit selections (reuses Combobox); save with feedback |
| `SavedPlansList` | List + open saved plans |

## 5. Landing Feature (`features/landing/`)  — Unit 3
| Component | Purpose |
|---|---|
| `LandingPage` | Orchestrates the results experience (US-3.1–3.7) |
| `CourseSelector` | Typeahead multi-select of completed courses (US-3.1) |
| `SkillSelector` | Typeahead multi-select of skills/interests (US-3.2) |
| `CareerSelector` | Multi-select careers; shows selected (US-3.3) |
| `RadarChart` | Chart.js radar: required vs current; career toggle (US-3.5) |
| `RadarDataTable` | Accessible text/table equivalent of radar data (FR-6.4) |
| `CareerToggle` | Switch which career's required profile is shown |
| `StudyPathway` | Stepwise pathway grouped by term/order (US-3.6) |
| `PathwayStepCard` | One step: course identity, source, skills, prereqs |
| `PathwayConflicts` | Surfaces conflicts when not fully schedulable (FR-7.6) |

## 6. Non-UI Components (`lib/`, `domain/`)
| Component | Purpose |
|---|---|
| `ApiClient` (interface) | Typed contract mirroring backend/API-CONTRACT.md |
| `HttpApiClient` | Real implementation (fetch via `/api`) |
| `StubApiClient` | Fixture-backed implementation (US-0.3) |
| `apiClient` (factory) | Selects Http vs Stub via `VITE_USE_STUB` |
| `queryHooks` | TanStack Query hooks wrapping ApiClient ops |
| `SessionContext` | Active profile id/username; sign in/out |
| `domain/competency` | Pure: derive competency from courses (PBT) |
| `domain/skillGap` | Pure: required - current gaps (PBT) |
| `domain/radar` | Pure: align axes for radar series (PBT) |
| `types` | Shared TS domain types mirroring the contract |
