from app.core.exceptions import AuthorizationError, ConflictError, NotFoundError
from app.core.security import hash_password
from app.repositories.user_repository import UserRepository


class UserService:
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo

    def list_users(self) -> list[dict]:
        users = self.user_repo.list_all()
        return [
            {
                "_id": u.id,
                "username": u.username,
                "email": u.email,
                "role": u.role,
                "createdAt": u.created_at.isoformat(),
                "updatedAt": u.updated_at.isoformat(),
            }
            for u in users
        ]

    def get_user(self, user_id: int) -> dict:
        user = self.user_repo.find_by_id(user_id)
        if not user:
            raise NotFoundError("User not found")
        return {
            "_id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "createdAt": user.created_at.isoformat(),
            "updatedAt": user.updated_at.isoformat(),
        }

    def create_user(self, username: str, email: str, password: str, role: str = "user") -> dict:
        if self.user_repo.find_by_email(email):
            raise ConflictError("email already exists")
        if self.user_repo.find_by_username(username):
            raise ConflictError("username already exists")

        hashed = hash_password(password)
        user = self.user_repo.create(username=username, email=email, hashed_password=hashed, role=role)
        return {
            "message": "User created successfully",
            "user": {
                "_id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role,
                "createdAt": user.created_at.isoformat(),
                "updatedAt": user.updated_at.isoformat(),
            },
        }

    def update_user(self, user_id: int, admin_id: int, **kwargs: object) -> dict:
        user = self.user_repo.find_by_id(user_id)
        if not user:
            raise NotFoundError("User not found")

        if "role" in kwargs and user_id == admin_id:
            raise AuthorizationError("Cannot change your own role")

        update_data: dict = {}
        if "username" in kwargs and kwargs["username"]:
            existing = self.user_repo.find_by_username(str(kwargs["username"]))
            if existing and existing.id != user_id:
                raise ConflictError("username already exists")
            update_data["username"] = kwargs["username"]
        if "email" in kwargs and kwargs["email"]:
            existing = self.user_repo.find_by_email(str(kwargs["email"]))
            if existing and existing.id != user_id:
                raise ConflictError("email already exists")
            update_data["email"] = kwargs["email"]
        if "password" in kwargs and kwargs["password"]:
            update_data["password"] = hash_password(str(kwargs["password"]))
        if "role" in kwargs and kwargs["role"]:
            update_data["role"] = kwargs["role"]

        self.user_repo.update(user, **update_data)
        return {
            "message": "User updated successfully",
            "user": {
                "_id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role,
                "createdAt": user.created_at.isoformat(),
                "updatedAt": user.updated_at.isoformat(),
            },
        }

    def update_role(self, user_id: int, admin_id: int, role: str) -> dict:
        user = self.user_repo.find_by_id(user_id)
        if not user:
            raise NotFoundError("User not found")
        if user_id == admin_id:
            raise AuthorizationError("Cannot change your own role")

        self.user_repo.update_role(user, role)
        return {
            "message": "User role updated successfully",
            "user": {
                "_id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role,
                "createdAt": user.created_at.isoformat(),
                "updatedAt": user.updated_at.isoformat(),
            },
        }

    def delete_user(self, user_id: int, admin_id: int) -> dict:
        if user_id == admin_id:
            raise AuthorizationError("Cannot delete your own account")
        user = self.user_repo.find_by_id(user_id)
        if not user:
            raise NotFoundError("User not found")
        self.user_repo.delete(user)
        return {"message": "User deleted successfully"}
