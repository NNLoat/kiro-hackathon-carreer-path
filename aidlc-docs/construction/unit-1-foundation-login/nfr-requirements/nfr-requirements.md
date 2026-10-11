# NFR Requirements — Unit 1: Foundation + Login

Unit-scoped non-functional requirements. Security + Resiliency extensions NOT enforced. PBT = Partial.

## Performance (NFR-4)
- NFR1-PERF-1: App shell + login route interactive quickly on a typical dev machine; no blocking main-thread work on load.
- NFR1-PERF-2: Login submit is debounced against double-submit (BR-6), not debounced on keystroke.

## Accessibility (NFR-2, WCAG 2.1 AA)
- NFR1-A11Y-1: Login form fully keyboard operable; visible focus states.
- NFR1-A11Y-2: Username input has an associated `<label>`; errors linked via `aria-describedby`.
- NFR1-A11Y-3: Errors conveyed by text, not color alone; Toast uses an ARIA live region.
- NFR1-A11Y-4: Automated axe checks run against LoginPage in tests; plus a manual keyboard pass.
- NFR1-A11Y-5: Full WCAG conformance requires manual assistive-tech testing + expert review (automated checks necessary, not sufficient).

## Reliability / Error handling
- NFR1-REL-1: All ApiClient calls normalize errors to `ApiError`; UI shows message + Retry (BR-5).
- NFR1-REL-2: Failed login never navigates away or loses the entered username.
- NFR1-REL-3: Session restore tolerates a stale/invalid persisted id (revalidate -> clear on 404, BR-3.3).

## Maintainability (NFR-3)
- NFR1-MAINT-1: UI decoupled from transport via the `ApiClient` interface; no `fetch` in components.
- NFR1-MAINT-2: Single wire<->UI mapping boundary (`lib/mappers.ts`).
- NFR1-MAINT-3: Feature-based structure; shared primitives in `components/`.

## Testability (NFR-5, PBT Partial)
- NFR1-TEST-1: Vitest + Testing Library for component/unit tests (existing setup).
- NFR1-TEST-2: fast-check added for PBT (PBT-09).
- NFR1-TEST-3: PBT targets — `mappers` round-trip (PBT-02); `validateUsername` invariants (PBT-03) with a username generator (PBT-07).
- NFR1-TEST-4: PBT runs with shrinking enabled; seed logged on failure / fixed seed for determinism (PBT-08).
- NFR1-TEST-5: Business-critical paths (valid login, invalid username, API error) also have example-based tests (PBT-10, advisory).

## Security
- Not enforced (prototype, no auth). Session is a convenience key, explicitly not a security boundary.
