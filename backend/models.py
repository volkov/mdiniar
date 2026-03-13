from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class Status(str, Enum):
    backlog = "backlog"
    todo = "todo"
    in_progress = "in_progress"
    done = "done"
    cancelled = "cancelled"


class Priority(str, Enum):
    urgent = "urgent"
    high = "high"
    medium = "medium"
    low = "low"
    none = "none"


class TaskResponse(BaseModel):
    id: str
    title: str
    status: Status
    priority: Priority
    assignee: Optional[str] = None
    labels: list[str] = Field(default_factory=list)
    created: datetime
    updated: datetime
    body: str = ""


class TaskCreate(BaseModel):
    title: str
    status: Status = Status.backlog
    priority: Priority = Priority.medium
    assignee: Optional[str] = None
    labels: list[str] = Field(default_factory=list)
    body: str = ""


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[Status] = None
    priority: Optional[Priority] = None
    assignee: Optional[str] = None
    labels: Optional[list[str]] = None
    body: Optional[str] = None
