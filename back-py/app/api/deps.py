from fastapi import Depends, Header

from app.core.exceptions import AuthenticationError, AuthorizationError
from app.core.security import decode_access_token
from app.db.session import get_db


def get_current_user(authorization: str | None = Header(default=None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise AuthenticationError("No token provided")

    token = authorization.split(" ", 1)[1]
    payload = decode_access_token(token)
    if payload is None:
        raise AuthenticationError("Invalid token")

    return {"id": payload["id"], "role": payload.get("role", "user"), "username": payload.get("username", "")}


def require_admin(current_user: dict = Depends(get_current_user)) -> dict:
    if current_user["role"] != "admin":
        raise AuthorizationError("Admin access required")
    return current_user
