"""Error handling producing the contract error envelope (API-CONTRACT 1.1).

{ "error": { "code": "...", "message": "...", "details": ... } }

When the app serves the built SPA (production single-container mode), a 404 on a
non-API GET returns the SPA shell so client-side routing works; everything else keeps
returning the contract envelope.
"""

from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import FileResponse, JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException


class AppError(Exception):
    """Domain error mapped to the contract envelope."""

    def __init__(self, code: str, message: str, status_code: int, details: object | None = None):
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details


def _envelope(code: str, message: str, details: object | None = None) -> dict:
    return {"error": {"code": code, "message": message, "details": details}}


_STATUS_CODE = {
    400: "validation_error",
    404: "not_found",
    409: "conflict",
    422: "unprocessable",
    500: "internal_error",
}


def _is_spa_route(request: Request) -> bool:
    path = request.url.path
    return (
        request.method == "GET"
        and not path.startswith("/api")
        and not path.startswith("/docs")
        and not path.startswith("/openapi")
        and not path.startswith("/assets")
    )


def register_error_handlers(app: FastAPI, spa_index: Path | None = None) -> None:
    """Register the contract error handlers.

    If `spa_index` is given (production SPA serving), a 404 on a non-API GET returns the
    SPA shell instead of the error envelope.
    """

    @app.exception_handler(AppError)
    async def _app_error(_: Request, exc: AppError) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            content=_envelope(exc.code, exc.message, exc.details),
        )

    @app.exception_handler(StarletteHTTPException)
    async def _http_error(request: Request, exc: StarletteHTTPException):
        if (
            spa_index is not None
            and exc.status_code == 404
            and _is_spa_route(request)
            and spa_index.is_file()
        ):
            return FileResponse(spa_index)
        code = _STATUS_CODE.get(exc.status_code, "error")
        message = exc.detail if isinstance(exc.detail, str) else code
        return JSONResponse(status_code=exc.status_code, content=_envelope(code, message))

    @app.exception_handler(RequestValidationError)
    async def _validation_error(_: Request, exc: RequestValidationError) -> JSONResponse:
        details = [
            {"loc": list(e.get("loc", [])), "msg": str(e.get("msg", "")), "type": str(e.get("type", ""))}
            for e in exc.errors()
        ]
        return JSONResponse(
            status_code=422,
            content=_envelope("validation_error", "Request validation failed", details),
        )
