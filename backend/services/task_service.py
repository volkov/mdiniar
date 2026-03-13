import uuid
from datetime import datetime, timezone
from pathlib import Path

import frontmatter

from config import TASKS_DIR
from models import Comment, CommentCreate, Priority, Status, TaskCreate, TaskResponse, TaskUpdate

PRIORITY_ORDER = {
    Priority.urgent: 0,
    Priority.high: 1,
    Priority.medium: 2,
    Priority.low: 3,
    Priority.none: 4,
}


def _ensure_tasks_dir() -> None:
    TASKS_DIR.mkdir(parents=True, exist_ok=True)


def _task_path(task_id: str) -> Path:
    return TASKS_DIR / f"{task_id}.md"


def _parse_task(path: Path) -> TaskResponse:
    post = frontmatter.load(str(path))
    meta = post.metadata
    raw_comments = meta.get("comments", [])
    comments = [Comment(**c) for c in raw_comments] if raw_comments else []
    return TaskResponse(
        id=meta["id"],
        title=meta["title"],
        status=meta.get("status", "backlog"),
        priority=meta.get("priority", "medium"),
        assignee=meta.get("assignee"),
        labels=meta.get("labels", []),
        created=meta["created"],
        updated=meta["updated"],
        body=post.content,
        comments=comments,
    )


def _write_task(task: TaskResponse) -> None:
    _ensure_tasks_dir()
    post = frontmatter.Post(task.body)
    post.metadata = {
        "id": task.id,
        "title": task.title,
        "status": task.status.value,
        "priority": task.priority.value,
        "assignee": task.assignee,
        "labels": task.labels,
        "created": task.created.isoformat(),
        "updated": task.updated.isoformat(),
        "comments": [c.model_dump(mode="json") for c in task.comments],
    }
    path = _task_path(task.id)
    path.write_text(frontmatter.dumps(post) + "\n")


def list_tasks(
    status: str | None = None,
    priority: str | None = None,
    assignee: str | None = None,
    label: str | None = None,
    sort: str = "created",
    order: str = "desc",
    search: str | None = None,
) -> list[TaskResponse]:
    _ensure_tasks_dir()
    tasks: list[TaskResponse] = []
    for path in TASKS_DIR.glob("*.md"):
        try:
            task = _parse_task(path)
        except Exception:
            continue
        tasks.append(task)

    if status:
        allowed = {s.strip() for s in status.split(",")}
        tasks = [t for t in tasks if t.status.value in allowed]

    if priority:
        allowed_p = {p.strip() for p in priority.split(",")}
        tasks = [t for t in tasks if t.priority.value in allowed_p]

    if assignee:
        tasks = [t for t in tasks if t.assignee == assignee]

    if label:
        tasks = [t for t in tasks if label in t.labels]

    if search:
        q = search.lower()
        tasks = [t for t in tasks if q in t.title.lower() or q in t.body.lower()]

    reverse = order == "desc"
    if sort == "priority":
        tasks.sort(key=lambda t: PRIORITY_ORDER.get(t.priority, 99), reverse=reverse)
    elif sort == "title":
        tasks.sort(key=lambda t: t.title.lower(), reverse=reverse)
    elif sort == "updated":
        tasks.sort(key=lambda t: t.updated, reverse=reverse)
    else:
        tasks.sort(key=lambda t: t.created, reverse=reverse)

    return tasks


def get_task(task_id: str) -> TaskResponse | None:
    path = _task_path(task_id)
    if not path.exists():
        return None
    return _parse_task(path)


def create_task(data: TaskCreate) -> TaskResponse:
    now = datetime.now(timezone.utc)
    task_id = uuid.uuid4().hex[:8]
    task = TaskResponse(
        id=task_id,
        title=data.title,
        status=data.status,
        priority=data.priority,
        assignee=data.assignee,
        labels=data.labels,
        created=now,
        updated=now,
        body=data.body,
    )
    _write_task(task)
    return task


def update_task(task_id: str, data: TaskUpdate) -> TaskResponse | None:
    task = get_task(task_id)
    if task is None:
        return None

    update_fields = data.model_dump(exclude_unset=True)
    for field, value in update_fields.items():
        setattr(task, field, value)

    task.updated = datetime.now(timezone.utc)
    _write_task(task)
    return task


def delete_task(task_id: str) -> bool:
    path = _task_path(task_id)
    if not path.exists():
        return False
    path.unlink()
    return True


def get_comments(task_id: str) -> list[Comment] | None:
    task = get_task(task_id)
    if task is None:
        return None
    return task.comments


def add_comment(task_id: str, data: CommentCreate) -> Comment | None:
    task = get_task(task_id)
    if task is None:
        return None
    comment = Comment(
        id=uuid.uuid4().hex[:8],
        author=data.author,
        body=data.body,
        created=datetime.now(timezone.utc),
    )
    task.comments.append(comment)
    task.updated = datetime.now(timezone.utc)
    _write_task(task)
    return comment
