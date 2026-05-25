from app.core.exceptions import AuthenticationError, ConflictError
from app.core.security import create_access_token, hash_password, verify_password
from app.repositories.user_repository import UserRepository


class AuthService:
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo

    def register(self, username: str, email: str, password: str, role: str = "user") -> dict:
        if self.user_repo.find_by_email(email):
            raise ConflictError("email already exists")
        if self.user_repo.find_by_username(username):
            raise ConflictError("username already exists")

        hashed = hash_password(password)
        self.user_repo.create(username=username, email=email, hashed_password=hashed, role=role)
        return {"message": "User registered successfully"}

    def login(self, email: str, password: str) -> dict:
        user = self.user_repo.find_by_email(email)
        if not user or not verify_password(password, user.password):
            raise AuthenticationError("Invalid credentials")

        token = create_access_token({"id": user.id, "role": user.role, "username": user.username})
        return {"token": token, "username": user.username, "role": user.role}

    def change_password(self, user_id: int, new_password: str) -> dict:
        user = self.user_repo.find_by_id(user_id)
        if not user:
            raise AuthenticationError("User not found")

        hashed = hash_password(new_password)
        self.user_repo.update_password(user, hashed)
        return {"message": "Password updated successfully"}
