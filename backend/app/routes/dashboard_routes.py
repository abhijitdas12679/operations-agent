from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.auth import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=schemas.DashboardStats)
def get_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    uid = current_user.id

    total_emails = db.query(models.EmailHistory).filter(models.EmailHistory.user_id == uid).count()
    total_reports = db.query(models.ReportHistory).filter(models.ReportHistory.user_id == uid).count()
    total_meetings = db.query(models.MeetingHistory).filter(models.MeetingHistory.user_id == uid).count()
    total_tasks = db.query(models.Task).filter(models.Task.user_id == uid).count()
    pending_tasks = db.query(models.Task).filter(
        models.Task.user_id == uid, models.Task.status == "pending"
    ).count()
    done_tasks = db.query(models.Task).filter(
        models.Task.user_id == uid, models.Task.status == "done"
    ).count()

    recent_emails = [
        {"id": r.id, "subject": r.subject, "recipient": r.recipient,
         "created_at": r.created_at.isoformat()}
        for r in db.query(models.EmailHistory)
        .filter(models.EmailHistory.user_id == uid)
        .order_by(models.EmailHistory.created_at.desc()).limit(5).all()
    ]
    recent_reports = [
        {"id": r.id, "team_name": r.team_name, "date": r.date,
         "created_at": r.created_at.isoformat()}
        for r in db.query(models.ReportHistory)
        .filter(models.ReportHistory.user_id == uid)
        .order_by(models.ReportHistory.created_at.desc()).limit(5).all()
    ]
    recent_meetings = [
        {"id": r.id, "meeting_title": r.meeting_title,
         "created_at": r.created_at.isoformat()}
        for r in db.query(models.MeetingHistory)
        .filter(models.MeetingHistory.user_id == uid)
        .order_by(models.MeetingHistory.created_at.desc()).limit(5).all()
    ]

    return {
        "total_emails": total_emails,
        "total_reports": total_reports,
        "total_meetings": total_meetings,
        "total_tasks": total_tasks,
        "pending_tasks": pending_tasks,
        "done_tasks": done_tasks,
        "recent_emails": recent_emails,
        "recent_reports": recent_reports,
        "recent_meetings": recent_meetings,
    }
