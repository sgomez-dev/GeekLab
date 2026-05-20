from pydantic import BaseModel, Field


class UserCreateRequest(BaseModel):
    username: str = Field(min_length=3, max_length=80, pattern=r"^[a-zA-Z0-9_]+$")
    email: str = Field(min_length=5, max_length=255, pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    password: str = Field(min_length=6, max_length=128)
    role: str = Field(default="user", pattern=r"^(user|admin)$")


class UserUpdateRequest(BaseModel):
    username: str | None = Field(default=None, min_length=3, max_length=80, pattern=r"^[a-zA-Z0-9_]+$")
    email: str | None = Field(default=None, min_length=5, max_length=255, pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    password: str | None = Field(default=None, min_length=6, max_length=128)
    role: str | None = Field(default=None, pattern=r"^(user|admin)$")


class UserRoleRequest(BaseModel):
    role: str = Field(pattern=r"^(user|admin)$")
