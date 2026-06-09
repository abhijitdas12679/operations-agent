import mimetypes
import re
from pathlib import Path
from urllib.parse import quote

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app import models, schemas
from app.auth import get_current_user
from app.database import get_db
from app.services.document_export_service import (
    create_professional_docx,
    create_professional_pdf,
)
from app.tools.document_tool import export_to_docx
from app.tools.pdf_tool import export_to_pdf
from app.utils.helpers import get_download_url

router = APIRouter(prefix="/documents", tags=["Documents"])


def safe_filename(name: str) -> str:
    name = name.strip()
    name = re.sub(r'[<>:"/\\|?*]', "_", name)
    name = re.sub(r"\s+", " ", name)
    return name[:120]


def rename_file_with_title(file_path: str, title: str) -> str:
    old_path = Path(file_path)

    if not old_path.exists():
        return file_path

    ext = old_path.suffix
    new_name = f"{safe_filename(title)}{ext}"
    new_path = old_path.parent / new_name

    counter = 1
    while new_path.exists():
        new_name = f"{safe_filename(title)}_{counter}{ext}"
        new_path = old_path.parent / new_name
        counter += 1

    old_path.rename(new_path)
    return str(new_path)


def _get_content(
    db: Session,
    user_id: int,
    doc_type: str,
    content_id: int,
) -> tuple[str, str, dict]:
    if doc_type == "email":
        rec = (
            db.query(models.EmailHistory)
            .filter(
                models.EmailHistory.id == content_id,
                models.EmailHistory.user_id == user_id,
            )
            .first()
        )

        if not rec:
            raise HTTPException(status_code=404, detail="Email not found")

        return (
            rec.generated_email,
            f"Email - {rec.subject}",
            {
                "subject": rec.subject,
                "recipient": rec.recipient,
                "recipient_email": rec.recipient_email,
            },
        )

    if doc_type == "report":
        rec = (
            db.query(models.ReportHistory)
            .filter(
                models.ReportHistory.id == content_id,
                models.ReportHistory.user_id == user_id,
            )
            .first()
        )

        if not rec:
            raise HTTPException(status_code=404, detail="Report not found")

        return (
            rec.generated_report,
            f"Daily Report - {rec.team_name} - {rec.date}",
            {
                "date": rec.date,
                "team_name": rec.team_name,
            },
        )

    if doc_type == "meeting":
        rec = (
            db.query(models.MeetingHistory)
            .filter(
                models.MeetingHistory.id == content_id,
                models.MeetingHistory.user_id == user_id,
            )
            .first()
        )

        if not rec:
            raise HTTPException(status_code=404, detail="Meeting not found")

        return (
            rec.generated_mom,
            f"MOM - {rec.meeting_title}",
            {
                "meeting_title": rec.meeting_title,
                "attendees": rec.attendees,
            },
        )

    if doc_type == "task":
        rec = (
            db.query(models.Task)
            .filter(
                models.Task.id == content_id,
                models.Task.user_id == user_id,
            )
            .first()
        )

        if not rec:
            raise HTTPException(status_code=404, detail="Task not found")

        content = (
            f"Task: {rec.title}\n"
            f"Description: {rec.description}\n"
            f"Assigned To: {rec.assigned_to}\n"
            f"Priority: {rec.priority}\n"
            f"Status: {rec.status}\n"
            f"Due Date: {rec.due_date}\n\n"
            f"Reminder:\n{rec.reminder_message}"
        )

        return (
            content,
            f"Task - {rec.title}",
            {
                "task_title": rec.title,
                "assigned_to": rec.assigned_to,
                "due_date": rec.due_date,
            },
        )

    raise HTTPException(status_code=400, detail="Invalid doc_type")


@router.post("/export-docx", response_model=schemas.ExportResponse)
def export_docx(
    req: schemas.ExportRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    content, title, meta = _get_content(
        db=db,
        user_id=current_user.id,
        doc_type=req.doc_type,
        content_id=req.content_id,
    )

    if req.doc_type == "report":
        file_path = create_professional_docx(
            content=content,
            date=meta.get("date", ""),
            team_name=meta.get("team_name", ""),
        )
    else:
        file_path = export_to_docx(content, req.doc_type, title)

    file_path = rename_file_with_title(file_path, title)

    export = models.DocumentExport(
        user_id=current_user.id,
        doc_type=req.doc_type,
        export_format="docx",
        file_path=file_path,
    )

    db.add(export)
    db.commit()

    return {
        "file_path": file_path,
        "download_url": get_download_url(file_path),
    }


@router.post("/export-pdf", response_model=schemas.ExportResponse)
def export_pdf(
    req: schemas.ExportRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    content, title, meta = _get_content(
        db=db,
        user_id=current_user.id,
        doc_type=req.doc_type,
        content_id=req.content_id,
    )

    if req.doc_type == "report":
        file_path = create_professional_pdf(
            content=content,
            date=meta.get("date", ""),
            team_name=meta.get("team_name", ""),
        )
    else:
        file_path = export_to_pdf(content, req.doc_type, title)

    file_path = rename_file_with_title(file_path, title)

    export = models.DocumentExport(
        user_id=current_user.id,
        doc_type=req.doc_type,
        export_format="pdf",
        file_path=file_path,
    )

    db.add(export)
    db.commit()

    return {
        "file_path": file_path,
        "download_url": get_download_url(file_path),
    }


@router.get("/download")
def download_file(
    path: str,
    current_user: models.User = Depends(get_current_user),
):
    file_path = Path(path)

    if not file_path.exists() or not file_path.is_file():
        raise HTTPException(status_code=404, detail="File not found")

    filename = file_path.name
    media_type, _ = mimetypes.guess_type(str(file_path))

    if filename.lower().endswith(".pdf"):
        media_type = "application/pdf"
    elif filename.lower().endswith(".docx"):
        media_type = (
            "application/vnd.openxmlformats-officedocument."
            "wordprocessingml.document"
        )
    else:
        media_type = media_type or "application/octet-stream"

    encoded_filename = quote(filename)

    return FileResponse(
        path=str(file_path),
        filename=filename,
        media_type=media_type,
        headers={
            "Content-Disposition": f"attachment; filename*=UTF-8''{encoded_filename}"
        },
    )