from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from app.database import get_db
from app import models, schemas
from app.auth import get_current_user
from app.crews.email_automation_crew import run_email_automation_crew, EMAIL_TEMPLATES
from app.services.smtp_service import smtp_service
from app.services.excel_service import parse_recipients_excel
from app.services.attachment_service import save_attachment

router = APIRouter(prefix="/email-automation", tags=["Email Automation"])

@router.get("/templates")
def templates():
    return [
        {
            "key": k,
            "name": v,
            "description": f"AI customized {v.lower()} template",
        }
        for k, v in EMAIL_TEMPLATES.items()
    ]

@router.post("/single/generate")
def generate_single(
    subject: str = Form(...),
    recipient_name: str = Form(...),
    recipient_email: str = Form(...),
    tone: str = Form("professional"),
    context: str = Form(...),
    template_type: str | None = Form(None),
    scheduled_at: datetime | None = Form(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    try:
        generated = run_email_automation_crew(
            subject=subject,
            recipient_name=recipient_name,
            recipient_email=recipient_email,
            tone=tone,
            context=context,
            template_type=template_type,
        )

        record = models.EmailHistory(
            user_id=current_user.id,
            subject=subject,
            recipient=recipient_name,
            recipient_name=recipient_name,
            recipient_email=recipient_email,
            tone=tone,
            context=context,
            template_type=template_type,
            generated_email=generated,
            status="scheduled" if scheduled_at else "draft",
            scheduled_at=scheduled_at,
        )

        db.add(record)
        db.commit()
        db.refresh(record)

        return record

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/single/{email_id}")
def update_single(
    email_id: int,
    subject: str | None = Form(None),
    generated_email: str | None = Form(None),
    scheduled_at: datetime | None = Form(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    record = (
        db.query(models.EmailHistory)
        .filter(
            models.EmailHistory.id == email_id,
            models.EmailHistory.user_id == current_user.id,
        )
        .first()
    )

    if not record:
        raise HTTPException(status_code=404, detail="Email not found")

    if subject is not None:
        record.subject = subject

    if generated_email is not None:
        record.generated_email = generated_email

    if scheduled_at is not None:
        record.scheduled_at = scheduled_at
        record.status = "scheduled"

    db.commit()
    db.refresh(record)

    return record

@router.post("/single/{email_id}/regenerate")
def regenerate_single(
    email_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    record = (
        db.query(models.EmailHistory)
        .filter(
            models.EmailHistory.id == email_id,
            models.EmailHistory.user_id == current_user.id,
        )
        .first()
    )

    if not record:
        raise HTTPException(status_code=404, detail="Email not found")

    record.generated_email = run_email_automation_crew(
        subject=record.subject,
        recipient_name=record.recipient_name or record.recipient or "Recipient",
        recipient_email=record.recipient_email or "",
        tone=record.tone or "professional",
        context=record.context or "",
        template_type=record.template_type,
    )

    record.status = "draft"

    db.commit()
    db.refresh(record)

    return record

@router.post("/single/{email_id}/attachments")
async def upload_single_attachment(
    email_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    record = (
        db.query(models.EmailHistory)
        .filter(
            models.EmailHistory.id == email_id,
            models.EmailHistory.user_id == current_user.id,
        )
        .first()
    )

    if not record:
        raise HTTPException(status_code=404, detail="Email not found")

    meta = await save_attachment(file)

    attachment = models.EmailAttachment(
        email_history_id=email_id,
        **meta,
    )

    db.add(attachment)
    db.commit()
    db.refresh(attachment)

    return {
        "id": attachment.id,
        "filename": attachment.original_filename,
    }

@router.post("/single/{email_id}/send")
def send_single(
    email_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    record = (
        db.query(models.EmailHistory)
        .options(joinedload(models.EmailHistory.attachments))
        .filter(
            models.EmailHistory.id == email_id,
            models.EmailHistory.user_id == current_user.id,
        )
        .first()
    )

    if not record:
        raise HTTPException(status_code=404, detail="Email not found")

    try:
        smtp_service.send_email(
            to_email=record.recipient_email,
            subject=record.subject,
            body=record.generated_email,
            attachments=[a.file_path for a in record.attachments],
        )

        record.status = "sent"
        record.sent_time = datetime.utcnow()
        record.error_message = None

    except Exception as e:
        record.status = "failed"
        record.error_message = str(e)

    db.commit()
    db.refresh(record)

    return {
        "id": record.id,
        "status": record.status,
        "message": "Email sent" if record.status == "sent" else record.error_message,
    }

@router.post("/bulk/upload")
async def bulk_upload(
    name: str = Form(...),
    subject: str = Form(...),
    tone: str = Form("professional"),
    context: str = Form(...),
    template_type: str | None = Form(None),
    scheduled_at: datetime | None = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if not (file.filename or "").lower().endswith((".xlsx", ".xlsm")):
        raise HTTPException(status_code=400, detail="Upload an Excel .xlsx file")

    try:
        recipients = parse_recipients_excel(await file.read())
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    campaign = models.EmailCampaign(
        user_id=current_user.id,
        name=name,
        subject=subject,
        tone=tone,
        context=context,
        template_type=template_type,
        scheduled_at=scheduled_at,
        status="scheduled" if scheduled_at else "draft",
        total_recipients=len(recipients),
    )

    db.add(campaign)
    db.flush()

    for r in recipients:
        generated = run_email_automation_crew(
            subject=subject,
            recipient_name=r["name"],
            recipient_email=r["email"],
            tone=tone,
            context=context,
            template_type=template_type,
            company=r.get("company"),
            designation=r.get("designation"),
        )

        db.add(
            models.EmailRecipient(
                campaign_id=campaign.id,
                name=r["name"],
                email=r["email"],
                company=r.get("company"),
                designation=r.get("designation"),
                generated_email=generated,
                status="scheduled" if scheduled_at else "draft",
            )
        )

    db.commit()

    return (
        db.query(models.EmailCampaign)
        .options(joinedload(models.EmailCampaign.recipients))
        .filter(models.EmailCampaign.id == campaign.id)
        .first()
    )

@router.get("/campaigns/{campaign_id}")
def get_campaign(
    campaign_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    campaign = (
        db.query(models.EmailCampaign)
        .options(joinedload(models.EmailCampaign.recipients))
        .filter(
            models.EmailCampaign.id == campaign_id,
            models.EmailCampaign.user_id == current_user.id,
        )
        .first()
    )

    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    return campaign

@router.post("/campaigns/{campaign_id}/send-all")
def send_campaign(
    campaign_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    campaign = (
        db.query(models.EmailCampaign)
        .options(joinedload(models.EmailCampaign.recipients))
        .filter(
            models.EmailCampaign.id == campaign_id,
            models.EmailCampaign.user_id == current_user.id,
        )
        .first()
    )

    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    sent = 0
    failed = 0

    for rec in campaign.recipients:
        try:
            smtp_service.send_email(
                to_email=rec.email,
                subject=campaign.subject,
                body=rec.generated_email or "",
            )

            rec.status = "sent"
            rec.sent_time = datetime.utcnow()
            rec.error_message = None
            sent += 1

        except Exception as e:
            rec.status = "failed"
            rec.error_message = str(e)
            failed += 1

        db.add(
            models.EmailHistory(
                user_id=current_user.id,
                campaign_id=campaign.id,
                recipient_id=rec.id,
                subject=campaign.subject,
                recipient=rec.name,
                recipient_name=rec.name,
                recipient_email=rec.email,
                tone=campaign.tone,
                template_type=campaign.template_type,
                context=campaign.context,
                generated_email=rec.generated_email or "",
                status=rec.status,
                sent_time=rec.sent_time,
                error_message=rec.error_message,
            )
        )

    campaign.sent_count = sent
    campaign.failed_count = failed
    campaign.status = "sent" if failed == 0 else "failed"

    db.commit()

    return {
        "campaign_id": campaign.id,
        "sent": sent,
        "failed": failed,
    }

@router.get("/history")
def history(
    status: str | None = None,
    search: str | None = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    query = db.query(models.EmailHistory).filter(
        models.EmailHistory.user_id == current_user.id
    )

    if status:
        query = query.filter(models.EmailHistory.status == status)

    if search:
        like = f"%{search}%"
        query = query.filter(
            (models.EmailHistory.subject.like(like))
            | (models.EmailHistory.recipient_email.like(like))
            | (models.EmailHistory.recipient_name.like(like))
        )

    return (
        query.order_by(models.EmailHistory.created_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

@router.delete("/history/{email_id}")
def delete_history(
    email_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    record = (
        db.query(models.EmailHistory)
        .filter(
            models.EmailHistory.id == email_id,
            models.EmailHistory.user_id == current_user.id,
        )
        .first()
    )

    if not record:
        raise HTTPException(status_code=404, detail="Email not found")

    db.delete(record)
    db.commit()

    return {"deleted": True}

@router.get("/analytics")
def analytics(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    base = db.query(models.EmailHistory).filter(
        models.EmailHistory.user_id == current_user.id
    )

    total = base.count()
    sent = base.filter(models.EmailHistory.status == "sent").count()
    failed = base.filter(models.EmailHistory.status == "failed").count()
    pending = base.filter(
        models.EmailHistory.status.in_(["draft", "pending", "scheduled"])
    ).count()

    def group(fmt: str):
        rows = (
            db.query(
                func.date_format(models.EmailHistory.created_at, fmt),
                func.count(models.EmailHistory.id),
            )
            .filter(models.EmailHistory.user_id == current_user.id)
            .group_by(func.date_format(models.EmailHistory.created_at, fmt))
            .order_by(func.date_format(models.EmailHistory.created_at, fmt))
            .all()
        )

        return [{"period": p, "count": c} for p, c in rows]

    return {
        "total_emails": total,
        "sent_emails": sent,
        "failed_emails": failed,
        "pending_emails": pending,
        "success_rate": round((sent / total) * 100, 2) if total else 0,
        "daily": group("%Y-%m-%d"),
        "weekly": group("%x-W%v"),
        "monthly": group("%Y-%m"),
    }