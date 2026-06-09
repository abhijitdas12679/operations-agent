from groq import Groq
from app.config import settings


EMAIL_TEMPLATES = {
    "follow_up": "Follow-up Email",
    "sales_outreach": "Sales Outreach",
    "meeting_invitation": "Meeting Invitation",
    "project_update": "Project Update",
    "reminder": "Reminder",
    "apology": "Apology Email",
    "leave_request": "Leave Request",
    "client_proposal": "Client Proposal",
    "interview_invitation": "Interview Invitation",
    "thank_you": "Thank You Email",
}


def _groq(prompt: str) -> str:
    if not settings.GROQ_API_KEY:
        raise EnvironmentError("GROQ_API_KEY is not set in backend/.env")

    client = Groq(api_key=settings.GROQ_API_KEY)

    response = client.chat.completions.create(
        model=settings.GROQ_MODEL,
        messages=[
            {
                "role": "system",
                "content": "You are an expert business email writing assistant.",
            },
            {
                "role": "user",
                "content": prompt,
            },
        ],
        temperature=0.4,
        max_tokens=1200,
    )

    return response.choices[0].message.content.strip()


def run_email_automation_crew(
    subject: str,
    recipient_name: str,
    recipient_email: str,
    tone: str,
    context: str,
    template_type: str | None = None,
    company: str | None = None,
    designation: str | None = None,
) -> str:
    template_name = EMAIL_TEMPLATES.get(template_type or "", "Custom Email")

    prompt = f"""
Write ONE ready-to-send professional email body only.

Template Type: {template_name}
Subject: {subject}
Recipient Name: {recipient_name}
Recipient Email: {recipient_email}
Company: {company or "N/A"}
Designation: {designation or "N/A"}
Tone: {tone}
Context: {context}

Rules:
- Do not include Subject in the email body.
- Do not write "Subject:" anywhere.
- Start with: Dear {recipient_name},
- Never use Dear Sir/Madam.
- Personalize using company/designation if available.
- Keep it professional, concise and human.
- Include a suitable closing.
- Use [Your Name] placeholder.
- Return only the email body.
"""

    return _groq(prompt)