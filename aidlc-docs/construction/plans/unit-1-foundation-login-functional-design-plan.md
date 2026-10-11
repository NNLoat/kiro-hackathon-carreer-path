# Functional Design Plan — Unit 1: Foundation + Login

Scope: shared lib/ (types, wire, mappers, ApiClient+Stub, queryHooks, SessionContext), app shell/router/guard,
and the login/create-profile flow. Stories: US-0.1, US-0.2, US-0.3, US-1.1, US-1.2.

Answer the `[Answer]:` tags; I'll analyze for ambiguity, then generate the functional design artifacts.

---

## Clarifying Questions

## Question 1
Profile creation semantics for `POST /api/profiles` (contract allows create-or-load). How should the UI treat it?

A) Single "Continue" action: submit username -> create if new, load if exists, then go to Landing — recommended (simplest, matches contract idempotency)

B) Separate "Sign up" vs "Log in" buttons with distinct messaging

X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 2
Session persistence across browser refresh (prototype, no token)?

A) Persist active profile id + username in localStorage; on app load, restore session and (optionally) revalidate via GET /api/profiles/{id} — recommended

B) In-memory only; a refresh returns the user to /login

X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 3
Username validation rules (client-side) before submit?

A) Non-empty, trimmed, 3-30 chars, allow letters/numbers/underscore/hyphen — recommended

B) Non-empty only (let backend decide the rest)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 4
On an API error during login, what should the UI do with the contract's error envelope `{error:{code,message}}`?

A) Show the `message` in an inline error with a Retry; map known `code`s (e.g. validation_error -> field error) — recommended

B) Show a generic "Something went wrong" message only

X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 5
Stub data for Unit 1 (so the app runs without backend) — how rich?

A) Minimal: stub supports createOrLoadProfile + getProfile with an in-memory map; catalog/radar/pathway stubs are stubbed-but-empty for now, filled in their units — recommended

B) Full fixtures for everything now (courses, careers, skills, radar, pathway)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Plan Execution Checklist (after approval)
- [x] Generate `business-logic-model.md` (session lifecycle, create-or-load flow, client selection of stub/http)
- [x] Generate `business-rules.md` (username validation, session persistence/restore, error mapping)
- [x] Generate `domain-entities.md` (Unit 1 slice: Profile, session state; wire/UI/mapper notes)
- [x] Generate `frontend-components.md` (LoginPage, UsernameForm, AppRouter, RequireProfile, AppProviders; props/state, interactions, API integration points)
- [x] Identify PBT properties (PBT-01): mappers round-trip; username validation invariants
