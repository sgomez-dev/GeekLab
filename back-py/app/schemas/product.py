from pydantic import BaseModel, Field, field_validator


class ReviewCreateRequest(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: str = Field(min_length=1, max_length=2000)


class ProductCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    brand: str | None = Field(default=None, max_length=100)
    price: float = Field(gt=0)
    description: str | None = Field(default=None, max_length=5000)
    category: str | None = Field(default=None, max_length=100)
    stock: int = Field(ge=0, default=0)

    @field_validator("price")
    @classmethod
    def price_must_be_positive(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("El precio debe ser mayor que 0")
        return round(v, 2)


class ProductUpdateRequest(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=200)
    brand: str | None = Field(default=None, max_length=100)
    price: float | None = Field(default=None, gt=0)
    description: str | None = Field(default=None, max_length=5000)
    category: str | None = Field(default=None, max_length=100)
    stock: int | None = Field(default=None, ge=0)

    @field_validator("price")
    @classmethod
    def price_must_be_positive(cls, v: float | None) -> float | None:
        if v is not None and v <= 0:
            raise ValueError("El precio debe ser mayor que 0")
        return round(v, 2) if v is not None else v
