import unittest
import uuid
from starlette.testclient import TestClient

from app.main import create_app, app
from app.store import TASK_STORE


class TestHealthEndpoint(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_health_endpoint_returns_200(self):
        response = self.client.get("/health/")
        self.assertEqual(response.status_code, 200)

    def test_health_endpoint_returns_ok_status(self):
        response = self.client.get("/health/")
        data = response.json()
        self.assertEqual(data["status"], "ok")

    def test_health_endpoint_response_structure(self):
        response = self.client.get("/health/")
        data = response.json()
        self.assertIsInstance(data, dict)
        self.assertIn("status", data)


class TestTasksListEndpoint(unittest.TestCase):
    def setUp(self):
        TASK_STORE._tasks = {}
        self.app = create_app()
        self.client = TestClient(self.app)

    def test_get_tasks_empty_list_returns_200(self):
        response = self.client.get("/tasks/")
        self.assertEqual(response.status_code, 200)

    def test_get_tasks_empty_list_returns_empty_json_array(self):
        response = self.client.get("/tasks/")
        data = response.json()
        self.assertEqual(data, [])

    def test_get_tasks_content_type_is_json(self):
        response = self.client.get("/tasks/")
        self.assertTrue(response.headers["content-type"].startswith("application/json"))

    def test_get_tasks_returns_list_type(self):
        response = self.client.get("/tasks/")
        data = response.json()
        self.assertIsInstance(data, list)

    def test_get_tasks_single_task(self):
        self.client.post("/tasks/", json={"description": "Test task"})
        response = self.client.get("/tasks/")
        data = response.json()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(data), 1)
        self.assertIsInstance(data[0], dict)
        self.assertIn("id", data[0])
        self.assertIn("description", data[0])
        self.assertIn("completed", data[0])

    def test_get_tasks_multiple_tasks(self):
        for i in range(3):
            self.client.post("/tasks/", json={"description": f"Task {i}"})
        response = self.client.get("/tasks/")
        data = response.json()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(data), 3)

    def test_get_tasks_task_structure(self):
        self.client.post("/tasks/", json={"description": "Test"})
        response = self.client.get("/tasks/")
        data = response.json()
        task = data[0]
        self.assertIn("id", task)
        self.assertIn("description", task)
        self.assertIn("completed", task)
        self.assertEqual(len(task), 3)


