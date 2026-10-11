# Hackathon

FastAPI + SQLModel backend, Vite + React + TypeScript + Tailwind frontend, Postgres 17.
Local development runs entirely in Docker Compose.

## Stack

| Layer     | Tech                                            |
| --------- | ----------------------------------------------- |
| Backend   | FastAPI, SQLModel (sync `psycopg`), `uv`, Py3.13 |
| Frontend  | Vite, React, TypeScript, Tailwind v4, pnpm       |
| Database  | `postgres:17`                                    |
| Dev infra | Docker Compose (`compose watch`)                 |

## Quick start

```bash
cp .env.example .env          # already present; adjust if needed
docker compose up --build     # first boot
# or, for live-reload development:
docker compose watch
```

Services:

- Frontend: http://localhost:5173
- Backend:  http://localhost:8000  (docs at /docs)
- Postgres: localhost:5432

The frontend calls the backend through the Vite dev proxy at `/api`, so there is
no CORS config needed in dev. In the browser, call `fetch("/api/health")` — Vite
forwards it to the `backend` container.

## Development model

`docker compose watch` syncs source changes into the running containers:

- Backend: `backend/app` → container; `uvicorn --reload` restarts.
- Frontend: `frontend/src` + `index.html` → container; Vite HMR picks it up.
- Changing `pyproject.toml`/`uv.lock` or `package.json`/`pnpm-lock.yaml`
  triggers an image rebuild automatically.

## Database schema

Tables are created on backend startup via `SQLModel.metadata.create_all()`.
This does NOT migrate existing tables — if you change a model and need the change
applied, recreate the volume:

```bash
docker compose down -v && docker compose up --build
```

Alembic can be introduced later once the schema stabilizes.

## Tests

```bash
# Backend
docker compose run --rm backend uv run pytest

# Frontend
docker compose run --rm frontend pnpm test
```
