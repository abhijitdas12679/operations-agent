from datetime import datetime
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.auth import get_current_user
from app.crews.crew_manager import run_email_crew
from app.services.smtp_service import smtp_service
from app.services.excel_service import parse_bulk_email_excel

router = APIRouter(prefix="/email", tags=["Email"])


def get_sender_signature(current_user: models.User) -> str:
    sender_name = current_user.full_name or current_user.username
    sender_designation = current_user.designation or ""

    if sender_designation:
        return f"Best regards,\n{sender_name}\n{sender_designation}"

    return f"Best regards,\n{sender_name}"


def apply_sender_signature(email_body: str, current_user: models.User) -> str:
    signature = get_sender_signature(current_user)

    body = email_body.strip()

    closing_words = [
        "Best regards,",
        "Regards,",
        "Sincerely,",
        "Thank you,",
        "Thanks,",
    ]

    for closing in closing_words:
        idx = body.lower().rfind(closing.lower())
        if idx != -1:
            body = body[:idx].strip()
            break

    return f"{body}\n\n{signature}"


def generate_personalized_email(
    subject: str,
    name: str,
    designation: str,
    tone: str,
    context: str,
    current_user: models.User,
):
    personalized_context = f"""
Create a personalized professional email.

Recipient Name: {name}
Recipient Designation: {designation}
Subject: {subject}
Tone: {tone}

Main Context:
{context}

Important Rules:
- Start email with: Dear {name},
- Do not use Dear Sir/Madam.
- Mention or consider recipient designation naturally if useful.
- Keep email professional and human.
- Do not add fake company details.
- End with a professional closing.
"""

    generated = run_email_crew(
        subject,
        name,
        tone,
        personalized_context,
    )

    return apply_sender_signature(generated, current_user)


