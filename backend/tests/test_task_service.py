"""Tests for task_service: MD file parsing, YAML frontmatter, and CRUD operations."""

import frontmatter

from models import Priority, Status, TaskCreate, TaskUpdate
from services import task_service


class TestParseTask:
    """Test markdown file parsing and YAML frontmatter handling."""

    def test_write_and_parse_roundtrip(self, task_dir):
        """A created task should be parseable back from disk."""
        data = TaskCreate(title="Test task", status=Status.todo, priority=Priority.high)
        created = task_service.create_task(data)

        path = task_dir / f"{created.id}.md"
        assert path.exists()

        parsed = task_service._parse_task(path)
        assert parsed.id == created.id
        assert parsed.title == "Test task"
        assert parsed.status == Status.todo
        assert parsed.priority == Priority.high
        assert parsed.body == ""

    def test_frontmatter_fields(self, task_dir):
        """The written file should contain correct YAML frontmatter fields."""
        data = TaskCreate(
            title="Auth feature",
            status=Status.in_progress,
            priority=Priority.urgent,
            assignee="alice",
            labels=["backend", "security"],
            body="Implement JWT auth",
        )
        created = task_service.create_task(data)
        path = task_dir / f"{created.id}.md"

        post = frontmatter.load(str(path))
        assert post.metadata["id"] == created.id
        assert post.metadata["title"] == "Auth feature"
        assert post.metadata["status"] == "in_progress"
        assert post.metadata["priority"] == "urgent"
        assert post.metadata["assignee"] == "alice"
        assert post.metadata["labels"] == ["backend", "security"]
        assert post.content == "Implement JWT auth"

    def test_parse_defaults(self, task_dir):
        """Missing optional fields should use defaults."""
        data = TaskCreate(title="Minimal task")
        created = task_service.create_task(data)

        assert created.status == Status.backlog
        assert created.priority == Priority.medium
        assert created.assignee is None
        assert created.labels == []
        assert created.body == ""

    def test_body_with_markdown(self, task_dir):
        """Markdown content in the body should survive roundtrip."""
        body = "## Heading\n\n- item 1\n- item 2\n\n```python\nprint('hello')\n```"
        data = TaskCreate(title="MD body", body=body)
        created = task_service.create_task(data)

        retrieved = task_service.get_task(created.id)
        assert retrieved is not None
        assert retrieved.body == body


class TestCreateTask:
    def test_create_generates_id(self):
        data = TaskCreate(title="New task")
        task = task_service.create_task(data)
        assert len(task.id) == 8
        assert all(c in "0123456789abcdef" for c in task.id)

    def test_create_sets_timestamps(self):
        data = TaskCreate(title="Timestamped")
        task = task_service.create_task(data)
        assert task.created is not None
        assert task.updated is not None
        assert task.created == task.updated

    def test_create_writes_file(self, task_dir):
        data = TaskCreate(title="File check")
        task = task_service.create_task(data)
        assert (task_dir / f"{task.id}.md").exists()


class TestGetTask:
    def test_get_existing(self):
        created = task_service.create_task(TaskCreate(title="Exists"))
        fetched = task_service.get_task(created.id)
        assert fetched is not None
        assert fetched.id == created.id
        assert fetched.title == "Exists"

    def test_get_nonexistent(self):
        assert task_service.get_task("00000000") is None


class TestUpdateTask:
    def test_update_title(self):
        created = task_service.create_task(TaskCreate(title="Original"))
        updated = task_service.update_task(created.id, TaskUpdate(title="Changed"))
        assert updated is not None
        assert updated.title == "Changed"

    def test_update_status(self):
        created = task_service.create_task(TaskCreate(title="Status test"))
        updated = task_service.update_task(created.id, TaskUpdate(status=Status.done))
        assert updated is not None
        assert updated.status == Status.done

    def test_update_updates_timestamp(self):
        created = task_service.create_task(TaskCreate(title="TS test"))
        updated = task_service.update_task(created.id, TaskUpdate(title="New title"))
        assert updated is not None
        assert updated.updated >= created.updated

    def test_partial_update_preserves_other_fields(self):
        created = task_service.create_task(
            TaskCreate(title="Partial", priority=Priority.high, assignee="bob")
        )
        updated = task_service.update_task(created.id, TaskUpdate(title="Changed"))
        assert updated is not None
        assert updated.priority == Priority.high
        assert updated.assignee == "bob"

    def test_update_nonexistent(self):
        assert task_service.update_task("00000000", TaskUpdate(title="No")) is None

    def test_update_persists_to_disk(self, task_dir):
        created = task_service.create_task(TaskCreate(title="Persist"))
        task_service.update_task(created.id, TaskUpdate(title="Updated"))
        reloaded = task_service.get_task(created.id)
        assert reloaded is not None
        assert reloaded.title == "Updated"


class TestDeleteTask:
    def test_delete_existing(self, task_dir):
        created = task_service.create_task(TaskCreate(title="Delete me"))
        assert task_service.delete_task(created.id) is True
        assert not (task_dir / f"{created.id}.md").exists()

    def test_delete_nonexistent(self):
        assert task_service.delete_task("00000000") is False


class TestListTasks:
    def _create_tasks(self):
        task_service.create_task(TaskCreate(title="A", status=Status.todo, priority=Priority.low, assignee="alice", labels=["frontend"]))
        task_service.create_task(TaskCreate(title="B", status=Status.in_progress, priority=Priority.high, assignee="bob", labels=["backend"]))
        task_service.create_task(TaskCreate(title="C", status=Status.todo, priority=Priority.urgent, assignee="alice", labels=["backend", "api"]))

    def test_list_all(self):
        self._create_tasks()
        tasks = task_service.list_tasks()
        assert len(tasks) == 3

    def test_filter_by_status(self):
        self._create_tasks()
        tasks = task_service.list_tasks(status="todo")
        assert len(tasks) == 2
        assert all(t.status == Status.todo for t in tasks)

    def test_filter_by_multiple_statuses(self):
        self._create_tasks()
        tasks = task_service.list_tasks(status="todo,in_progress")
        assert len(tasks) == 3

    def test_filter_by_priority(self):
        self._create_tasks()
        tasks = task_service.list_tasks(priority="high")
        assert len(tasks) == 1
        assert tasks[0].title == "B"

    def test_filter_by_assignee(self):
        self._create_tasks()
        tasks = task_service.list_tasks(assignee="alice")
        assert len(tasks) == 2

    def test_filter_by_label(self):
        self._create_tasks()
        tasks = task_service.list_tasks(label="backend")
        assert len(tasks) == 2

    def test_sort_by_title_asc(self):
        self._create_tasks()
        tasks = task_service.list_tasks(sort="title", order="asc")
        titles = [t.title for t in tasks]
        assert titles == ["A", "B", "C"]

    def test_sort_by_priority(self):
        self._create_tasks()
        tasks = task_service.list_tasks(sort="priority", order="asc")
        priorities = [t.priority for t in tasks]
        assert priorities == [Priority.urgent, Priority.high, Priority.low]

    def test_search(self):
        self._create_tasks()
        task_service.create_task(TaskCreate(title="Deploy script", body="Setup CI/CD pipeline"))
        tasks = task_service.list_tasks(search="deploy")
        assert len(tasks) == 1
        assert tasks[0].title == "Deploy script"

    def test_search_in_body(self):
        self._create_tasks()
        task_service.create_task(TaskCreate(title="Infra", body="Setup kubernetes cluster"))
        tasks = task_service.list_tasks(search="kubernetes")
        assert len(tasks) == 1

    def test_empty_list(self):
        tasks = task_service.list_tasks()
        assert tasks == []
