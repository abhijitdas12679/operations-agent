import json
import uuid
from datetime import date, datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app import models, schemas
from app.auth import get_current_user
from app.config import settings
from app.database import get_db
from app.tools.notification_tool import generate_reminder
from app.services.ai_task_service import generate_professional_task_content, predict_task_effort
from app.services.task_document_service import create_task_docx, create_task_pdf
from app.services.task_email_service import send_task_assignment_email


router = APIRouter(prefix="/tasks", tags=["Tasks"])

TASK_STATUSES = {"pending", "in_progress", "waiting_approval", "blocked", "completed", "cancelled"}
TASK_PRIORITIES = {"low", "medium", "high", "critical"}


def get_task_or_404(task_id: int, db: Session, user_id: int):
    task = db.query(models.Task).filter(
        models.Task.id == task_id,
        models.Task.user_id == user_id,
    ).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    return task


def normalize_status(status: str | None) -> str:
    value = (status or "pending").strip().lower().replace(" ", "_")

    if value not in TASK_STATUSES:
        raise HTTPException(status_code=400, detail="Invalid task status")

    return value


def normalize_priority(priority: str | None) -> str:
    value = (priority or "medium").strip().lower()

    if value not in TASK_PRIORITIES:
        raise HTTPException(status_code=400, detail="Invalid task priority")

    return value


def clamp_progress(progress: int | None) -> int:
    return max(0, min(100, int(progress or 0)))


def parse_due_date(due_date: str | None):
    if not due_date:
        return None

    try:
        return datetime.strptime(due_date, "%Y-%m-%d").date()
    except ValueError:
        return None


def json_list(value):
    if not value:
        return []

    if isinstance(value, list):
        return value

    try:
        parsed = json.loads(value)
        return parsed if isinstance(parsed, list) else []
    except Exception:
        return []


def build_reminder(title: str, assigned_to: str | None, due_date: str | None, priority: str):
    try:
        return generate_reminder(
            title,
            assigned_to or "Team",
            due_date or "TBD",
            priority or "medium",
        )
    except Exception:
        return f"Reminder: Please complete '{title}' by {due_date or 'TBD'}."


def get_frontend_task_update_link(token: str):
    return f"{settings.FRONTEND_URL.rstrip('/')}/task-update/{token}"


def ensure_task_token(task: models.Task):
    if not task.public_update_token:
        task.public_update_token = uuid.uuid4().hex

    return task.public_update_token


def label_task_status(status: str):
    return (status or "pending").replace("_", " ").title()


def create_checklist_items_if_missing(db: Session, task: models.Task, checklist: List[str]):
    exists = db.query(models.TaskChecklistItem).filter(
        models.TaskChecklistItem.task_id == task.id
    ).count()

    if exists:
        return

    for title in checklist:
        clean = str(title).strip()

        if clean:
            db.add(
                models.TaskChecklistItem(
                    task_id=task.id,
                    title=clean[:300],
                    is_completed=0,
                )
            )


def get_parent_checklist_items(db: Session, task_id: int):
    return (
        db.query(models.TaskChecklistItem)
        .filter(
            models.TaskChecklistItem.task_id == task_id,
            models.TaskChecklistItem.parent_checklist_id.is_(None),
        )
        .order_by(models.TaskChecklistItem.id.asc())
        .all()
    )


def generate_related_subtasks(task: models.Task, checklist_title: str) -> list[str]:
    text = (checklist_title or "").strip()
    context = f"{task.title or ''} {task.description or ''} {text}".lower()
    item = text.lower()

    if len(item.split()) <= 3:
        return []

    if any(x in item for x in ["best practices", "code organization", "reusability"]):
        return [
            "Define reusable component structure",
            "Organize folders and shared utilities",
        ]

    if any(x in item for x in ["vite", "build", "development"]):
        return [
            "Configure Vite settings",
            "Verify development server startup",
            "Test optimized production build",
        ]

    if any(x in item for x in ["responsive", "alignment", "screen", "layout"]):
        return [
            "Check mobile and desktop layout",
            "Fix spacing and alignment issues",
        ]

    if any(x in item for x in ["api", "endpoint", "backend"]):
        return [
            "Define request and response structure",
            "Connect endpoint with business logic",
            "Test API response handling",
        ]

    if any(x in item for x in ["database", "schema", "postgres", "mysql", "sql", "rds"]):
        return [
            "Review required table changes",
            "Update schema or model",
            "Test database operations",
        ]

    if any(x in item for x in ["test", "testing", "debug"]):
        return [
            "Prepare test cases",
            "Run tests and fix issues",
        ]

    if any(x in item for x in ["document", "documentation", "instructions"]):
        return [
            "Write clear setup notes",
            "Add maintenance instructions",
        ]

    if any(x in item for x in ["deploy", "production", "render", "vercel", "aws", "ec2"]):
        return [
            "Check environment variables",
            "Deploy and verify service health",
        ]

    return []


