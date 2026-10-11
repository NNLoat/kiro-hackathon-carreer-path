# Execution Plan — Course & Career Navigator (Combined)

> Combined inception: reconciles this repo's frontend plan with the dataset+concept plan. Frontend design authoritative; the combined project builds the full stack (backend implemented + seeded from the dataset). See `../combined-inception.md`.

## Analysis Summary
- **Project Type**: Full-stack build on this repo's scaffold (`backend/`, `frontend/`, `docker-compose.yml`).
- **User-facing**: Yes — 3-page React/TS app as designed in this repo.
- **Data model**: Yes — PostgreSQL schema implementing the contract, seeded from the dataset.
- **API**: Implement `backend/API-CONTRACT.md` in FastAPI.
- **Risk**: Low–Medium (local PoC via Docker Compose; stub keeps frontend runnable independently).

## Workflow Visualization

```mermaid
flowchart TD
    Start(["User Request"])

    subgraph INCEPTION["INCEPTION PHASE"]
        WD["Workspace Detection<br/><b>COMPLETED</b>"]
        RA["Requirements Analysis<br/><b>COMPLETED (combined)</b>"]
        US["User Stories<br/><b>COMPLETED (combined)</b>"]
        WP["Workflow Planning<br/><b>COMPLETED (combined)</b>"]
        AD["Application Design<br/><b>EXECUTE</b>"]
        UG["Units Generation<br/><b>EXECUTE</b>"]
    end

    subgraph CONSTRUCTION["CONSTRUCTION PHASE"]
        FD["Functional Design<br/><b>EXECUTE</b>"]
        NFRA["NFR Requirements<br/><b>EXECUTE</b>"]
        NFRD["NFR Design<br/><b>SKIP</b>"]
        ID["Infrastructure Design<br/><b>SKIP</b>"]
        CG["Code Generation<br/><b>EXECUTE</b>"]
        BT["Build and Test<br/><b>EXECUTE</b>"]
    end

    subgraph OPERATIONS["OPERATIONS PHASE"]
        OPS["Operations<br/><b>PLACEHOLDER</b>"]
    end

    Start --> WD --> RA --> US --> WP --> AD --> UG --> FD --> NFRA --> CG --> BT --> End(["Complete"])
    BT -.-> OPS

    style WD fill:#4CAF50,stroke:#1B5E20,stroke-width:3px,color:#fff
    style RA fill:#4CAF50,stroke:#1B5E20,stroke-width:3px,color:#fff
    style US fill:#4CAF50,stroke:#1B5E20,stroke-width:3px,color:#fff
    style WP fill:#4CAF50,stroke:#1B5E20,stroke-width:3px,color:#fff
    style AD fill:#FFA726,stroke:#E65100,stroke-width:3px,stroke-dasharray: 5 5,color:#000
    style UG fill:#FFA726,stroke:#E65100,stroke-width:3px,stroke-dasharray: 5 5,color:#000
    style FD fill:#FFA726,stroke:#E65100,stroke-width:3px,stroke-dasharray: 5 5,color:#000
    style NFRA fill:#FFA726,stroke:#E65100,stroke-width:3px,stroke-dasharray: 5 5,color:#000
    style NFRD fill:#BDBDBD,stroke:#424242,stroke-width:2px,stroke-dasharray: 5 5,color:#000
    style ID fill:#BDBDBD,stroke:#424242,stroke-width:2px,stroke-dasharray: 5 5,color:#000
    style CG fill:#4CAF50,stroke:#1B5E20,stroke-width:3px,color:#fff
    style BT fill:#4CAF50,stroke:#1B5E20,stroke-width:3px,color:#fff
    style OPS fill:#BDBDBD,stroke:#424242,stroke-width:2px,stroke-dasharray: 5 5,color:#000
    style INCEPTION fill:#BBDEFB,stroke:#1565C0,stroke-width:3px,color:#000
    style CONSTRUCTION fill:#C8E6C9,stroke:#2E7D32,stroke-width:3px,color:#000
    style OPERATIONS fill:#FFF59D,stroke:#F57F17,stroke-width:3px,color:#000
    style Start fill:#CE93D8,stroke:#6A1B9A,stroke-width:3px,color:#000
    style End fill:#CE93D8,stroke:#6A1B9A,stroke-width:3px,color:#000

    linkStyle default stroke:#333,stroke-width:2px
```

### Text Alternative
INCEPTION: Workspace Detection (DONE) → Requirements (DONE, combined) → User Stories (DONE, combined) → Workflow Planning (DONE, combined) → Application Design (EXECUTE) → Units Generation (EXECUTE). CONSTRUCTION: Functional Design (EXECUTE) → NFR Requirements (EXECUTE) → NFR Design (SKIP) → Infrastructure Design (SKIP) → Code Generation (EXECUTE) → Build and Test (EXECUTE). OPERATIONS: placeholder.

## Phases
- Application Design — **EXECUTE**: define frontend module/page structure (matching this repo's frontend), backend service structure, shared types, and how the backend implements the contract + seeds the dataset.
- Units Generation — **EXECUTE** (see units below).
- Functional Design — **EXECUTE**: competency normalization formula, skill-gap, pathway scheduler, seeding transforms; PBT property identification.
- NFR Requirements — **EXECUTE** (minimal): confirm stack; pick radar chart lib + headless component lib + router (frontend); confirm Hypothesis (backend) + fast-check (frontend) for PBT.
- NFR Design — **SKIP**: satisfied by library/pattern choices.
- Infrastructure Design — **SKIP**: Docker Compose already provided.
- Code Generation — **EXECUTE** (per unit).
- Build and Test — **EXECUTE**: `docker compose up --build`; backend pytest+Hypothesis; frontend Vitest+fast-check; end-to-end against the seeded backend and against the stub.

## Units of Work (combined)
Aligned to the frontend phasing, plus a backend unit so the full stack works:
1. **U1 — Frontend Foundation & Login**: app shell, routing, shared domain types, typed API client + stub, login/create-profile. (US-0.x, US-1.x)
2. **U2 — Frontend Profile**: view/edit profile, saved plans. (US-2.x)
3. **U3 — Frontend Landing/Results**: typeaheads, career selection, competency, radar w/ toggle + text alt, stepwise pathway, responsive/accessible. (US-3.x)
4. **U4 — Backend (Contract Implementation + Dataset Seeding)**: FastAPI + SQLModel models for Skill/Course/Career/Profile/Plan; endpoints per `backend/API-CONTRACT.md`; competency/radar/pathway services; startup seeding from `backend/seed_data/`. (US-4.x)

**Dependencies**: U1 → U2, U3 (shared types/client). U3 and U4 share the contract; U4 can be built in parallel with U1–U3 against the contract, and integrated once ready (frontend uses the stub meanwhile).

## Success Criteria
Combined SC-1 … SC-7 (see `../combined-inception.md` §10).

## Extension Configuration
Security: No · Resiliency: No · PBT: Partial (PBT-02, 03, 07, 08, 09) — Hypothesis (backend) + fast-check (frontend).
