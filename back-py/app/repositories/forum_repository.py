from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.forum_message import ForumMessage


class ForumRepository:
    def __init__(self, db: Session):
        self.db = db

    def list_recent(self, limit: int = 100) -> list[ForumMessage]:
        stmt = select(ForumMessage).order_by(ForumMessage.created_at.desc()).limit(limit)
        messages = list(self.db.execute(stmt).scalars().all())
        messages.reverse()  # oldest first, como el backend original
        return messages

    def create(self, user_id: int, username: str, content: str) -> ForumMessage:
        msg = ForumMessage(user_id=user_id, username=username, content=content)
        self.db.add(msg)
        self.db.flush()
        return msg
