import unittest
from starlette.testclient import TestClient

from app.main import app


class TestHealthEndpoint(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_health_endpoint_returns_200(self):
        response = self.client.get("/health/")
        self.assertEqual(response.status_code, 200)

    def test_health_endpoint_returns_json_content_type(self):
        response = self.client.get("/health/")
        self.assertTrue(
            response.headers["content-type"].startswith("application/json"),
            f"Expected application/json, got {response.headers['content-type']}",
        )

    def test_health_endpoint_returns_ok_status(self):
        response = self.client.get("/health/")
        data = response.json()
        self.assertEqual(data["status"], "ok")

    def test_health_endpoint_response_structure(self):
        response = self.client.get("/health/")
        data = response.json()
        self.assertIsInstance(data, dict)
        self.assertIn("status", data)
        self.assertEqual(len(data), 1)

    def test_health_endpoint_exact_response_body(self):
        response = self.client.get("/health/")
        expected = {"status": "ok"}
        self.assertEqual(response.json(), expected)

    def test_health_endpoint_method_variations(self):
        cases = [
            ("GET", 200),
            ("POST", 405),
            ("PUT", 405),
            ("DELETE", 405),
            ("PATCH", 405),
        ]
        for method, expected_status in cases:
            with self.subTest(method=method):
                if method == "GET":
                    response = self.client.get("/health/")
                elif method == "POST":
                    response = self.client.post("/health/")
                elif method == "PUT":
                    response = self.client.put("/health/")
                elif method == "DELETE":
                    response = self.client.delete("/health/")
                elif method == "PATCH":
                    response = self.client.patch("/health/")

                self.assertEqual(
                    response.status_code,
                    expected_status,
                    f"Method {method} expected {expected_status}, got {response.status_code}",
                )

    def test_health_endpoint_with_query_parameters(self):
        response = self.client.get("/health/?foo=bar")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "ok")

    def test_health_endpoint_with_multiple_query_parameters(self):
        response = self.client.get("/health/?foo=bar&baz=qux")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "ok")

    def test_health_endpoint_response_keys_exact(self):
        response = self.client.get("/health/")
        data = response.json()
        expected_keys = {"status"}
        actual_keys = set(data.keys())
        self.assertEqual(actual_keys, expected_keys)

    def test_health_endpoint_response_status_value_type(self):
        response = self.client.get("/health/")
        data = response.json()
        self.assertIsInstance(data["status"], str)

    def test_health_endpoint_idempotent(self):
        for _ in range(3):
            with self.subTest(iteration=_):
                response = self.client.get("/health/")
                self.assertEqual(response.status_code, 200)
                self.assertEqual(response.json(), {"status": "ok"})

    def test_health_endpoint_without_trailing_slash_follows_redirect(self):
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "ok")

    def test_health_endpoint_multiple_slashes(self):
        response = self.client.get("/health//")
        self.assertEqual(response.status_code, 404)

    def test_health_endpoint_case_sensitivity(self):
        response = self.client.get("/Health/")
        self.assertEqual(response.status_code, 404)

    def test_health_endpoint_with_headers(self):
        headers = {
            "User-Agent": "test-client",
            "Accept": "application/json",
        }
        response = self.client.get("/health/", headers=headers)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "ok")

    def test_health_endpoint_with_custom_headers(self):
        headers = {"X-Custom-Header": "test-value"}
        response = self.client.get("/health/", headers=headers)
        self.assertEqual(response.status_code, 200)

    def test_health_endpoint_json_content_type_charset(self):
        response = self.client.get("/health/")
        content_type = response.headers.get("content-type", "")
        self.assertIn("application/json", content_type)


class TestAppFactory(unittest.TestCase):
    def test_app_is_fastapi_instance(self):
        from fastapi import FastAPI

        self.assertIsInstance(app, FastAPI)

    def test_app_has_routes(self):
        self.assertTrue(len(app.routes) > 0)

    def test_app_health_route_exists(self):
        route_paths = [route.path for route in app.routes]
        self.assertIn("/health/", route_paths)


class TestAppImportability(unittest.TestCase):
    def test_app_imports_successfully(self):
        try:
            from app.main import app as imported_app

            self.assertIsNotNone(imported_app)
        except ImportError as e:
            self.fail(f"Failed to import app from app.main: {e}")


if __name__ == "__main__":
    unittest.main()
