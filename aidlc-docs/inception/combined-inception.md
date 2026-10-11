# Combined Inception — Course & Career Navigator

**Purpose**: Reconcile the frontend-derived inception in this repo with the dataset + concept inception produced in the AI-DLC workspace. **The frontend design is authoritative** for app structure, stack, UX, data model, and the API contract. The dataset and concept provide the real catalog content and the problem framing.

**Sources combined**:
1. **This repo (frontend design)**: `README.md`, `backend/API-CONTRACT.md`, `frontend/` (Vite + React + TS + Tailwind v4), `docker-compose.yml`, and the inception under `aidlc-docs/inception/*`.
2. **Dataset + concept (AI-DLC workspace)**: `Dataset/*.json` (courses, skills, careers, course→skill→career map) and the concept's requirements/stories/plan.

The dataset is seeded via `backend/seed_data/`.

---

## 1. Authority & Reconciliation Rules

| Dimension | Authority | Rationale |
|---|---|---|
| App structure, pages, routing | **Frontend (this repo)** | Keep the frontend design |
| Tech stack & dev infra | **Frontend (this repo)** | FastAPI + SQLModel + Postgres 17 / Vite + React + TS + Tailwind v4, Docker Compose |
| Domain data model (weighted skills, radar) | **Frontend (this repo)** | Richer than the concept's boolean model; drives the UI |
| API contract | **Frontend (this repo)** | `backend/API-CONTRACT.md` is the shared source of truth |
| Catalog **content** (courses/skills/careers) | **Dataset** | Real, openly-licensed data (MIT/Harvard/Stanford + O*NET) + online platforms |
| Problem/Build/Success framing | **Shared (identical)** | Both inceptions state the same problem/goal |
| Accessibility (WCAG 2.1 AA) | **Frontend (this repo)** | The concept didn't specify; adopt the stronger target |

---

## 2. Reconciliation of Differences

