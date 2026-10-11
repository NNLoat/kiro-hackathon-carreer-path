# Unit 1 — Foundation + Login: Code Summary

## What was built
A runnable, routed React app shell plus the username login flow, built against a typed API client
with an in-memory stub (so it runs with no backend).

## Created files (frontend/src)
- `lib/types.ts` — UI domain types (camelCase)
- `lib/wire.ts` — wire types mirroring backend/API-CONTRACT.md (snake_case)
- `lib/mappers.ts` — single wire<->UI boundary (pure; PBT round-trip)
- `lib/validateUsername.ts` — pure username validation (BR-1; PBT invariants)
- `lib/apiClient.ts` — ApiClient interface
- `lib/httpApiClient.ts` — real client (fetch /api, parse wire, map, normalize errors)
- `lib/stubApiClient.ts` — in-memory stub (profiles functional; others stubbed-empty for later units)
- `lib/createApiClient.ts` — selects stub/real via VITE_USE_STUB (default: stub)
- `lib/queryHooks.ts` — TanStack Query client + useCreateOrLoadProfile/useProfile
- `lib/SessionContext.tsx` — prototype session + localStorage persist/restore (BR-3)
- `app/AppProviders.tsx` — QueryClientProvider + SessionProvider
- `app/RequireProfile.tsx` — route guard -> /login (BR-4)
- `app/AppRouter.tsx` — routes /login, /, /profile (landing/profile placeholders)
- `components/{Button,Field,Spinner,ErrorState,AppNav}.tsx` — shared UI (Radix+Tailwind, a11y, data-testid)
- `features/auth/UsernameForm.tsx`, `features/auth/LoginPage.tsx` — login UI + flow

## Modified files
- `frontend/package.json` — added react-router-dom, @tanstack/react-query, @radix-ui/react-label,
  fast-check, jest-axe, @types/jest-axe, @testing-library/user-event
- `frontend/src/main.tsx` — renders AppProviders + AppRouter

## Removed files
- `frontend/src/App.tsx`, `frontend/src/App.test.tsx` — obsolete starter health-check shell (replaced by router)

## Tests authored (run in Build & Test)
- Example: `lib/validateUsername.test.ts`, `features/auth/UsernameForm.test.tsx`,
  `features/auth/LoginPage.test.tsx`, `app/RequireProfile.test.tsx`
- PBT (fast-check): `lib/mappers.pbt.test.ts` (PBT-02 round-trip),
  `lib/validateUsername.pbt.test.ts` (PBT-03 invariants, PBT-07 generators, PBT-08 shrink/seed)

## How to run (Docker/pnpm env)
- Install deps: `docker compose run --rm frontend pnpm install` (or `pnpm install` in frontend/)
- Dev: `docker compose watch` -> http://localhost:5173 (runs against stub by default)
- Tests: `docker compose run --rm frontend pnpm test`
- Real backend: set `VITE_USE_STUB=false` (frontend calls `/api` via the Vite proxy)

## Story coverage
US-0.1 (shell/routing), US-0.2 (contract/typed client), US-0.3 (stub), US-1.1 (login), US-1.2 (a11y login).

## Note
Build/tests could not be executed in the authoring environment (no Node/pnpm/Docker on host).
They must be run in the Docker/pnpm dev environment during the Build & Test stage.
