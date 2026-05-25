from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.repositories.forum_repository import ForumRepository
from app.schemas.forum import ForumMessageRequest
from app.services.forum_service import ForumService

router = APIRouter(prefix="/forum", tags=["forum"])


def _get_forum_service(db: Session = Depends(get_db)) -> ForumService:
    return ForumService(ForumRepository(db))


@router.get("/messages")
def list_messages(service: ForumService = Depends(_get_forum_service)):
    return service.list_messages()


@router.post("/messages", status_code=201)
def create_message(
    body: ForumMessageRequest,
    current_user: dict = Depends(get_current_user),
    service: ForumService = Depends(_get_forum_service),
):
    return service.create_message(
        user_id=current_user["id"],
        username=current_user["username"],
        content=body.content,
    )
