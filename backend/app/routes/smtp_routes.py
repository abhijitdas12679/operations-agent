from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app import models
from app.auth import get_current_user
from app.database import get_db
from app.services.encryption_service import encrypt_text
from app.services.smtp_service import smtp_service

router = APIRouter(prefix="/smtp", tags=["User SMTP"])


class SMTPConnectRequest(BaseModel):
    provider: str = "gmail"
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_email: EmailStr
    app_password: str
    from_name: str | None = None


class SMTPTestRequest(BaseModel):
    to_email: EmailStr | None = None


def validate_smtp_payload(payload: SMTPConnectRequest):
    provider = payload.provider.lower().strip()
    smtp_host = payload.smtp_host.lower().strip()
    smtp_port = int(payload.smtp_port)

    if provider not in ["gmail", "outlook", "custom"]:
        raise HTTPException(
            status_code=400,
            detail="Provider must be gmail, outlook, or custom.",
        )

    if provider == "gmail":
        if smtp_host != "smtp.gmail.com":
            raise HTTPException(
                status_code=400,
                detail="For Gmail, SMTP host must be smtp.gmail.com.",
            )

        if smtp_port not in [587, 465]:
            raise HTTPException(
                status_code=400,
                detail="For Gmail, SMTP port must be 587 or 465.",
            )

    if provider == "outlook":
        if smtp_host != "smtp.office365.com":
            raise HTTPException(
                status_code=400,
                detail="For Outlook, SMTP host must be smtp.office365.com.",
            )

        if smtp_port != 587:
            raise HTTPException(
                status_code=400,
                detail="For Outlook, SMTP port must be 587.",
            )

    if not payload.app_password or len(payload.app_password.strip()) < 8:
        raise HTTPException(
            status_code=400,
            detail="App password is required.",
        )


@router.post("/connect")
def connect_smtp(
    payload: SMTPConnectRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    validate_smtp_payload(payload)

    if payload.smtp_email.lower().strip() != current_user.email.lower().strip():
        raise HTTPException(
            status_code=400,
            detail="SMTP email must match your registered email address.",
        )

    setting = (
        db.query(models.UserSMTPSetting)
        .filter(models.UserSMTPSetting.user_id == current_user.id)
        .first()
    )

    encrypted_password = encrypt_text(payload.app_password.strip())

    if setting:
        setting.provider = payload.provider.lower().strip()
        setting.smtp_host = payload.smtp_host.lower().strip()
        setting.smtp_port = int(payload.smtp_port)
        setting.smtp_email = payload.smtp_email.lower().strip()
        setting.encrypted_app_password = encrypted_password
        setting.from_name = payload.from_name or current_user.full_name
        setting.is_active = 1
    else:
        setting = models.UserSMTPSetting(
            user_id=current_user.id,
            provider=payload.provider.lower().strip(),
            smtp_host=payload.smtp_host.lower().strip(),
            smtp_port=int(payload.smtp_port),
            smtp_email=payload.smtp_email.lower().strip(),
            encrypted_app_password=encrypted_password,
            from_name=payload.from_name or current_user.full_name,
            is_active=1,
        )
        db.add(setting)

    db.commit()
    db.refresh(setting)

    return {
        "id": setting.id,
        "provider": setting.provider,
        "smtp_host": setting.smtp_host,
        "smtp_port": setting.smtp_port,
        "smtp_email": setting.smtp_email,
        "from_name": setting.from_name,
        "is_active": setting.is_active,
        "message": "SMTP account connected successfully.",
    }


@router.get("/me")
def get_my_smtp(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    setting = (
        db.query(models.UserSMTPSetting)
        .filter(models.UserSMTPSetting.user_id == current_user.id)
        .first()
    )

    if not setting:
        return None

    return {
        "id": setting.id,
        "provider": setting.provider,
        "smtp_host": setting.smtp_host,
        "smtp_port": setting.smtp_port,
        "smtp_email": setting.smtp_email,
        "from_name": setting.from_name,
        "is_active": setting.is_active,
    }


@router.post("/test")
def test_smtp(
    payload: SMTPTestRequest | None = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    setting = (
        db.query(models.UserSMTPSetting)
        .filter(
            models.UserSMTPSetting.user_id == current_user.id,
            models.UserSMTPSetting.is_active == 1,
        )
        .first()
    )

    if not setting:
        raise HTTPException(status_code=400, detail="Email account is not connected.")

    to_email = payload.to_email if payload and payload.to_email else current_user.email

    sender_name = current_user.full_name or current_user.username
    sender_designation = current_user.designation or "Operations Team"

    try:
        smtp_service.send_email(
            smtp_setting=setting,
            to_email=str(to_email),
            subject="SMTP Test Email - Operations Agent",
            body=(
                f"Hello,\n\n"
                f"Your email account is connected successfully with Operations Agent.\n\n"
                f"Sender:\n"
                f"{sender_name}\n"
                f"{sender_designation}\n\n"
                f"Best regards,\n"
                f"{sender_name}\n"
                f"{sender_designation}"
            ),
        )

        return {
            "success": True,
            "message": "Test email sent successfully.",
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/disconnect")
def disconnect_smtp(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    setting = (
        db.query(models.UserSMTPSetting)
        .filter(models.UserSMTPSetting.user_id == current_user.id)
        .first()
    )

    if not setting:
        raise HTTPException(status_code=404, detail="SMTP setting not found.")

    db.delete(setting)
    db.commit()

    return {
        "success": True,
        "message": "Email account disconnected.",
    }