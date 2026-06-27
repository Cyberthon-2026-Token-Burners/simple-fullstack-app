import unittest
import uuid

from app.models import Task
from app.store import TaskStore, TASK_STORE


class TestTaskStoreCreate(unittest.TestCase):
    def setUp(self):
        self.store = TaskStore()

    def test_create_single_task(self):
        task = self.store.create(description="Task 1")

        self.assertIsInstance(task, Task)
        self.assertEqual(task.description, "Task 1")
        self.assertFalse(task.completed)
        self.assertIsInstance(task.id, uuid.UUID)

    def test_create_task_with_empty_description(self):
        task = self.store.create(description="")
        self.assertEqual(task.description, "")

    def test_create_multiple_tasks(self):
        task1 = self.store.create(description="Task 1")
        task2 = self.store.create(description="Task 2")
        task3 = self.store.create(description="Task 3")

        self.assertNotEqual(task1.id, task2.id)
        self.assertNotEqual(task2.id, task3.id)
        self.assertNotEqual(task1.id, task3.id)

    def test_create_up_to_999_tasks(self):
        for i in range(999):
            task = self.store.create(description=f"Task {i}")
            self.assertIsNotNone(task)

    def test_create_exactly_1000_tasks(self):
        for i in range(1000):
            task = self.store.create(description=f"Task {i}")
            self.assertIsNotNone(task)

    def test_create_exceeding_1000_tasks_raises_error(self):
        for i in range(1000):
            self.store.create(description=f"Task {i}")

        with self.assertRaises(ValueError):
            self.store.create(description="Task 1001")

    def test_create_1001st_task_fails(self):
        for i in range(1000):
            self.store.create(description=f"Task {i}")

        with self.assertRaises(ValueError):
            self.store.create(description="Overflow")

    def test_create_maintains_internal_state(self):
        task = self.store.create(description="Test Task")

        retrieved = self.store.get_by_id(task.id)
        self.assertEqual(retrieved.id, task.id)
        self.assertEqual(retrieved.description, "Test Task")

    def test_create_task_completed_always_false(self):
        task = self.store.create(description="Task")
        self.assertFalse(task.completed)

    def test_create_returns_new_task_object(self):
        task1 = self.store.create(description="Task 1")
        task2 = self.store.create(description="Task 1")

        self.assertNotEqual(task1.id, task2.id)
        self.assertIsNot(task1, task2)

    def test_create_with_special_characters_in_description(self):
        task = self.store.create(description="Task!@#$%^&*()")
        self.assertEqual(task.description, "Task!@#$%^&*()")

    def test_create_with_unicode_characters(self):
        task = self.store.create(description="任务 описание")
        self.assertEqual(task.description, "任务 описание")

    def test_create_with_very_long_description(self):
        long_desc = "T" * 256
        task = self.store.create(description=long_desc)
        self.assertEqual(task.description, long_desc)

    def test_create_boundary_999_then_1000(self):
        for i in range(999):
            self.store.create(description=f"Task {i}")

        task_1000 = self.store.create(description="Task 1000")
        self.assertIsNotNone(task_1000)

        with self.assertRaises(ValueError):
            self.store.create(description="Task 1001")


