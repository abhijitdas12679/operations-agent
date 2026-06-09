"""
Notification / reminder helper.
Currently generates in-app reminders; can be extended with email/SMS.
"""
from app.crews.crew_manager import run_reminder_crew


def generate_reminder(task_title: str, assigned_to: str, due_date: str, priority: str) -> str:
    """Call the CrewAI reminder crew and return the message string."""
    return run_reminder_crew(task_title, assigned_to, due_date, priority)
