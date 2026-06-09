import smtplib
import mimetypes
from pathlib import Path
from email.message import EmailMessage
from typing import List, Dict, Any, Optional

from app.services.encryption_service import decrypt_text


class SMTPService:
    def _format_from(self, email: str, from_name: Optional[str] = None) -> str:
        if from_name and from_name.strip():
            return f"{from_name.strip()} <{email}>"
        return email

    def _connect_server(self, smtp_host: str, smtp_port: int):
        smtp_port = int(smtp_port)

        if smtp_port == 465:
            server = smtplib.SMTP_SSL(smtp_host, smtp_port, timeout=30)
            server.ehlo()
            return server

        server = smtplib.SMTP(smtp_host, smtp_port, timeout=30)
        server.ehlo()
        server.starttls()
        server.ehlo()
        return server

    def _add_attachments(
        self,
        msg: EmailMessage,
        attachments: Optional[List[str]] = None,
    ) -> None:
        if not attachments:
            return

        for file_path in attachments:
            path = Path(file_path)

            if not path.exists() or not path.is_file():
                continue

            mime_type, _ = mimetypes.guess_type(str(path))
            if mime_type:
                maintype, subtype = mime_type.split("/", 1)
            else:
                maintype, subtype = "application", "octet-stream"

            with open(path, "rb") as file:
                msg.add_attachment(
                    file.read(),
                    maintype=maintype,
                    subtype=subtype,
                    filename=path.name,
                )

    def send_email(
        self,
        smtp_setting,
        to_email: str,
        subject: str,
        body: str,
        attachments: Optional[List[str]] = None,
    ) -> bool:
        app_password = decrypt_text(smtp_setting.encrypted_app_password)

        msg = EmailMessage()
        msg["Subject"] = subject
        msg["From"] = self._format_from(
            smtp_setting.smtp_email,
            smtp_setting.from_name,
        )
        msg["To"] = to_email
        msg.set_content(body)

        self._add_attachments(msg, attachments)

        with self._connect_server(
            smtp_setting.smtp_host,
            int(smtp_setting.smtp_port),
        ) as server:
            server.login(smtp_setting.smtp_email, app_password)
            server.send_message(msg)

        return True

    def send_bulk_email(
        self,
        smtp_setting,
        recipients: List[Dict[str, Any]],
    ) -> bool:
        app_password = decrypt_text(smtp_setting.encrypted_app_password)

        with self._connect_server(
            smtp_setting.smtp_host,
            int(smtp_setting.smtp_port),
        ) as server:
            server.login(smtp_setting.smtp_email, app_password)

            for item in recipients:
                to_email = item.get("to_email") or item.get("email")
                subject = item.get("subject", "")
                body = item.get("body", "")
                attachments = item.get("attachments", [])

                if not to_email:
                    continue

                msg = EmailMessage()
                msg["Subject"] = subject
                msg["From"] = self._format_from(
                    smtp_setting.smtp_email,
                    smtp_setting.from_name,
                )
                msg["To"] = to_email
                msg.set_content(body)

                self._add_attachments(msg, attachments)

                server.send_message(msg)

        return True


smtp_service = SMTPService()