class TestTaskStoreGetById(unittest.TestCase):
    def setUp(self):
        self.store = TaskStore()

    def test_get_by_id_existing_task(self):
        created_task = self.store.create(description="Task to Retrieve")

        retrieved_task = self.store.get_by_id(created_task.id)
        self.assertIsNotNone(retrieved_task)
        self.assertEqual(retrieved_task.id, created_task.id)
        self.assertEqual(retrieved_task.description, "Task to Retrieve")

    def test_get_by_id_non_existent_returns_none(self):
        random_id = uuid.uuid4()
        result = self.store.get_by_id(random_id)
        self.assertIsNone(result)

    def test_get_by_id_multiple_tasks(self):
        task1 = self.store.create(description="Task 1")
        task2 = self.store.create(description="Task 2")
        task3 = self.store.create(description="Task 3")

        retrieved1 = self.store.get_by_id(task1.id)
        retrieved2 = self.store.get_by_id(task2.id)
        retrieved3 = self.store.get_by_id(task3.id)

        self.assertEqual(retrieved1.description, "Task 1")
        self.assertEqual(retrieved2.description, "Task 2")
        self.assertEqual(retrieved3.description, "Task 3")

    def test_get_by_id_returns_correct_task_properties(self):
        created_task = self.store.create(description="Test Description")

        retrieved_task = self.store.get_by_id(created_task.id)
        self.assertEqual(retrieved_task.description, "Test Description")
        self.assertFalse(retrieved_task.completed)

    def test_get_by_id_with_various_invalid_uuids(self):
        invalid_cases = [
            uuid.uuid4(),
            uuid.uuid4(),
            uuid.uuid4(),
        ]
        for invalid_id in invalid_cases:
            with self.subTest(uuid=invalid_id):
                result = self.store.get_by_id(invalid_id)
                self.assertIsNone(result)

    def test_get_by_id_after_create_immediate(self):
        created_task = self.store.create(description="Immediate Test")

        immediately = self.store.get_by_id(created_task.id)
        self.assertIsNotNone(immediately)

    def test_get_by_id_empty_store(self):
        random_id = uuid.uuid4()
        result = self.store.get_by_id(random_id)
        self.assertIsNone(result)

    def test_get_by_id_after_many_creates(self):
        tasks_created = []
        for i in range(100):
            task = self.store.create(description=f"Task {i}")
            tasks_created.append(task)

        for idx, task in enumerate(tasks_created):
            with self.subTest(index=idx):
                retrieved = self.store.get_by_id(task.id)
                self.assertEqual(retrieved.description, f"Task {idx}")

    def test_get_by_id_does_not_modify_task(self):
        created_task = self.store.create(description="Original Task")

        retrieved1 = self.store.get_by_id(created_task.id)
        retrieved2 = self.store.get_by_id(created_task.id)

        self.assertEqual(retrieved1.description, retrieved2.description)
        self.assertEqual(retrieved1.id, retrieved2.id)


class TestTaskStoreDelete(unittest.TestCase):
    def setUp(self):
        self.store = TaskStore()

    def test_delete_existing_task_returns_task(self):
        created_task = self.store.create(description="Task to Delete")

        deleted_task = self.store.delete(created_task.id)
        self.assertIsNotNone(deleted_task)
        self.assertEqual(deleted_task.id, created_task.id)
        self.assertEqual(deleted_task.description, "Task to Delete")

    def test_delete_non_existent_task_returns_none(self):
        random_id = uuid.uuid4()
        result = self.store.delete(random_id)
        self.assertIsNone(result)

    def test_delete_removes_from_store(self):
        created_task = self.store.create(description="Task to Delete")

        self.store.delete(created_task.id)

        retrieved = self.store.get_by_id(created_task.id)
        self.assertIsNone(retrieved)

    def test_delete_then_create_same_id_not_reused(self):
        task1 = self.store.create(description="Task 1")
        id1 = task1.id

        self.store.delete(id1)

        task2 = self.store.create(description="Task 2")
        id2 = task2.id

        self.assertNotEqual(id1, id2)

    def test_delete_multiple_tasks(self):
        task1 = self.store.create(description="Task 1")
        task2 = self.store.create(description="Task 2")
        task3 = self.store.create(description="Task 3")

        deleted1 = self.store.delete(task1.id)
        deleted2 = self.store.delete(task2.id)
        deleted3 = self.store.delete(task3.id)

        self.assertIsNotNone(deleted1)
        self.assertIsNotNone(deleted2)
        self.assertIsNotNone(deleted3)

        self.assertIsNone(self.store.get_by_id(task1.id))
        self.assertIsNone(self.store.get_by_id(task2.id))
        self.assertIsNone(self.store.get_by_id(task3.id))

    def test_delete_twice_same_id(self):
        task = self.store.create(description="Task")

        first_delete = self.store.delete(task.id)
        second_delete = self.store.delete(task.id)

        self.assertIsNotNone(first_delete)
        self.assertIsNone(second_delete)

    def test_delete_empty_store(self):
        random_id = uuid.uuid4()
        result = self.store.delete(random_id)
        self.assertIsNone(result)

    def test_delete_after_capacity_reached(self):
        for i in range(1000):
            self.store.create(description=f"Task {i}")

        first_task_id = uuid.uuid4()

        retrieved_task = self.store.delete(first_task_id)
        self.assertIsNone(retrieved_task)

    def test_delete_frees_capacity(self):
        created_tasks = []
        for i in range(1000):
            task = self.store.create(description=f"Task {i}")
            created_tasks.append(task)

        with self.assertRaises(ValueError):
            self.store.create(description="Over Capacity")

        deleted_task = created_tasks[0]
        self.store.delete(deleted_task.id)

        created = self.store.create(description="New Task After Delete")
        self.assertIsNotNone(created)

    def test_delete_returns_exact_deleted_task(self):
        created_task = self.store.create(description="Exact Task")

        deleted_task = self.store.delete(created_task.id)

        self.assertEqual(deleted_task.id, created_task.id)
        self.assertEqual(deleted_task.description, created_task.description)


