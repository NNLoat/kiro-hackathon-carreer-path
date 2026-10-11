# Unit of Work Plan — Career-Path Planner (Frontend)

This plan decomposes the frontend into units of work. Much is already settled: your delivery phasing
(Login -> Profile -> Landing) maps to units, and Application Design listed them. These questions resolve
the few remaining decomposition choices. Fill the `[Answer]:` tags; I'll analyze, then request approval.

Context: single deployable frontend (one Vite app). "Unit of work" here = a logical module/milestone,
NOT a separate deployable service.

---

## Clarifying Questions

## Question 1
How should the shared foundation (types, wire, mappers, ApiClient+Stub, queryHooks, SessionContext, app shell/router) be treated?

A) Fold the foundation INTO Unit 1 (Login) so Unit 1 delivers the runnable app shell + login together — recommended (matches "easiest first"; later units build on it)

B) Make the foundation a separate Unit 0 delivered before Login

X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 2
Confirm the unit boundaries and order.

A) Unit 1 = Foundation + Login; Unit 2 = Profile; Unit 3 = Landing/Results — recommended (matches approved phasing)

B) Different grouping (describe)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 3
Each unit is "done" when...?

A) Each unit is fully designed AND coded with tests (example + applicable PBT) before starting the next — recommended (AI-DLC per-unit loop)

B) Design all units first, then code all units

X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 4
Shared `domain/` pure logic (competency, skillGap, radar) is primarily used by Unit 3 (Landing). Where should it be built?

A) Build `domain/` within Unit 3 (where it's first needed) — recommended

B) Build `domain/` as part of the Unit 1 foundation

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Plan Execution Checklist (after approval)
- [x] Generate `aidlc-docs/inception/application-design/unit-of-work.md` (unit definitions, responsibilities, code organization)
- [x] Generate `aidlc-docs/inception/application-design/unit-of-work-dependency.md` (dependency matrix)
- [x] Generate `aidlc-docs/inception/application-design/unit-of-work-story-map.md` (stories -> units)
- [x] Validate unit boundaries and dependencies
- [x] Ensure all stories (US-0.x, US-1.x, US-2.x, US-3.x) are assigned to units
