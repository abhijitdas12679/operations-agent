"""
PDF export tool using ReportLab.
"""
import os
import uuid
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from app.config import settings


def _ensure_dir(path: str):
    os.makedirs(path, exist_ok=True)


def export_to_pdf(content: str, doc_type: str, title: str = "") -> str:
    """
    Create a PDF file from content string.
    Returns the absolute file path.
    """
    folder_map = {
        "email": settings.EMAILS_DIR,
        "report": settings.REPORTS_DIR,
        "meeting": settings.MOMS_DIR,
    }
    folder = folder_map.get(doc_type, settings.OUTPUT_DIR)
    _ensure_dir(folder)

    filename = f"{doc_type}_{uuid.uuid4().hex[:8]}_{datetime.now().strftime('%Y%m%d%H%M%S')}.pdf"
    filepath = os.path.join(folder, filename)

    doc = SimpleDocTemplate(
        filepath,
        pagesize=A4,
        rightMargin=2 * cm,
        leftMargin=2 * cm,
        topMargin=2 * cm,
        bottomMargin=2 * cm,
    )

    styles = getSampleStyleSheet()
    style_title = ParagraphStyle(
        "CustomTitle",
        parent=styles["Title"],
        fontSize=20,
        textColor=colors.HexColor("#1F538A"),
        spaceAfter=12,
        alignment=TA_CENTER,
    )
    style_h2 = ParagraphStyle(
        "CustomH2",
        parent=styles["Heading2"],
        fontSize=13,
        textColor=colors.HexColor("#2E4057"),
        spaceBefore=10,
        spaceAfter=4,
    )
    style_body = ParagraphStyle(
        "CustomBody",
        parent=styles["Normal"],
        fontSize=10,
        leading=16,
        alignment=TA_LEFT,
    )
    style_meta = ParagraphStyle(
        "Meta",
        parent=styles["Normal"],
        fontSize=8,
        textColor=colors.grey,
        alignment=TA_CENTER,
    )

    story = []
    story.append(Paragraph(title or doc_type.upper(), style_title))
    story.append(Paragraph(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", style_meta))
    story.append(Spacer(1, 0.5 * cm))

    for line in content.split("\n"):
        stripped = line.strip()
        if not stripped:
            story.append(Spacer(1, 0.3 * cm))
            continue
        if stripped.startswith("## "):
            story.append(Paragraph(stripped[3:], style_h2))
        elif stripped.startswith("# "):
            story.append(Paragraph(stripped[2:], style_title))
        elif stripped.startswith("- ") or stripped.startswith("* "):
            story.append(Paragraph(f"• {stripped[2:]}", style_body))
        else:
            story.append(Paragraph(stripped, style_body))

    doc.build(story)
    return filepath
