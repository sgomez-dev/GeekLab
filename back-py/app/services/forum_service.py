from app.repositories.forum_repository import ForumRepository


class ForumService:
    def __init__(self, forum_repo: ForumRepository):
        self.forum_repo = forum_repo

    def list_messages(self) -> list[dict]:
        messages = self.forum_repo.list_recent()
        return [
            {
                "_id": str(m.id),
                "userId": str(m.user_id),
                "username": m.username,
                "content": m.content,
                "createdAt": m.created_at.isoformat(),
                "updatedAt": m.updated_at.isoformat(),
            }
            for m in messages
        ]

    def create_message(self, user_id: int, username: str, content: str) -> dict:
        msg = self.forum_repo.create(user_id=user_id, username=username, content=content)
        return {
            "_id": str(msg.id),
            "userId": str(msg.user_id),
            "username": msg.username,
            "content": msg.content,
            "createdAt": msg.created_at.isoformat(),
            "updatedAt": msg.updated_at.isoformat(),
        }
