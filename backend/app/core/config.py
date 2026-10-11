from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings sourced from environment variables."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+psycopg://hackathon:hackathon@db:5432/hackathon"
    app_name: str = "Hackathon API"

    # Production: serve the built SPA (frontend/dist copied to /app/static) from FastAPI,
    # so the whole app runs as a single same-origin container. Disabled in dev (Vite serves
    # the SPA and proxies /api).
    serve_static: bool = False
    static_dir: str = "static"

    # Seed the catalog on startup. Idempotent; safe to leave on against RDS.
    seed_on_startup: bool = True


settings = Settings()
