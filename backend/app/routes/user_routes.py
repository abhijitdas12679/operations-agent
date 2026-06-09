from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import get_current_user
from app import models, schemas

router = APIRouter(prefix="/user", tags=["User Profile"])


@router.get("/profile", response_model=schemas.UserProfileOut)
def get_profile(
    current_user: models.User = Depends(get_current_user),
):
    return current_user


@router.put("/profile", response_model=schemas.UserProfileOut)
def update_profile(
    payload: schemas.UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    email_changed = payload.email.lower() != current_user.email.lower()

    if email_changed:
        existing_email = db.query(models.User).filter(
            models.User.email == payload.email,
            models.User.id != current_user.id,
        ).first()

        if existing_email:
            raise HTTPException(
                status_code=400,
                detail="This email is already used by another user."
            )

    current_user.full_name = payload.full_name
    current_user.email = payload.email
    current_user.designation = payload.designation

    if email_changed:
        smtp_setting = db.query(models.UserSMTPSetting).filter(
            models.UserSMTPSetting.user_id == current_user.id
        ).first()

        if smtp_setting:
            db.delete(smtp_setting)

    db.commit()
    db.refresh(current_user)

    return current_user