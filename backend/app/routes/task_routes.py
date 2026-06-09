from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models, schemas
from app.auth import get_current_user
from app.tools.notification_tool import generate_reminder

router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.post("/create", response_model=schemas.TaskOut, status_code=201)
def create_task(
    req: schemas.TaskCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    # Generate AI reminder message
    try:
        reminder = generate_reminder(
            req.title,
            req.assigned_to or "Team",
            req.due_date or "TBD",
            req.priority or "medium",
        )
    except Exception:
        reminder = f"Reminder: Please complete '{req.title}' by {req.due_date}."

    task = models.Task(
        user_id=current_user.id,
        title=req.title,
        description=req.description,
        assigned_to=req.assigned_to,
        priority=req.priority,
        due_date=req.due_date,
        reminder_message=reminder,
        status="pending",
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.get("/list", response_model=List[schemas.TaskOut])
def list_tasks(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return (
        db.query(models.Task)
        .filter(models.Task.user_id == current_user.id)
        .order_by(models.Task.created_at.desc())
        .all()
    )


@router.put("/update/{task_id}", response_model=schemas.TaskOut)
def update_task(
    task_id: int,
    req: schemas.TaskUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    task = db.query(models.Task).filter(
        models.Task.id == task_id,
        models.Task.user_id == current_user.id,
    ).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    for field, value in req.dict(exclude_unset=True).items():
        setattr(task, field, value)

    db.commit()
    db.refresh(task)
    return task


@router.delete("/delete/{task_id}", status_code=204)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    task = db.query(models.Task).filter(
        models.Task.id == task_id,
        models.Task.user_id == current_user.id,
    ).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