class TestTasksCreateEndpoint(unittest.TestCase):
    def setUp(self):
        TASK_STORE._tasks = {}
        self.app = create_app()
        self.client = TestClient(self.app)

    def test_post_tasks_with_valid_description_returns_201(self):
        response = self.client.post("/tasks/", json={"description": "My first task"})
        self.assertEqual(response.status_code, 201)

    def test_post_tasks_creates_task_with_uuid(self):
        response = self.client.post("/tasks/", json={"description": "Test task"})
        data = response.json()
        self.assertIn("id", data)
        try:
            uuid.UUID(data["id"])
        except (ValueError, TypeError):
            self.fail("Task ID is not a valid UUID")

    def test_post_tasks_creates_task_with_description(self):
        response = self.client.post("/tasks/", json={"description": "My task"})
        data = response.json()
        self.assertEqual(data["description"], "My task")

    def test_post_tasks_creates_task_with_completed_false(self):
        response = self.client.post("/tasks/", json={"description": "Test"})
        data = response.json()
        self.assertFalse(data["completed"])

    def test_post_tasks_response_contains_required_fields(self):
        response = self.client.post("/tasks/", json={"description": "Test"})
        data = response.json()
        self.assertIn("id", data)
        self.assertIn("description", data)
        self.assertIn("completed", data)

    def test_post_tasks_with_empty_description_returns_422(self):
        response = self.client.post("/tasks/", json={"description": ""})
        self.assertEqual(response.status_code, 422)

    def test_post_tasks_with_single_character_description(self):
        response = self.client.post("/tasks/", json={"description": "A"})
        self.assertEqual(response.status_code, 201)
        data = response.json()
        self.assertEqual(data["description"], "A")

    def test_post_tasks_with_max_length_description_256(self):
        desc_256 = "D" * 256
        response = self.client.post("/tasks/", json={"description": desc_256})
        self.assertEqual(response.status_code, 201)
        data = response.json()
        self.assertEqual(len(data["description"]), 256)

    def test_post_tasks_with_exceeds_max_length_description_257(self):
        desc_257 = "D" * 257
        response = self.client.post("/tasks/", json={"description": desc_257})
        self.assertEqual(response.status_code, 422)

    def test_post_tasks_with_whitespace_description(self):
        response = self.client.post("/tasks/", json={"description": "   "})
        self.assertEqual(response.status_code, 201)
        data = response.json()
        self.assertEqual(data["description"], "   ")

    def test_post_tasks_with_special_characters(self):
        special_desc = "Test!@#$%^&*()"
        response = self.client.post("/tasks/", json={"description": special_desc})
        self.assertEqual(response.status_code, 201)
        data = response.json()
        self.assertEqual(data["description"], special_desc)

    def test_post_tasks_with_unicode_description(self):
        unicode_desc = "测试任务 тест"
        response = self.client.post("/tasks/", json={"description": unicode_desc})
        self.assertEqual(response.status_code, 201)
        data = response.json()
        self.assertEqual(data["description"], unicode_desc)

    def test_post_tasks_with_newlines_in_description(self):
        multiline_desc = "Line 1\nLine 2\nLine 3"
        response = self.client.post("/tasks/", json={"description": multiline_desc})
        self.assertEqual(response.status_code, 201)
        data = response.json()
        self.assertEqual(data["description"], multiline_desc)

    def test_post_tasks_missing_description_field_returns_422(self):
        response = self.client.post("/tasks/", json={})
        self.assertEqual(response.status_code, 422)

    def test_post_tasks_with_invalid_json(self):
        response = self.client.post("/tasks/", content="invalid json")
        self.assertEqual(response.status_code, 422)

    def test_post_tasks_description_as_non_string_returns_422(self):
        response = self.client.post("/tasks/", json={"description": 123})
        self.assertEqual(response.status_code, 422)

    def test_post_tasks_description_as_list_returns_422(self):
        response = self.client.post("/tasks/", json={"description": []})
        self.assertEqual(response.status_code, 422)

    def test_post_tasks_response_content_type(self):
        response = self.client.post("/tasks/", json={"description": "Test"})
        self.assertTrue(response.headers["content-type"].startswith("application/json"))

    def test_post_tasks_multiple_creates_generate_unique_ids(self):
        resp1 = self.client.post("/tasks/", json={"description": "Task 1"})
        resp2 = self.client.post("/tasks/", json={"description": "Task 2"})
        id1 = resp1.json()["id"]
        id2 = resp2.json()["id"]
        self.assertNotEqual(id1, id2)

    def test_post_tasks_creates_distinct_instances(self):
        response1 = self.client.post("/tasks/", json={"description": "Task 1"})
        response2 = self.client.post("/tasks/", json={"description": "Task 1"})
        self.assertNotEqual(response1.json()["id"], response2.json()["id"])


