from datetime import datetime
from uuid import uuid4
import re
from html import escape

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.auth import get_current_user
from app.crews.crew_manager import run_email_crew
from app.services.smtp_service import smtp_service
from app.services.excel_service import parse_bulk_email_excel

router = APIRouter(prefix="/email", tags=["Email"])


def is_html_content(text: str) -> bool:
    if not text:
        return False
    return bool(re.search(r"</?(p|br|ul|ol|li|strong|b|em|table|div|span)\b", text, re.I))


def strip_markdown_code_fence(text: str) -> str:
    if not text:
        return ""

    text = text.strip()
    text = re.sub(r"^```(?:html)?", "", text, flags=re.I).strip()
    text = re.sub(r"```$", "", text).strip()
    return text


def clean_ai_html(html: str) -> str:
    html = strip_markdown_code_fence(html)

    if not html:
        return ""

    html = re.sub(r"<strong>\s*</strong>", "", html, flags=re.I)
    html = re.sub(r"<b>\s*</b>", "", html, flags=re.I)

    return html.strip()


def convert_text_to_email_html(text: str) -> str:
    if not text:
        return ""

    text = strip_markdown_code_fence(text)

    if is_html_content(text):
        return clean_ai_html(text)

    lines = text.splitlines()
    html_parts = []
    paragraph_lines = []
    list_open = False
    ordered_list_open = False

    def clean_inline(value: str) -> str:
        value = escape(value.strip())
        value = re.sub(r"\*\*(.*?)\*\*", r"<strong>\1</strong>", value)
        return value

    def flush_paragraph():
        nonlocal paragraph_lines

        if paragraph_lines:
            paragraph = " ".join(line.strip() for line in paragraph_lines if line.strip())
            html_parts.append(f"<p>{clean_inline(paragraph)}</p>")
            paragraph_lines = []

    def close_lists():
        nonlocal list_open, ordered_list_open

        if list_open:
            html_parts.append("</ul>")
            list_open = False

        if ordered_list_open:
            html_parts.append("</ol>")
            ordered_list_open = False

    for raw_line in lines:
        line = raw_line.strip()

        if not line:
            flush_paragraph()
            close_lists()
            continue

        bullet_match = re.match(r"^[-*•]\s+(.*)", line)
        number_match = re.match(r"^\d+[.)]\s+(.*)", line)

        if bullet_match:
            flush_paragraph()

            if ordered_list_open:
                html_parts.append("</ol>")
                ordered_list_open = False

            if not list_open:
                html_parts.append("<ul>")
                list_open = True

            item = bullet_match.group(1).strip()
            html_parts.append(f"<li>{clean_inline(item)}</li>")
            continue

        if number_match:
            flush_paragraph()

            if list_open:
                html_parts.append("</ul>")
                list_open = False

            if not ordered_list_open:
                html_parts.append("<ol>")
                ordered_list_open = True

            item = number_match.group(1).strip()
            html_parts.append(f"<li>{clean_inline(item)}</li>")
            continue

        close_lists()
        paragraph_lines.append(line)

    flush_paragraph()
    close_lists()

    return clean_ai_html("\n".join(html_parts))


def get_sender_signature(current_user: models.User) -> str:
    sender_name = current_user.full_name or current_user.username
    sender_designation = current_user.designation or ""

    if sender_designation:
        return f"""
<p>Best regards,<br>
{escape(sender_name)}<br>
{escape(sender_designation)}</p>
""".strip()

    return f"""
<p>Best regards,<br>
{escape(sender_name)}</p>
""".strip()


def apply_sender_signature(email_body: str, current_user: models.User) -> str:
    body = convert_text_to_email_html(email_body or "").strip()
    signature = get_sender_signature(current_user)

    closing_patterns = [
        r"<p>\s*Best regards,?.*?</p>",
        r"<p>\s*Regards,?.*?</p>",
        r"<p>\s*Sincerely,?.*?</p>",
        r"<p>\s*Thank you,?.*?</p>",
        r"<p>\s*Thanks,?.*?</p>",
    ]

    for pattern in closing_patterns:
        body = re.sub(pattern, "", body, flags=re.I | re.S).strip()

    return f"{body}\n\n{signature}"


def build_selected_docx_template_context(
    subject: str,
    recipient: str,
    recipient_email: str | None,
    tone: str,
    context: str,
    template_name: str | None,
    template_category: str | None,
    template_file: str | None,
    template_content: str | None,
    dynamic_fields: dict | None = None,
) -> str:
    dynamic_text = ""

    if dynamic_fields:
        dynamic_text = "\n".join(
            [f"- {key}: {value}" for key, value in dynamic_fields.items()]
        )

    if template_content:
        return f"""
Generate a professional email strictly using the selected DOCX template.

Selected Template Name:
{template_name or template_file or "Selected Template"}

Template Category:
{template_category or "Not specified"}

Selected Template File:
{template_file or "Not specified"}

Template Content:
{template_content}

Recipient Details:
- Recipient Name: {recipient}
- Recipient Email: {recipient_email or "Not specified"}
- Tone: {tone}

Subject:
{subject}

User Provided Context:
{context}

Dynamic Field Values:
{dynamic_text or "No additional dynamic fields provided."}

Very Important Formatting Rules:
- Return the final email in clean HTML only.
- Use <p> for normal paragraphs.
- If the DOCX template has bullet points, use <ul><li>...</li></ul>.
- If the DOCX template has numbered points, use <ol><li>...</li></ol>.
- Preserve bullet points from the selected template.
- Do not convert bullet points into normal paragraphs.
- Do not make bullet text bold automatically.
- Do not add extra bold formatting by yourself.
- Keep bold only if the template clearly marks that text as bold.
- Do not wrap the response in ```html or any code block.
- Do not return markdown bullet points like "- item".
- Do not return plain text bullet points.

Content Rules:
- Use only the selected DOCX template structure.
- Do not select or guess another template.
- Replace placeholders only when the value is available.
- Do not keep placeholder text if the user provided the value.
- Do not invent fake dates, names, locations, companies, or deadlines.
- Start with a suitable greeting using the recipient name.
- Keep the email professional, clear, and human.
- End with a professional closing.
"""

    return f"""
Create a professional email.

Recipient Name:
{recipient}

Recipient Email:
{recipient_email or "Not specified"}

Subject:
{subject}

Tone:
{tone}

User Provided Context:
{context}

Dynamic Field Values:
{dynamic_text or "No additional dynamic fields provided."}

Very Important Formatting Rules:
- Return the final email in clean HTML only.
- Use <p> for paragraphs.
- Use <ul><li>...</li></ul> for bullet points.
- Use <ol><li>...</li></ol> for numbered points.
- Do not make bullet text bold automatically.
- Do not add extra bold formatting by yourself.
- Do not return markdown.
- Do not wrap the response in ```html or any code block.

Important Rules:
- Start with a suitable greeting using the recipient name.
- Do not use Dear Sir/Madam if recipient name is available.
- Keep the email professional, clear, and human.
- Do not invent fake details.
- End with a professional closing.
"""


