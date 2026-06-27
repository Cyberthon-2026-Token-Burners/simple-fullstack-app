from typing import List
from uuid import UUID
from fastapi import FastAPI, HTTPException, status
from .models import Task, TaskCreate, TaskUpdate
from .store import TASK_STORE


def create_app() -> FastAPI:
    """Creates and configures the FastAPI application instance."""
    app = FastAPI()

    @app.get("/health/")
    async def health_check() -> dict:
        """Route handler for the health check endpoint."""
        return {"status": "ok"}

    @app.get("/tasks/", response_model=List[Task])
    async def get_tasks() -> List[Task]:
        """Retrieve all tasks."""
        return TASK_STORE.get_all()

    @app.post("/tasks/", response_model=Task, status_code=status.HTTP_201_CREATED)
    async def create_task(task_create: TaskCreate) -> Task:
        """Create a new task."""
        return TASK_STORE.create(task_create.description)

    @app.patch("/tasks/{task_id}", response_model=Task)
    async def update_task(task_id: UUID, task_update: TaskUpdate) -> Task:
        """Update a task's completion status.
        Raises:
            HTTPException: with status 404 if the task_id is not found.
        """
        task = TASK_STORE.update(task_id, task_update.completed)
        if task is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Task not found"
            )
        return task

    @app.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
    async def delete_task(task_id: UUID):
        """Delete a task.
        Raises:
            HTTPException: with status 404 if the task_id is not found.
        """
        task = TASK_STORE.delete(task_id)
        if task is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Task not found"
            )

    return app


app = create_app()
