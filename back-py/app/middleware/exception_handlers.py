import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError

from app.core.exceptions import (
    AuthenticationError,
    AuthorizationError,
    ConflictError,
    DomainError,
    InsufficientStockError,
    NotFoundError,
)

logger = logging.getLogger(__name__)

STATUS_MAP: dict[type, int] = {
    NotFoundError: 404,
    ConflictError: 409,
    InsufficientStockError: 400,
    AuthenticationError: 401,
    AuthorizationError: 403,
}


def register_exception_handlers(app: FastAPI) -> None:

    @app.exception_handler(DomainError)
    async def domain_error_handler(_request: Request, exc: DomainError) -> JSONResponse:
        status = STATUS_MAP.get(type(exc), 400)
        body: dict = {
            "message": exc.message,
            "error": exc.message,
            "code": exc.code,
        }
        if exc.details:
            body["details"] = exc.details
        return JSONResponse(status_code=status, content=body)

    @app.exception_handler(RequestValidationError)
    async def validation_error_handler(_request: Request, exc: RequestValidationError) -> JSONResponse:
        errors = exc.errors()
        messages = []
        for err in errors:
            loc = " -> ".join(str(l) for l in err.get("loc", []))
            messages.append(f"{loc}: {err.get('msg', '')}")
        return JSONResponse(
            status_code=422,
            content={
                "message": "; ".join(messages),
                "error": "; ".join(messages),
                "code": "VALIDATION_ERROR",
                "details": errors,
            },
        )

    @app.exception_handler(SQLAlchemyError)
    async def sqlalchemy_error_handler(_request: Request, exc: SQLAlchemyError) -> JSONResponse:
        logger.error("Database error: %s", exc, exc_info=True)
        return JSONResponse(
            status_code=500,
            content={
                "message": "Error interno del servidor",
                "error": "Error interno del servidor",
                "code": "INTERNAL_ERROR",
            },
        )
