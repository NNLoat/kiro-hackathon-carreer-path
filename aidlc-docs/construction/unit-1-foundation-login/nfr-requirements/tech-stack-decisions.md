# Tech Stack Decisions — Unit 1: Foundation + Login

Additions layered on the existing frontend (Vite 5, React 18, TS 5.6, Tailwind v4, Vitest).
Version policy: latest stable compatible with React 18 / Vite 5 / TS 5.6; caret ranges (matches repo).

## Runtime dependencies
| Package | Purpose | Rationale |
|---|---|---|
| react-router-dom (^6) | Client routing (US-0.1) | De facto standard; nested routes + guards |
| @tanstack/react-query (^5) | Server state / fetching | Caching, loading/error, retries for contract calls |
| @radix-ui/react-* (primitives) | Accessible headless UI | WCAG-friendly base for Field/Combobox/Toast etc. |

## Dev dependencies
| Package | Purpose | Rationale |
|---|---|---|
| fast-check (^3) | Property-based testing (PBT-09) | Vitest integration, shrinking, seeded reproducibility |
| jest-axe / @axe-core (via Testing Library) | Automated a11y checks | NFR1-A11Y-4 |

## Configuration decisions
- **Stub/real selection**: `import.meta.env.VITE_USE_STUB` chooses `StubApiClient` vs `HttpApiClient`
  behind `createApiClient()`. Default to stub in dev so the app runs without the backend (US-0.3).
- **API base**: real client calls `/api/...` (existing Vite proxy to backend).
- **Session persistence**: localStorage key `cpp.session` (prototype; not a security token).
- **PBT config**: shrinking enabled; seed logged on failure (PBT-08). Test command: `pnpm test`.
  CI workflow wiring deferred (no CI config in repo yet) — documented expectation only.

## Not added (and why)
- No state library (Zustand/Redux): React Context + hooks suffice for Unit 1 (and overall scope).
- No component kit (shadcn): using Radix primitives + Tailwind directly.
- Chart.js/react-chartjs-2: deferred to Unit 3 (radar), not needed for Unit 1.