def recalculate_task_progress(db: Session, task: models.Task):
    items = db.query(models.TaskChecklistItem).filter(
        models.TaskChecklistItem.task_id == task.id
    ).all()

    if not items:
        return task

    completed = len([item for item in items if item.is_completed])
    task.progress = round((completed / len(items)) * 100)

    if task.progress >= 100:
        task.status = "completed"
    elif task.progress > 0 and task.status == "pending":
        task.status = "in_progress"
    elif task.progress < 100 and task.status == "completed":
        task.status = "in_progress"

    return task


@router.post("/create", response_model=schemas.TaskOut, status_code=201)
def create_task(
    req: schemas.TaskCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    priority = normalize_priority(req.priority)
    status = normalize_status(req.status)
    progress = clamp_progress(req.progress)

    assignees = req.assignees or []
    assignee_emails = [str(email) for email in (req.assignee_emails or [])]
    assigned_to_text = ", ".join(assignees) if assignees else req.assigned_to

    ai_content = generate_professional_task_content(
        title=req.title,
        description=req.description or "",
        priority=priority,
        due_date=req.due_date,
    )

    prediction = predict_task_effort(req.title, req.description or "")
    reminder = build_reminder(req.title, assigned_to_text, req.due_date, priority)

    task = models.Task(
        user_id=current_user.id,
        title=req.title,
        description=req.description,
        professional_description=ai_content["professional_description"],
        email_subject=ai_content["email_subject"],
        assigned_to=assigned_to_text,
        assignees=json.dumps(assignees),
        assignee_emails=json.dumps(assignee_emails),
        priority=priority,
        due_date=req.due_date,
        reminder_message=reminder,
        status=status,
        progress=progress,
        estimated_effort=prediction["estimated_effort"],
        recurrence=req.recurrence or "none",
        recurrence_anchor=req.due_date,
        public_update_token=uuid.uuid4().hex,
    )

    db.add(task)
    db.commit()
    db.refresh(task)

    create_checklist_items_if_missing(db, task, ai_content["checklist"])
    db.commit()
    db.refresh(task)

    return task


@router.get("/list", response_model=List[schemas.TaskOut])
def list_tasks(
    status: str | None = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    query = db.query(models.Task).filter(
        models.Task.user_id == current_user.id,
        models.Task.parent_task_id.is_(None),
    )

    if status and status != "all":
        query = query.filter(models.Task.status == normalize_status(status))

    return query.order_by(models.Task.created_at.desc()).all()


@router.get("/analytics/summary", response_model=schemas.TaskAnalytics)
def task_analytics(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    tasks = db.query(models.Task).filter(
        models.Task.user_id == current_user.id,
        models.Task.parent_task_id.is_(None),
    ).all()

    today = date.today()
    total = len(tasks)
    completed = len([task for task in tasks if task.status == "completed"])

    overdue = sum(
        1
        for task in tasks
        if parse_due_date(task.due_date)
        and parse_due_date(task.due_date) < today
        and task.status not in {"completed", "cancelled"}
    )

    return {
        "total_tasks": total,
        "pending_tasks": len([task for task in tasks if task.status == "pending"]),
        "in_progress_tasks": len([task for task in tasks if task.status == "in_progress"]),
        "completed_tasks": completed,
        "blocked_tasks": len([task for task in tasks if task.status == "blocked"]),
        "overdue_tasks": overdue,
        "completion_rate": round((completed / total) * 100, 2) if total else 0,
    }


@router.get("/summary/daily", response_model=schemas.DailySummaryResponse)
def daily_summary(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    tasks = (
        db.query(models.Task)
        .filter(
            models.Task.user_id == current_user.id,
            models.Task.parent_task_id.is_(None),
        )
        .order_by(models.Task.created_at.desc())
        .all()
    )

    today = date.today()
    start_today = datetime.combine(today, datetime.min.time())

    updates = (
        db.query(models.TaskExternalUpdate)
        .join(models.Task)
        .filter(
            models.Task.user_id == current_user.id,
            models.TaskExternalUpdate.created_at >= start_today,
        )
        .order_by(models.TaskExternalUpdate.created_at.desc())
        .all()
    )

    return {
        "completed": [task.title for task in tasks if task.status == "completed"],
        "pending": [
            task.title
            for task in tasks
            if task.status in {"pending", "in_progress", "waiting_approval", "blocked"}
        ],
        "overdue": [
            task.title
            for task in tasks
            if parse_due_date(task.due_date)
            and parse_due_date(task.due_date) < today
            and task.status not in {"completed", "cancelled"}
        ],
        "updates_today": [
            f"{update.updater_name or update.updater_email or 'Assignee'} updated "
            f"'{update.task.title if update.task else 'Task'}' to {update.progress}%"
            + (f" - {update.comment}" if update.comment else "")
            for update in updates
        ],
    }


@router.get("/{task_id}/summary", response_model=schemas.DailySummaryResponse)
def task_daily_summary(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    task = get_task_or_404(task_id, db, current_user.id)

    items = (
        db.query(models.TaskChecklistItem)
        .filter(models.TaskChecklistItem.task_id == task.id)
        .order_by(
            models.TaskChecklistItem.parent_checklist_id.asc().nullsfirst(),
            models.TaskChecklistItem.id.asc(),
        )
        .all()
    )

    completed = []
    pending = []

    for item in items:
        prefix = "↳ " if item.parent_checklist_id else ""
        text = f"{prefix}{item.title}"

        if item.is_completed:
            completed.append(text)
        else:
            pending.append(text)

    due = parse_due_date(task.due_date)
    today = date.today()

    overdue = []
    if due and due < today and task.status not in {"completed", "cancelled"}:
        overdue.append(task.title)

    start_today = datetime.combine(today, datetime.min.time())

    updates = (
        db.query(models.TaskExternalUpdate)
        .filter(
            models.TaskExternalUpdate.task_id == task.id,
            models.TaskExternalUpdate.created_at >= start_today,
        )
        .order_by(models.TaskExternalUpdate.created_at.desc())
        .all()
    )

    updates_today = [
        f"{update.updater_name or update.updater_email or 'Assignee'} updated progress to {update.progress}%"
        + (f" - {update.comment}" if update.comment else "")
        for update in updates
    ]

    if not updates_today:
        updates_today.append(
            f"Current task status is {label_task_status(task.status)} with {task.progress or 0}% progress."
        )

    return {
        "completed": completed,
        "pending": pending,
        "overdue": overdue,
        "updates_today": updates_today,
    }


@router.get("/{task_id}", response_model=schemas.TaskOut)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return get_task_or_404(task_id, db, current_user.id)


@router.put("/update/{task_id}", response_model=schemas.TaskOut)
def update_task(
    task_id: int,
    req: schemas.TaskUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    task = get_task_or_404(task_id, db, current_user.id)
    data = req.model_dump(exclude_unset=True)

    if data.get("priority") is not None:
        data["priority"] = normalize_priority(data["priority"])

    if data.get("status") is not None:
        data["status"] = normalize_status(data["status"])

        if data["status"] == "completed":
            data["progress"] = 100

    if data.get("progress") is not None:
        data["progress"] = clamp_progress(data["progress"])

        if data["progress"] == 100:
            data["status"] = "completed"

    if data.get("assignees") is not None:
        assignees = data.pop("assignees")
        task.assignees = json.dumps(assignees)
        task.assigned_to = ", ".join(assignees)

    if data.get("assignee_emails") is not None:
        emails = [str(email) for email in data.pop("assignee_emails")]
        task.assignee_emails = json.dumps(emails)

    for field, value in data.items():
        setattr(task, field, value)

    db.commit()
    db.refresh(task)

    return task


@router.post("/{task_id}/generate-subtasks", response_model=schemas.TaskOut)
def generate_subtasks(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    task = get_task_or_404(task_id, db, current_user.id)
    parents = get_parent_checklist_items(db, task.id)

    if not parents:
        raise HTTPException(status_code=400, detail="No checklist items found for this task.")

    created_count = 0

    for parent in parents:
        child_exists = (
            db.query(models.TaskChecklistItem)
            .filter(
                models.TaskChecklistItem.task_id == task.id,
                models.TaskChecklistItem.parent_checklist_id == parent.id,
            )
            .count()
        )

        if child_exists:
            continue

        for title in generate_related_subtasks(task, parent.title):
            clean = str(title).strip()

            if not clean:
                continue

            db.add(
                models.TaskChecklistItem(
                    task_id=task.id,
                    parent_checklist_id=parent.id,
                    title=clean[:300],
                    is_completed=0,
                )
            )
            created_count += 1

    if created_count == 0:
        db.refresh(task)
        return task

    recalculate_task_progress(db, task)
    db.commit()
    db.refresh(task)

    return task


@router.put("/{task_id}/checklist/{item_id}/toggle", response_model=schemas.TaskOut)
def toggle_checklist_item(
    task_id: int,
    item_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    task = get_task_or_404(task_id, db, current_user.id)

    item = (
        db.query(models.TaskChecklistItem)
        .filter(
            models.TaskChecklistItem.id == item_id,
            models.TaskChecklistItem.task_id == task.id,
        )
        .first()
    )

    if not item:
        raise HTTPException(status_code=404, detail="Checklist item not found")

    item.is_completed = 0 if item.is_completed else 1
    recalculate_task_progress(db, task)

    db.commit()
    db.refresh(task)

    return task


@router.delete("/delete/{task_id}", status_code=204)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    task = get_task_or_404(task_id, db, current_user.id)

    db.delete(task)
    db.commit()

    return None


@router.post("/{task_id}/comments", response_model=schemas.TaskCommentOut, status_code=201)
def add_comment(
    task_id: int,
    req: schemas.TaskCommentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    task = get_task_or_404(task_id, db, current_user.id)

    comment = models.TaskComment(
        task_id=task.id,
        user_id=current_user.id,
        author_name=current_user.full_name or current_user.username,
        comment=req.comment,
    )

    db.add(comment)
    db.commit()
    db.refresh(comment)

    return comment


@router.post("/{task_id}/send", response_model=schemas.SendTaskEmailResponse)
def send_task_email(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    task = get_task_or_404(task_id, db, current_user.id)

    smtp_setting = (
        db.query(models.UserSMTPSetting)
        .filter(
            models.UserSMTPSetting.user_id == current_user.id,
            models.UserSMTPSetting.is_active == 1,
        )
        .first()
    )

    if not smtp_setting:
        raise HTTPException(status_code=400, detail="SMTP account is not connected.")

    emails = json_list(task.assignee_emails)

    if not emails:
        raise HTTPException(status_code=400, detail="Please add at least one assignee email.")

    if not task.professional_description or not task.email_subject:
        ai_content = generate_professional_task_content(
            title=task.title,
            description=task.description or "",
            priority=task.priority,
            due_date=task.due_date,
        )

        task.professional_description = ai_content["professional_description"]
        task.email_subject = ai_content["email_subject"]

        create_checklist_items_if_missing(db, task, ai_content["checklist"])

    token = ensure_task_token(task)
    update_link = get_frontend_task_update_link(token)

    sender_name = current_user.full_name or current_user.username
    sender_designation = current_user.designation or "Operations Team"

    pdf_path = create_task_pdf(task, update_link, sender_name, sender_designation)
    docx_path = create_task_docx(task, update_link, sender_name, sender_designation)

    task.task_pdf_path = pdf_path
    task.task_docx_path = docx_path

    try:
        send_task_assignment_email(
            smtp_setting=smtp_setting,
            task=task,
            to_emails=emails,
            update_link=update_link,
            pdf_path=pdf_path,
            docx_path=docx_path,
            sender_name=sender_name,
            sender_designation=sender_designation,
        )

        task.email_sent_at = datetime.utcnow()
        task.email_error = None

        db.commit()
        db.refresh(task)

        return {
            "success": True,
            "message": "Task email sent successfully.",
            "task_id": task.id,
            "email_subject": task.email_subject,
            "pdf_path": task.task_pdf_path,
            "docx_path": task.task_docx_path,
            "public_update_link": update_link,
        }

    except Exception as e:
        task.email_error = str(e)
        db.commit()

        raise HTTPException(status_code=400, detail=f"Task email failed: {str(e)}")


@router.post("/ai/deadline", response_model=schemas.AIDeadlineResponse)
def predict_deadline(
    req: schemas.AIDeadlineRequest,
    current_user: models.User = Depends(get_current_user),
):
    return predict_task_effort(req.title, req.description or "")


@router.get("/analytics/productivity", response_model=List[schemas.ProductivityItem])
def productivity_graph(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    tasks = (
        db.query(models.Task)
        .filter(
            models.Task.user_id == current_user.id,
            models.Task.status == "completed",
        )
        .all()
    )

    monthly = {}

    for task in tasks:
        key = task.updated_at.strftime("%b %Y")
        monthly[key] = monthly.get(key, 0) + 1

    return [{"month": month, "completed": count} for month, count in monthly.items()]


@router.get("/analytics/team-performance", response_model=List[schemas.TeamPerformanceItem])
def team_performance(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    rows = (
        db.query(models.Task.assigned_to, func.count(models.Task.id))
        .filter(
            models.Task.user_id == current_user.id,
            models.Task.parent_task_id.is_(None),
        )
        .group_by(models.Task.assigned_to)
        .all()
    )

    return [
        {
            "assigned_to": assigned_to or "Unassigned",
            "task_count": count,
        }
        for assigned_to, count in rows
    ]


@router.get("/calendar/list", response_model=List[schemas.TaskOut])
def calendar_tasks(
    start_date: str | None = None,
    end_date: str | None = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    tasks = (
        db.query(models.Task)
        .filter(
            models.Task.user_id == current_user.id,
            models.Task.parent_task_id.is_(None),
        )
        .all()
    )

    start = parse_due_date(start_date) if start_date else None
    end = parse_due_date(end_date) if end_date else None

    if not start and not end:
        return tasks

    result = []

    for task in tasks:
        due = parse_due_date(task.due_date)

        if not due:
            continue

        if start and due < start:
            continue

        if end and due > end:
            continue

        result.append(task)

    return result


@router.post("/from-email/{email_id}", response_model=schemas.TaskOut, status_code=201)
def create_task_from_email(
    email_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    email = (
        db.query(models.EmailHistory)
        .filter(
            models.EmailHistory.id == email_id,
            models.EmailHistory.user_id == current_user.id,
        )
        .first()
    )

    if not email:
        raise HTTPException(status_code=404, detail="Email not found")

    title = email.subject or f"Follow up with {email.recipient or 'recipient'}"

    task = models.Task(
        user_id=current_user.id,
        source_type="email",
        source_id=email.id,
        title=title,
        description=email.generated_email or email.context,
        assigned_to=current_user.full_name or current_user.username,
        priority="medium",
        status="pending",
        progress=0,
        public_update_token=uuid.uuid4().hex,
        reminder_message=build_reminder(title, current_user.full_name, "TBD", "medium"),
    )

    db.add(task)
    db.commit()
    db.refresh(task)

    return task


@router.post("/from-report/{report_id}", response_model=schemas.TaskOut, status_code=201)
def create_task_from_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    report = (
        db.query(models.ReportHistory)
        .filter(
            models.ReportHistory.id == report_id,
            models.ReportHistory.user_id == current_user.id,
        )
        .first()
    )

    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    task = models.Task(
        user_id=current_user.id,
        source_type="report",
        source_id=report.id,
        title=f"Follow up report: {report.team_name or 'Team Report'}",
        description=report.generated_report,
        assigned_to=current_user.full_name or current_user.username,
        priority="medium",
        status="pending",
        progress=0,
        public_update_token=uuid.uuid4().hex,
        reminder_message=build_reminder("Follow up report", current_user.full_name, "TBD", "medium"),
    )

    db.add(task)
    db.commit()
    db.refresh(task)

    return task


@router.post("/from-mom/{meeting_id}", response_model=schemas.TaskOut, status_code=201)
def create_task_from_mom(
    meeting_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    meeting = (
        db.query(models.MeetingHistory)
        .filter(
            models.MeetingHistory.id == meeting_id,
            models.MeetingHistory.user_id == current_user.id,
        )
        .first()
    )

    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting MOM not found")

    task = models.Task(
        user_id=current_user.id,
        source_type="mom",
        source_id=meeting.id,
        title=f"Action items from: {meeting.meeting_title or 'Meeting'}",
        description=meeting.generated_mom or meeting.raw_notes,
        assigned_to=current_user.full_name or current_user.username,
        priority="high",
        status="pending",
        progress=0,
        public_update_token=uuid.uuid4().hex,
        reminder_message=build_reminder("Action items from meeting", current_user.full_name, "TBD", "high"),
    )

    db.add(task)
    db.commit()
    db.refresh(task)

    return task