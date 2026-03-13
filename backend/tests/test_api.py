"""Integration tests for the FastAPI endpoints."""

import pytest
from fastapi.testclient import TestClient

from main import app


@pytest.fixture
def client():
    return TestClient(app)


class TestCreateEndpoint:
    def test_create_task(self, client):
        res = client.post("/api/tasks", json={"title": "New task"})
        assert res.status_code == 201
        data = res.json()
        assert data["title"] == "New task"
        assert data["status"] == "backlog"
        assert data["priority"] == "medium"
        assert len(data["id"]) == 8

    def test_create_with_all_fields(self, client):
        res = client.post("/api/tasks", json={
            "title": "Full task",
            "status": "todo",
            "priority": "high",
            "assignee": "alice",
            "labels": ["bug", "urgent"],
            "body": "Fix the login page",
        })
        assert res.status_code == 201
        data = res.json()
        assert data["title"] == "Full task"
        assert data["status"] == "todo"
        assert data["priority"] == "high"
        assert data["assignee"] == "alice"
        assert data["labels"] == ["bug", "urgent"]
        assert data["body"] == "Fix the login page"

    def test_create_without_title_fails(self, client):
        res = client.post("/api/tasks", json={})
        assert res.status_code == 422

    def test_create_with_invalid_status(self, client):
        res = client.post("/api/tasks", json={"title": "Bad", "status": "invalid"})
        assert res.status_code == 422


class TestGetEndpoint:
    def test_get_task(self, client):
        create_res = client.post("/api/tasks", json={"title": "Get me"})
        task_id = create_res.json()["id"]

        res = client.get(f"/api/tasks/{task_id}")
        assert res.status_code == 200
        assert res.json()["title"] == "Get me"

    def test_get_nonexistent(self, client):
        res = client.get("/api/tasks/00000000")
        assert res.status_code == 404
        assert res.json()["detail"] == "Task not found"


class TestListEndpoint:
    def _seed(self, client):
        client.post("/api/tasks", json={"title": "A", "status": "todo", "priority": "low"})
        client.post("/api/tasks", json={"title": "B", "status": "in_progress", "priority": "high"})
        client.post("/api/tasks", json={"title": "C", "status": "todo", "priority": "urgent"})

    def test_list_all(self, client):
        self._seed(client)
        res = client.get("/api/tasks")
        assert res.status_code == 200
        assert len(res.json()) == 3

    def test_list_filter_status(self, client):
        self._seed(client)
        res = client.get("/api/tasks?status=todo")
        assert res.status_code == 200
        assert len(res.json()) == 2

    def test_list_filter_priority(self, client):
        self._seed(client)
        res = client.get("/api/tasks?priority=high")
        assert res.status_code == 200
        assert len(res.json()) == 1

    def test_list_empty(self, client):
        res = client.get("/api/tasks")
        assert res.status_code == 200
        assert res.json() == []


class TestUpdateEndpoint:
    def test_update_title(self, client):
        create_res = client.post("/api/tasks", json={"title": "Original"})
        task_id = create_res.json()["id"]

        res = client.patch(f"/api/tasks/{task_id}", json={"title": "Updated"})
        assert res.status_code == 200
        assert res.json()["title"] == "Updated"

    def test_update_status(self, client):
        create_res = client.post("/api/tasks", json={"title": "Status"})
        task_id = create_res.json()["id"]

        res = client.patch(f"/api/tasks/{task_id}", json={"status": "done"})
        assert res.status_code == 200
        assert res.json()["status"] == "done"

    def test_update_nonexistent(self, client):
        res = client.patch("/api/tasks/00000000", json={"title": "No"})
        assert res.status_code == 404

    def test_update_preserves_unchanged(self, client):
        create_res = client.post("/api/tasks", json={
            "title": "Keep me",
            "priority": "high",
            "assignee": "bob",
        })
        task_id = create_res.json()["id"]

        res = client.patch(f"/api/tasks/{task_id}", json={"title": "Changed"})
        data = res.json()
        assert data["title"] == "Changed"
        assert data["priority"] == "high"
        assert data["assignee"] == "bob"


class TestDeleteEndpoint:
    def test_delete_task(self, client):
        create_res = client.post("/api/tasks", json={"title": "Delete me"})
        task_id = create_res.json()["id"]

        res = client.delete(f"/api/tasks/{task_id}")
        assert res.status_code == 200

        # Verify it's gone
        get_res = client.get(f"/api/tasks/{task_id}")
        assert get_res.status_code == 404

    def test_delete_nonexistent(self, client):
        res = client.delete("/api/tasks/00000000")
        assert res.status_code == 404
