from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy.orm import joinedload
from app.database import SessionLocal
from app import models
from app.services.smtp_service import smtp_service

scheduler = BackgroundScheduler(timezone="UTC")

def send_due_scheduled_emails():
    db = SessionLocal()

    try:
        due_emails = (
            db.query(models.EmailHistory)
            .options(joinedload(models.EmailHistory.attachments))
            .filter(
                models.EmailHistory.status == "scheduled",
                models.EmailHistory.scheduled_at <= datetime.utcnow(),
            )
            .all()
        )

        for record in due_emails:
            try:
                smtp_service.send_email(
                    record.recipient_email,
                    record.subject,
                    record.generated_email,
                    [a.file_path for a in record.attachments],
                )
                record.status = "sent"
                record.sent_time = datetime.utcnow()
                record.error_message = None
            except Exception as e:
                record.status = "failed"
                record.error_message = str(e)

        due_campaigns = (
            db.query(models.EmailCampaign)
            .options(joinedload(models.EmailCampaign.recipients))
            .filter(
                models.EmailCampaign.status == "scheduled",
                models.EmailCampaign.scheduled_at <= datetime.utcnow(),
            )
            .all()
        )

        for campaign in due_campaigns:
            sent = 0
            failed = 0

            for rec in campaign.recipients:
                try:
                    smtp_service.send_email(
                        rec.email,
                        campaign.subject,
                        rec.generated_email or "",
                    )
                    rec.status = "sent"
                    rec.sent_time = datetime.utcnow()
                    rec.error_message = None
                    sent += 1
                except Exception as e:
                    rec.status = "failed"
                    rec.error_message = str(e)
                    failed += 1

            campaign.sent_count = sent
            campaign.failed_count = failed
            campaign.status = "sent" if failed == 0 else "failed"

        db.commit()

    finally:
        db.close()

def start_scheduler():
    if not scheduler.running:
        scheduler.add_job(
            send_due_scheduled_emails,
            "interval",
            minutes=1,
            id="scheduled_email_sender",
            replace_existing=True,
        )
        scheduler.start()

def shutdown_scheduler():
    if scheduler.running:
        scheduler.shutdown()