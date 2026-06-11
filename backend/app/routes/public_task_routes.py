import os
import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session

from app import models, schemas
from app.config import settings
from app.database import get_db


router = APIRouter(prefix="/public-task", tags=["Public Task Update"])


def get_task_by_token_or_404(token: str, db: Session):
    task = (
        db.query(models.Task)
        .filter(models.Task.public_update_token == token)
        .first()
    )

    if not task:
        raise HTTPException(status_code=404, detail="Invalid or expired task update link.")

    return task


def calculate_task_progress(task: models.Task):
    checklist = task.checklist_items or []

    if not checklist:
        return task.progress or 0

    total = len(checklist)
    completed = len([item for item in checklist if item.is_completed == 1])

    if total == 0:
        return 0

    return round((completed / total) * 100)


@router.get("/{token}", response_model=schemas.PublicTaskOut)
def get_public_task(
    token: str,
    db: Session = Depends(get_db),
):
    task = get_task_by_token_or_404(token, db)
    return task


@router.post("/{token}/update", response_model=schemas.PublicTaskOut)
def update_public_task(
    token: str,
    req: schemas.PublicTaskUpdateRequest,
    db: Session = Depends(get_db),
):
    task = get_task_by_token_or_404(token, db)

    checklist_updates = req.checklist or []

    for item_update in checklist_updates:
        item = (
            db.query(models.TaskChecklistItem)
            .filter(
                models.TaskChecklistItem.id == item_update.item_id,
                models.TaskChecklistItem.task_id == task.id,
            )
            .first()
        )

        if item:
            item.is_completed = 1 if item_update.is_completed else 0
            item.updated_at = datetime.utcnow()

    db.flush()

    new_progress = calculate_task_progress(task)

    task.progress = new_progress

    if new_progress >= 100:
        task.status = "completed"
    elif new_progress > 0:
        task.status = "in_progress"

    external_update = models.TaskExternalUpdate(
        task_id=task.id,
        updater_name=req.updater_name,
        updater_email=str(req.updater_email) if req.updater_email else None,
        progress=new_progress,
        comment=req.comment,
    )

    db.add(external_update)
    db.commit()
    db.refresh(task)

    return task


@router.post("/{token}/proof", response_model=schemas.PublicTaskOut)
async def upload_public_task_proof(
    token: str,
    updater_name: str = Form(""),
    updater_email: str = Form(""),
    comment: str = Form(""),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    task = get_task_by_token_or_404(token, db)

    allowed_extensions = {
        ".pdf",
        ".docx",
        ".xlsx",
        ".xls",
        ".png",
        ".jpg",
        ".jpeg",
        ".txt",
    }

    _, ext = os.path.splitext(file.filename or "")

    if ext.lower() not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail="Only PDF, DOCX, Excel, image, and TXT files are allowed.",
        )

    content = await file.read()

    max_mb = getattr(settings, "MAX_ATTACHMENT_MB", 10)
    max_size = max_mb * 1024 * 1024

    if len(content) > max_size:
        raise HTTPException(
            status_code=400,
            detail=f"File size must be under {max_mb} MB.",
        )

    upload_dir = os.path.join(settings.OUTPUT_DIR, "task_proofs")
    os.makedirs(upload_dir, exist_ok=True)

    stored_filename = f"{uuid.uuid4().hex}{ext.lower()}"
    file_path = os.path.join(upload_dir, stored_filename)

    with open(file_path, "wb") as f:
        f.write(content)

    progress = calculate_task_progress(task)

    external_update = models.TaskExternalUpdate(
        task_id=task.id,
        updater_name=updater_name or None,
        updater_email=updater_email or None,
        progress=progress,
        comment=comment or None,
        proof_filename=file.filename,
        proof_file_path=file_path.replace("\\", "/"),
        proof_content_type=file.content_type,
    )

    db.add(external_update)
    db.commit()
    db.refresh(task)

    return task