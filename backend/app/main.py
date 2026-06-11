import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import create_all_tables
from app.routes import (
    auth_routes,
    dashboard_routes,
    document_routes,
    email_routes,
    meeting_routes,
    public_task_routes,
    report_routes,
    smtp_routes,
    task_routes,
    user_routes,
)

app = FastAPI(
    title="Operations & Communication Automation Agent",
    description="AI-powered operations automation using FastAPI, CrewAI, and Groq.",
    version="1.0.0",
)


allowed_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
]

if settings.FRONTEND_URL and settings.FRONTEND_URL not in allowed_origins:
    allowed_origins.append(settings.FRONTEND_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],
)


def ensure_output_directories():
    directories = [
        settings.OUTPUT_DIR,
        settings.REPORTS_DIR,
        settings.EMAILS_DIR,
        settings.MOMS_DIR,
        settings.TASKS_DIR,
        settings.TASK_ATTACHMENTS_DIR,
        settings.EXPORTS_DIR,
        os.path.join(settings.OUTPUT_DIR, "task_proofs"),
    ]

    for directory in directories:
        os.makedirs(directory, exist_ok=True)


ensure_output_directories()

app.mount(
    "/outputs",
    StaticFiles(directory=settings.OUTPUT_DIR),
    name="outputs",
)


app.include_router(auth_routes.router)
app.include_router(email_routes.router)
app.include_router(report_routes.router)
app.include_router(meeting_routes.router)
app.include_router(task_routes.router)
app.include_router(public_task_routes.router)
app.include_router(document_routes.router)
app.include_router(dashboard_routes.router)
app.include_router(smtp_routes.router)
app.include_router(user_routes.router)


@app.on_event("startup")
def startup():
    create_all_tables()
    ensure_output_directories()


@app.get("/", tags=["Health"])
def root():
    return {
        "status": "running",
        "message": "Operations Agent API is live. Visit /docs for Swagger UI.",
    }


@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok"}