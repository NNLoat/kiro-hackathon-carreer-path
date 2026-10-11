# NFR Requirements Plan — Unit 1: Foundation + Login

Determine NFRs and finalize the Unit 1 tech-stack additions. Most stack choices were set in Application
Design (React Router, TanStack Query, Context, Radix, env-flag stub). This confirms specifics + the PBT
framework (PBT-09). Fill the `[Answer]:` tags; I'll analyze, then generate the NFR artifacts.

Carry-over NFRs (from requirements.md): responsive (NFR-1), WCAG 2.1 AA (NFR-2), performance/debounce
(NFR-4), testability incl. PBT Partial (NFR-5). Security + Resiliency extensions: NOT enforced.

---

## Clarifying Questions

## Question 1
PBT framework for TypeScript/Vitest (PBT-09)?

A) fast-check (integrates with Vitest; shrinking + seeded reproducibility) — recommended

B) Other PBT library (describe)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 2
Dependency version policy for new packages?

A) Pin to latest stable compatible with React 18 / Vite 5 / TS 5.6, caret ranges as the repo already uses — recommended

B) Exact-pin everything (no caret ranges)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 3
Accessibility verification approach for Unit 1 (login)?

A) Automated checks in tests (e.g., jest-axe/axe-core via Testing Library) for the login page + manual keyboard pass — recommended

B) Manual keyboard/screen-reader pass only (no automated a11y lib)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 4
CI expectation for tests + PBT seed logging (PBT-08)?

A) Document the test command (pnpm test) and that PBT uses a logged/fixed seed; actual CI wiring deferred (no CI config in repo yet) — recommended

B) Add a CI workflow (e.g., GitHub Actions) now

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Plan Execution Checklist (after approval)
- [x] Generate `nfr-requirements/nfr-requirements.md` (unit-scoped NFRs: perf, a11y, reliability, maintainability, testability)
- [x] Generate `nfr-requirements/tech-stack-decisions.md` (packages + versions + rationale, incl. PBT framework PBT-09)
