from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from sqlmodel import Session

from app.api.analysis import router as analysis_router
from app.api.catalog import router as catalog_router
from app.api.errors import register_error_handlers
from app.api.profiles import router as profiles_router
from app.core.config import settings
from app.db.session import engine, init_db
from app.seed.loader import seed_catalog

_STATIC_DIR = Path(settings.static_dir)
_INDEX_FILE = _STATIC_DIR / "index.html"


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    if settings.seed_on_startup:
        # Idempotent catalog seeding from the generated snapshot (safe on RDS).
        with Session(engine) as session:
            seed_catalog(session)
    yield


app = FastAPI(title=settings.app_name, lifespan=lifespan)

# Register error handlers; in production SPA mode, 404 on non-API GET returns the SPA shell.
register_error_handlers(app, spa_index=_INDEX_FILE if settings.serve_static else None)

# All API routes are served under /api.
app.include_router(profiles_router, prefix="/api")
app.include_router(catalog_router, prefix="/api")
app.include_router(analysis_router, prefix="/api")


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


# --- Production: serve the built SPA (single same-origin container) -------------------
# When serve_static is enabled, the frontend's built assets (frontend/dist -> /app/static
# in the production image) are served from FastAPI. API routes above take precedence; the
# SPA shell is returned at "/" and as the 404 fallback for client-side routes.
if settings.serve_static:
    _assets_dir = _STATIC_DIR / "assets"
    if _assets_dir.is_dir():
        app.mount("/assets", StaticFiles(directory=_assets_dir), name="assets")

    @app.get("/")
    def _spa_root() -> FileResponse:
        return FileResponse(_INDEX_FILE)
