from pydantic import BaseModel, Field


class ForumMessageRequest(BaseModel):
    content: str = Field(min_length=1, max_length=5000)
