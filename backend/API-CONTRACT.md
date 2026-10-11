# API Contract — Career-Path Planner

**Status**: Draft v0.1 — proposed by the frontend team for backend design.
**Audience**: Backend developers. This is the contract the frontend will build against; please
review, refine, and treat it as the shared source of truth. Changes should be agreed by both sides.

**Conventions** (aligned with the existing backend):
- All endpoints are served under the `/api` prefix (the Vite dev proxy forwards `/api` to the backend).
- JSON request/response bodies. Timestamps (if added later) in ISO 8601 UTC.
- SQLModel-style schema split is suggested per resource: `*Base` (shared fields), `*Create` (input),
  `*Read` (output with ids). The shapes below map directly to `*Read`/`*Create`.
- **Auth is prototype-grade**: a username-only "profile" with server-side save. **No passwords, no
  tokens** in this phase. The frontend holds the returned profile id/username as the session key and
  sends it as described per endpoint. Real auth is explicitly out of scope for now.

**Scope note**: This phase covers the data the frontend needs for three pages — Login, Profile,
Landing/Results. The frontend will run against a typed stub that mirrors this contract until the
backend is ready.

---

## 1. Conventions & Shared Shapes

### 1.1 Error response (all non-2xx)
A consistent error envelope so the frontend can render uniform error states:

```json
{
  "error": {
    "code": "not_found",
    "message": "Profile not found",
    "details": null
  }
}
```

- `code` (string): machine-readable, snake_case (e.g. `not_found`, `validation_error`, `conflict`, `internal_error`).
- `message` (string): human-readable summary.
- `details` (object|array|null): optional field-level info for validation errors.

Suggested status codes: `400` validation, `404` not found, `409` conflict, `422` unprocessable, `500` internal.

### 1.2 Core domain objects

**Skill**
```json
{ "id": "skill_python", "name": "Python Programming", "category": "Programming" }
```

**Course**
```json
{
  "id": "cs101",
  "code": "CS101",
  "title": "Introduction to Programming",
  "source": "university",            // "university" | "online"
  "provider": "State University",     // e.g. university name or "Coursera"
  "credits": 3,                        // nullable for online courses
  "prerequisites": ["cs100"],         // array of course ids (may be empty)
  "terms_offered": ["fall", "spring"],// which terms this course runs in
  "skill_contributions": [             // how completing this course advances skills
    { "skill_id": "skill_python", "weight": 0.6 },
    { "skill_id": "skill_problem_solving", "weight": 0.3 }
  ]
}
```
- `weight` is a 0..1 contribution used to derive competency. Weights are per-course and need not sum to 1.

**Career**
```json
{
  "id": "career_data_scientist",
  "title": "Data Scientist",
  "description": "Builds models and extracts insight from data.",
  "required_skills": [                 // target competency per skill for this career
    { "skill_id": "skill_python", "level": 0.8 },
    { "skill_id": "skill_statistics", "level": 0.9 }
  ]
}
```
- `level` is the target competency on a normalized 0..1 scale.

**Profile**
```json
{
  "id": "prof_abc123",
  "username": "nam",
  "completed_course_ids": ["cs100", "cs101"],
  "interest_skill_ids": ["skill_python", "skill_statistics"],
  "selected_career_ids": ["career_data_scientist"]
}
```

**Plan** (a saved study pathway)
```json
{
  "id": "plan_xyz789",
  "profile_id": "prof_abc123",
  "name": "Data Scientist — Fall start",
  "career_id": "career_data_scientist",
  "pathway": { /* PathwayResult, see 5.1 */ }
}
```

---

## 2. Profile Endpoints  (Phase 1 — Login, Phase 2 — Profile)

### POST /api/profiles  — create or load a profile by username
Creates a profile if the username is new, otherwise returns the existing one (idempotent on username).

Request:
```json
{ "username": "nam" }
```
Response `200` (existing) or `201` (created): a **Profile** object (see 1.2).

