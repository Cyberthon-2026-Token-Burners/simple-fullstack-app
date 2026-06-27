import unittest
import uuid
from pydantic import ValidationError

from app.models import Task, TaskCreate, TaskUpdate


class TestTaskModel(unittest.TestCase):
    def test_task_instantiation_with_all_fields(self):
        task_id = uuid.uuid4()
        task = Task(
            id=task_id,
            description="Test Description",
            completed=True,
        )
        self.assertEqual(task.id, task_id)
        self.assertEqual(task.description, "Test Description")
        self.assertTrue(task.completed)

    def test_task_instantiation_with_defaults(self):
        task_id = uuid.uuid4()
        task = Task(id=task_id, description="Simple Task", completed=False)
        self.assertIsInstance(task.id, uuid.UUID)
        self.assertEqual(task.description, "Simple Task")
        self.assertFalse(task.completed)

    def test_task_generates_unique_uuid_each_time(self):
        task1 = Task(id=uuid.uuid4(), description="Task 1", completed=False)
        task2 = Task(id=uuid.uuid4(), description="Task 2", completed=False)
        self.assertNotEqual(task1.id, task2.id)
        self.assertIsInstance(task1.id, uuid.UUID)
        self.assertIsInstance(task2.id, uuid.UUID)

    def test_task_accepts_valid_uuid_string(self):
        uuid_str = str(uuid.uuid4())
        task = Task(id=uuid_str, description="Test", completed=False)
        self.assertIsInstance(task.id, uuid.UUID)
        self.assertEqual(str(task.id), uuid_str)

    def test_task_completed_must_be_bool_true(self):
        task = Task(id=uuid.uuid4(), description="Test", completed=True)
        self.assertIs(task.completed, True)
        self.assertIsInstance(task.completed, bool)

    def test_task_completed_must_be_bool_false(self):
        task = Task(id=uuid.uuid4(), description="Test", completed=False)
        self.assertIs(task.completed, False)
        self.assertIsInstance(task.completed, bool)

    def test_task_completed_rejects_none(self):
        with self.assertRaises(ValidationError):
            Task(id=uuid.uuid4(), description="Test", completed=None)

    def test_task_description_empty_string(self):
        task = Task(id=uuid.uuid4(), description="", completed=False)
        self.assertEqual(task.description, "")

    def test_task_description_single_character(self):
        task = Task(id=uuid.uuid4(), description="A", completed=False)
        self.assertEqual(task.description, "A")

    def test_task_description_long_string(self):
        long_description = "A" * 1000
        task = Task(id=uuid.uuid4(), description=long_description, completed=False)
        self.assertEqual(task.description, long_description)

    def test_task_description_with_special_characters(self):
        special_description = "Test!@#$%^&*()_+-=[]{}|;:',.<>?/`~"
        task = Task(id=uuid.uuid4(), description=special_description, completed=False)
        self.assertEqual(task.description, special_description)

    def test_task_description_with_unicode(self):
        unicode_description = "测试任务 тест Task"
        task = Task(id=uuid.uuid4(), description=unicode_description, completed=False)
        self.assertEqual(task.description, unicode_description)

    def test_task_description_with_newlines(self):
        multiline_description = "Line 1\nLine 2\nLine 3"
        task = Task(id=uuid.uuid4(), description=multiline_description, completed=False)
        self.assertEqual(task.description, multiline_description)

    def test_task_description_type_must_be_string(self):
        with self.assertRaises(ValidationError):
            Task(id=uuid.uuid4(), description=123)

    def test_task_description_type_rejects_list(self):
        with self.assertRaises(ValidationError):
            Task(id=uuid.uuid4(), description=[])

    def test_task_id_type_must_be_uuid(self):
        valid_uuid = uuid.uuid4()
        task = Task(id=valid_uuid, description="Test", completed=False)
        self.assertEqual(task.id, valid_uuid)

    def test_task_id_rejects_invalid_uuid_string(self):
        with self.assertRaises(ValidationError):
            Task(id="not-a-uuid", description="Test")

    def test_task_id_rejects_integer(self):
        with self.assertRaises(ValidationError):
            Task(id=12345, description="Test")

    def test_task_model_config_allows_assignment_validation(self):
        task = Task(id=uuid.uuid4(), description="Test", completed=False)
        with self.assertRaises(ValidationError):
            task.completed = "invalid"


class TestTaskCreateModel(unittest.TestCase):
    def test_task_create_with_required_description(self):
        tc = TaskCreate(description="New Task")
        self.assertEqual(tc.description, "New Task")

    def test_task_create_description_required(self):
        with self.assertRaises(ValidationError):
            TaskCreate()

    def test_task_create_description_empty_string_invalid(self):
        with self.assertRaises(ValidationError):
            TaskCreate(description="")

    def test_task_create_description_single_character_valid(self):
        tc = TaskCreate(description="A")
        self.assertEqual(tc.description, "A")

    def test_task_create_description_max_length_256(self):
        desc_256 = "D" * 256
        tc = TaskCreate(description=desc_256)
        self.assertEqual(tc.description, desc_256)
        self.assertEqual(len(tc.description), 256)

    def test_task_create_description_exceeds_max_length(self):
        desc_257 = "D" * 257
        with self.assertRaises(ValidationError):
            TaskCreate(description=desc_257)

    def test_task_create_description_length_255(self):
        desc_255 = "D" * 255
        tc = TaskCreate(description=desc_255)
        self.assertEqual(len(tc.description), 255)

    def test_task_create_description_boundary_lengths(self):
        boundary_cases = [
            ("A", 1, True),
            ("D" * 256, 256, True),
            ("D" * 257, 257, False),
        ]
        for desc, length, should_pass in boundary_cases:
            with self.subTest(length=length):
                if should_pass:
                    tc = TaskCreate(description=desc)
                    self.assertEqual(len(tc.description), length)
                else:
                    with self.assertRaises(ValidationError):
                        TaskCreate(description=desc)

    def test_task_create_description_type_must_be_string(self):
        with self.assertRaises(ValidationError):
            TaskCreate(description=123)

    def test_task_create_with_special_characters(self):
        tc = TaskCreate(description="Special: !@#$%^&*()")
        self.assertEqual(tc.description, "Special: !@#$%^&*()")

    def test_task_create_with_unicode(self):
        tc = TaskCreate(description="测试 тест")
        self.assertEqual(tc.description, "测试 тест")

    def test_task_create_with_newlines_in_description(self):
        desc_with_newline = "Line 1\nLine 2"
        tc = TaskCreate(description=desc_with_newline)
        self.assertEqual(tc.description, desc_with_newline)


class TestTaskUpdateModel(unittest.TestCase):
    def test_task_update_with_completed_only(self):
        tu = TaskUpdate(completed=True)
        self.assertTrue(tu.completed)

    def test_task_update_completed_true(self):
        tu = TaskUpdate(completed=True)
        self.assertIs(tu.completed, True)

    def test_task_update_completed_false(self):
        tu = TaskUpdate(completed=False)
        self.assertIs(tu.completed, False)

    def test_task_update_completed_rejects_none(self):
        with self.assertRaises(ValidationError):
            TaskUpdate(completed=None)

    def test_task_update_accepts_bool_values(self):
        bool_cases = [True, False]
        for val in bool_cases:
            with self.subTest(completed=val):
                tu = TaskUpdate(completed=val)
                self.assertIs(tu.completed, val)


if __name__ == "__main__":
    unittest.main()