class TestTasksUpdateEndpoint(unittest.TestCase):
    def setUp(self):
        TASK_STORE._tasks = {}
        self.app = create_app()
        self.client = TestClient(self.app)

    def test_patch_tasks_update_existing_task_to_completed(self):
        create_resp = self.client.post("/tasks/", json={"description": "Test"})
        task_id = create_resp.json()["id"]
        response = self.client.patch(f"/tasks/{task_id}", json={"completed": True})
        self.assertEqual(response.status_code, 200)

    def test_patch_tasks_update_returns_updated_task(self):
        create_resp = self.client.post("/tasks/", json={"description": "Test"})
        task_id = create_resp.json()["id"]
        response = self.client.patch(f"/tasks/{task_id}", json={"completed": True})
        data = response.json()
        self.assertTrue(data["completed"])

    def test_patch_tasks_update_preserves_description(self):
        desc = "Original description"
        create_resp = self.client.post("/tasks/", json={"description": desc})
        task_id = create_resp.json()["id"]
        response = self.client.patch(f"/tasks/{task_id}", json={"completed": True})
        data = response.json()
        self.assertEqual(data["description"], desc)

    def test_patch_tasks_update_preserves_id(self):
        create_resp = self.client.post("/tasks/", json={"description": "Test"})
        task_id = create_resp.json()["id"]
        response = self.client.patch(f"/tasks/{task_id}", json={"completed": True})
        data = response.json()
        self.assertEqual(data["id"], task_id)

    def test_patch_tasks_update_to_false(self):
        create_resp = self.client.post("/tasks/", json={"description": "Test"})
        task_id = create_resp.json()["id"]
        self.client.patch(f"/tasks/{task_id}", json={"completed": True})
        response = self.client.patch(f"/tasks/{task_id}", json={"completed": False})
        data = response.json()
        self.assertFalse(data["completed"])

    def test_patch_tasks_non_existent_task_returns_404(self):
        non_existent_uuid = str(uuid.uuid4())
        response = self.client.patch(
            f"/tasks/{non_existent_uuid}", json={"completed": True}
        )
        self.assertEqual(response.status_code, 404)

    def test_patch_tasks_invalid_uuid_format_returns_422(self):
        response = self.client.patch("/tasks/not-a-uuid", json={"completed": True})
        self.assertEqual(response.status_code, 422)

    def test_patch_tasks_missing_completed_field_returns_422(self):
        create_resp = self.client.post("/tasks/", json={"description": "Test"})
        task_id = create_resp.json()["id"]
        response = self.client.patch(f"/tasks/{task_id}", json={})
        self.assertEqual(response.status_code, 422)

    def test_patch_tasks_completed_as_non_bool_returns_422(self):
        create_resp = self.client.post("/tasks/", json={"description": "Test"})
        task_id = create_resp.json()["id"]
        response = self.client.patch(f"/tasks/{task_id}", json={"completed": "true"})
        self.assertEqual(response.status_code, 422)

    def test_patch_tasks_completed_as_integer_1_returns_422(self):
        create_resp = self.client.post("/tasks/", json={"description": "Test"})
        task_id = create_resp.json()["id"]
        response = self.client.patch(f"/tasks/{task_id}", json={"completed": 1})
        self.assertEqual(response.status_code, 422)

    def test_patch_tasks_response_content_type(self):
        create_resp = self.client.post("/tasks/", json={"description": "Test"})
        task_id = create_resp.json()["id"]
        response = self.client.patch(f"/tasks/{task_id}", json={"completed": True})
        self.assertTrue(response.headers["content-type"].startswith("application/json"))

    def test_patch_tasks_response_contains_all_fields(self):
        create_resp = self.client.post("/tasks/", json={"description": "Test"})
        task_id = create_resp.json()["id"]
        response = self.client.patch(f"/tasks/{task_id}", json={"completed": True})
        data = response.json()
        self.assertIn("id", data)
        self.assertIn("description", data)
        self.assertIn("completed", data)

    def test_patch_tasks_toggle_completion_multiple_times(self):
        create_resp = self.client.post("/tasks/", json={"description": "Test"})
        task_id = create_resp.json()["id"]
        values = [True, False, True, False]
        for value in values:
            with self.subTest(completed=value):
                response = self.client.patch(
                    f"/tasks/{task_id}", json={"completed": value}
                )
                self.assertEqual(response.status_code, 200)
                self.assertEqual(response.json()["completed"], value)