Errors: `422` if username is empty/invalid.

> Note: idempotent create-or-load keeps the prototype login simple (no separate signup/login).
> If the backend prefers strict 409-on-exists semantics instead, flag it and we'll adjust the frontend.

### GET /api/profiles/{profile_id}  — fetch a profile
Response `200`: a **Profile** object.
Errors: `404` if not found.

### PUT /api/profiles/{profile_id}  — update profile selections
Request (full replacement of the editable fields):
```json
{
  "completed_course_ids": ["cs100", "cs101"],
  "interest_skill_ids": ["skill_python"],
  "selected_career_ids": ["career_data_scientist"]
}
```
Response `200`: the updated **Profile**.
Errors: `404` not found; `422` if any id does not exist in the catalog.

---

## 3. Catalog Endpoints  (Phase 3 — Landing; also used by Profile editing)

Catalog is read-only from the frontend. Search is server-side to keep payloads small.

### GET /api/catalog/skills?query={q}&limit={n}
Response `200`:
```json
{ "items": [ { "id": "skill_python", "name": "Python Programming", "category": "Programming" } ] }
```

### GET /api/catalog/courses?query={q}&source={university|online}&limit={n}
`query` and `source` are optional filters.
Response `200`:
```json
{ "items": [ /* array of Course objects */ ] }
```

### GET /api/catalog/careers?query={q}&limit={n}
Response `200`:
```json
{ "items": [ /* array of Career objects */ ] }
```

> Typeahead expectation: these endpoints should respond quickly for prefix/substring queries.
> If the catalog is small, returning the full list (ignoring `query`) is acceptable for the prototype.

---

## 4. Skills & Radar Endpoints  (Phase 3 — Landing)

### POST /api/skills/competency  — derive current competency from completed courses
The frontend sends completed courses; the backend returns normalized competency per skill derived
from each course's `skill_contributions`.

Request:
```json
{ "completed_course_ids": ["cs100", "cs101"] }
```
Response `200`:
```json
{
  "competency": [
    { "skill_id": "skill_python", "level": 0.72 },
    { "skill_id": "skill_problem_solving", "level": 0.4 }
  ]
}
```
- `level` normalized to 0..1. Normalization method is the backend's choice but MUST be deterministic
  (same input → same output) and monotonic (adding a contributing course never lowers that skill).

> This computation could also live on the frontend from course data, but exposing it as an endpoint
> keeps the derivation authoritative on the backend. Either side can own it — let's agree here.

### POST /api/radar  — required-vs-current data for the radar chart
Returns, for a given career and the user's completed courses, the aligned skill axes with both the
career's required level and the user's current level.

Request:
```json
{
  "career_id": "career_data_scientist",
  "completed_course_ids": ["cs100", "cs101"]
}
```
Response `200`:
```json
{
  "career_id": "career_data_scientist",
  "axes": [
    { "skill_id": "skill_python",     "skill_name": "Python Programming", "required": 0.8, "current": 0.72 },
    { "skill_id": "skill_statistics", "skill_name": "Statistics",         "required": 0.9, "current": 0.3  }
  ]
}
```
- `axes` MUST include every skill required by the career; `current` is 0 if the user has no contributing courses.
- The union of axes across careers lets the frontend keep a stable "current" series while toggling careers.

---

## 5. Pathway Endpoint  (Phase 3 — Landing)

### POST /api/pathway  — generate a step-by-step study pathway
Given the user's completed courses and a target career, return an ordered pathway that respects
prerequisites, prioritizes closing the largest skill gaps, and schedules courses into conflict-free terms.

Request:
```json
{
  "career_id": "career_data_scientist",
  "completed_course_ids": ["cs100"],
  "interest_skill_ids": ["skill_python"],   // optional, may influence prioritization
  "start_term": "fall"                       // optional; first term to schedule into
}
```

