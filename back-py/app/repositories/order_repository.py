from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.order import Order


class OrderRepository:
    def __init__(self, db: Session):
        self.db = db

    def find_by_id(self, order_id: int) -> Order | None:
        return self.db.get(Order, order_id)

    def list_all(self, status: str | None = None) -> list[Order]:
        stmt = select(Order).order_by(Order.created_at.desc())
        if status:
            stmt = stmt.where(Order.status == status)
        return list(self.db.execute(stmt).scalars().all())

    def list_by_user(self, user_id: int, status: str | None = None) -> list[Order]:
        stmt = select(Order).where(Order.user_id == user_id).order_by(Order.created_at.desc())
        if status:
            stmt = stmt.where(Order.status == status)
        return list(self.db.execute(stmt).scalars().all())

    def create(self, user_id: int, items_json: str, total: float) -> Order:
        order = Order(user_id=user_id, items=items_json, total=total, status="pending")
        self.db.add(order)
        self.db.flush()
        return order

    def update_status(self, order: Order, status: str) -> Order:
        order.status = status
        self.db.flush()
        return order