| Topic | Dataset+concept inception | Frontend inception (this repo) | Combined decision |
|---|---|---|---|
| Pages | Single page, single session | Login, Landing/Results, Profile + routing | **3 pages + routing** |
| Accounts/persistence | None (session only) | Username-only profile, server-side save; no password | **Username-only profile** (supersedes "no persistence"; still no real auth) |
| Skill model | Boolean "have / don't have" from course topics | Weighted competency 0..1 from course `skill_contributions`; career `required level` 0..1 | **Weighted competency 0..1** |
| Output | On-screen study plan + career roadmap | Radar chart (required vs current, toggle careers) + stepwise pathway | **Radar + stepwise pathway** |
| Scheduling constraints | Prereqs + synthesized time slots + multi-term | Prereqs + skill-gap priority + conflict-free terms + conflict surfacing | **Prereqs + skill-gap priority + conflict-free terms**, surface conflicts when unschedulable |
| Course sources | University courseware only | university \| online | **Both** — `course_skill_career_map.json` includes online-platform courses |
| Catalog source | PostgreSQL seeded from JSON | API contract (backend out of scope in this repo's engagement) | **Implement the backend** per contract, **seed from the dataset** |
| Testing | PBT Partial (Hypothesis, Python) | PBT Partial (fast-check, frontend) | **PBT Partial on BOTH sides**: Hypothesis (backend) + fast-check (frontend) |
| Infra Design stage | SKIP (local PoC) | SKIP | **SKIP** (Docker Compose already provided) |

### Scope expansion note
This repo's engagement was **frontend + contract only** (backend out of scope). The concept is a **full working app** (Python backend + PostgreSQL seeded from the dataset). The combined project therefore **builds the full stack**: the frontend exactly as designed here, plus a FastAPI backend that **implements** `backend/API-CONTRACT.md` and seeds the catalog from the dataset. This is the only material scope change, and it is additive — it does not alter the frontend design.

---

## 3. Combined Problem / Build / Success (unchanged across both)
- **Problem**: Planning registration and career paths is hard; information is not centralized.
- **Build**: Recommend course plans and conflict-free schedules; suggest career paths and skills by interest and completed courses.
- **Success**: Enter interests + completed courses → study plan (stepwise pathway) + career roadmap (radar + careers).

---

## 4. Combined Tech Stack (authoritative = this repo)

| Layer | Technology |
|---|---|
| Backend | FastAPI, SQLModel (sync `psycopg`), `uv`, Python 3.13 |
| Frontend | Vite, React 18, TypeScript, Tailwind v4, pnpm |
| Database | PostgreSQL 17 |
| Dev infra | Docker Compose (`docker compose watch`); Vite `/api` proxy → backend |
| Backend tests | pytest + Hypothesis (PBT, Partial) |
| Frontend tests | Vitest + Testing Library + fast-check (PBT, Partial) |

Ports: Frontend `5173`, Backend `8000` (`/docs`), Postgres `5432`.

---

## 5. Combined Pages & Flow (authoritative = frontend)
1. **Login** (`/login`) — enter username to create/load a profile (no password). Establishes client-held session key.
2. **Landing / Results** (`/`) — typeahead multi-select completed courses (university + online) and interests/skills; select one or more careers; auto-derived competency; radar chart (required vs current, toggle between careers, with text/table alternative); stepwise, prerequisite-aware, skill-gap-prioritized, conflict-free study pathway; conflicts surfaced when unschedulable.
3. **Profile** (`/profile`) — view/edit completed courses, interests, careers; save/name and revisit generated plans.

Protected routes redirect to `/login` when there is no active profile.

---

## 6. Combined Data Model (authoritative = contract; content = dataset)
- **Skill** — `{ id, name, category }`. Seeded from `skills.json` (SK-### → skill ids).
- **Course** — `{ id, code, title, source: university|online, provider, credits (nullable), prerequisites[], terms_offered[], skill_contributions[{skill_id, weight 0..1}] }`. Seeded from `computer_science_courses.json` + `course_skill_career_map.json`.
  - `prerequisites`: from `computer_science_courses.json`.
  - `terms_offered`: synthesized — map `delivery`/level to fall/spring; finalize in Functional Design.
  - `skill_contributions`: derived deterministically from `teaches_skills` in `course_skill_career_map.json` (equal-weight default, normalized/monotonic per contract §4; exact formula in Functional Design).
- **Career** — `{ id, title, description, required_skills[{skill_id, level 0..1}] }`. Seeded from `careers.json` (`required_skills` → high level, `recommended_skills` → lower level).
- **Profile** — `{ id, username, completed_course_ids[], interest_skill_ids[], selected_career_ids[] }`. Server-side persisted (username-only).
- **Plan** — `{ id, profile_id, name, career_id, pathway: PathwayResult }`.
- **Competency** / **Radar axes** / **PathwayResult** — exactly as in `backend/API-CONTRACT.md` §4–5.

### Mapping of dataset → contract fields
| Dataset | Contract field |
|---|---|
| `skills.json` `skill_id`, `name`, `category` | Skill `id`, `name`, `category` |
| `computer_science_courses.json` `course_code`, `title`, `provider`, `prerequisites`, `credits` | Course `code`/`id`, `title`, `provider`, `prerequisites`, `credits` |
| `course_skill_career_map.json` `source_type` (university-courseware/online-platform) | Course `source` (university/online) |
| `course_skill_career_map.json` `teaches_skills` | Course `skill_contributions` (weighted) |
| `course_skill_career_map.json` `matching_careers` | cross-check for career matching |
| `careers.json` `required_skills` / `recommended_skills` | Career `required_skills` with `level` |

---

## 7. Combined API Contract
Authoritative: `backend/API-CONTRACT.md`. This project **implements** it (profiles, catalog, competency, radar, pathway, plans) in FastAPI, backed by PostgreSQL seeded from `backend/seed_data/`.

Resolution of the contract's "Open Questions for the Backend Team":
1. **Competency ownership** → backend-owned (`POST /api/skills/competency`), authoritative + deterministic.
2. **Normalization** → deterministic, monotonic: cap per-skill competency at 1.0, accumulate course contributions with diminishing returns (exact formula in Functional Design). Satisfies PBT-03 monotonicity invariant.
3. **Profile create semantics** → idempotent create-or-load on `POST /api/profiles`.
4. **Catalog size** → small (~20 courses, 29 skills, 10 careers) → returning full lists is acceptable; `query` filtering still supported.
5. **Term model** → terms `fall`/`spring` (optionally `summer`); a clash = two courses sharing a synthesized timeslot in the same term; drives the pathway scheduler.
6. **IDs** → string ids as drafted, mapped from the dataset's SK-/CR- ids during seeding.

---

## 8. Combined Non-Functional Requirements
- Accessibility: **WCAG 2.1 AA** target (keyboard nav, visible focus, non-color cues, radar text/table alternative). Full conformance requires manual AT testing + expert review.
- Responsiveness: debounced typeahead; radar/pathway update on selection change without full reload.
- Maturity: PoC/prototype (no real auth, no security/resiliency baselines).
- Testability: pure logic (competency derivation, skill-gap, pathway ordering/scheduling, contract (de)serialization) covered by PBT (Partial) on both backend (Hypothesis) and frontend (fast-check).

## 9. Extension Configuration
| Extension | Enabled |
|---|---|
| Security Baseline | No |
| Resiliency Baseline | No |
| Property-Based Testing | Partial (PBT-02, 03, 07, 08, 09 enforced) — backend: Hypothesis; frontend: fast-check |

## 10. Combined Success Criteria
- SC-1: User enters a username and reaches the Landing page.
- SC-2: User searches and multi-selects completed courses (university + online) and interests from the seeded catalog.
- SC-3: User selects one or more careers.
- SC-4: Radar chart shows required-vs-current skills; user toggles between selected careers; a text/table alternative exists.
- SC-5: A stepwise study pathway is shown — ordered by prerequisites, skill-gap priority, and conflict-free term scheduling; conflicts surfaced when unschedulable.
- SC-6: Profile page shows/edits the saved profile and saved plans.
- SC-7: The backend implements `API-CONTRACT.md` over PostgreSQL seeded from the dataset; the frontend runs against it (and against the typed stub when the backend is unavailable).
