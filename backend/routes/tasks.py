from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from models import TaskCreate, TaskResponse, TaskUpdate
from services import task_service

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("", response_model=list[TaskResponse])
def list_tasks(
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    assignee: Optional[str] = Query(None),
    label: Optional[str] = Query(None),
    sort: str = Query("created"),
    order: str = Query("desc"),
    search: Optional[str] = Query(None),
):
    return task_service.list_tasks(
        status=status,
        priority=priority,
        assignee=assignee,
        label=label,
        sort=sort,
        order=order,
        search=search,
    )


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(task_id: str):
    task = task_service.get_task(task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.post("", response_model=TaskResponse, status_code=201)
def create_task(data: TaskCreate):
    return task_service.create_task(data)


@router.patch("/{task_id}", response_model=TaskResponse)
def update_task(task_id: str, data: TaskUpdate):
    task = task_service.update_task(task_id, data)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.delete("/{task_id}", status_code=200)
def delete_task(task_id: str):
    if not task_service.delete_task(task_id):
        raise HTTPException(status_code=404, detail="Task not found")
    return {"detail": "Task deleted"}
