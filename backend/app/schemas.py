from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, EmailStr, Field


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
    tone: str = "professional"
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


TASK_STATUSES = [
    "pending",
    "in_progress",
    "waiting_approval",
    "blocked",
    "completed",
    "cancelled",
]

TASK_PRIORITIES = [
    "low",
    "medium",
    "high",
    "critical",
]


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    assigned_to: Optional[str] = ""

    assignees: List[str] = []
    assignee_emails: List[EmailStr] = []

    priority: str = "medium"
    status: str = "pending"
    progress: int = 0

    due_date: Optional[str] = None
    recurrence: str = "none"


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    assigned_to: Optional[str] = None

    assignees: Optional[List[str]] = None
    assignee_emails: Optional[List[EmailStr]] = None

    priority: Optional[str] = None
    status: Optional[str] = None
    progress: Optional[int] = None

    due_date: Optional[str] = None
    estimated_effort: Optional[str] = None
    recurrence: Optional[str] = None


class TaskCommentCreate(BaseModel):
    comment: str


class TaskCommentOut(BaseModel):
    id: int
    author_name: Optional[str]
    comment: str
    created_at: datetime

    class Config:
        from_attributes = True


class TaskAttachmentOut(BaseModel):
    id: int
    filename: str
    file_path: str
    content_type: Optional[str]
    size_bytes: int
    created_at: datetime

    class Config:
        from_attributes = True


class TaskChecklistItemOut(BaseModel):
    id: int
    task_id: int
    parent_checklist_id: Optional[int] = None
    title: str
    is_completed: int
    created_at: datetime
    updated_at: datetime
    children: List["TaskChecklistItemOut"] = []

    class Config:
        from_attributes = True


class TaskExternalUpdateOut(BaseModel):
    id: int
    updater_name: Optional[str]
    updater_email: Optional[str]
    progress: int
    comment: Optional[str]
    proof_filename: Optional[str]
    proof_file_path: Optional[str]
    proof_content_type: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class SubTaskOut(BaseModel):
    id: int
    title: str
    status: str
    progress: int
    due_date: Optional[str] = None

    class Config:
        from_attributes = True


class TaskOut(BaseModel):
    id: int

    title: str
    description: Optional[str]
    professional_description: Optional[str]

    assigned_to: Optional[str]
    assignees: Optional[str]
    assignee_emails: Optional[str]

    priority: str
    status: str
    progress: int

    due_date: Optional[str]
    estimated_effort: Optional[str]
    reminder_message: Optional[str]
    recurrence: Optional[str]

    email_subject: Optional[str]
    public_update_token: Optional[str]
    task_pdf_path: Optional[str]
    task_docx_path: Optional[str]
    email_sent_at: Optional[datetime]
    email_error: Optional[str]

    source_type: Optional[str]
    source_id: Optional[int]

    created_at: datetime
    updated_at: datetime

    comments: List[TaskCommentOut] = []
    attachments: List[TaskAttachmentOut] = []
    subtasks: List[SubTaskOut] = []
    checklist_items: List[TaskChecklistItemOut] = []
    external_updates: List[TaskExternalUpdateOut] = []

    class Config:
        from_attributes = True


class SendTaskEmailRequest(BaseModel):
    task_id: int


class SendTaskEmailResponse(BaseModel):
    success: bool
    message: str
    task_id: int
    email_subject: Optional[str]
    pdf_path: Optional[str]
    docx_path: Optional[str]
    public_update_link: Optional[str]


class PublicTaskChecklistUpdate(BaseModel):
    item_id: int
    is_completed: int


class PublicSubTaskUpdate(BaseModel):
    subtask_id: int
    status: str = "pending"
    progress: int = 0


class PublicTaskUpdateRequest(BaseModel):
    updater_name: Optional[str] = ""
    updater_email: Optional[EmailStr] = None
    comment: Optional[str] = ""
    checklist: List[PublicTaskChecklistUpdate] = []
    subtasks: List[PublicSubTaskUpdate] = []


class PublicTaskOut(BaseModel):
    id: int
    title: str
    professional_description: Optional[str]
    priority: str
    status: str
    progress: int
    due_date: Optional[str]
    assignees: Optional[str]
    checklist_items: List[TaskChecklistItemOut] = []
    subtasks: List[SubTaskOut] = []
    external_updates: List[TaskExternalUpdateOut] = []

    class Config:
        from_attributes = True


class AITaskBreakdownRequest(BaseModel):
    title: str
    description: Optional[str] = ""


class AIDeadlineRequest(BaseModel):
    title: str
    description: Optional[str] = ""


class AIDeadlineResponse(BaseModel):
    estimated_effort: str
    suggested_deadline: str


class DailySummaryResponse(BaseModel):
    completed: List[str]
    pending: List[str]
    overdue: List[str]
    updates_today: List[str] = []


class MOMTaskCreateRequest(BaseModel):
    meeting_id: int


class EmailTaskCreateRequest(BaseModel):
    email_id: int


class ReportTaskCreateRequest(BaseModel):
    report_id: int


class TaskAnalytics(BaseModel):
    total_tasks: int
    pending_tasks: int
    in_progress_tasks: int
    completed_tasks: int
    blocked_tasks: int
    overdue_tasks: int
    completion_rate: float


class ProductivityItem(BaseModel):
    month: str
    completed: int


class TeamPerformanceItem(BaseModel):
    assigned_to: str
    task_count: int


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


class ExportRequest(BaseModel):
    content_id: int
    doc_type: str
    export_format: str


class ExportResponse(BaseModel):
    file_path: str
    download_url: str