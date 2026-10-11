# Application Design (Consolidated) — Career-Path Planner (Frontend)

High-level frontend architecture. Detailed per-unit business logic is defined later in Functional Design.
Consolidates: components.md, component-methods.md, services.md, component-dependency.md.

## Architecture Decisions (from Application Design plan)
| Area | Decision |
|---|---|
| Routing | React Router (`/login`, `/`, `/profile`; `RequireProfile` guard) |
| Server state / fetching | TanStack Query over a typed `ApiClient` |
| Client/UI state | React Context + hooks (`SessionContext`) |
| Headless components | Radix UI primitives + Tailwind v4 |
| Radar chart | Chart.js via react-chartjs-2 (canvas) + accessible `RadarDataTable` (FR-6.4) |
| Pure domain logic | Dedicated `domain/` module (PBT targets) |
| Stub vs real API | One `ApiClient` interface; `createApiClient()` picks Http/Stub via `VITE_USE_STUB` |
| Folder structure | Feature-based (`features/{auth,profile,landing}`, `lib`, `domain`, `components`) |

## Conflict-Avoidance Naming Convention
`backend/API-CONTRACT.md` is the **single source of truth for wire field names** (snake_case). The frontend:
- defines **wire types** (`lib/wire.ts`) that mirror the contract exactly,
- defines idiomatic **UI types** (`lib/types.ts`) in camelCase,
- converts between them in exactly one place (`lib/mappers.ts`).
No alternative names are invented for shared concepts; internal React component names live under `src/`
and cannot collide with backend module paths. This keeps frontend and backend aligned at the seam.

## Components
See `components.md`. Grouped into: shared UI (`components/`), app shell (`app/`), and feature components
for auth (Unit 1), profile (Unit 2), landing (Unit 3); plus non-UI modules in `lib/` and `domain/`.

## Methods & Interfaces
See `component-methods.md` for the `ApiClient` interface, wire/UI type sets, mapping functions, query
hooks, session, pure domain functions, and key UI prop contracts.

## Services & Orchestration
See `services.md`: ApiClient service (+Http/Stub), Query service, Session service, Domain service, Mapping
service, and per-unit orchestration flows.

## Dependencies & Data Flow
See `component-dependency.md` for the dependency matrix, communication patterns, Mermaid data-flow diagram,
and build order.

## Traceability
- Routing/guard → FR-1, US-0.1
- API contract/client/stub → FR-9, US-0.2, US-0.3
- Login → FR-2, US-1.1/1.2
- Profile/plans → FR-8, US-2.1/2.2/2.3
- Catalog selectors → FR-3/FR-4, US-3.1/3.2/3.3
- Competency/radar → FR-5/FR-6, US-3.4/3.5 (+ accessible table FR-6.4)
- Pathway + conflicts → FR-7, US-3.6 (FR-7.6 conflict surfacing)
- Accessibility/perf → NFR-1/NFR-2/NFR-4, US-1.2/US-3.7
- Testability/PBT → NFR-5 (domain + mappers as PBT targets)

## Validation
- Every FR/US maps to at least one component/service (see traceability).
- All data names align to the contract via the wire/UI/mapper convention.
- Radar accessibility addressed via `RadarDataTable` because Chart.js canvas is not screen-reader-readable.