class TestTaskStoreIntegration(unittest.TestCase):
    def setUp(self):
        self.store = TaskStore()

    def test_create_get_delete_sequence(self):
        created = self.store.create(description="Sequential Task")

        retrieved = self.store.get_by_id(created.id)
        self.assertEqual(retrieved.id, created.id)

        deleted = self.store.delete(created.id)
        self.assertEqual(deleted.id, created.id)

        final = self.store.get_by_id(created.id)
        self.assertIsNone(final)

    def test_multiple_create_get_delete_sequence(self):
        tasks = []
        for i in range(10):
            task = self.store.create(description=f"Task {i}")
            tasks.append(task)

        for task in tasks:
            retrieved = self.store.get_by_id(task.id)
            self.assertIsNotNone(retrieved)

        for task in tasks:
            self.store.delete(task.id)

        for task in tasks:
            retrieved = self.store.get_by_id(task.id)
            self.assertIsNone(retrieved)

    def test_create_near_capacity_delete_create_cycle(self):
        for i in range(999):
            self.store.create(description=f"Task {i}")

        task_1000 = self.store.create(description="Task 1000")

        with self.assertRaises(ValueError):
            self.store.create(description="Over Capacity")

        self.store.delete(task_1000.id)

        new_task = self.store.create(description="New Task")
        self.assertIsNotNone(new_task)

    def test_interleaved_operations(self):
        task1 = self.store.create(description="Task 1")
        task2 = self.store.create(description="Task 2")

        retrieved1 = self.store.get_by_id(task1.id)
        self.assertIsNotNone(retrieved1)

        self.store.delete(task1.id)

        task3 = self.store.create(description="Task 3")

        retrieved2 = self.store.get_by_id(task2.id)
        self.assertIsNotNone(retrieved2)

        retrieved3 = self.store.get_by_id(task3.id)
        self.assertIsNotNone(retrieved3)

        gone1 = self.store.get_by_id(task1.id)
        self.assertIsNone(gone1)


class TestTaskStoreSingleton(unittest.TestCase):
    def test_task_store_singleton_exists(self):
        self.assertIsNotNone(TASK_STORE)
        self.assertIsInstance(TASK_STORE, TaskStore)

    def test_task_store_singleton_is_same_instance(self):
        from app.store import TASK_STORE as imported_store

        self.assertIs(TASK_STORE, imported_store)

    def test_task_store_multiple_imports_same_instance(self):
        import app.store

        store1 = app.store.TASK_STORE
        store2 = app.store.TASK_STORE
        self.assertIs(store1, store2)


if __name__ == "__main__":
    unittest.main()
