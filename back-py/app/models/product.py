from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    brand: Mapped[str | None] = mapped_column(String(100))
    price: Mapped[float] = mapped_column(nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    category: Mapped[str | None] = mapped_column(String(100))
    stock: Mapped[int] = mapped_column(default=0, nullable=False)
    image: Mapped[str | None] = mapped_column(String(500))
    average_rating: Mapped[float] = mapped_column(default=0.0, nullable=False)
    num_reviews: Mapped[int] = mapped_column(default=0, nullable=False)

    reviews: Mapped[list["Review"]] = relationship(
        "Review", back_populates="product", cascade="all, delete-orphan", lazy="selectin"
    )


from app.models.review import Review  # noqa: E402 — evitar import circular
