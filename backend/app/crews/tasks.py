"""
CrewAI Task definitions.
Each function returns a Task object configured for a specific agent.
"""
from crewai import Task
from crewai import Agent


def email_task(agent: Agent, subject: str, recipient: str, tone: str, context: str) -> Task:
    return Task(
        description=(
            f"Write a professional email with the following details:\n"
            f"- Subject: {subject}\n"
            f"- Recipient: {recipient}\n"
            f"- Tone: {tone}\n"
            f"- Context / Purpose: {context}\n\n"
            "The email must have: Subject line, greeting, body paragraphs, closing, and signature placeholder."
        ),
        expected_output=(
            "A complete, ready-to-send email formatted as:\n"
            "Subject: ...\n\nDear [Name],\n\n[Body]\n\nBest regards,\n[Your Name]"
        ),
        agent=agent,
    )


def report_task(agent: Agent, date: str, team_name: str, tasks_completed: str, blockers: str) -> Task:
    return Task(
        description=(
            f"Generate a Daily Progress Report for {team_name} dated {date}.\n\n"
            f"Tasks Completed Today:\n{tasks_completed}\n\n"
            f"Blockers / Challenges:\n{blockers}\n\n"
            "Include sections: Executive Summary, Completed Tasks, Blockers, Plan for Tomorrow."
        ),
        expected_output=(
            "A structured Daily Progress Report with clear sections, bullet points, "
            "and a professional tone suitable for management review."
        ),
        agent=agent,
    )


def meeting_mom_task(agent: Agent, meeting_title: str, attendees: str, raw_notes: str) -> Task:
    return Task(
        description=(
            f"Convert the following raw meeting notes into a formal Minutes of Meeting (MOM).\n\n"
            f"Meeting Title: {meeting_title}\n"
            f"Attendees: {attendees}\n\n"
            f"Raw Notes:\n{raw_notes}\n\n"
            "Extract: Agenda items discussed, Key decisions made, Action items with owners and deadlines, "
            "Next meeting date if mentioned."
        ),
        expected_output=(
            "A formal MOM document with sections: Meeting Details, Attendees, Agenda, "
            "Key Decisions, Action Items (table: Item | Owner | Deadline), Next Steps."
        ),
        agent=agent,
    )


def reminder_task(agent: Agent, task_title: str, assigned_to: str, due_date: str, priority: str) -> Task:
    return Task(
        description=(
            f"Generate a professional reminder message for the following task:\n"
            f"- Task: {task_title}\n"
            f"- Assigned To: {assigned_to}\n"
            f"- Due Date: {due_date}\n"
            f"- Priority: {priority}\n\n"
            "The reminder should be polite but clear, mentioning the deadline and priority."
        ),
        expected_output=(
            "A concise reminder message (3-5 sentences) that motivates the assignee "
            "to complete the task on time."
        ),
        agent=agent,
    )


def document_format_task(agent: Agent, content: str, doc_type: str) -> Task:
    return Task(
        description=(
            f"Review and reformat the following {doc_type} content for export:\n\n"
            f"{content}\n\n"
            "Ensure consistent headings, bullet points where appropriate, "
            "and professional language throughout."
        ),
        expected_output=(
            "The same content reformatted with clear section headings (##), "
            "bullet points (-), and clean paragraph breaks ready for DOCX/PDF export."
        ),
        agent=agent,
    )
