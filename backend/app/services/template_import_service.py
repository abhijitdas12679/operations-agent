import re
from docx import Document


DEPARTMENTS = {
    "HR Department": "HR",
    "Operations Department": "Operations",
    "Admin Department": "Admin",
    "Technical Department": "Technical",
    "Client Communication Templates": "Client Communication",
    "Internal Communication Templates": "Internal Communication",
}


def _paragraph_is_bullet(paragraph) -> bool:
    try:
        style_name = (paragraph.style.name or "").lower()
        if "bullet" in style_name:
            return True

        pPr = paragraph._p.pPr
        if pPr is not None and pPr.numPr is not None:
            return True
    except Exception:
        pass

    return False


def _paragraph_is_numbered(paragraph) -> bool:
    try:
        style_name = (paragraph.style.name or "").lower()
        if "number" in style_name:
            return True
    except Exception:
        pass

    return False


def _get_paragraph_text(paragraph) -> str:
    text = paragraph.text.strip()

    if not text:
        return ""

    if _paragraph_is_numbered(paragraph):
        return f"1. {text}"

    if _paragraph_is_bullet(paragraph):
        return f"• {text}"

    return text


def read_email_template_docx(file_path: str):
    document = Document(file_path)

    lines = []

    for p in document.paragraphs:
        text = _get_paragraph_text(p)
        if text:
            lines.append(text)

    templates = []

    current_category = None
    current_template = None
    current_subject = ""
    current_body = []

    template_pattern = re.compile(r"^\d+\.\s+(.*)$")

    for line in lines:
        if line in DEPARTMENTS:
            current_category = DEPARTMENTS[line]
            continue

        match = template_pattern.match(line)

        if match and not current_template:
            current_template = match.group(1).strip()
            current_subject = ""
            current_body = []
            continue

        if match and current_template:
            templates.append(
                {
                    "category": current_category,
                    "template_name": current_template,
                    "subject_template": current_subject,
                    "body_template": "\n".join(current_body).strip(),
                }
            )

            current_template = match.group(1).strip()
            current_subject = ""
            current_body = []
            continue

        if line.startswith("Subject:"):
            current_subject = line.replace("Subject:", "", 1).strip()
            continue

        if current_template:
            current_body.append(line)

    if current_template:
        templates.append(
            {
                "category": current_category,
                "template_name": current_template,
                "subject_template": current_subject,
                "body_template": "\n".join(current_body).strip(),
            }
        )

    return templates