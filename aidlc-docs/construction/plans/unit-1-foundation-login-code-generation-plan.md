# Code Generation Plan — Unit 1: Foundation + Login

**Single source of truth for Unit 1 code generation.** Execute steps in order; mark [x] as completed.
Workspace root: /Users/pisutmanorat/Learning/kiro/kiro-hackathon-carreer-path (frontend app code under `frontend/`).
Project type: Brownfield (modify existing frontend starter in place; no duplicate files).

## Unit Context
- **Stories**: US-0.1 (routing/shell), US-0.2 (API contract/typed client), US-0.3 (stub), US-1.1 (login), US-1.2 (a11y login)
- **Dependencies**: none (foundation). Later units depend on this.
- **Out of scope**: no API/repository/DB layers (backend is contract-only). No Chart.js (Unit 3).
- **Contract**: backend/API-CONTRACT.md (wire names = source of truth).

## Tech additions (install)
- runtime: react-router-dom@^6, @tanstack/react-query@^5, @radix-ui/react-label (+ primitives as needed)
- dev: fast-check@^3, jest-axe (+ @types), @axe-core/react optional

---

## Steps

### Step 1 — Dependencies & project structure  [US-0.1]
- [x] Add deps to `frontend/package.json` (react-router-dom, @tanstack/react-query, radix label, fast-check, jest-axe)
- [x] Create folders: `frontend/src/{app,lib,components,features/auth,domain,features/profile,features/landing}` (placeholders where empty)
- [x] Add `.env` support: document `VITE_USE_STUB` (default stub in dev)

### Step 2 — Shared types & wire types  [US-0.2]
- [x] `frontend/src/lib/types.ts` (UI camelCase domain types)
- [x] `frontend/src/lib/wire.ts` (snake_case wire types mirroring contract)

### Step 3 — Mappers (wire <-> UI)  [US-0.2]
- [x] `frontend/src/lib/mappers.ts` (toProfile, profilePatchToWire, toApiError, + stubs for later units)

### Step 4 — ApiClient interface + Http + Stub + factory  [US-0.2, US-0.3]
- [x] `frontend/src/lib/apiClient.ts` (interface)
- [x] `frontend/src/lib/httpApiClient.ts` (fetch `/api`, parse wire, map, normalize errors)
- [x] `frontend/src/lib/stubApiClient.ts` (in-memory profiles; others stubbed-empty)
- [x] `frontend/src/lib/createApiClient.ts` (VITE_USE_STUB selection)

### Step 5 — Username validation (pure domain)  [US-1.1]
- [x] `frontend/src/lib/validateUsername.ts` (BR-1 rules; pure, PBT target)

### Step 6 — Query hooks + Session context  [US-0.1, US-1.1]
- [x] `frontend/src/lib/queryHooks.ts` (useCreateOrLoadProfile, useProfile; QueryClient)
- [x] `frontend/src/lib/SessionContext.tsx` (signIn/signOut, localStorage persist/restore BR-3)

### Step 7 — App shell: providers, router, guard  [US-0.1]
- [x] `frontend/src/app/AppProviders.tsx` (QueryClientProvider + SessionProvider)
- [x] `frontend/src/app/RequireProfile.tsx` (guard -> /login)
- [x] `frontend/src/app/AppRouter.tsx` (routes /login, /, /profile; placeholders for /, /profile)
- [x] `frontend/src/components/AppNav.tsx` (nav + Sign Out, shown when session active)

### Step 8 — Shared UI primitives (seed)  [US-1.2]
- [x] `frontend/src/components/{Button,Field,Spinner,ErrorState}.tsx` (Radix+Tailwind, data-testid, a11y)

### Step 9 — Login feature  [US-1.1, US-1.2]
- [x] `frontend/src/features/auth/UsernameForm.tsx` (controlled input, validation, a11y, data-testid)
- [x] `frontend/src/features/auth/LoginPage.tsx` (mutation, success->signIn+navigate, error+retry)

### Step 10 — Wire up entrypoint  [US-0.1]
- [x] Modify `frontend/src/main.tsx` to render AppProviders + AppRouter
- [x] Replace/trim `frontend/src/App.tsx` (old health-check shell) — repurpose as landing placeholder or remove

### Step 11 — Example-based tests
- [x] `validateUsername.test.ts` (valid/invalid examples)
- [x] `UsernameForm.test.tsx` (renders, validation error, submit disabled while loading, a11y via jest-axe)
- [x] `LoginPage.test.tsx` (success navigates; API error shows message + retry) — stub client
- [x] `RequireProfile.test.tsx` (redirects when no session)

### Step 12 — Property-based tests (PBT Partial: PBT-02, 03, 07, 08)
- [x] `mappers.pbt.test.ts` — round-trip toProfile/profilePatchToWire (PBT-02), seed logged (PBT-08)
- [x] `validateUsername.pbt.test.ts` — invariants (PBT-03) with username generator (PBT-07), shrinking+seed (PBT-08)

### Step 13 — Documentation summary
- [x] `aidlc-docs/construction/unit-1-foundation-login/code/README.md` (what was built, how to run with stub, test cmd, created/modified file list)

---

## Story Coverage
- US-0.1: Steps 1,6,7,10
- US-0.2: Steps 2,3,4
- US-0.3: Step 4 (stub)
- US-1.1: Steps 5,6,9
- US-1.2: Steps 8,9,11

## Scope
13 steps. No backend code. Tests authored here; executed in Build & Test stage.
