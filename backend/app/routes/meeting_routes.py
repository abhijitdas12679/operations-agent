import json
import re
from datetime import datetime
from io import BytesIO
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from openpyxl import load_workbook
from docx import Document

from app.database import get_db
from app import models, schemas
from app.auth import get_current_user
from app.crews.crew_manager import run_meeting_crew
from app.tools.pdf_tool import export_to_pdf
from app.services.document_export_service import convert_docx_to_pdf
from app.services.smtp_service import smtp_service
from app.services.mom_docx_template_service import build_basic_mom_docx_from_template
from app.utils.helpers import get_download_url

router = APIRouter(prefix="/meeting", tags=["Meeting"])

APP_DIR = Path(__file__).resolve().parents[1]
MOM_TEMPLATE_DIR = APP_DIR / "template_files" / "mom"


def sanitize_mom_html(html: str = "") -> str:
    if not html:
        return ""

    html = html.strip()
    html = re.sub(r"<\s*script[^>]*>.*?<\s*/\s*script\s*>", "", html, flags=re.I | re.S)
    html = re.sub(r"<\s*style[^>]*>.*?<\s*/\s*style\s*>", "", html, flags=re.I | re.S)
    html = re.sub(r"\son\w+\s*=\s*(['\"]).*?\1", "", html, flags=re.I | re.S)
    html = re.sub(r"javascript\s*:", "", html, flags=re.I)
    html = html.replace("```html", "").replace("```", "").replace("---", "")
    html = html.replace("**", "").replace("###", "").replace("##", "").replace("#", "")
    return html.strip()


def validate_mom_template_file(filename: str) -> Path:
    if not filename:
        raise HTTPException(status_code=400, detail="Selected MOM template file is required")

    MOM_TEMPLATE_DIR.mkdir(parents=True, exist_ok=True)

    base = MOM_TEMPLATE_DIR.resolve()
    file_path = (MOM_TEMPLATE_DIR / filename).resolve()

    if file_path.parent != base:
        raise HTTPException(status_code=400, detail="Invalid MOM template file path")

    if file_path.suffix.lower() != ".docx":
        raise HTTPException(status_code=400, detail="Only .docx MOM templates are allowed")

    if not file_path.exists() or not file_path.is_file():
        raise HTTPException(status_code=404, detail="Selected MOM template file not found")

    return file_path


def read_mom_template_docx(filename: str | None) -> str:
    if not filename:
        return ""

    file_path = validate_mom_template_file(filename)

    try:
        doc = Document(str(file_path))
        lines = []

        for paragraph in doc.paragraphs:
            text = paragraph.text.strip()
            if text:
                lines.append(text)

        for table in doc.tables:
            for row in table.rows:
                row_text = []
                for cell in row.cells:
                    text = cell.text.strip()
                    if text:
                        row_text.append(text)
                if row_text:
                    lines.append(" | ".join(row_text))

        return "\n".join(lines).strip()

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unable to read selected MOM template: {str(e)}")


def text_to_lines(value: str = "") -> list[str]:
    if not value:
        return []

    parts = re.split(r"\n|;|\|", str(value))
    cleaned = []

    for item in parts:
        item = item.strip(" -•\t")
        if item:
            cleaned.append(item)

    return cleaned


def detect_required_sections(raw_notes: str) -> dict:
    text = (raw_notes or "").lower()
    lines = text_to_lines(raw_notes)

    return {
        "project_overview": bool(raw_notes.strip()),
        "roles": any(k in text for k in ["role", "responsibility", "owner", "assigned", "resource"]),
        "milestones": any(k in text for k in ["milestone", "timeline", "target date", "phase", "sprint", "deadline"]),
        "communication_plan": "communication" in text or "sync" in text or "channel" in text,
        "decisions": any(k in text for k in ["decision", "decided", "approved", "finalized", "agreed", "confirmed"]),
        "actions": any(k in text for k in ["action", "task", "assigned", "owner", "deadline", "follow up", "next step"]) or len(lines) > 0,
        "risks": any(k in text for k in ["risk", "dependency", "blocker", "issue", "challenge", "concern"]),
        "next_steps": "next" in text or len(lines) > 0,
        "closing": True,
    }


