# Requirements Clarification Questions — Course & Career Navigator

Please answer each question by filling in the letter choice after the `[Answer]:` tag. If none of the options match, pick the last option (Other) and describe your preference after the tag. Let me know when you're done.

---

## Question 1
What type of application should this be?

A) Web application (browser-based)

B) Command-line / terminal application

C) Desktop application

D) REST API / backend service only (no UI)

X) Other (please describe after [Answer]: tag below)

[Answer]: 
A
---

## Question 2
Where should course, schedule, and career data come from?

A) Local seed data files bundled with the app (e.g., JSON/CSV) — self-contained demo

B) A database the app manages (e.g., SQLite/PostgreSQL) seeded with sample data

C) Integration with an external/university system or API

D) User uploads their own catalog file

X) Other (please describe after [Answer]: tag below)

[Answer]: 
B PostgresSQL
---

## Question 3
How should the user provide their interests and completed courses?

A) Interactive form / prompts in the app

B) Upload a file (e.g., transcript or CSV)

C) Both interactive entry and file upload

X) Other (please describe after [Answer]: tag below)

[Answer]: 
A
---

## Question 4
For "conflict-free schedules," which constraints must the scheduler respect? (Choose the closest set)

A) Time overlaps only (no two courses at the same time slot)

B) Time overlaps + prerequisites already completed

C) Time overlaps + prerequisites + credit-hour limits per term

D) Time overlaps + prerequisites + credit limits + user-preferred days/times

X) Other (please describe after [Answer]: tag below)

[Answer]: 
B
---

## Question 5
How should career paths and skills be recommended? (Choose the closest approach)

A) Rule-based mapping (interests + completed courses -> predefined career paths and skill gaps)

B) Weighted scoring/ranking of careers by match percentage

C) Machine-learning model trained on data

X) Other (please describe after [Answer]: tag below)

[Answer]: 
A
---

## Question 6
What should the output "study plan + career roadmap" look like?

A) Text/console summary

B) Structured document (e.g., Markdown/HTML report) the user can save

C) On-screen interactive view in the UI

D) Downloadable file (PDF/CSV/JSON)

X) Other (please describe after [Answer]: tag below)

[Answer]: 
C
---

## Question 7
Does the app need user accounts and persistence (save/return to plans later)?

A) No — single session, no login, nothing saved

B) Yes — simple local persistence, no authentication

C) Yes — user accounts with login/authentication

X) Other (please describe after [Answer]: tag below)

[Answer]: 
A
---

## Question 8
What is the primary goal / expected maturity for this build?

A) Proof-of-concept / demo (prioritize speed and a working happy path)

B) Production-grade application (prioritize robustness, security, scalability)

X) Other (please describe after [Answer]: tag below)

[Answer]: 
A
---

## Question 9
Do you have a preferred technology stack / programming language?

A) Python (e.g., FastAPI/Flask backend, or CLI)

B) JavaScript/TypeScript (e.g., Node.js + React)

C) Java

D) No preference — recommend the best fit for the goal

X) Other (please describe after [Answer]: tag below)

[Answer]: 
A
---

## Question: Security Extensions
Should security extension rules be enforced for this project?

A) Yes — enforce all SECURITY rules as blocking constraints (recommended for production-grade applications)

B) No — skip all SECURITY rules (suitable for PoCs, prototypes, and experimental projects)

X) Other (please describe after [Answer]: tag below)

[Answer]: 
B
---

## Question: Resiliency Extensions
Should the resiliency baseline be applied to this project?

Enabling it applies directional, design-time best practices for building resilient systems (fault tolerance, high availability, observability, recoverability), derived from the AWS Well-Architected Framework (Reliability Pillar). It is a starting point, not a production-readiness guarantee.

A) Yes — apply the resiliency baseline as directional best practices and design-time guidance (recommended for business-critical workloads)

B) No — skip the resiliency baseline (suitable for PoCs, prototypes, and experimental projects)

X) Other (please describe after [Answer]: tag below)

[Answer]: 
B
---

## Question: Property-Based Testing Extension
Should property-based testing (PBT) rules be enforced for this project?

A) Yes — enforce all PBT rules as blocking constraints (recommended for projects with business logic, data transformations, serialization, or stateful components)

B) Partial — enforce PBT rules only for pure functions and serialization round-trips (suitable for projects with limited algorithmic complexity)

C) No — skip all PBT rules (suitable for simple CRUD applications, UI-only projects, or thin integration layers with no significant business logic)

X) Other (please describe after [Answer]: tag below)

[Answer]: 
B
