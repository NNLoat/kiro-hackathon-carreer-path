---
inclusion: always
---

# AI-DLC Project Context — Course and Career Navigator

This project uses **AI-DLC** (AI-Driven Development Life Cycle), the AWS
steering-based variant. The authoritative workflow mechanics live in
`.kiro/steering/core-workflow.md`; this file is orientation only. On any
conflict, `core-workflow.md` and the rule-detail files it points to win.

## What this project is

A **career-path planning** web application. A user enters interests/skills and
completed courses, selects careers of interest, sees a required-vs-current skill
radar chart, and receives an ordered study pathway (university + online courses).

- **Problem**: planning registration and career paths is hard; information is not centralized.
- **Build**: recommend course plans and conflict-free schedules; suggest career paths and skills by interest and completed courses.
- **Success**: enter interests + completed courses → study plan + career roadmap.

## Where things live

| Area | Location | Notes |
| --- | --- | --- |
| Workflow engine (steering) | `.kiro/steering/core-workflow.md` | Overrides built-in workflows; read first |
| Rule details | `.kiro/aws-aidlc-rule-details/` | `common/`, `inception/`, `construction/`, `operations/`, `extensions/` |
| AI-DLC documentation & artifacts | `aidlc-docs/` | Requirements, user stories, plans — **docs only** |
| Runtime state (local, gitignored) | `aidlc-docs/aidlc-state.md`, `aidlc-docs/audit.md` | Machine-specific; not tracked |
| Application code | repo root (`backend/`, `frontend/`) | **Never** under `aidlc-docs/` |

### Rule-details path resolution

`core-workflow.md` resolves the rule-details directory by probing several paths.
In this Kiro CLI/IDE setup it resolves to **`.kiro/aws-aidlc-rule-details/`**.
All rule references (e.g. `common/process-overview.md`) are relative to that.

## Code vs. documentation separation (strict)

- **Application code** goes at the repo root (`backend/`, `frontend/`, compose, etc.).
- **AI-DLC documents** go under `aidlc-docs/` only.
- Never place application code under `aidlc-docs/`, and never place AI-DLC
  workflow docs in the application tree.

## Machine-specific runtime files

`aidlc-docs/aidlc-state.md` and `aidlc-docs/audit.md` are **per-machine runtime
state** and are gitignored by design. They are not shared via git — each
contributor's local copy reflects their own machine (e.g. `Workspace Root`).
Do not re-commit them; the shared, tracked artifacts are the inception documents
under `aidlc-docs/inception/`.

## Current state (informational)

- The repo already contains a working scaffold: **FastAPI + SQLModel** backend
  and **Vite + React + TypeScript + Tailwind v4** frontend, orchestrated with
  **Docker Compose** (`postgres:17`). See `README.md`.
- The AI-DLC inception artifacts (`aidlc-docs/inception/`) describe the
  **frontend career-path planner + API contract** work. The committed
  requirements scope that effort to **frontend + API contract definition only**
  (no backend logic/auth/persistence implemented in that engagement).
- `aidlc-docs/aidlc-state.md` may lag the real tree (it was first authored when
  the workspace was empty). Trust the repo contents and the inception documents
  over the `Workspace State` snapshot; update `aidlc-state.md` locally as the
  workflow progresses.

## Working with AI-DLC here

1. Read `.kiro/steering/core-workflow.md` first; it defines phases, gates, and
   mandatory rule-loading.
2. Load `common/` rules at workflow start (process overview, session continuity,
   content validation, question format) from `.kiro/aws-aidlc-rule-details/`.
3. Ask clarification/decision questions by writing them into `.md` files under
   `aidlc-docs/`, not inline in chat (per `common/question-format-guide.md`).
4. Keep `aidlc-docs/aidlc-state.md` and `aidlc-docs/audit.md` current locally as
   stages complete.
