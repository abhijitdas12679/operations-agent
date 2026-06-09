"""
CrewAI Agent definitions using Groq.
"""

from crewai import Agent
from langchain_openai import ChatOpenAI
from app.config import settings


def _llm():
    if not settings.GROQ_API_KEY:
        raise EnvironmentError("GROQ_API_KEY is not set in backend/.env")

    return ChatOpenAI(
        model=settings.GROQ_MODEL,
        api_key=settings.GROQ_API_KEY,
        base_url="https://api.groq.com/openai/v1",
        temperature=0.3,
    )


def get_manager_agent() -> Agent:
    return Agent(
        role="Operations Manager",
        goal="Coordinate all sub-agents to deliver high-quality professional outputs.",
        backstory=(
            "You are a seasoned operations manager who coordinates communication, "
            "reporting, meeting summaries, reminders and document formatting."
        ),
        llm=_llm(),
        verbose=False,
        allow_delegation=True,
    )


def get_communication_agent() -> Agent:
    return Agent(
        role="Professional Communication Specialist",
        goal="Draft clear, tone-appropriate and persuasive emails and messages.",
        backstory=(
            "You are an expert business communicator who writes professional emails "
            "with proper tone, structure and clarity."
        ),
        llm=_llm(),
        verbose=False,
        allow_delegation=False,
    )


def get_report_agent() -> Agent:
    return Agent(
        role="Daily Progress Report Writer",
        goal="Generate structured and concise daily progress reports from raw notes.",
        backstory=(
            "You transform task notes into polished reports with completed work, "
            "blockers and next steps."
        ),
        llm=_llm(),
        verbose=False,
        allow_delegation=False,
    )


def get_meeting_agent() -> Agent:
    return Agent(
        role="Meeting Minutes Specialist",
        goal="Convert raw meeting notes into formal Minutes of Meeting documents.",
        backstory=(
            "You extract decisions, action items, owners and deadlines from meeting notes."
        ),
        llm=_llm(),
        verbose=False,
        allow_delegation=False,
    )


def get_task_agent() -> Agent:
    return Agent(
        role="Workflow and Task Coordinator",
        goal="Analyze tasks and generate clear reminder messages.",
        backstory=(
            "You help teams stay on track by writing clear reminders and priority suggestions."
        ),
        llm=_llm(),
        verbose=False,
        allow_delegation=False,
    )


def get_document_agent() -> Agent:
    return Agent(
        role="Document Formatting Expert",
        goal="Structure and format content for professional DOCX and PDF export.",
        backstory=(
            "You ensure documents have clean headings, spacing and professional formatting."
        ),
        llm=_llm(),
        verbose=False,
        allow_delegation=False,
    )


def get_notification_agent() -> Agent:
    return Agent(
        role="Notification and Reminder Writer",
        goal="Generate concise and action-driving reminder messages.",
        backstory=(
            "You write short notifications that are clear, polite and action-oriented."
        ),
        llm=_llm(),
        verbose=False,
        allow_delegation=False,
    )