from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_admin
from app.db.session import get_db
from app.repositories.order_repository import OrderRepository
from app.repositories.product_repository import ProductRepository
from app.schemas.order import CheckoutRequest, OrderStatusRequest
from app.services.order_service import OrderService

router = APIRouter(tags=["orders"])


def _get_order_service(db: Session = Depends(get_db)) -> OrderService:
    return OrderService(OrderRepository(db), ProductRepository(db))


@router.post("/checkout")
def checkout(
    body: CheckoutRequest,
    current_user: dict = Depends(get_current_user),
    service: OrderService = Depends(_get_order_service),
):
    items = [{"_id": str(item.id), "quantity": item.quantity} for item in body.items]
    return service.checkout(user_id=current_user["id"], items=items)


@router.get("/orders")
def list_orders(
    status: str | None = Query(default=None),
    admin: dict = Depends(require_admin),
    service: OrderService = Depends(_get_order_service),
):
    return service.list_orders(status=status if status else None)


@router.get("/orders/my")
def my_orders(
    status: str | None = Query(default=None),
    current_user: dict = Depends(get_current_user),
    service: OrderService = Depends(_get_order_service),
):
    return service.list_user_orders(user_id=current_user["id"], status=status if status else None)


@router.put("/orders/{order_id}/status")
def update_order_status(
    order_id: int,
    body: OrderStatusRequest,
    admin: dict = Depends(require_admin),
    service: OrderService = Depends(_get_order_service),
):
    return service.update_status(order_id=order_id, status=body.status)