def build_clean_generated_mom_html(
    meeting_title: str,
    attendees: str,
    raw_notes: str,
    meeting_date: str,
    prepared_by: str,
    generated: str = "",
) -> str:
    required = detect_required_sections(raw_notes)
    lines = text_to_lines(raw_notes)

    overview = raw_notes.strip() or generated.strip() or "The meeting discussion was documented based on the provided notes."
    first_line = lines[0] if lines else overview

    html = f"""
<section>
  <h2>Minutes of Meeting</h2>
  <p><strong>Meeting Title:</strong> {meeting_title}</p>
  <p><strong>Date:</strong> <strong>{meeting_date}</strong></p>
  <p><strong>Time:</strong> <strong>To be confirmed</strong></p>
  <p><strong>Location / Platform:</strong> <strong>To be confirmed</strong></p>
  <p><strong>Attendees:</strong> {attendees}</p>
  <p><strong>Prepared By:</strong> <strong>{prepared_by}</strong></p>
</section>
""".strip()

    if required["project_overview"]:
        html += f"""
<section>
  <h3>Project Overview</h3>
  <p>{overview}</p>
</section>
"""

    if required["roles"]:
        html += "<section><h3>Roles & Responsibilities</h3><ul>"
        for line in lines[:3]:
            html += f"<li>{line}</li>"
        html += "</ul></section>"

    if required["milestones"]:
        html += "<section><h3>Key Milestones & Timeline</h3><ul>"
        for line in lines[:3]:
            html += f"<li>{line}</li>"
        html += "</ul></section>"

    if required["communication_plan"]:
        html += """
<section>
  <h3>Communication Plan</h3>
  <p>The team will coordinate through agreed communication channels and regular updates.</p>
</section>
"""

    if required["decisions"]:
        html += "<section><h3>Decisions Taken</h3><ol>"
        decision_lines = [
            line for line in lines
            if any(word in line.lower() for word in ["decision", "decided", "approved", "finalized", "agreed", "confirmed"])
        ] or [first_line]
        for line in decision_lines:
            html += f"<li>{line}</li>"
        html += "</ol></section>"

    if required["actions"]:
        html += "<section><h3>Action Items</h3><ol>"
        for line in lines[:5]:
            html += f"<li>{line}</li>"
        html += "</ol></section>"

    if required["risks"]:
        html += "<section><h3>Risks / Dependencies</h3><ol>"
        for line in lines:
            if any(word in line.lower() for word in ["risk", "dependency", "blocker", "issue", "challenge", "concern"]):
                html += f"<li>{line}</li>"
        html += "</ol></section>"

    if required["next_steps"]:
        html += "<section><h3>Next Steps</h3><ol>"
        for line in lines[:3]:
            html += f"<li>{line}</li>"
        html += "</ol></section>"

    if required["closing"]:
        html += """
<section>
  <h3>Closing Summary</h3>
  <p>The meeting concluded with alignment on the discussed points and agreed next steps.</p>
</section>
"""

    return sanitize_mom_html(html)


def build_mom_email(
    recipient_name: str,
    position: str,
    meeting_title: str,
    sender_name: str | None = None,
    sender_designation: str | None = None,
) -> str:
    name = recipient_name.strip() if recipient_name else "Sir/Madam"

    return f"""Dear {name},

Please find attached the Minutes of Meeting for "{meeting_title}".

Kindly review the document and note the key points and next steps.

Best regards,
{sender_name or "Team"}
{sender_designation or ""}
"""


def create_latest_send_pdf(
    meeting: models.MeetingHistory,
    db: Session,
    current_user: models.User,
    latest_generated_mom: str | None = None,
) -> str:
    content = sanitize_mom_html(latest_generated_mom or meeting.generated_mom or "")

    if not content:
        raise HTTPException(status_code=400, detail="No MOM content available to create PDF.")

    meeting.generated_mom = content

    template_filename = getattr(meeting, "template_name", None)

    if template_filename:
        # Use the exact same pipeline as the on-screen preview:
        # DOCX built from the selected .docx template -> LibreOffice -> PDF.
        created_at = getattr(meeting, "created_at", None)
        meeting_date = created_at.strftime("%d %b %Y") if created_at else ""
        prepared_by = current_user.full_name or current_user.username or "User"

        docx_path = build_basic_mom_docx_from_template(
            template_filename=template_filename,
            meeting_title=meeting.meeting_title or "Meeting",
            attendees=meeting.attendees or "",
            raw_notes=meeting.raw_notes or "",
            prepared_by=prepared_by,
            meeting_date=meeting_date,
        )

        try:
            pdf_path = convert_docx_to_pdf(docx_path)
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to create exact MOM PDF: {str(e)}",
            )
    else:
        # Fallback only when no template was saved for this meeting.
        pdf_path = export_to_pdf(
            content,
            "meeting",
            f"MOM - {meeting.meeting_title or 'Meeting'}",
        )

    meeting.mom_pdf_path = pdf_path
    db.commit()
    db.refresh(meeting)

    return pdf_path


