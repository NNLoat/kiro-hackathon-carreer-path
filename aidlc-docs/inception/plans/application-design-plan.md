# Application Design Plan — Career-Path Planner (Frontend)

This plan defines HOW we will produce the high-level frontend application design (components, their
methods/interfaces, services, and dependencies). Please answer the embedded questions (fill the
`[Answer]:` tags). I'll analyze answers, then request approval before generating the design artifacts.

Context loaded: requirements.md, stories.md, personas.md, execution-plan.md, backend/API-CONTRACT.md.
Scope: FRONTEND only; backend is contract-only. Units: 1) Foundation+Login, 2) Profile, 3) Landing.

---

## Clarifying Questions (architecture decisions)

## Question 1
Routing library for the multi-page app (Login, Landing, Profile)?

A) React Router (de facto standard, nested routes, loaders) — recommended

B) TanStack Router (type-safe routing)

C) Hash-based minimal routing (no library)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 2
Server state / data-fetching approach for the typed API client?

A) TanStack Query (React Query) over a typed fetch client — caching, loading/error states, retries (recommended; fits catalog + radar + pathway fetching)

B) Plain typed fetch wrapper + React state/hooks (no data library)

C) RTK Query (if we later add Redux)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 3
Client/UI state (active profile/session, current selections) management?

A) React Context + hooks only (lightweight; recommended for this scope)

B) Zustand (small global store)

C) Redux Toolkit (heavier; only if state grows a lot)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 4
Headless component library on top of Tailwind v4 (you chose CQ1=B)?

A) Radix UI primitives (unstyled, accessible) + custom Tailwind styling — recommended

B) shadcn/ui (prebuilt components generated into the repo, built on Radix)

C) Headless UI (@headlessui/react)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 5
Radar chart library (you chose Q9=C "AI picks")? Confirm or override.

A) Recharts — declarative, React-first, built-in Radar chart, easy to pair with an accessible text/table — recommended

B) Chart.js via react-chartjs-2 — mature radar, canvas-based

C) Nivo (@nivo/radar) — nice defaults, SVG

X) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 6
Where should the frontend domain logic live for the pure functions we must PBT (competency derivation, skill-gap, any client-side normalization/serialization)?

A) A dedicated framework-agnostic `domain/` (or `lib/`) module of pure TS functions, imported by UI — recommended (clean to property-test)

B) Inside React hooks/components

X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 7
How should the swappable stub vs. real API be selected (per US-0.3 / FR-9.4)?

A) Env flag (e.g., VITE_USE_STUB) selecting a stub client vs. real HTTP client behind one typed interface — recommended

B) Always stub for now; wire real client later by code change

C) MSW (Mock Service Worker) intercepting real fetch calls

X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 8
Frontend folder structure preference?

A) Feature-based (`src/features/{auth,profile,landing}`, plus `src/lib`, `src/components`, `src/domain`) — recommended, matches units

B) Type-based (`src/components`, `src/pages`, `src/hooks`, `src/services`)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Plan Execution Checklist (after approval)
- [x] Generate `components.md` (UI + non-UI components, responsibilities, interfaces)
- [x] Generate `component-methods.md` (method signatures / props contracts; business rules deferred to Functional Design)
- [x] Generate `services.md` (API client service, stub service, domain service, session/profile service — orchestration)
- [x] Generate `component-dependency.md` (dependency matrix, data flow, Mermaid diagram)
- [x] Generate consolidated `application-design.md`
- [x] Validate completeness/consistency against requirements + stories + API contract
