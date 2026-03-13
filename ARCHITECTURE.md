# md-linear Architecture

A Linear-inspired task management app using markdown files with YAML frontmatter as the data store.

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | React 18 + Vite + TailwindCSS      |
| Backend  | Python 3.12+ with FastAPI           |
| Storage  | Markdown files with YAML frontmatter|
| Pkg Mgmt | uv (Python), npm (Frontend)        |

## Directory Structure

```
mdiniar/
├── ARCHITECTURE.md
├── README.md
├── backend/
│   ├── pyproject.toml          # uv project config
│   ├── main.py                 # FastAPI app entrypoint
│   ├── models.py               # Pydantic models
│   ├── routes/
│   │   └── tasks.py            # Task CRUD endpoints
│   ├── services/
│   │   └── task_service.py     # Business logic: read/write/parse MD files
│   └── config.py               # App configuration (task dir path, etc.)
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── index.html
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── api/
│   │   │   └── tasks.ts        # API client functions
│   │   ├── components/
│   │   │   ├── Layout.tsx      # Shell: sidebar + main content
│   │   │   ├── Sidebar.tsx     # Navigation sidebar
│   │   │   ├── BoardView.tsx   # Kanban board grouped by status
│   │   │   ├── ListView.tsx    # Table/list view
│   │   │   ├── TaskCard.tsx    # Card in board view
│   │   │   ├── TaskRow.tsx     # Row in list view
│   │   │   ├── TaskDetail.tsx  # Detail panel/modal with MD editor
│   │   │   └── TaskForm.tsx    # Create/edit form
│   │   ├── hooks/
│   │   │   └── useTasks.ts     # Data fetching hooks
│   │   └── types.ts            # TypeScript type definitions
│   └── public/
└── tasks/                      # Default task storage directory
    └── *.md                    # Individual task files
```

## Data Model

### Task Markdown File

Each task is a single `.md` file. The filename is the task ID: `{id}.md` where `id` is a UUID (short 8-char hex).

Example file `tasks/a1b2c3d4.md`:

```markdown
---
id: a1b2c3d4
title: Implement user authentication
status: in_progress
priority: high
assignee: alice
labels:
  - backend
  - security
created: 2026-03-13T10:00:00Z
updated: 2026-03-13T14:30:00Z
---

## Description

We need to add JWT-based authentication to the API.

### Acceptance Criteria

- Login endpoint returns JWT token
- Protected routes validate token
```

### YAML Frontmatter Schema

| Field      | Type       | Required | Default       | Description                              |
|------------|------------|----------|---------------|------------------------------------------|
| `id`       | string     | yes      | auto-generated| 8-char hex UUID prefix                   |
| `title`    | string     | yes      | -             | Task title                               |
| `status`   | enum       | yes      | `backlog`     | One of: `backlog`, `todo`, `in_progress`, `done`, `cancelled` |
| `priority` | enum       | no       | `medium`      | One of: `urgent`, `high`, `medium`, `low`, `none` |
| `assignee` | string     | no       | `null`        | Assignee name/handle                     |
| `labels`   | list[str]  | no       | `[]`          | Arbitrary string labels                  |
| `created`  | datetime   | yes      | auto          | ISO 8601 creation timestamp              |
| `updated`  | datetime   | yes      | auto          | ISO 8601 last-modified timestamp         |

### Status Flow

```
backlog → todo → in_progress → done
                              → cancelled
```

## API Design

Base URL: `http://localhost:8000/api`

### Endpoints

| Method   | Path              | Description                     |
|----------|-------------------|---------------------------------|
| `GET`    | `/tasks`          | List all tasks (with filters)   |
| `GET`    | `/tasks/{id}`     | Get a single task               |
| `POST`   | `/tasks`          | Create a new task               |
| `PATCH`  | `/tasks/{id}`     | Update a task (partial update)  |
| `DELETE` | `/tasks/{id}`     | Delete a task                   |

### Query Parameters for `GET /tasks`

| Param      | Type   | Description                          |
|------------|--------|--------------------------------------|
| `status`   | string | Filter by status (comma-separated)   |
| `priority` | string | Filter by priority (comma-separated) |
| `assignee` | string | Filter by assignee                   |
| `label`    | string | Filter by label                      |
| `sort`     | string | Sort field: `created`, `updated`, `priority`, `title` |
| `order`    | string | `asc` or `desc` (default: `desc`)    |
| `search`   | string | Full-text search in title and body   |

### Request/Response Schemas

#### Task Object (Response)

```json
{
  "id": "a1b2c3d4",
  "title": "Implement user authentication",
  "status": "in_progress",
  "priority": "high",
  "assignee": "alice",
  "labels": ["backend", "security"],
  "created": "2026-03-13T10:00:00Z",
  "updated": "2026-03-13T14:30:00Z",
  "body": "## Description\n\nWe need to add JWT-based authentication..."
}
```

#### Create Task (POST body)

```json
{
  "title": "New task title",
  "status": "todo",
  "priority": "high",
  "assignee": "bob",
  "labels": ["frontend"],
  "body": "Task description in markdown"
}
```

Only `title` is required. All other fields use defaults.

#### Update Task (PATCH body)

Any subset of the create fields. `updated` timestamp is set automatically.

### Error Responses

```json
{
  "detail": "Task not found"
}
```

Standard HTTP status codes: 200, 201, 404, 422.

## Frontend Architecture

### Views

1. **Board View** — Kanban columns grouped by status (`backlog`, `todo`, `in_progress`, `done`). Tasks displayed as cards with title, priority indicator, assignee, and labels. Drag-and-drop is a stretch goal (not required for MVP).

2. **List View** — Table with sortable columns: title, status, priority, assignee, created date. Click to open detail panel.

3. **Task Detail** — Side panel or modal showing full task details. Inline editing of all fields. Markdown body rendered with an edit toggle.

### Routing

- `/` — Redirects to board view
- `/board` — Board view
- `/list` — List view

No client-side router needed for MVP; use simple state-based view switching.

### State Management

Use React hooks and `fetch` for API calls. No external state management library needed for MVP. A custom `useTasks` hook handles fetching, caching, and mutations.

### Styling

TailwindCSS with a dark theme inspired by Linear. Neutral gray palette with accent colors for priority and status indicators.

## Backend Implementation Notes

- Use `python-frontmatter` library to parse/serialize YAML frontmatter in MD files.
- Task directory path configured via environment variable `MDINIAR_TASKS_DIR` (default: `./tasks`).
- FastAPI with CORS middleware enabled for frontend dev server.
- File operations are synchronous (acceptable for local, single-user use).
- On create: generate 8-char hex ID via `uuid.uuid4().hex[:8]`, write file.
- On update: read file, merge changes, update `updated` timestamp, write file.
- On delete: remove the `.md` file from disk.
