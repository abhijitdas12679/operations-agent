from app.services.smtp_service import smtp_service


def build_task_assignment_email_body(
    task,
    update_link: str,
    sender_name: str,
    sender_designation: str,
):
    return f"""
Hello,

A new task has been assigned to you.

Task: {task.title}
Priority: {task.priority.title()}
Deadline: {task.due_date or "Not specified"}

Task Details:
{task.professional_description or task.description or ""}

Task Update Link:
{update_link}

Please use the above link to update your progress, complete checklist items, add comments, and upload proof of work if required.

Best regards,
{sender_name}
{sender_designation}
""".strip()


def send_task_assignment_email(
    smtp_setting,
    task,
    to_emails: list[str],
    update_link: str,
    pdf_path: str | None,
    docx_path: str | None,
    sender_name: str,
    sender_designation: str,
):
    subject = task.email_subject or f"Task Assigned: {task.title}"

    body = build_task_assignment_email_body(
        task=task,
        update_link=update_link,
        sender_name=sender_name,
        sender_designation=sender_designation,
    )

    return smtp_service.send_task_assignment_email(
        smtp_setting=smtp_setting,
        to_emails=to_emails,
        subject=subject,
        body=body,
        pdf_path=pdf_path,
        docx_path=docx_path,
    )