from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.product import Product


class ProductRepository:
    def __init__(self, db: Session):
        self.db = db

    def find_by_id(self, product_id: int) -> Product | None:
        return self.db.get(Product, product_id)

    def list_all(self) -> list[Product]:
        stmt = select(Product)
        return list(self.db.execute(stmt).scalars().all())

    def create(self, **kwargs: object) -> Product:
        product = Product(**kwargs)
        self.db.add(product)
        self.db.flush()
        return product

    def update(self, product: Product, **kwargs: object) -> Product:
        for key, value in kwargs.items():
            if hasattr(product, key):
                setattr(product, key, value)
        self.db.flush()
        return product

    def delete(self, product: Product) -> None:
        self.db.delete(product)
        self.db.flush()

    def decrement_stock_atomic(self, product_id: int, quantity: int) -> Product | None:
        """Decrementa stock con bloqueo pesimista (FOR UPDATE en Postgres, simulado en SQLite)."""
        stmt = select(Product).where(Product.id == product_id).with_for_update()
        product = self.db.execute(stmt).scalar_one_or_none()
        if product is None:
            return None
        product.stock -= quantity
        self.db.flush()
        return product

    def refresh(self, product: Product) -> Product:
        self.db.expire(product)
        self.db.refresh(product)
        return product

    def find_by_id_for_update(self, product_id: int) -> Product | None:
        stmt = select(Product).where(Product.id == product_id).with_for_update()
        return self.db.execute(stmt).scalar_one_or_none()