def generate_personalized_email(
    subject: str,
    name: str,
    designation: str,
    tone: str,
    context: str,
    current_user: models.User,
    template_name: str | None = None,
    template_category: str | None = None,
    template_file: str | None = None,
    template_content: str | None = None,
):
    personalized_context = f"""
Create a personalized professional email.

Recipient Name:
{name}

Recipient Designation:
{designation or "Not specified"}

Subject:
{subject}

Tone:
{tone}

Selected Template Name:
{template_name or template_file or "Not selected"}

Template Category:
{template_category or "Not specified"}

Selected Template File:
{template_file or "Not specified"}

Template Content:
{template_content or "No template content provided."}

Main Context:
{context}

Very Important Formatting Rules:
- Return the final email in clean HTML only.
- Use <p> for paragraphs.
- If template content has bullet points, use <ul><li>...</li></ul>.
- If template content has numbered points, use <ol><li>...</li></ol>.
- Preserve bullet points from the selected template.
- Do not make bullet text bold automatically.
- Do not add extra bold formatting by yourself.
- Keep bold only if the template clearly marks that text as bold.
- Do not return markdown bullet points like "- item".
- Do not return plain text bullet points.
- Do not wrap the response in ```html or any code block.

Important Rules:
- If template content is provided, follow that template structure.
- Do not choose another template.
- Start email with: Dear {name},
- Do not use Dear Sir/Madam.
- Mention recipient designation naturally if useful.
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
    final_subject = req.subject or req.template_name or "Professional Email"

    try:
        final_context = build_selected_docx_template_context(
            subject=final_subject,
            recipient=req.recipient,
            recipient_email=req.recipient_email,
            tone=req.tone,
            context=req.context,
            template_name=req.template_name,
            template_category=req.template_category,
            template_file=req.template_file,
            template_content=req.template_content,
            dynamic_fields=req.dynamic_fields,
        )

        generated = run_email_crew(
            final_subject,
            req.recipient,
            req.tone,
            final_context,
        )

        generated = apply_sender_signature(generated, current_user)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")

    record = models.EmailHistory(
        user_id=current_user.id,
        subject=final_subject,
        recipient=req.recipient,
        recipient_email=req.recipient_email,
        tone=req.tone,
        context=req.context,
        generated_email=generated,
        template_id=req.template_id,
        template_name=req.template_name or req.template_file,
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
    template_name: str | None = Form(None),
    template_category: str | None = Form(None),
    template_file: str | None = Form(None),
    template_content: str | None = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if not file.filename or not file.filename.lower().endswith((".xlsx", ".xlsm")):
        raise HTTPException(
            status_code=400,
            detail="Only Excel .xlsx or .xlsm file is allowed.",
        )

    final_subject = subject or template_name or "Professional Email"

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
                subject=final_subject,
                name=recipient["name"],
                designation=recipient["designation"],
                tone=tone,
                context=context,
                current_user=current_user,
                template_name=template_name,
                template_category=template_category,
                template_file=template_file,
                template_content=template_content,
            )

            record = models.EmailHistory(
                user_id=current_user.id,
                subject=final_subject,
                recipient=recipient["name"],
                recipient_email=recipient["email"],
                designation=recipient["designation"],
                tone=tone,
                context=context,
                generated_email=generated,
                template_id=None,
                template_name=template_name or template_file,
                batch_id=batch_id,
                status="draft",
            )

        except Exception as e:
            record = models.EmailHistory(
                user_id=current_user.id,
                subject=final_subject,
                recipient=recipient["name"],
                recipient_email=recipient["email"],
                designation=recipient["designation"],
                tone=tone,
                context=context,
                generated_email="",
                template_id=None,
                template_name=template_name or template_file,
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

    record.generated_email = convert_text_to_email_html(req.generated_email)
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
            detail="Please connect your email account from Email Settings before sending bulk emails.",
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
            record.generated_email = convert_text_to_email_html(edited_content)

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
        record.generated_email = convert_text_to_email_html(req.generated_email)

    smtp_setting = db.query(models.UserSMTPSetting).filter(
        models.UserSMTPSetting.user_id == current_user.id,
        models.UserSMTPSetting.is_active == 1,
    ).first()

    if not smtp_setting:
        raise HTTPException(
            status_code=400,
            detail="Please connect your email account from Email Settings before sending.",
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