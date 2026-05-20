from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.repositories.user_repository import UserRepository
from app.schemas.auth import ChangePasswordRequest, LoginRequest, RegisterRequest
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


def _get_auth_service(db: Session = Depends(get_db)) -> AuthService:
    return AuthService(UserRepository(db))


@router.post("/login")
def login(body: LoginRequest, service: AuthService = Depends(_get_auth_service)):
    return service.login(email=body.email, password=body.password)


@router.post("/register", status_code=201)
def register(body: RegisterRequest, service: AuthService = Depends(_get_auth_service)):
    return service.register(
        username=body.username, email=body.email, password=body.password, role=body.role
    )


@router.put("/password")
def change_password(
    body: ChangePasswordRequest,
    current_user: dict = Depends(get_current_user),
    service: AuthService = Depends(_get_auth_service),
):
    return service.change_password(user_id=current_user["id"], new_password=body.password)