### 5.1 PathwayResult (response `200`)
```json
{
  "career_id": "career_data_scientist",
  "steps": [
    {
      "order": 1,
      "term": "fall",
      "courses": [
        {
          "course_id": "cs101",
          "code": "CS101",
          "title": "Introduction to Programming",
          "source": "university",
          "prerequisites": ["cs100"],
          "advances_skills": [
            { "skill_id": "skill_python", "gap_closed": 0.5 }
          ]
        }
      ]
    }
  ],
  "conflicts": [],       // see 5.2
  "fully_schedulable": true
}
```
- `steps` are ordered by `order` (what to take first) and grouped by `term` (when to take it).
- Within a step/term, `courses` are co-scheduled (no timetable clash).
- `advances_skills.gap_closed` is how much that course closes the gap toward the career (drives priority).

### 5.2 No conflict-free ordering (required behavior — FR-7.6)
If a fully conflict-free schedule is not possible, the backend MUST still return `200` with the best
achievable ordering AND populate `conflicts` and set `fully_schedulable: false`:
```json
{
  "steps": [ /* best-effort ordering */ ],
  "conflicts": [
    {
      "type": "term_clash",            // or "missing_prerequisite", "unschedulable"
      "course_ids": ["cs201", "cs210"],
      "message": "CS201 and CS210 are only offered in spring and clash."
    }
  ],
  "fully_schedulable": false
}
```
The frontend will surface these conflicts to the user rather than failing silently.

---

## 6. Plan Endpoints  (Phase 2 — Profile)

### POST /api/profiles/{profile_id}/plans  — save a named plan
Request:
```json
{ "name": "Data Scientist — Fall start", "career_id": "career_data_scientist", "pathway": { /* PathwayResult */ } }
```
Response `201`: a **Plan** object.

### GET /api/profiles/{profile_id}/plans  — list saved plans
Response `200`:
```json
{ "items": [ /* array of Plan objects */ ] }
```

### GET /api/profiles/{profile_id}/plans/{plan_id}  — fetch one plan
Response `200`: a **Plan** object. Errors: `404`.

---

## 7. Endpoint Summary

| Method | Path | Purpose | Phase |
|---|---|---|---|
| POST | /api/profiles | Create or load profile by username | 1 |
| GET  | /api/profiles/{id} | Fetch profile | 1/2 |
| PUT  | /api/profiles/{id} | Update profile selections | 2 |
| GET  | /api/catalog/skills | Search skills | 3 |
| GET  | /api/catalog/courses | Search courses | 3 |
| GET  | /api/catalog/careers | Search careers | 3 |
| POST | /api/skills/competency | Derive current competency from courses | 3 |
| POST | /api/radar | Required-vs-current radar data | 3 |
| POST | /api/pathway | Generate stepwise study pathway | 3 |
| POST | /api/profiles/{id}/plans | Save a named plan | 2 |
| GET  | /api/profiles/{id}/plans | List saved plans | 2 |
| GET  | /api/profiles/{id}/plans/{planId} | Fetch a saved plan | 2 |

---

## 8. Open Questions for the Backend Team

1. **Competency ownership**: Should `/api/skills/competency` live on the backend, or should the frontend
   derive it from course data? (Contract supports backend-owned; flag if you prefer otherwise.)
2. **Normalization formula**: What exact normalization for competency levels (cap at 1.0? sum of weights
   with ceiling? diminishing returns)? Must be deterministic + monotonic.
3. **Profile create semantics**: OK with idempotent create-or-load on `POST /api/profiles`, or do you want
   strict signup vs login separation?
4. **Catalog size**: Is server-side search needed, or is the catalog small enough to return in full?
5. **Term model**: What are the valid `term` values and how are clashes defined (shared timeslot? same term
   capacity)? This drives the pathway scheduler.
6. **IDs**: String ids (as drafted) or integer ids like the existing `items` resource? Frontend can adapt.
