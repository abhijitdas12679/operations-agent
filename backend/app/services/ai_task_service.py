import json
from datetime import date, timedelta

from groq import Groq

from app.config import settings


def _fallback_professional_description(title: str, description: str, priority: str, due_date: str | None):
    return (
        f"Task Title: {title}\n\n"
        f"Objective:\n{description or 'Complete the assigned task as per project requirements.'}\n\n"
        f"Priority: {priority.title()}\n"
        f"Deadline: {due_date or 'To be confirmed'}\n\n"
        f"Expected Outcome:\nThe assignee should complete the task on time, update progress regularly, "
        f"and share proof of work if applicable."
    )


def _fallback_subject(title: str):
    return f"Task Assigned: {title[:80]}"


def _fallback_checklist(title: str):
    return [
        f"Review the task requirement: {title}",
        "Plan the work and identify dependencies",
        "Complete the assigned implementation/work",
        "Test and verify the result",
        "Submit final update with proof if required",
    ]


def generate_professional_task_content(
    title: str,
    description: str,
    priority: str,
    due_date: str | None,
):
    if not settings.GROQ_API_KEY:
        return {
            "professional_description": _fallback_professional_description(
                title, description, priority, due_date
            ),
            "email_subject": _fallback_subject(title),
            "checklist": _fallback_checklist(title),
        }

    prompt = f"""
You are a professional operations manager.

Convert this raw task into a clear professional task assignment.

Task title: {title}
Raw description: {description}
Priority: {priority}
Deadline: {due_date or "Not specified"}

Return ONLY valid JSON with this structure:
{{
  "professional_description": "professional detailed task description",
  "email_subject": "short professional email subject",
  "checklist": ["checklist item 1", "checklist item 2", "checklist item 3", "checklist item 4", "checklist item 5"]
}}
"""

    try:
        client = Groq(api_key=settings.GROQ_API_KEY)

        response = client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": "Return only clean valid JSON. No markdown.",
                },
                {
                    "role": "user",
                    "content": prompt,
                },
            ],
            temperature=0.25,
            max_tokens=1000,
        )

        text = response.choices[0].message.content.strip()
        data = json.loads(text)

        return {
            "professional_description": data.get(
                "professional_description",
                _fallback_professional_description(title, description, priority, due_date),
            ),
            "email_subject": data.get("email_subject", _fallback_subject(title)),
            "checklist": data.get("checklist", _fallback_checklist(title)),
        }

    except Exception:
        return {
            "professional_description": _fallback_professional_description(
                title, description, priority, due_date
            ),
            "email_subject": _fallback_subject(title),
            "checklist": _fallback_checklist(title),
        }


def predict_task_effort(title: str, description: str = ""):
    text = f"{title} {description}".lower()

    if any(x in text for x in ["small", "minor", "fix", "button", "text"]):
        days = 1
    elif any(x in text for x in ["integration", "automation", "module", "bulk", "smtp"]):
        days = 3
    elif any(x in text for x in ["dashboard", "deployment", "production", "analytics"]):
        days = 4
    else:
        days = 2

    return {
        "estimated_effort": f"{days} day{'s' if days > 1 else ''}",
        "suggested_deadline": (date.today() + timedelta(days=days)).isoformat(),
    }