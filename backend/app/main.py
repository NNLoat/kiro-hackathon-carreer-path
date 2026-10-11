from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.items import router as items_router
from app.core.config import settings
from app.db.session import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title=settings.app_name, lifespan=lifespan)

# All routes are served under /api so the Vite dev proxy can forward cleanly.
app.include_router(items_router, prefix="/api")


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
