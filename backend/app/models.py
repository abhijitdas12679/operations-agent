from datetime import datetime

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
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
        cascade="all, delete-orphan",
    )
    emails = relationship(
        "EmailHistory",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    reports = relationship(
        "ReportHistory",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    meetings = relationship(
        "MeetingHistory",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    tasks = relationship(
        "Task",
        back_populates="user",
        cascade="all, delete-orphan",
        foreign_keys="Task.user_id",
    )
    exports = relationship(
        "DocumentExport",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    reset_tokens = relationship(
        "PasswordResetToken",
        back_populates="user",
        cascade="all, delete-orphan",
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

    subject = Column(String(300), nullable=True)
    recipient = Column(String(200), nullable=True)
    recipient_email = Column(String(255), nullable=True)
    designation = Column(String(200), nullable=True)

    tone = Column(String(50), nullable=True)
    context = Column(Text, nullable=True)
    generated_email = Column(Text, nullable=True)

    batch_id = Column(String(100), nullable=True)
    status = Column(String(30), default="draft")
    sent_time = Column(DateTime, nullable=True)
    error_message = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="emails")


class ReportHistory(Base):
    __tablename__ = "report_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    date = Column(String(20), nullable=True)
    team_name = Column(String(200), nullable=True)
    tasks_completed = Column(Text, nullable=True)
    blockers = Column(Text, nullable=True)
    generated_report = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="reports")


class MeetingHistory(Base):
    __tablename__ = "meeting_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    meeting_title = Column(String(300), nullable=True)
    attendees = Column(Text, nullable=True)
    raw_notes = Column(Text, nullable=True)
    generated_mom = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="meetings")


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    parent_task_id = Column(Integer, ForeignKey("tasks.id"), nullable=True)

    source_type = Column(String(50), nullable=True)
    source_id = Column(Integer, nullable=True)

    title = Column(String(300), nullable=False)
    description = Column(Text, nullable=True)

    assigned_to = Column(String(500), nullable=True)
    assignees = Column(Text, nullable=True)
    assignee_emails = Column(Text, nullable=True)

    priority = Column(String(20), default="medium")
    status = Column(String(40), default="pending")
    progress = Column(Integer, default=0)

    due_date = Column(String(20), nullable=True)
    estimated_effort = Column(String(100), nullable=True)
    reminder_message = Column(Text, nullable=True)

    professional_description = Column(Text, nullable=True)
    email_subject = Column(String(300), nullable=True)
    public_update_token = Column(String(255), unique=True, index=True, nullable=True)

    recurrence = Column(String(40), default="none")
    recurrence_anchor = Column(String(20), nullable=True)

    task_pdf_path = Column(String(500), nullable=True)
    task_docx_path = Column(String(500), nullable=True)
    email_sent_at = Column(DateTime, nullable=True)
    email_error = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship(
        "User",
        back_populates="tasks",
        foreign_keys=[user_id],
    )

    parent = relationship(
        "Task",
        remote_side=[id],
        back_populates="subtasks",
    )

    subtasks = relationship(
        "Task",
        back_populates="parent",
        cascade="all, delete-orphan",
        single_parent=True,
    )

    comments = relationship(
        "TaskComment",
        back_populates="task",
        cascade="all, delete-orphan",
    )

    attachments = relationship(
        "TaskAttachment",
        back_populates="task",
        cascade="all, delete-orphan",
    )

    checklist_items = relationship(
        "TaskChecklistItem",
        back_populates="task",
        cascade="all, delete-orphan",
    )

    external_updates = relationship(
        "TaskExternalUpdate",
        back_populates="task",
        cascade="all, delete-orphan",
    )

    @property
    def completion_percentage(self):
        checklist = self.checklist_items or []
        subtasks = self.subtasks or []

        total = len(checklist) + len(subtasks)

        if total == 0:
            return self.progress or 0

        completed_checklist = len([item for item in checklist if item.is_completed])
        completed_subtasks = len(
            [
                subtask
                for subtask in subtasks
                if subtask.status == "completed" or int(subtask.progress or 0) >= 100
            ]
        )

        return round(((completed_checklist + completed_subtasks) / total) * 100)


class TaskComment(Base):
    __tablename__ = "task_comments"

    id = Column(Integer, primary_key=True, index=True)

    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    author_name = Column(String(200), nullable=True)
    comment = Column(Text, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)

    task = relationship("Task", back_populates="comments")


class TaskAttachment(Base):
    __tablename__ = "task_attachments"

    id = Column(Integer, primary_key=True, index=True)

    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    filename = Column(String(255), nullable=False)
    stored_filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)

    content_type = Column(String(120), nullable=True)
    size_bytes = Column(Integer, default=0)

    created_at = Column(DateTime, default=datetime.utcnow)

    task = relationship("Task", back_populates="attachments")


class TaskChecklistItem(Base):
    __tablename__ = "task_checklist_items"

    id = Column(Integer, primary_key=True, index=True)

    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False)

    parent_checklist_id = Column(
        Integer,
        ForeignKey("task_checklist_items.id"),
        nullable=True,
    )

    title = Column(String(300), nullable=False)
    is_completed = Column(Integer, default=0)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    task = relationship(
        "Task",
        back_populates="checklist_items",
    )

    parent = relationship(
        "TaskChecklistItem",
        remote_side=[id],
        back_populates="children",
    )

    children = relationship(
        "TaskChecklistItem",
        back_populates="parent",
        cascade="all, delete-orphan",
        single_parent=True,
    )


class TaskExternalUpdate(Base):
    __tablename__ = "task_external_updates"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False)

    updater_name = Column(String(200), nullable=True)
    updater_email = Column(String(255), nullable=True)

    progress = Column(Integer, default=0)
    comment = Column(Text, nullable=True)

    proof_filename = Column(String(255), nullable=True)
    proof_file_path = Column(String(500), nullable=True)
    proof_content_type = Column(String(120), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    task = relationship("Task", back_populates="external_updates")


class DocumentExport(Base):
    __tablename__ = "document_exports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    doc_type = Column(String(50), nullable=True)
    export_format = Column(String(10), nullable=True)
    file_path = Column(String(500), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="exports")