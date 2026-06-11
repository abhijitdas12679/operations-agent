import os
from dotenv import load_dotenv

load_dotenv()


class Settings:

    # =====================================================
    # AI SETTINGS
    # =====================================================

    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = os.getenv(
        "GROQ_MODEL",
        "llama-3.3-70b-versatile",
    )

    # =====================================================
    # POSTGRESQL
    # =====================================================

    POSTGRES_HOST: str = os.getenv("POSTGRES_HOST", "localhost")
    POSTGRES_PORT: str = os.getenv("POSTGRES_PORT", "5432")
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "postgres")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "")
    POSTGRES_DATABASE: str = os.getenv(
        "POSTGRES_DATABASE",
        "operations_agent",
    )

    @property
    def DATABASE_URL(self) -> str:
        return (
            f"postgresql+psycopg2://"
            f"{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}"
            f"/{self.POSTGRES_DATABASE}"
        )

    # =====================================================
    # AUTH
    # =====================================================

    JWT_SECRET_KEY: str = os.getenv(
        "JWT_SECRET_KEY",
        "change_this_secret",
    )

    JWT_ALGORITHM: str = os.getenv(
        "JWT_ALGORITHM",
        "HS256",
    )

    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(
        os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60")
    )

    # =====================================================
    # FRONTEND
    # =====================================================

    FRONTEND_URL: str = os.getenv(
        "FRONTEND_URL",
        "http://localhost:5173",
    )

    # =====================================================
    # SYSTEM SMTP
    # =====================================================

    SYSTEM_SMTP_HOST: str = os.getenv(
        "SYSTEM_SMTP_HOST",
        "",
    )

    SYSTEM_SMTP_PORT: int = int(
        os.getenv("SYSTEM_SMTP_PORT", "587")
    )

    SYSTEM_SMTP_USERNAME: str = os.getenv(
        "SYSTEM_SMTP_USERNAME",
        "",
    )

    SYSTEM_SMTP_PASSWORD: str = os.getenv(
        "SYSTEM_SMTP_PASSWORD",
        "",
    )

    SYSTEM_SMTP_FROM_EMAIL: str = os.getenv(
        "SYSTEM_SMTP_FROM_EMAIL",
        "",
    )

    SYSTEM_SMTP_FROM_NAME: str = os.getenv(
        "SYSTEM_SMTP_FROM_NAME",
        "Operations Agent",
    )

    # =====================================================
    # PASSWORD RESET
    # =====================================================

    PASSWORD_RESET_TOKEN_EXPIRE_MINUTES: int = int(
        os.getenv(
            "PASSWORD_RESET_TOKEN_EXPIRE_MINUTES",
            "15",
        )
    )

    # =====================================================
    # ENCRYPTION
    # =====================================================

    ENCRYPTION_SECRET_KEY: str = os.getenv(
        "ENCRYPTION_SECRET_KEY",
        ""
    )

    # =====================================================
    # FILE UPLOADS
    # =====================================================

    MAX_ATTACHMENT_MB: int = int(
        os.getenv("MAX_ATTACHMENT_MB", "10")
    )

    # =====================================================
    # OUTPUT DIRECTORIES
    # =====================================================

    BASE_DIR = os.path.dirname(os.path.dirname(__file__))

    OUTPUT_DIR = os.path.join(BASE_DIR, "outputs")

    REPORTS_DIR = os.path.join(
        OUTPUT_DIR,
        "reports",
    )

    EMAILS_DIR = os.path.join(
        OUTPUT_DIR,
        "emails",
    )

    MOMS_DIR = os.path.join(
        OUTPUT_DIR,
        "moms",
    )

    TASKS_DIR = os.path.join(
        OUTPUT_DIR,
        "tasks",
    )

    TASK_ATTACHMENTS_DIR = os.path.join(
        OUTPUT_DIR,
        "task_attachments",
    )

    EXPORTS_DIR = os.path.join(
        OUTPUT_DIR,
        "exports",
    )

    def create_directories(self):
        directories = [
            self.OUTPUT_DIR,
            self.REPORTS_DIR,
            self.EMAILS_DIR,
            self.MOMS_DIR,
            self.TASKS_DIR,
            self.TASK_ATTACHMENTS_DIR,
            self.EXPORTS_DIR,
        ]

        for directory in directories:
            os.makedirs(directory, exist_ok=True)


settings = Settings()

settings.create_directories()