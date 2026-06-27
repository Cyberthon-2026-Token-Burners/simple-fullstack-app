import uuid
from pydantic import BaseModel, Field, ConfigDict


class Task(BaseModel):
    model_config = ConfigDict(validate_assignment=True)

    id: uuid.UUID
    description: str
    completed: bool


class TaskCreate(BaseModel):
    description: str = Field(min_length=1, max_length=256)


class TaskUpdate(BaseModel):
    completed: bool
