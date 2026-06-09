import hashlib
import secrets
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.auth import hash_password, verify_password, create_access_token
from app.config import settings
from app.services.password_reset_email_service import send_password_reset_email

router = APIRouter(prefix="/auth", tags=["Auth"])


def _hash_reset_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


@router.post("/register")
def register(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(
        or_(
            models.User.username == user_data.username,
            models.User.email == user_data.email,
        )
    ).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="Username or email already registered")

    try:
        password_hash = hash_password(user_data.password)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    user = models.User(
        username=user_data.username.strip(),
        email=user_data.email.strip().lower(),
        full_name=user_data.full_name.strip(),
        designation=user_data.designation.strip(),
        hashed_password=password_hash,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "message": "User registered successfully",
        "user_id": user.id,
        "username": user.username,
        "email": user.email,
        "full_name": user.full_name,
        "designation": user.designation,
    }


@router.post("/login", response_model=schemas.TokenResponse)
def login(user_data: schemas.UserLogin, db: Session = Depends(get_db)):
    login_value = user_data.username.strip()

    user = db.query(models.User).filter(
        or_(
            models.User.username == login_value,
            models.User.email == login_value.lower(),
        )
    ).first()

    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid username/email or password")

    token = create_access_token(data={"sub": user.username})

    return {
        "access_token": token,
        "token_type": "bearer",
        "username": user.username,
    }


@router.post("/forgot-password")
def forgot_password(
    payload: schemas.ForgotPasswordRequest,
    db: Session = Depends(get_db),
):
    email = payload.email.strip().lower()

    user = db.query(models.User).filter(models.User.email == email).first()

    if not user:
        raise HTTPException(status_code=404, detail="This email is not registered.")

    raw_token = secrets.token_urlsafe(48)
    token_hash = _hash_reset_token(raw_token)

    expires_at = datetime.utcnow() + timedelta(
        minutes=settings.PASSWORD_RESET_TOKEN_EXPIRE_MINUTES
    )

    db.query(models.PasswordResetToken).filter(
        models.PasswordResetToken.user_id == user.id,
        models.PasswordResetToken.used_at.is_(None),
    ).delete()

    reset_record = models.PasswordResetToken(
        user_id=user.id,
        token_hash=token_hash,
        expires_at=expires_at,
    )

    db.add(reset_record)
    db.commit()

    reset_link = f"{settings.FRONTEND_URL}/reset-password?token={raw_token}"

    try:
        send_password_reset_email(user.email, reset_link)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Password reset email failed: {str(e)}")

    return {
        "success": True,
        "message": "Password reset link sent to your registered email.",
    }


@router.post("/reset-password")
def reset_password(
    payload: schemas.ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    token_hash = _hash_reset_token(payload.token)

    reset_record = db.query(models.PasswordResetToken).filter(
        models.PasswordResetToken.token_hash == token_hash,
        models.PasswordResetToken.used_at.is_(None),
    ).first()

    if not reset_record:
        raise HTTPException(status_code=400, detail="Reset link is invalid or already used.")

    if reset_record.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Reset link has expired.")

    user = db.query(models.User).filter(models.User.id == reset_record.user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    try:
        user.hashed_password = hash_password(payload.new_password)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    reset_record.used_at = datetime.utcnow()

    db.commit()

    return {
        "success": True,
        "message": "Password updated successfully. Please login with your new password.",
    }