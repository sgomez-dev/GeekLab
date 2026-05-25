from pydantic import BaseModel, Field, field_validator


class CheckoutItem(BaseModel):
    # El frontend envía _id como identificador de producto
    id: int | str = Field(alias="_id")
    quantity: int = Field(ge=1)

    model_config = {"populate_by_name": True}

    @field_validator("quantity")
    @classmethod
    def quantity_must_be_positive(cls, v: int) -> int:
        if v < 1:
            raise ValueError("La cantidad debe ser al menos 1")
        return v


class CheckoutRequest(BaseModel):
    items: list[CheckoutItem] = Field(min_length=1)


class OrderStatusRequest(BaseModel):
    status: str = Field(pattern=r"^(pending|completed)$")
