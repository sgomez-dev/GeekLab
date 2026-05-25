import os
import shutil
import uuid

from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_admin
from app.core.exceptions import DomainError
from app.db.session import get_db
from app.repositories.product_repository import ProductRepository
from app.repositories.review_repository import ReviewRepository
from app.schemas.product import ReviewCreateRequest
from app.services.product_service import ProductService
from app.services.review_service import ReviewService

router = APIRouter(prefix="/products", tags=["products"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), "uploads")


def _get_product_service(db: Session = Depends(get_db)) -> ProductService:
    return ProductService(ProductRepository(db))


def _get_review_service(db: Session = Depends(get_db)) -> ReviewService:
    return ReviewService(ReviewRepository(db), ProductRepository(db))


def _save_upload(file: UploadFile) -> str:
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    ext = os.path.splitext(file.filename or "")[1]
    filename = f"{uuid.uuid4().hex}{ext}"
    dest = os.path.join(UPLOAD_DIR, filename)
    with open(dest, "wb") as f:
        shutil.copyfileobj(file.file, f)
    return f"/uploads/{filename}"


@router.get("")
def list_products(service: ProductService = Depends(_get_product_service)):
    return service.list_products()


@router.get("/{product_id}")
def get_product(product_id: int, service: ProductService = Depends(_get_product_service)):
    return service.get_product(product_id)


@router.post("", status_code=201)
def create_product(
    name: str = Form(...),
    price: float = Form(...),
    description: str = Form(default=""),
    category: str = Form(default=""),
    stock: int = Form(default=0),
    brand: str = Form(default=""),
    image: UploadFile | None = File(default=None),
    admin: dict = Depends(require_admin),
    service: ProductService = Depends(_get_product_service),
):
    if stock < 0:
        raise DomainError("El stock no puede ser negativo")
    if price <= 0:
        raise DomainError("El precio debe ser mayor que 0")
    image_path = _save_upload(image) if image and image.filename else ""
    return service.create_product(
        name=name,
        price=price,
        description=description,
        category=category,
        stock=stock,
        brand=brand,
        image=image_path,
    )


@router.put("/{product_id}")
def update_product(
    product_id: int,
    name: str = Form(default=None),
    price: float = Form(default=None),
    description: str = Form(default=None),
    category: str = Form(default=None),
    stock: int = Form(default=None),
    brand: str = Form(default=None),
    image: UploadFile | None = File(default=None),
    admin: dict = Depends(require_admin),
    service: ProductService = Depends(_get_product_service),
):
    update_data: dict = {}
    if name is not None:
        update_data["name"] = name
    if price is not None:
        update_data["price"] = price
    if description is not None:
        update_data["description"] = description
    if category is not None:
        update_data["category"] = category
    if stock is not None:
        update_data["stock"] = stock
    if brand is not None:
        update_data["brand"] = brand
    if image and image.filename:
        update_data["image"] = _save_upload(image)
    return service.update_product(product_id, **update_data)


@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    admin: dict = Depends(require_admin),
    service: ProductService = Depends(_get_product_service),
):
    return service.delete_product(product_id)


@router.post("/{product_id}/reviews", status_code=201)
def add_review(
    product_id: int,
    body: ReviewCreateRequest,
    current_user: dict = Depends(get_current_user),
    service: ReviewService = Depends(_get_review_service),
):
    return service.add_review(
        product_id=product_id,
        user_id=current_user["id"],
        username=current_user["username"],
        rating=body.rating,
        comment=body.comment,
    )
