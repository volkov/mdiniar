"""Tests for comments API endpoints and service layer."""

import pytest
from fastapi.testclient import TestClient

from main import app
from models import TaskCreate
from services import task_service


@pytest.fixture
def client():
    return TestClient(app)


class TestCommentsService:
    """Tests for comment service functions."""

    def test_new_task_has_no_comments(self):
        task = task_service.create_task(TaskCreate(title="No comments"))
        assert task.comments == []

    def test_get_comments_returns_empty_list(self):
        task = task_service.create_task(TaskCreate(title="Empty comments"))
        comments = task_service.get_comments(task.id)
        assert comments == []

    def test_get_comments_nonexistent_task(self):
        result = task_service.get_comments("00000000")
        assert result is None

    def test_add_comment(self):
        from models import CommentCreate

        task = task_service.create_task(TaskCreate(title="With comment"))
        comment = task_service.add_comment(task.id, CommentCreate(author="alice", body="Hello"))
        assert comment is not None
        assert comment.author == "alice"
        assert comment.body == "Hello"
        assert len(comment.id) == 8

    def test_add_comment_nonexistent_task(self):
        from models import CommentCreate

        result = task_service.add_comment("00000000", CommentCreate(author="bob", body="Nope"))
        assert result is None

    def test_add_comment_persists(self):
        from models import CommentCreate

        task = task_service.create_task(TaskCreate(title="Persist comment"))
        task_service.add_comment(task.id, CommentCreate(author="alice", body="First"))
        task_service.add_comment(task.id, CommentCreate(author="bob", body="Second"))

        comments = task_service.get_comments(task.id)
        assert len(comments) == 2
        assert comments[0].author == "alice"
        assert comments[0].body == "First"
        assert comments[1].author == "bob"
        assert comments[1].body == "Second"

    def test_add_comment_updates_task_timestamp(self):
        from models import CommentCreate

        task = task_service.create_task(TaskCreate(title="Timestamp check"))
        original_updated = task.updated
        comment = task_service.add_comment(task.id, CommentCreate(author="alice", body="Update"))
        refreshed = task_service.get_task(task.id)
        assert refreshed.updated >= original_updated

    def test_comments_survive_roundtrip(self):
        """Comments stored in YAML frontmatter should survive read/write."""
        from models import CommentCreate

        task = task_service.create_task(TaskCreate(title="Roundtrip"))
        task_service.add_comment(task.id, CommentCreate(author="alice", body="Test comment"))

        # Re-read from disk
        reloaded = task_service.get_task(task.id)
        assert len(reloaded.comments) == 1
        assert reloaded.comments[0].author == "alice"
        assert reloaded.comments[0].body == "Test comment"


class TestCommentsAPI:
    """Tests for comments REST endpoints."""

    def test_get_comments_endpoint(self, client):
        create_res = client.post("/api/tasks", json={"title": "API comments"})
        task_id = create_res.json()["id"]

        res = client.get(f"/api/tasks/{task_id}/comments")
        assert res.status_code == 200
        assert res.json() == []

    def test_get_comments_nonexistent_task(self, client):
        res = client.get("/api/tasks/00000000/comments")
        assert res.status_code == 404

    def test_add_comment_endpoint(self, client):
        create_res = client.post("/api/tasks", json={"title": "Add comment API"})
        task_id = create_res.json()["id"]

        res = client.post(f"/api/tasks/{task_id}/comments", json={
            "author": "alice",
            "body": "Great work!",
        })
        assert res.status_code == 201
        data = res.json()
        assert data["author"] == "alice"
        assert data["body"] == "Great work!"
        assert "id" in data
        assert "created" in data

    def test_add_comment_nonexistent_task(self, client):
        res = client.post("/api/tasks/00000000/comments", json={
            "author": "bob",
            "body": "Nope",
        })
        assert res.status_code == 404

    def test_multiple_comments(self, client):
        create_res = client.post("/api/tasks", json={"title": "Multi comment"})
        task_id = create_res.json()["id"]

        client.post(f"/api/tasks/{task_id}/comments", json={"author": "alice", "body": "First"})
        client.post(f"/api/tasks/{task_id}/comments", json={"author": "bob", "body": "Second"})

        res = client.get(f"/api/tasks/{task_id}/comments")
        assert res.status_code == 200
        comments = res.json()
        assert len(comments) == 2

    def test_comments_included_in_task_response(self, client):
        create_res = client.post("/api/tasks", json={"title": "Task with comments"})
        task_id = create_res.json()["id"]

        client.post(f"/api/tasks/{task_id}/comments", json={"author": "alice", "body": "Inline"})

        res = client.get(f"/api/tasks/{task_id}")
        assert res.status_code == 200
        data = res.json()
        assert len(data["comments"]) == 1
        assert data["comments"][0]["author"] == "alice"

    def test_add_comment_missing_fields(self, client):
        create_res = client.post("/api/tasks", json={"title": "Missing fields"})
        task_id = create_res.json()["id"]

        res = client.post(f"/api/tasks/{task_id}/comments", json={"author": "alice"})
        assert res.status_code == 422
