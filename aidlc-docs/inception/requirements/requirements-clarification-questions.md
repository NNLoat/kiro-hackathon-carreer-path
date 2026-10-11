# Requirements Clarification Questions (Round 2)

Two items need resolving before I write the requirements document: one unanswered question and one scope contradiction.

---

## Ambiguity 1: Q8 was left blank
Q8 (target + styling direction) had no answer.

### Clarification Question 1
What is the primary target and styling direction for the frontend?

A) Responsive web, mobile-first; keep Tailwind utilities only (no component library)

B) Responsive web; add a headless component library (e.g., Radix/shadcn-style) on top of Tailwind for accessible, keyboard-navigable components (pairs well with your WCAG 2.1 AA choice)

C) Desktop-focused web app; Tailwind utilities only

X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Contradiction 1: Scope — "frontend side" vs. real backend endpoints + full accounts
You said the focus is the **frontend side** of the project, but you also chose:
- Q1=B — frontend calls **new backend API endpoints** we design alongside this
- Q6=C — **full accounts** (login + server-side persistence of profiles and plans)

Together these pull in a real backend workstream (auth, user storage, session handling, career/course/skill endpoints). I want to confirm how far into the backend you want this engagement to go, so the requirements and plan match your intent.

### Clarification Question 2
How should we treat the backend for this engagement?

A) Frontend + define the API contract only — I design the endpoint shapes (request/response schemas) the frontend needs, build the frontend against them, but DO NOT implement backend logic now (backend team/you implement later)

B) Full stack — design AND implement the backend endpoints (incl. auth + persistence) as part of this work, alongside the frontend

C) Frontend-first with mock API — build the frontend against a typed mock/stub layer that mirrors the real contract; wire to the real backend later

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Ambiguity 2: Accounts/auth depth (only relevant if you keep Q6=C)
You chose full accounts (Q6=C) but opted OUT of the Security extension. For a login system we should still fix the auth approach.

### Clarification Question 3
What authentication approach do you want for accounts?

A) Email + password with session/JWT handled by our own backend

B) Social / OAuth login (Google, etc.)

C) Keep it minimal for now — a simple username-only "profile" with server-side save, no real password/auth (prototype-grade)

D) Drop accounts for this engagement — use local persistence (browser localStorage) instead, revisit auth later

X) Other (please describe after [Answer]: tag below)

[Answer]: C
