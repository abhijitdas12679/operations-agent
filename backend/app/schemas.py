from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    full_name: str
    designation: str
    password: str = Field(min_length=6, max_length=72)


class UserLogin(BaseModel):
    username: str
    password: str = Field(min_length=1, max_length=72)


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=6, max_length=72)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str


class UserOut(BaseModel):
    id: int
    username: str
    email: str
    full_name: Optional[str]
    designation: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class UserProfileUpdate(BaseModel):
    full_name: str
    email: EmailStr
    designation: str


class UserProfileOut(BaseModel):
    id: int
    username: str
    email: str
    full_name: Optional[str]
    designation: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class EmailGenerateRequest(BaseModel):
    subject: str
    recipient: str
    recipient_email: EmailStr
    tone: Optional[str] = "professional"
    context: str


class EmailContentUpdateRequest(BaseModel):
    subject: Optional[str] = None
    generated_email: str


class BulkSendItem(BaseModel):
    id: int
    subject: Optional[str] = None
    generated_email: str


class EmailGenerateResponse(BaseModel):
    id: int
    subject: Optional[str]
    recipient: Optional[str]
    recipient_email: Optional[str]
    designation: Optional[str]
    generated_email: str
    status: Optional[str]
    sent_time: Optional[datetime]
    error_message: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class BulkRecipientPreview(BaseModel):
    id: int
    subject: str
    recipient: str
    recipient_email: str
    designation: Optional[str]
    generated_email: str
    status: str
    error_message: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class BulkUploadResponse(BaseModel):
    total: int
    emails: List[BulkRecipientPreview]


class ReportGenerateRequest(BaseModel):
    date: str
    team_name: str
    tasks_completed: str
    blockers: Optional[str] = "None"


class ReportGenerateResponse(BaseModel):
    id: int
    generated_report: str
    created_at: datetime

    class Config:
        from_attributes = True


class MeetingMOMRequest(BaseModel):
    meeting_title: str
    attendees: str
    raw_notes: str


class MeetingMOMResponse(BaseModel):
    id: int
    generated_mom: str
    created_at: datetime

    class Config:
        from_attributes = True


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    assigned_to: Optional[str] = ""
    priority: Optional[str] = "medium"
    due_date: Optional[str] = ""


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    assigned_to: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    due_date: Optional[str] = None


class TaskOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    assigned_to: Optional[str]
    priority: str
    status: str
    due_date: Optional[str]
    reminder_message: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ExportRequest(BaseModel):
    content_id: int
    doc_type: str
    export_format: str


class ExportResponse(BaseModel):
    file_path: str
    download_url: str


class DashboardStats(BaseModel):
    total_emails: int
    total_reports: int
    total_meetings: int
    total_tasks: int
    pending_tasks: int
    done_tasks: int
    recent_emails: List[dict]
    recent_reports: List[dict]
    recent_meetings: List[dict]