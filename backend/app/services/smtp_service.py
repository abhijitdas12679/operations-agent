import smtplib
import mimetypes
from pathlib import Path
from email.message import EmailMessage
from typing import List, Dict, Any, Optional, Union

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

    def _normalize_recipients(
        self,
        recipients: Union[str, List[str]],
    ) -> List[str]:
        if isinstance(recipients, str):
            recipients = [recipients]

        return [
            email.strip()
            for email in recipients
            if email and email.strip()
        ]

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
        to_email: Union[str, List[str]],
        subject: str,
        body: str,
        attachments: Optional[List[str]] = None,
        html_body: Optional[str] = None,
    ) -> bool:
        app_password = decrypt_text(smtp_setting.encrypted_app_password)

        recipients = self._normalize_recipients(to_email)

        if not recipients:
            raise ValueError("No valid recipient email provided.")

        msg = EmailMessage()
        msg["Subject"] = subject
        msg["From"] = self._format_from(
            smtp_setting.smtp_email,
            smtp_setting.from_name,
        )
        msg["To"] = ", ".join(recipients)

        msg.set_content(body or "")

        if html_body:
            msg.add_alternative(html_body, subtype="html")

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
                html_body = item.get("html_body")
                attachments = item.get("attachments", [])

                email_list = self._normalize_recipients(to_email)

                if not email_list:
                    continue

                msg = EmailMessage()
                msg["Subject"] = subject
                msg["From"] = self._format_from(
                    smtp_setting.smtp_email,
                    smtp_setting.from_name,
                )
                msg["To"] = ", ".join(email_list)

                msg.set_content(body or "")

                if html_body:
                    msg.add_alternative(html_body, subtype="html")

                self._add_attachments(msg, attachments)

                server.send_message(msg)

        return True

    def send_task_assignment_email(
        self,
        smtp_setting,
        to_emails: List[str],
        subject: str,
        body: str,
        pdf_path: Optional[str] = None,
        docx_path: Optional[str] = None,
        html_body: Optional[str] = None,
    ) -> bool:
        attachments = []

        if pdf_path:
            attachments.append(pdf_path)

        if docx_path:
            attachments.append(docx_path)

        return self.send_email(
            smtp_setting=smtp_setting,
            to_email=to_emails,
            subject=subject,
            body=body,
            html_body=html_body,
            attachments=attachments,
        )


smtp_service = SMTPService()