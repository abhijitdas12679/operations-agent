from groq import Groq
from app.config import settings


def clean_ai_output(text: str) -> str:
    if not text:
        return ""

    unwanted = ["**", "###", "##", "#", "---", "```"]
    for item in unwanted:
        text = text.replace(item, "")

    return text.strip()


def generate_ai_text(prompt: str, max_tokens: int = 1800) -> str:
    if not settings.GROQ_API_KEY:
        raise EnvironmentError("GROQ_API_KEY is not set in backend/.env")

    client = Groq(api_key=settings.GROQ_API_KEY)

    response = client.chat.completions.create(
        model=settings.GROQ_MODEL,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a senior operations and business communication assistant. "
                    "Always produce clean, formal, polished, business-ready content. "
                    "Do not use markdown formatting symbols like **, ##, ###, #, ---, or code blocks. "
                    "Use clear section headings, professional wording, and practical action points."
                ),
            },
            {
                "role": "user",
                "content": prompt,
            },
        ],
        temperature=0.3,
        max_tokens=max_tokens,
    )

    return clean_ai_output(response.choices[0].message.content)


def run_email_crew(subject: str, recipient: str, tone: str, context: str) -> str:
    prompt = f"""
Write a professional email body only.

Subject: {subject}
Recipient: {recipient}
Tone: {tone}
Context: {context}

Rules:
- Do not include the subject in the body.
- Start with Dear {recipient},
- Do not use markdown.
- Do not use ** symbols.
- Return only the email body.
"""
    return generate_ai_text(prompt, max_tokens=1200)


def run_report_crew(date: str, team_name: str, tasks_completed: str, blockers: str) -> str:
    prompt = f"""
Generate a clean, polished, and professional Daily Progress Report.

Input Details:
Date: {date}
Team / Project: {team_name}
Tasks Completed: {tasks_completed}
Blockers / Challenges: {blockers}

Strict Formatting Rules:
- Do not use markdown.
- Do not use ** symbols.
- Do not use # symbols.
- Do not use decorative separators.
- Do not wrap headings with special symbols.
- Keep the report formal, clear, and easy to read.
- Use numbered points for task lists.
- Keep each point specific and professional.
- If blockers are provided, write them under Challenges Faced.
- If blockers are empty or not serious, write "No major blockers were reported."

Use exactly this format:

DAILY PROGRESS REPORT

Date:
{date}

Team / Project:
{team_name}

Executive Summary:
Write a short 2 to 3 sentence professional summary of today's progress.

Tasks Completed:
1. Write the first completed task clearly.
2. Write the second completed task clearly.
3. Write the third completed task clearly.
4. Add more points only if needed.

Challenges Faced:
1. Write the first challenge clearly.
2. Write the second challenge clearly.
3. Write the third challenge clearly.

Next Action Plan:
1. Write the first next action.
2. Write the second next action.
3. Write the third next action.

Overall Status:
Write one short professional closing status line.
"""
    return generate_ai_text(prompt, max_tokens=1800)


def run_meeting_crew(meeting_title: str, attendees: str, raw_notes: str) -> str:
    prompt = f"""
Create a highly professional, business-ready Minutes of Meeting document.

Input Details:
Meeting Title: {meeting_title}
Attendees: {attendees}
Raw Meeting Notes: {raw_notes}

Strict Formatting Rules:
- Do not use markdown.
- Do not use ** symbols.
- Do not use # symbols.
- Do not use decorative separators.
- Do not use tables because this content will be exported to PDF and DOCX.
- Use clean headings and numbered points.
- Make the wording formal, concise, and executive-friendly.
- Convert rough notes into complete professional sentences.
- Do not add unrealistic details that are not supported by the notes.
- If deadlines are missing, write "To be confirmed".
- If owners are missing, write "Owner to be assigned".
- If risks are not mentioned, write "No major risks or dependencies were identified."

Use exactly this format:

MINUTES OF MEETING

Meeting Title:
{meeting_title}

Meeting Objective:
Write a clear 2 to 3 line objective of the meeting based on the raw notes.

Attendees:
{attendees}

Meeting Overview:
Write a short professional overview of the discussion in 3 to 4 sentences.

Key Discussion Points:
1. Write the first key discussion point clearly.
2. Write the second key discussion point clearly.
3. Write the third key discussion point clearly.
4. Add more points only if required.

Decisions Taken:
1. Write the first decision clearly with business impact.
2. Write the second decision clearly with business impact.
3. Add more decisions only if required.

Action Items:
1. Task: Write the action item clearly.
   Owner: Write the responsible person or "Owner to be assigned".
   Deadline: Write the deadline or "To be confirmed".
   Priority: High / Medium / Low.

2. Task: Write the action item clearly.
   Owner: Write the responsible person or "Owner to be assigned".
   Deadline: Write the deadline or "To be confirmed".
   Priority: High / Medium / Low.

Risks / Dependencies:
1. Write any risk, blocker, dependency, or pending confirmation.
2. If none, write "No major risks or dependencies were identified."

Next Steps:
1. Write the immediate next step.
2. Write the follow-up action.
3. Write the review or tracking step.

Closing Summary:
Write a polished closing paragraph summarizing alignment, ownership, and follow-up.
"""
    return generate_ai_text(prompt, max_tokens=2200)


def run_reminder_crew(task_title: str, assigned_to: str, due_date: str, priority: str) -> str:
    prompt = f"""
Write a short professional task reminder.

Task: {task_title}
Assigned To: {assigned_to}
Due Date: {due_date}
Priority: {priority}

Rules:
- Do not use markdown.
- Do not use ** symbols.
- Keep it short and polite.
"""
    return generate_ai_text(prompt, max_tokens=800)


def run_document_format_crew(content: str, doc_type: str) -> str:
    prompt = f"""
Format this {doc_type} professionally.

Content:
{content}

Rules:
- Do not use markdown.
- Do not use ** symbols.
- Use clean headings and readable paragraphs.
- Keep formatting suitable for PDF and DOCX export.
"""
    return generate_ai_text(prompt, max_tokens=1800)