from datetime import datetime

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True, nullable=False)
    email = Column(String(200), unique=True, index=True, nullable=False)
    full_name = Column(String(200), nullable=True)
    designation = Column(String(200), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    smtp_setting = relationship(
        "UserSMTPSetting",
        back_populates="user",
        uselist=False,
        cascade="all, delete",
    )
    emails = relationship("EmailHistory", back_populates="user", cascade="all, delete")
    reports = relationship("ReportHistory", back_populates="user", cascade="all, delete")
    meetings = relationship("MeetingHistory", back_populates="user", cascade="all, delete")
    tasks = relationship("Task", back_populates="user", cascade="all, delete")
    exports = relationship("DocumentExport", back_populates="user", cascade="all, delete")
    reset_tokens = relationship(
        "PasswordResetToken",
        back_populates="user",
        cascade="all, delete",
    )


class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    token_hash = Column(String(255), unique=True, index=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    used_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="reset_tokens")


class UserSMTPSetting(Base):
    __tablename__ = "user_smtp_settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)

    provider = Column(String(50), default="gmail")
    smtp_host = Column(String(200), nullable=False, default="smtp.gmail.com")
    smtp_port = Column(Integer, nullable=False, default=587)
    smtp_email = Column(String(255), nullable=False)
    encrypted_app_password = Column(Text, nullable=False)
    from_name = Column(String(200), nullable=True)
    is_active = Column(Integer, default=1)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="smtp_setting")


class EmailHistory(Base):
    __tablename__ = "email_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    subject = Column(String(300))
    recipient = Column(String(200))
    recipient_email = Column(String(255))
    designation = Column(String(200), nullable=True)

    tone = Column(String(50))
    context = Column(Text)
    generated_email = Column(Text)

    batch_id = Column(String(100), nullable=True)
    status = Column(
        Enum(
            "draft",
            "sent",
            "failed",
            name="email_status_enum",
        ),
        default="draft",
    )
    sent_time = Column(DateTime, nullable=True)
    error_message = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="emails")


class ReportHistory(Base):
    __tablename__ = "report_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(String(20))
    team_name = Column(String(200))
    tasks_completed = Column(Text)
    blockers = Column(Text)
    generated_report = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="reports")


class MeetingHistory(Base):
    __tablename__ = "meeting_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    meeting_title = Column(String(300))
    attendees = Column(Text)
    raw_notes = Column(Text)
    generated_mom = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="meetings")


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    title = Column(String(300), nullable=False)
    description = Column(Text)
    assigned_to = Column(String(200))

    priority = Column(
        Enum(
            "low",
            "medium",
            "high",
            name="task_priority_enum",
        ),
        default="medium",
    )

    status = Column(
        Enum(
            "pending",
            "in_progress",
            "done",
            name="task_status_enum",
        ),
        default="pending",
    )

    due_date = Column(String(20))
    reminder_message = Column(Text)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="tasks")


class DocumentExport(Base):
    __tablename__ = "document_exports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    doc_type = Column(String(50))
    export_format = Column(String(10))
    file_path = Column(String(500))

    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="exports")