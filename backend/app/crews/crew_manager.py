from groq import Groq
from app.config import settings


def clean_ai_output(text: str) -> str:
    if not text:
        return ""

    unwanted = ["```html", "```", "---"]
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
                    "You are a senior business analyst and operations documentation expert. "
                    "Generate accurate, concise, business-ready content only from the provided notes and selected template. "
                    "Never use a fixed default MOM format when a template is provided. "
                    "Never copy empty template headings. Never invent unsupported technical details. "
                    "When HTML is requested, return only safe HTML body content. "
                    "Do not include markdown, code blocks, scripts, style tags, or unsafe attributes."
                ),
            },
            {"role": "user", "content": prompt},
        ],
        temperature=0.12,
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
- Highlight important dates, deadlines, requests, and next steps using <strong>.
- Use <p>, <ul>, <li>, and <strong> only.
- Do not use markdown.
- Return only the email body HTML.
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
- Keep the report formal, clear, and easy to read.
- Use numbered points for task lists.
- If blockers are empty or not serious, write "No major blockers were reported."

Use exactly this format:

DAILY PROGRESS REPORT

Date:
{date}

Team / Project:
{team_name}

Executive Summary:
Write a short 2 to 3 sentence professional summary.

Tasks Completed:
1. Write clear completed tasks.

Challenges Faced:
1. Write challenges clearly.

Next Action Plan:
1. Write next actions.

Overall Status:
Write one short professional closing status line.
"""
    return generate_ai_text(prompt, max_tokens=1800)


def run_meeting_crew(
    meeting_title: str,
    attendees: str,
    raw_notes: str,
    meeting_date: str,
    prepared_by: str,
    template_content: str = "",
) -> str:
    selected_template = template_content.strip() if template_content else ""

    prompt = f"""
Create a professional Minutes of Meeting document in clean HTML.

Input Details:
Meeting Title: {meeting_title}
Meeting Date: {meeting_date}
Attendees: {attendees}
Prepared By: {prepared_by}
Raw Meeting Notes:
{raw_notes}

Selected MOM Template Content:
{selected_template if selected_template else "No selected template content was provided."}

CRITICAL TEMPLATE RULES:
- If Selected MOM Template Content is provided, it is mandatory.
- Follow the selected template's section order and section names.
- Do not replace the selected template with a default MOM structure.
- Do not generate every MOM in one common format.
- Use only the selected template's relevant sections.
- If a selected template section has no useful content from raw notes, remove that section.
- Never output empty headings.
- Never copy placeholder text, reusable template text, or instructions.
- Never include "How to Use This Template", "Reusable Template", or bracket placeholders.
- If no selected template content is provided, then use a simple generic MOM format.

Important Content Rules:
- Always use Meeting Date exactly as given: {meeting_date}
- Always use Prepared By exactly as given: {prepared_by}
- Keep attendee format as Name (Role) when available.
- Bold attendee names and roles using <strong>.
- If Time is not clearly available, write <strong>To be confirmed</strong>.
- If Location / Platform is not clearly available, write <strong>To be confirmed</strong>.
- Do not add fake client names, fake deadlines, fake tools, fake business goals, or fake requirements.
- Convert rough notes into short business-ready sentences.
- Keep the MOM concise and practical.
- Avoid repeated points.
- Do not say developers discussed requirement strategy unless raw notes clearly say so.

Owner Logic:
- Project Manager or TL owns planning, clarification, coordination, review, timeline, and client communication tasks.
- Developer owns implementation, coding, setup, bug fixing, testing support, and technical analysis tasks.
- Do not assign frontend/backend implementation to TL or PM unless raw notes clearly says so.
- Do not assign client coordination or requirement clarification to developer unless raw notes clearly says so.
- If owner is unclear, use <strong>Owner to be assigned</strong>.
- If deadline is unclear, use <strong>To be confirmed</strong>.

Action Item Rules:
- Action items must be short and specific.
- Do not create more than 5 action items unless raw notes clearly require it.
- Every action item must include task, owner, deadline, and priority.

Priority Label Rules:
Use exactly one of these priority labels for each action item:
<span class="priority-badge priority-high">High Priority</span>
<span class="priority-badge priority-medium">Medium Priority</span>
<span class="priority-badge priority-low">Low Priority</span>

HTML Rules:
- Return only HTML content.
- Do not use markdown.
- Do not use code blocks.
- Do not include <html>, <head>, <body>, <script>, or <style>.
- Use only these tags: <section>, <h2>, <h3>, <p>, <ol>, <ul>, <li>, <strong>, <em>, <span>.
- Do not add inline style attributes.
- Do not use HTML tables.
- Highlight names, dates, deadlines, owners, decisions, and important next steps using <strong>.

Required Output Quality:
- No empty sections.
- No copied template-only headings.
- No repeated action items.
- No unsupported assumptions.
- Clear, short, professional MOM.
"""
    return generate_ai_text(prompt, max_tokens=3600)


def run_reminder_crew(task_title: str, assigned_to: str, due_date: str, priority: str) -> str:
    prompt = f"""
Write a short professional task reminder.

Task: {task_title}
Assigned To: {assigned_to}
Due Date: {due_date}
Priority: {priority}

Rules:
- Do not use markdown.
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
- Use clean headings and readable paragraphs.
- Keep formatting suitable for PDF and DOCX export.
"""
    return generate_ai_text(prompt, max_tokens=1800)