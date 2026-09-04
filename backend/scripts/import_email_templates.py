import os
import sys

sys.path.append(
    os.path.dirname(
        os.path.dirname(__file__)
    )
)

from app.database import SessionLocal
from app.models import TemplateLibrary
from app.services.template_import_service import (
    read_email_template_docx,
)


FILE_PATH = (
    "app/template_files/email/"
    "Email_Template_Library.docx"
)


def import_templates():
    db = SessionLocal()

    templates = read_email_template_docx(
        FILE_PATH
    )

    count = 0

    for item in templates:

        exists = (
            db.query(TemplateLibrary)
            .filter(
                TemplateLibrary.template_type == "email",
                TemplateLibrary.template_name
                == item["template_name"],
            )
            .first()
        )

        if exists:
            continue

        template = TemplateLibrary(
            template_type="email",
            category=item["category"],
            template_name=item["template_name"],
            subject_template=item["subject_template"],
            body_template=item["body_template"],
            source_file="Email_Template_Library.docx",
            is_active=True,
        )

        db.add(template)
        count += 1

    db.commit()
    db.close()

    print(
        f"{count} templates imported successfully."
    )


if __name__ == "__main__":
    import_templates()