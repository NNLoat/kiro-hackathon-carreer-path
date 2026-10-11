# Services & Orchestration — Career-Path Planner (Frontend)

Frontend "services" are non-UI modules that orchestrate data and logic. Backend is contract-only;
these services consume `backend/API-CONTRACT.md` through one typed interface.

## Naming note
All service symbols live under the frontend `src/lib` and `src/domain` trees. Shared *data* names follow
the wire/UI/mapper convention in `component-methods.md` (contract = source of truth; one mapping boundary).

## 1. API Client Service (`lib/apiClient.ts` + implementations)
- **Interface `ApiClient`**: single typed surface for all contract operations (profiles, catalog,
  competency, radar, pathway, plans).
- **`HttpApiClient`**: real impl; `fetch` to `/api/...` (Vite proxy), validates/parses wire types,
  runs `mappers` to return UI types, normalizes errors to `ApiError`.
- **`StubApiClient`**: fixture-backed impl mirroring the contract; enables full offline run (US-0.3).
- **`createApiClient()`**: factory selecting Http vs Stub via `import.meta.env.VITE_USE_STUB`.
- **Orchestration**: UI never calls `fetch` directly; it goes UI → query hook → ApiClient → (map) → UI type.

## 2. Query Service (`lib/queryHooks.ts`) — TanStack Query
- Wraps each `ApiClient` operation in a query/mutation with caching, loading/error, retry.
- Owns cache keys (e.g. `['profile', id]`, `['catalog','courses',query]`, `['radar',careerId,coursesHash]`,
  `['pathway', inputHash]`, `['plans', profileId]`).
- Invalidation rules: updating profile invalidates `profile` + dependent `radar`/`pathway`; saving a plan
  invalidates `plans`.

## 3. Session Service (`lib/SessionContext.tsx`)
- Holds active `profileId`/`username` (prototype session; no token).
- `signIn(profile)` sets session after create/load; `signOut()` clears it.
- Consumed by `RequireProfile` route guard and `AppNav`.

## 4. Domain Service (`domain/`) — pure logic
- `deriveCompetency`, `computeSkillGaps`, `buildRadarAxes`: pure, framework-agnostic, PBT targets.
- Mirrors contract rules so the stub and (optionally) client-side derivation agree with the backend.

## 5. Mapping Service (`lib/mappers.ts`)
- Sole wire<->UI boundary. Pure functions; round-trip PBT targets (PBT-02).

## Orchestration flows (by unit)
- **Unit 1 (Login)**: `UsernameForm` → `useCreateOrLoadProfile` → `ApiClient.createOrLoadProfile`
  → `SessionContext.signIn` → navigate `/`.
- **Unit 2 (Profile)**: `ProfilePage` → `useProfile`/`useUpdateProfile`/`usePlans` → `ApiClient` → mappers.
- **Unit 3 (Landing)**: selectors drive `useSearch*`; selection changes drive `useRadar` + `usePathway`;
  `deriveCompetency`/`buildRadarAxes` feed `RadarChart` + `RadarDataTable`; `StudyPathway` renders steps
  and `PathwayConflicts` when `fullySchedulable === false`.
