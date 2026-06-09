import smtplib
from email.message import EmailMessage
from email.utils import formataddr

from app.config import settings


def send_password_reset_email(to_email: str, reset_link: str) -> None:
    required = [
        settings.SYSTEM_SMTP_HOST,
        settings.SYSTEM_SMTP_USERNAME,
        settings.SYSTEM_SMTP_PASSWORD,
        settings.SYSTEM_SMTP_FROM_EMAIL,
    ]

    if not all(required):
        raise RuntimeError(
            "System SMTP is not configured. Add SYSTEM_SMTP_HOST, SYSTEM_SMTP_USERNAME, "
            "SYSTEM_SMTP_PASSWORD and SYSTEM_SMTP_FROM_EMAIL in .env"
        )

    msg = EmailMessage()
    msg["From"] = formataddr(
        (settings.SYSTEM_SMTP_FROM_NAME, settings.SYSTEM_SMTP_FROM_EMAIL)
    )
    msg["To"] = to_email
    msg["Subject"] = "Reset Your Operations Agent Password"

    msg.set_content(
        f"""Hello,

We received a request to reset your Operations Agent password.

Click this secure link to create a new password:

{reset_link}

This link will expire in {settings.PASSWORD_RESET_TOKEN_EXPIRE_MINUTES} minutes.

If you did not request this, please ignore this email.

Regards,
Operations Agent Team
"""
    )

    with smtplib.SMTP(settings.SYSTEM_SMTP_HOST, settings.SYSTEM_SMTP_PORT) as server:
        server.starttls()
        server.login(settings.SYSTEM_SMTP_USERNAME, settings.SYSTEM_SMTP_PASSWORD)
        server.send_message(msg)