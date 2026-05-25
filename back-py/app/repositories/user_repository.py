from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def find_by_id(self, user_id: int) -> User | None:
        return self.db.get(User, user_id)

    def find_by_email(self, email: str) -> User | None:
        stmt = select(User).where(User.email == email)
        return self.db.execute(stmt).scalar_one_or_none()

    def find_by_username(self, username: str) -> User | None:
        stmt = select(User).where(User.username == username)
        return self.db.execute(stmt).scalar_one_or_none()

    def list_all(self) -> list[User]:
        stmt = select(User).order_by(User.created_at.desc())
        return list(self.db.execute(stmt).scalars().all())

    def create(self, username: str, email: str, hashed_password: str, role: str = "user") -> User:
        user = User(username=username, email=email, password=hashed_password, role=role)
        self.db.add(user)
        self.db.flush()
        return user

    def update_password(self, user: User, hashed_password: str) -> User:
        user.password = hashed_password
        self.db.flush()
        return user

    def update_role(self, user: User, role: str) -> User:
        user.role = role
        self.db.flush()
        return user

    def update(self, user: User, **kwargs: object) -> User:
        for key, value in kwargs.items():
            if hasattr(user, key):
                setattr(user, key, value)
        self.db.flush()
        return user

    def delete(self, user: User) -> None:
        self.db.delete(user)
        self.db.flush()