class TestTasksDeleteEndpoint(unittest.TestCase):
    def setUp(self):
        TASK_STORE._tasks = {}
        self.app = create_app()
        self.client = TestClient(self.app)

    def test_delete_tasks_existing_task_returns_204(self):
        create_resp = self.client.post("/tasks/", json={"description": "Test"})
        task_id = create_resp.json()["id"]
        response = self.client.delete(f"/tasks/{task_id}")
        self.assertEqual(response.status_code, 204)

    def test_delete_tasks_returns_no_content_body(self):
        create_resp = self.client.post("/tasks/", json={"description": "Test"})
        task_id = create_resp.json()["id"]
        response = self.client.delete(f"/tasks/{task_id}")
        self.assertEqual(response.content, b"")

    def test_delete_tasks_removes_task_from_list(self):
        create_resp = self.client.post("/tasks/", json={"description": "Test"})
        task_id = create_resp.json()["id"]
        self.client.delete(f"/tasks/{task_id}")
        list_resp = self.client.get("/tasks/")
        tasks = list_resp.json()
        task_ids = [t["id"] for t in tasks]
        self.assertNotIn(task_id, task_ids)

    def test_delete_tasks_non_existent_returns_404(self):
        non_existent_uuid = str(uuid.uuid4())
        response = self.client.delete(f"/tasks/{non_existent_uuid}")
        self.assertEqual(response.status_code, 404)

    def test_delete_tasks_invalid_uuid_format_returns_422(self):
        response = self.client.delete("/tasks/not-a-uuid")
        self.assertEqual(response.status_code, 422)

    def test_delete_tasks_multiple_deletes_of_same_id_first_succeeds(self):
        create_resp = self.client.post("/tasks/", json={"description": "Test"})
        task_id = create_resp.json()["id"]
        response1 = self.client.delete(f"/tasks/{task_id}")
        self.assertEqual(response1.status_code, 204)

    def test_delete_tasks_delete_non_existent_after_successful_delete(self):
        create_resp = self.client.post("/tasks/", json={"description": "Test"})
        task_id = create_resp.json()["id"]
        self.client.delete(f"/tasks/{task_id}")
        response = self.client.delete(f"/tasks/{task_id}")
        self.assertEqual(response.status_code, 404)

    def test_delete_tasks_deletes_correct_task(self):
        resp1 = self.client.post("/tasks/", json={"description": "Task 1"})
        resp2 = self.client.post("/tasks/", json={"description": "Task 2"})
        task_id_1 = resp1.json()["id"]
        task_id_2 = resp2.json()["id"]
        self.client.delete(f"/tasks/{task_id_1}")
        list_resp = self.client.get("/tasks/")
        tasks = list_resp.json()
        self.assertEqual(len(tasks), 1)
        self.assertEqual(tasks[0]["id"], task_id_2)

    def test_delete_tasks_can_recreate_after_deletion(self):
        create_resp1 = self.client.post("/tasks/", json={"description": "Test"})
        task_id = create_resp1.json()["id"]
        self.client.delete(f"/tasks/{task_id}")
        create_resp2 = self.client.post("/tasks/", json={"description": "Test"})
        self.assertEqual(create_resp2.status_code, 201)
        new_task_id = create_resp2.json()["id"]
        self.assertNotEqual(task_id, new_task_id)


class TestAppFactory(unittest.TestCase):
    def test_create_app_returns_fastapi_instance(self):
        from fastapi import FastAPI

        app_instance = create_app()
        self.assertIsInstance(app_instance, FastAPI)

    def test_create_app_creates_independent_instances(self):
        app1 = create_app()
        app2 = create_app()
        self.assertIsNot(app1, app2)

    def test_app_module_exports_app_instance(self):
        from app.main import app as app_instance
        from fastapi import FastAPI

        self.assertIsInstance(app_instance, FastAPI)

    def test_app_has_routes(self):
        app_instance = create_app()
        self.assertTrue(len(app_instance.routes) > 0)


if __name__ == "__main__":
    unittest.main()