def meeting_to_response(record: models.MeetingHistory) -> dict:
    template_name = getattr(record, "template_name", None)
    mom_pdf_path = getattr(record, "mom_pdf_path", None)
    mom_docx_path = getattr(record, "mom_docx_path", None)

    return {
        "id": record.id,
        "meeting_title": record.meeting_title,
        "attendees": record.attendees,
        "raw_notes": getattr(record, "raw_notes", ""),
        "generated_mom": record.generated_mom,
        "created_at": record.created_at,
        "updated_at": getattr(record, "updated_at", None),
        "template_name": template_name,
        "template_filename": template_name,
        "template_file": template_name,
        "mom_pdf_path": mom_pdf_path,
        "mom_docx_path": mom_docx_path,
        "pdf_path": mom_pdf_path,
        "docx_path": mom_docx_path,
        "pdf_download_url": get_download_url(mom_pdf_path) if mom_pdf_path else None,
        "docx_download_url": get_download_url(mom_docx_path) if mom_docx_path else None,
    }


@router.post("/generate-mom", response_model=schemas.MeetingMOMResponse, status_code=201)
def generate_mom(
    req: schemas.MeetingMOMRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    current_date = datetime.now().strftime("%d %b %Y")
    prepared_by = current_user.full_name or current_user.username or "User"

    template_filename = (
        getattr(req, "template_filename", None)
        or getattr(req, "template_file", None)
        or getattr(req, "template_name", None)
        or getattr(req, "template_category", None)
    )

    if not template_filename:
        raise HTTPException(status_code=400, detail="Please select a MOM template.")

    selected_template_content = read_mom_template_docx(template_filename)

    try:
        try:
            generated_ai_text = run_meeting_crew(
                req.meeting_title,
                req.attendees,
                req.raw_notes,
                current_date,
                prepared_by,
                selected_template_content,
            )
        except Exception:
            generated_ai_text = req.raw_notes

        generated = build_clean_generated_mom_html(
            meeting_title=req.meeting_title,
            attendees=req.attendees,
            raw_notes=req.raw_notes,
            meeting_date=current_date,
            prepared_by=prepared_by,
            generated=generated_ai_text,
        )

        final_docx_path = build_basic_mom_docx_from_template(
            template_filename=template_filename,
            meeting_title=req.meeting_title,
            attendees=req.attendees,
            raw_notes=req.raw_notes,
            prepared_by=prepared_by,
            meeting_date=current_date,
        )

        final_pdf_path = export_to_pdf(
            generated,
            "meeting",
            f"MOM - {req.meeting_title}",
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"MOM generation failed: {str(e)}")

    record = models.MeetingHistory(
        user_id=current_user.id,
        meeting_title=req.meeting_title,
        attendees=req.attendees,
        raw_notes=req.raw_notes,
        generated_mom=generated,
        template_name=template_filename,
        mom_docx_path=final_docx_path,
        mom_pdf_path=final_pdf_path,
    )

    db.add(record)
    db.commit()
    db.refresh(record)

    return {
        **meeting_to_response(record),
        "docx_path": final_docx_path,
        "pdf_path": final_pdf_path,
        "mom_docx_path": final_docx_path,
        "mom_pdf_path": final_pdf_path,
        "docx_download_url": get_download_url(final_docx_path),
        "pdf_download_url": get_download_url(final_pdf_path),
    }


@router.get("/history")
def get_meeting_history(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    records = (
        db.query(models.MeetingHistory)
        .filter(models.MeetingHistory.user_id == current_user.id)
        .order_by(models.MeetingHistory.created_at.desc())
        .limit(50)
        .all()
    )

    return [meeting_to_response(record) for record in records]


@router.get("/history/{meeting_id}")
def get_meeting_detail(
    meeting_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    record = (
        db.query(models.MeetingHistory)
        .filter(
            models.MeetingHistory.id == meeting_id,
            models.MeetingHistory.user_id == current_user.id,
        )
        .first()
    )

    if not record:
        raise HTTPException(status_code=404, detail="Meeting not found")

    return meeting_to_response(record)


@router.post("/send")
def send_mom_manual(
    meeting_id: int = Form(...),
    recipients: str = Form(...),
    generated_mom: str | None = Form(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    meeting = (
        db.query(models.MeetingHistory)
        .filter(
            models.MeetingHistory.id == meeting_id,
            models.MeetingHistory.user_id == current_user.id,
        )
        .first()
    )

    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting MOM not found")

    if not current_user.smtp_setting:
        raise HTTPException(status_code=400, detail="Please connect SMTP first.")

    try:
        recipient_list = json.loads(recipients)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid recipients data.")

    valid_recipients = []

    for item in recipient_list:
        email = str(item.get("email", "")).strip()

        if email:
            valid_recipients.append(
                {
                    "name": str(item.get("name", "")).strip() or "Sir/Madam",
                    "position": str(item.get("position", "")).strip(),
                    "email": email,
                }
            )

    if not valid_recipients:
        raise HTTPException(status_code=400, detail="Please add at least one email.")

    final_pdf_path = create_latest_send_pdf(
        meeting=meeting,
        db=db,
        current_user=current_user,
        latest_generated_mom=generated_mom,
    )

    subject = f"Minutes of Meeting - {meeting.meeting_title}"

    sent = 0
    failed = []

    for recipient in valid_recipients:
        try:
            smtp_service.send_email(
                smtp_setting=current_user.smtp_setting,
                to_email=recipient["email"],
                subject=subject,
                body=build_mom_email(
                    recipient_name=recipient["name"],
                    position=recipient["position"],
                    meeting_title=meeting.meeting_title,
                    sender_name=current_user.full_name,
                    sender_designation=current_user.designation,
                ),
                attachments=[final_pdf_path],
            )
            sent += 1
        except Exception as e:
            failed.append({"email": recipient["email"], "error": str(e)})

    return {
        "message": "MOM sending completed.",
        "sent": sent,
        "failed": failed,
        "attached_pdf": Path(final_pdf_path).name,
        "attached_pdf_path": final_pdf_path,
    }


@router.post("/send-excel")
def send_mom_excel(
    meeting_id: int = Form(...),
    file: UploadFile = File(...),
    generated_mom: str | None = Form(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    meeting = (
        db.query(models.MeetingHistory)
        .filter(
            models.MeetingHistory.id == meeting_id,
            models.MeetingHistory.user_id == current_user.id,
        )
        .first()
    )

    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting MOM not found")

    if not current_user.smtp_setting:
        raise HTTPException(status_code=400, detail="Please connect SMTP first.")

    try:
        workbook = load_workbook(BytesIO(file.file.read()), read_only=True, data_only=True)
        sheet = workbook.active
        rows = list(sheet.iter_rows(values_only=True))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid Excel file: {str(e)}")

    if not rows:
        raise HTTPException(status_code=400, detail="Excel file is empty.")

    headers = [str(h or "").strip().lower() for h in rows[0]]

    if "email" not in headers:
        raise HTTPException(status_code=400, detail="Excel must contain email column.")

    final_pdf_path = create_latest_send_pdf(
        meeting=meeting,
        db=db,
        current_user=current_user,
        latest_generated_mom=generated_mom,
    )

    subject = f"Minutes of Meeting - {meeting.meeting_title}"

    sent = 0
    failed = []

    for row in rows[1:]:
        data = {}

        for index, header in enumerate(headers):
            if index < len(row):
                data[header] = str(row[index] or "").strip()

        email = data.get("email", "")

        if not email:
            continue

        name = data.get("name", "") or "Sir/Madam"
        position = data.get("position", "") or data.get("designation", "")

        try:
            smtp_service.send_email(
                smtp_setting=current_user.smtp_setting,
                to_email=email,
                subject=subject,
                body=build_mom_email(
                    recipient_name=name,
                    position=position,
                    meeting_title=meeting.meeting_title,
                    sender_name=current_user.full_name,
                    sender_designation=current_user.designation,
                ),
                attachments=[final_pdf_path],
            )
            sent += 1
        except Exception as e:
            failed.append({"email": email, "error": str(e)})

    return {
        "message": "Excel MOM sending completed.",
        "sent": sent,
        "failed": failed,
        "attached_pdf": Path(final_pdf_path).name,
        "attached_pdf_path": final_pdf_path,
    }