@router.post("/generate", response_model=schemas.EmailGenerateResponse, status_code=201)
def generate_email(
    req: schemas.EmailGenerateRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    try:
        generated = run_email_crew(
            req.subject,
            req.recipient,
            req.tone,
            req.context,
        )

        generated = apply_sender_signature(generated, current_user)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")

    record = models.EmailHistory(
        user_id=current_user.id,
        subject=req.subject,
        recipient=req.recipient,
        recipient_email=req.recipient_email,
        tone=req.tone,
        context=req.context,
        generated_email=generated,
        status="draft",
    )

    db.add(record)
    db.commit()
    db.refresh(record)

    return record


@router.post("/bulk/upload", response_model=schemas.BulkUploadResponse)
async def upload_bulk_excel_and_generate(
    subject: str = Form(...),
    tone: str = Form("professional"),
    context: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if not file.filename.lower().endswith((".xlsx", ".xlsm")):
        raise HTTPException(status_code=400, detail="Only Excel .xlsx or .xlsm file is allowed.")

    try:
        file_bytes = await file.read()
        recipients = parse_bulk_email_excel(file_bytes)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    batch_id = str(uuid4())
    created_records = []

    for recipient in recipients:
        try:
            generated = generate_personalized_email(
                subject=subject,
                name=recipient["name"],
                designation=recipient["designation"],
                tone=tone,
                context=context,
                current_user=current_user,
            )

            record = models.EmailHistory(
                user_id=current_user.id,
                subject=subject,
                recipient=recipient["name"],
                recipient_email=recipient["email"],
                designation=recipient["designation"],
                tone=tone,
                context=context,
                generated_email=generated,
                batch_id=batch_id,
                status="draft",
            )

        except Exception as e:
            record = models.EmailHistory(
                user_id=current_user.id,
                subject=subject,
                recipient=recipient["name"],
                recipient_email=recipient["email"],
                designation=recipient["designation"],
                tone=tone,
                context=context,
                generated_email="",
                batch_id=batch_id,
                status="failed",
                error_message=f"AI generation failed: {str(e)}",
            )

        db.add(record)
        db.flush()
        created_records.append(record)

    db.commit()

    for record in created_records:
        db.refresh(record)

    return {
        "total": len(created_records),
        "emails": created_records,
    }


@router.put("/history/{email_id}/content")
def update_email_content(
    email_id: int,
    req: schemas.EmailContentUpdateRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    record = db.query(models.EmailHistory).filter(
        models.EmailHistory.id == email_id,
        models.EmailHistory.user_id == current_user.id,
    ).first()

    if not record:
        raise HTTPException(status_code=404, detail="Email not found")

    if req.subject:
        record.subject = req.subject

    record.generated_email = req.generated_email
    record.status = "draft"
    record.error_message = None

    db.commit()
    db.refresh(record)

    return record


@router.post("/bulk/send")
def send_bulk_emails(
    emails: list[schemas.BulkSendItem],
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    smtp_setting = db.query(models.UserSMTPSetting).filter(
        models.UserSMTPSetting.user_id == current_user.id,
        models.UserSMTPSetting.is_active == 1,
    ).first()

    if not smtp_setting:
        raise HTTPException(
            status_code=400,
            detail="Please connect your email account from Email Settings before sending bulk emails."
        )

    email_ids = [item.id for item in emails]
    content_map = {item.id: item.generated_email for item in emails}

    records = db.query(models.EmailHistory).filter(
        models.EmailHistory.user_id == current_user.id,
        models.EmailHistory.id.in_(email_ids),
    ).all()

    if not records:
        raise HTTPException(status_code=404, detail="No emails found for sending.")

    sent_count = 0
    failed_count = 0
    results = []

    for record in records:
        edited_content = content_map.get(record.id)

        if edited_content:
            record.generated_email = edited_content

        if record.status == "sent":
            results.append({
                "id": record.id,
                "recipient_email": record.recipient_email,
                "status": "sent",
                "message": "Already sent",
            })
            continue

        if not record.generated_email:
            record.status = "failed"
            record.error_message = "Generated email content is empty."
            failed_count += 1
            results.append({
                "id": record.id,
                "recipient_email": record.recipient_email,
                "status": "failed",
                "message": record.error_message,
            })
            continue

        try:
            smtp_service.send_email(
                smtp_setting=smtp_setting,
                to_email=record.recipient_email,
                subject=record.subject,
                body=record.generated_email,
            )

            record.status = "sent"
            record.sent_time = datetime.utcnow()
            record.error_message = None
            sent_count += 1

            results.append({
                "id": record.id,
                "recipient_email": record.recipient_email,
                "status": "sent",
                "message": "Email sent successfully",
            })

        except Exception as e:
            record.status = "failed"
            record.error_message = str(e)
            failed_count += 1

            results.append({
                "id": record.id,
                "recipient_email": record.recipient_email,
                "status": "failed",
                "message": str(e),
            })

    db.commit()

    return {
        "total": len(records),
        "sent": sent_count,
        "failed": failed_count,
        "results": results,
    }


@router.post("/history/{email_id}/send")
def send_generated_email(
    email_id: int,
    req: schemas.EmailContentUpdateRequest | None = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    record = db.query(models.EmailHistory).filter(
        models.EmailHistory.id == email_id,
        models.EmailHistory.user_id == current_user.id,
    ).first()

    if not record:
        raise HTTPException(status_code=404, detail="Email not found")

    if req:
        if req.subject:
            record.subject = req.subject
        record.generated_email = req.generated_email

    smtp_setting = db.query(models.UserSMTPSetting).filter(
        models.UserSMTPSetting.user_id == current_user.id,
        models.UserSMTPSetting.is_active == 1,
    ).first()

    if not smtp_setting:
        raise HTTPException(
            status_code=400,
            detail="Please connect your email account from Email Settings before sending."
        )

    try:
        smtp_service.send_email(
            smtp_setting=smtp_setting,
            to_email=record.recipient_email,
            subject=record.subject,
            body=record.generated_email,
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
        "sent_time": record.sent_time,
        "error_message": record.error_message,
    }


@router.get("/history")
def get_email_history(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    records = (
        db.query(models.EmailHistory)
        .filter(models.EmailHistory.user_id == current_user.id)
        .order_by(models.EmailHistory.created_at.desc())
        .limit(100)
        .all()
    )
    return records


@router.get("/history/{email_id}")
def get_email_detail(
    email_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    record = db.query(models.EmailHistory).filter(
        models.EmailHistory.id == email_id,
        models.EmailHistory.user_id == current_user.id,
    ).first()

    if not record:
        raise HTTPException(status_code=404, detail="Email not found")

    return record