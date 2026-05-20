from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import require_admin
from app.db.session import get_db
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserCreateRequest, UserRoleRequest, UserUpdateRequest
from app.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["users"])


def _get_user_service(db: Session = Depends(get_db)) -> UserService:
    return UserService(UserRepository(db))


@router.get("")
def list_users(
    admin: dict = Depends(require_admin),
    service: UserService = Depends(_get_user_service),
):
    return service.list_users()


@router.post("", status_code=201)
def create_user(
    body: UserCreateRequest,
    admin: dict = Depends(require_admin),
    service: UserService = Depends(_get_user_service),
):
    return service.create_user(
        username=body.username, email=body.email, password=body.password, role=body.role
    )


@router.get("/{user_id}")
def get_user(
    user_id: int,
    admin: dict = Depends(require_admin),
    service: UserService = Depends(_get_user_service),
):
    return service.get_user(user_id)


@router.put("/{user_id}")
def update_user(
    user_id: int,
    body: UserUpdateRequest,
    admin: dict = Depends(require_admin),
    service: UserService = Depends(_get_user_service),
):
    update_data = body.model_dump(exclude_none=True)
    return service.update_user(user_id=user_id, admin_id=admin["id"], **update_data)


@router.put("/{user_id}/role")
def update_role(
    user_id: int,
    body: UserRoleRequest,
    admin: dict = Depends(require_admin),
    service: UserService = Depends(_get_user_service),
):
    return service.update_role(user_id=user_id, admin_id=admin["id"], role=body.role)


@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    admin: dict = Depends(require_admin),
    service: UserService = Depends(_get_user_service),
):
    return service.delete_user(user_id=user_id, admin_id=admin["id"])
