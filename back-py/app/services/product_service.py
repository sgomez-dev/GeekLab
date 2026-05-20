from app.core.exceptions import NotFoundError
from app.repositories.product_repository import ProductRepository


class ProductService:
    def __init__(self, product_repo: ProductRepository):
        self.product_repo = product_repo

    def _serialize(self, product) -> dict:
        reviews = []
        for r in product.reviews:
            reviews.append({
                "_id": str(r.id),
                "userId": str(r.user_id),
                "username": r.username,
                "rating": r.rating,
                "comment": r.comment,
                "createdAt": r.created_at.isoformat(),
            })
        return {
            "_id": str(product.id),
            "name": product.name,
            "brand": product.brand or "",
            "price": product.price,
            "description": product.description or "",
            "category": product.category or "",
            "stock": product.stock,
            "image": product.image or "",
            "reviews": reviews,
            "averageRating": product.average_rating,
            "numReviews": product.num_reviews,
        }

    def list_products(self) -> list[dict]:
        products = self.product_repo.list_all()
        return [self._serialize(p) for p in products]

    def get_product(self, product_id: int) -> dict:
        product = self.product_repo.find_by_id(product_id)
        if not product:
            raise NotFoundError("Product not found")
        return self._serialize(product)

    def create_product(self, name: str, price: float, **kwargs: object) -> dict:
        product = self.product_repo.create(name=name, price=price, **kwargs)
        return self._serialize(product)

    def update_product(self, product_id: int, **kwargs: object) -> dict:
        product = self.product_repo.find_by_id(product_id)
        if not product:
            raise NotFoundError("Product not found")
        self.product_repo.update(product, **kwargs)
        return self._serialize(product)

    def delete_product(self, product_id: int) -> dict:
        product = self.product_repo.find_by_id(product_id)
        if not product:
            raise NotFoundError("Product not found")
        self.product_repo.delete(product)
        return {"message": "Product deleted successfully"}
