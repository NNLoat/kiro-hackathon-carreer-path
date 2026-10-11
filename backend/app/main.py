from contextlib import asynccontextmanager

from fastapi import FastAPI
from sqlmodel import Session

from app.api.analysis import router as analysis_router
from app.api.catalog import router as catalog_router
from app.api.errors import register_error_handlers
from app.api.profiles import router as profiles_router
from app.core.config import settings
from app.db.session import engine, init_db
from app.seed.loader import seed_catalog


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    # Idempotent catalog seeding from the generated snapshot.
    with Session(engine) as session:
        seed_catalog(session)
    yield


app = FastAPI(title=settings.app_name, lifespan=lifespan)
register_error_handlers(app)

# All routes are served under /api so the Vite dev proxy can forward cleanly.
app.include_router(profiles_router, prefix="/api")
app.include_router(catalog_router, prefix="/api")
app.include_router(analysis_router, prefix="/api")


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
