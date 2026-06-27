import uuid
from typing import Dict, List, Optional
from .models import Task


MAX_TASKS = 1000


class TaskStore:
    """A singleton class to manage tasks in memory."""

    def __init__(self):
        self._tasks: Dict[uuid.UUID, Task] = {}

    def get_all(self) -> List[Task]:
        """Returns all tasks."""
        return list(self._tasks.values())

    def get_by_id(self, task_id: uuid.UUID) -> Optional[Task]:
        """Returns a single task by its ID, or None if not found."""
        return self._tasks.get(task_id)

    def create(self, description: str) -> Task:
        """Creates a new task with a new UUID and completed=False.

        Raises:
            ValueError: If the store is at maximum capacity (1000 tasks).
        """
        if len(self._tasks) >= MAX_TASKS:
            raise ValueError(f"Cannot create more than {MAX_TASKS} tasks")

        task = Task(
            id=uuid.uuid4(),
            description=description,
            completed=False,
        )
        self._tasks[task.id] = task
        return task

    def update(self, task_id: uuid.UUID, completed: bool) -> Optional[Task]:
        """Updates a task's completed status. Returns the updated task or None if not found."""
        task = self._tasks.get(task_id)
        if task is None:
            return None
        task.completed = completed
        return task

    def delete(self, task_id: uuid.UUID) -> Optional[Task]:
        """Deletes a task. Returns the deleted task or None if not found."""
        return self._tasks.pop(task_id, None)


# Singleton instance of the store
TASK_STORE = TaskStore()
