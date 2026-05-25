import json

from app.core.exceptions import InsufficientStockError, NotFoundError
from app.repositories.order_repository import OrderRepository
from app.repositories.product_repository import ProductRepository


class OrderService:
    def __init__(self, order_repo: OrderRepository, product_repo: ProductRepository):
        self.order_repo = order_repo
        self.product_repo = product_repo

    def _serialize_order(self, order) -> dict:
        items = json.loads(order.items)
        user_info = {"username": order.user.username, "email": order.user.email} if order.user else {}
        return {
            "_id": str(order.id),
            "userId": user_info,
            "items": items,
            "total": order.total,
            "status": order.status,
            "createdAt": order.created_at.isoformat(),
            "updatedAt": order.updated_at.isoformat(),
        }

    def checkout(self, user_id: int, items: list[dict]) -> dict:
        if not items:
            raise NotFoundError("Items array is empty")

        order_items: list[dict] = []
        insufficient: list[dict] = []
        total = 0.0

        for item in items:
            product_id = item.get("_id") or item.get("productId")
            quantity = item.get("quantity", 0)

            product = self.product_repo.find_by_id_for_update(int(product_id))
            if not product:
                raise NotFoundError(f"Producto no encontrado: {product_id}")

            if product.stock < quantity:
                insufficient.append({
                    "product": product.name,
                    "requested": quantity,
                    "available": product.stock,
                })
            else:
                order_items.append({
                    "productId": str(product.id),
                    "name": product.name,
                    "price": product.price,
                    "quantity": quantity,
                })
                total += product.price * quantity

        if insufficient:
            raise InsufficientStockError(
                message="Stock insuficiente",
                details=insufficient,
            )

        # Decrementar stock
        for item in order_items:
            self.product_repo.decrement_stock_atomic(int(item["productId"]), item["quantity"])

        order = self.order_repo.create(
            user_id=user_id,
            items_json=json.dumps(order_items),
            total=round(total, 2),
        )

        return {
            "message": "Compra realizada con éxito",
            "order": self._serialize_order(order),
        }

    def list_orders(self, status: str | None = None) -> list[dict]:
        orders = self.order_repo.list_all(status=status)
        return [self._serialize_order(o) for o in orders]

    def list_user_orders(self, user_id: int, status: str | None = None) -> list[dict]:
        orders = self.order_repo.list_by_user(user_id, status=status)
        return [self._serialize_order(o) for o in orders]

    def update_status(self, order_id: int, status: str) -> dict:
        order = self.order_repo.find_by_id(order_id)
        if not order:
            raise NotFoundError("Order not found")
        self.order_repo.update_status(order, status)
        return {"message": "Order status updated successfully", "order": self._serialize_order(order)}
