from app.core.exceptions import ConflictError, NotFoundError
from app.repositories.product_repository import ProductRepository
from app.repositories.review_repository import ReviewRepository


class ReviewService:
    def __init__(self, review_repo: ReviewRepository, product_repo: ProductRepository):
        self.review_repo = review_repo
        self.product_repo = product_repo

    def add_review(
        self, product_id: int, user_id: int, username: str, rating: int, comment: str
    ) -> dict:
        product = self.product_repo.find_by_id(product_id)
        if not product:
            raise NotFoundError("Product not found")

        existing = self.review_repo.find_by_user_and_product(user_id, product_id)
        if existing:
            raise ConflictError("Ya has dejado una reseña para este producto")

        self.review_repo.create(
            product_id=product_id,
            user_id=user_id,
            username=username,
            rating=rating,
            comment=comment,
        )

        # Recalcular average y count
        reviews = self.review_repo.list_by_product(product_id)
        total_rating = sum(r.rating for r in reviews)
        count = len(reviews)
        self.product_repo.update(
            product,
            average_rating=round(total_rating / count, 2) if count else 0,
            num_reviews=count,
        )

        # Forzar recarga del producto con sus reviews actualizadas
        self.product_repo.refresh(product)

        from app.services.product_service import ProductService

        ps = ProductService(self.product_repo)
        return ps.get_product(product_id)
