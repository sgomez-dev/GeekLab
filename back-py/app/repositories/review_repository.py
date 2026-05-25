from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.review import Review


class ReviewRepository:
    def __init__(self, db: Session):
        self.db = db

    def find_by_user_and_product(self, user_id: int, product_id: int) -> Review | None:
        stmt = select(Review).where(
            Review.user_id == user_id,
            Review.product_id == product_id,
        )
        return self.db.execute(stmt).scalar_one_or_none()

    def create(self, product_id: int, user_id: int, username: str, rating: int, comment: str) -> Review:
        review = Review(
            product_id=product_id,
            user_id=user_id,
            username=username,
            rating=rating,
            comment=comment,
        )
        self.db.add(review)
        self.db.flush()
        return review

    def list_by_product(self, product_id: int) -> list[Review]:
        stmt = select(Review).where(Review.product_id == product_id).order_by(Review.created_at.asc())
        return list(self.db.execute(stmt).scalars().all())
