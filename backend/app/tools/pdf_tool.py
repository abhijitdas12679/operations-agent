import os
import re
import uuid
from html import escape
from datetime import datetime

from bs4 import BeautifulSoup
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)

from app.config import settings


TITLE_BLUE = colors.HexColor("#1F4E79")
HEADING_BLUE = colors.HexColor("#2B2FA3")
TEXT_COLOR = colors.HexColor("#374151")
TABLE_BORDER = colors.HexColor("#CFDAF0")
META_BG = colors.HexColor("#E9EEF8")
ACTION_HEADER_BG = colors.HexColor("#4F46E5")

PRIORITY_MEDIUM_BG = colors.HexColor("#FFF3CD")
PRIORITY_MEDIUM_TEXT = colors.HexColor("#B45309")
PRIORITY_HIGH_BG = colors.HexColor("#FEE2E2")
PRIORITY_HIGH_TEXT = colors.HexColor("#B91C1C")
PRIORITY_LOW_BG = colors.HexColor("#DCFCE7")
PRIORITY_LOW_TEXT = colors.HexColor("#047857")


def _ensure_dir(path: str):
    os.makedirs(path, exist_ok=True)


def _clean_text(text: str) -> str:
    if not text:
        return ""

    text = str(text).replace("\xa0", " ")
    text = re.sub(r"\s+", " ", text).strip()

    replacements = {
        "Decision:It": "Decision: It",
        "Decision:  It": "Decision: It",
        "Decision: Decision:": "Decision:",
        "withSayeli": "with Sayeli",
        "Chkraborty": "Chakraborty",
        "[Medium Priority]Medium Priority": "Medium",
        "[High Priority]High Priority": "High",
        "[Low Priority]Low Priority": "Low",
        "Medium Priority": "Medium",
        "High Priority": "High",
        "Low Priority": "Low",
    }

    for old, new in replacements.items():
        text = text.replace(old, new)

    return text.strip()


def _safe_html(text: str) -> str:
    return escape(_clean_text(text))


def _get_section_by_heading(soup: BeautifulSoup, heading: str):
    wanted = heading.strip().lower()

    for section in soup.find_all("section"):
        h = section.find(["h1", "h2", "h3", "h4"])
        if h and h.get_text(" ", strip=True).strip().lower() == wanted:
            return section

    for h in soup.find_all(["h1", "h2", "h3", "h4"]):
        if h.get_text(" ", strip=True).strip().lower() == wanted:
            return h.parent

    return None


def _get_meta_value(soup: BeautifulSoup, label: str) -> str:
    first_section = soup.find("section")
    if not first_section:
        return ""

    label_lower = label.lower().strip().rstrip(":")

    for p in first_section.find_all("p", recursive=False):
        text = _clean_text(p.get_text(" ", strip=True))
        if text.lower().startswith(label_lower):
            parts = text.split(":", 1)
            if len(parts) == 2:
                return _clean_text(parts[1])

    for row in first_section.find_all("tr"):
        cells = row.find_all(["td", "th"])
        if len(cells) >= 2:
            left = _clean_text(cells[0].get_text(" ", strip=True)).lower().rstrip(":")
            if left == label_lower:
                return _clean_text(cells[1].get_text(" ", strip=True))

    return ""


def _section_paragraph(soup: BeautifulSoup, heading: str) -> str:
    section = _get_section_by_heading(soup, heading)
    if not section:
        return ""

    paragraphs = []

    for p in section.find_all("p"):
        text = _clean_text(p.get_text(" ", strip=True))
        if text and text.lower() != heading.lower():
            paragraphs.append(text)

    if paragraphs:
        return " ".join(paragraphs)

    text = _clean_text(section.get_text(" ", strip=True))
    return _clean_text(text.replace(heading, "", 1))


def _section_items(soup: BeautifulSoup, heading: str):
    section = _get_section_by_heading(soup, heading)
    if not section:
        return []

    items = []

    for li in section.find_all("li"):
        text = _clean_text(li.get_text(" ", strip=True))
        if text:
            items.append(text)

    if items:
        return items

    for p in section.find_all("p"):
        text = _clean_text(p.get_text(" ", strip=True))
        if text and text.lower() != heading.lower():
            items.append(text)

    return items


def _extract_priority(text: str) -> str:
    text = (text or "").lower()

    if "high" in text:
        return "High"
    if "low" in text:
        return "Low"
    return "Medium"


def _extract_action_items(soup: BeautifulSoup):
    section = _get_section_by_heading(soup, "Action Items")

    if not section:
        return [{
            "task": "To be confirmed",
            "owner": "Owner to be assigned",
            "deadline": "To be confirmed",
            "priority": "Medium",
        }]

    items = []

    for row in section.find_all("tr"):
        cells = row.find_all(["td", "th"])
        if len(cells) >= 4:
            first = _clean_text(cells[0].get_text(" ", strip=True))
            if first == "#" or first.lower() == "task":
                continue

            if len(cells) >= 5:
                task = _clean_text(cells[1].get_text(" ", strip=True))
                owner = _clean_text(cells[2].get_text(" ", strip=True))
                deadline = _clean_text(cells[3].get_text(" ", strip=True))
                priority = _extract_priority(cells[4].get_text(" ", strip=True))
            else:
                task = _clean_text(cells[0].get_text(" ", strip=True))
                owner = _clean_text(cells[1].get_text(" ", strip=True))
                deadline = _clean_text(cells[2].get_text(" ", strip=True))
                priority = _extract_priority(cells[3].get_text(" ", strip=True))

            if task or owner or deadline:
                items.append({
                    "task": task or "To be confirmed",
                    "owner": owner or "Owner to be assigned",
                    "deadline": deadline or "To be confirmed",
                    "priority": priority,
                })

    if items:
        return items

    for li in section.find_all("li"):
        full_text = _clean_text(li.get_text(" ", strip=True))

        task = ""
        owner = ""
        deadline = ""
        priority = _extract_priority(full_text)

        for p in li.find_all("p"):
            text = _clean_text(p.get_text(" ", strip=True))

            if text.lower().startswith("task:"):
                task = _clean_text(text.split(":", 1)[1])
            elif text.lower().startswith("owner:"):
                owner = _clean_text(text.split(":", 1)[1])
            elif text.lower().startswith("deadline:"):
                deadline = _clean_text(text.split(":", 1)[1])
            elif text.lower().startswith("priority:"):
                priority = _extract_priority(text)

        if not task:
            match = re.search(r"Task:\s*(.*?)(Owner:|Deadline:|Priority:|$)", full_text, flags=re.I)
            if match:
                task = _clean_text(match.group(1))

        if not owner:
            match = re.search(r"Owner:\s*(.*?)(Deadline:|Priority:|$)", full_text, flags=re.I)
            if match:
                owner = _clean_text(match.group(1))

        if not deadline:
            match = re.search(r"Deadline:\s*(.*?)(Priority:|$)", full_text, flags=re.I)
            if match:
                deadline = _clean_text(match.group(1))

        if task or owner or deadline:
            items.append({
                "task": task or "To be confirmed",
                "owner": owner or "Owner to be assigned",
                "deadline": deadline or "To be confirmed",
                "priority": priority,
            })

    return items or [{
        "task": "To be confirmed",
        "owner": "Owner to be assigned",
        "deadline": "To be confirmed",
        "priority": "Medium",
    }]


def _priority_colors(priority: str):
    priority = (priority or "").lower()

    if priority == "high":
        return PRIORITY_HIGH_TEXT, PRIORITY_HIGH_BG
    if priority == "low":
        return PRIORITY_LOW_TEXT, PRIORITY_LOW_BG
    return PRIORITY_MEDIUM_TEXT, PRIORITY_MEDIUM_BG


def _make_styles():
    base = getSampleStyleSheet()

    return {
        "title": ParagraphStyle(
            "MomTitle",
            parent=base["Title"],
            fontName="Times-Bold",
            fontSize=22,
            leading=28,
            textColor=TITLE_BLUE,
            alignment=TA_CENTER,
            spaceAfter=16,
        ),
        "generated": ParagraphStyle(
            "Generated",
            parent=base["Normal"],
            fontName="Times-Italic",
            fontSize=10.5,
            leading=14,
            textColor=colors.HexColor("#4B5563"),
            alignment=TA_CENTER,
            spaceAfter=46,
        ),
        "section": ParagraphStyle(
            "SectionHeading",
            parent=base["Heading2"],
            fontName="Times-Bold",
            fontSize=16,
            leading=20,
            textColor=HEADING_BLUE,
            alignment=TA_LEFT,
            spaceBefore=14,
            spaceAfter=8,
        ),
        "body": ParagraphStyle(
            "Body",
            parent=base["Normal"],
            fontName="Times-Roman",
            fontSize=11.7,
            leading=17,
            textColor=TEXT_COLOR,
            alignment=TA_LEFT,
            spaceAfter=4,
        ),
        "number": ParagraphStyle(
            "Number",
            parent=base["Normal"],
            fontName="Times-Roman",
            fontSize=11.7,
            leading=17,
            textColor=colors.black,
            alignment=TA_LEFT,
        ),
        "meta_label": ParagraphStyle(
            "MetaLabel",
            parent=base["Normal"],
            fontName="Times-Bold",
            fontSize=11,
            leading=14,
            textColor=colors.black,
            alignment=TA_LEFT,
        ),
        "meta_value": ParagraphStyle(
            "MetaValue",
            parent=base["Normal"],
            fontName="Times-Roman",
            fontSize=11,
            leading=14,
            textColor=TEXT_COLOR,
            alignment=TA_LEFT,
        ),
        "action_header": ParagraphStyle(
            "ActionHeader",
            parent=base["Normal"],
            fontName="Times-Bold",
            fontSize=10.5,
            leading=13,
            textColor=colors.white,
            alignment=TA_LEFT,
        ),
        "action_body": ParagraphStyle(
            "ActionBody",
            parent=base["Normal"],
            fontName="Times-Roman",
            fontSize=10.5,
            leading=13.5,
            textColor=colors.black,
            alignment=TA_LEFT,
        ),
        "priority": ParagraphStyle(
            "Priority",
            parent=base["Normal"],
            fontName="Times-Bold",
            fontSize=10.5,
            leading=13.5,
            alignment=TA_LEFT,
        ),
    }


def _p(text: str, style):
    return Paragraph(_safe_html(text), style)


def _raw_p(html: str, style):
    return Paragraph(html, style)


def _add_meta_table(story, meta: dict, styles):
    rows = [
        ("Meeting Title", meta.get("meeting_title") or "To be confirmed"),
        ("Date", meta.get("date") or datetime.now().strftime("%d %b %Y")),
        ("Time", meta.get("time") or "To be confirmed"),
        ("Location / Platform", meta.get("location") or "To be confirmed"),
        ("Attendees", meta.get("attendees") or "To be confirmed"),
        ("Prepared By", meta.get("prepared_by") or "To be confirmed"),
    ]

    data = [
        [_p(label, styles["meta_label"]), _p(value, styles["meta_value"])]
        for label, value in rows
    ]

    # Full available text width:
    # A4 width = 21 cm
    # left margin = 1.75 cm
    # right margin = 1.75 cm
    # available width = 17.5 cm
    available_width = 17.5 * cm

    table = Table(
        data,
        colWidths=[
            available_width * 0.38,
            available_width * 0.62,
        ],
        hAlign="LEFT",
    )

    table.setStyle(TableStyle([
        ("GRID", (0, 0), (-1, -1), 0.8, TABLE_BORDER),
        ("BACKGROUND", (0, 0), (0, -1), META_BG),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("ALIGN", (0, 0), (-1, -1), "LEFT"),

        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))

    story.append(table)
    story.append(Spacer(1, 0.42 * cm))


def _add_section_heading(story, heading: str, styles):
    story.append(Paragraph(escape(heading), styles["section"]))


def _add_body(story, text: str, styles):
    story.append(_p(text or "To be confirmed", styles["body"]))


def _add_numbered_items(story, items, styles, start_number: int):
    if not items:
        items = ["To be confirmed"]

    rows = []

    for index, item in enumerate(items, start=start_number):
        rows.append([
            _p(f"{index}.", styles["number"]),
            _p(item, styles["body"]),
        ])

    table = Table(rows, colWidths=[0.55 * cm, 16.95 * cm], hAlign="LEFT")

    table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (0, -1), 6),
        ("RIGHTPADDING", (1, 0), (1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 1),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 1),
    ]))

    story.append(table)
    return start_number + len(items)


def _add_action_table(story, action_items, styles):
    data = [[
        _raw_p("<b>#</b>", styles["action_header"]),
        _raw_p("<b>Task</b>", styles["action_header"]),
        _raw_p("<b>Owner</b>", styles["action_header"]),
        _raw_p("<b>Deadline</b>", styles["action_header"]),
        _raw_p("<b>Priority</b>", styles["action_header"]),
    ]]

    for index, item in enumerate(action_items, start=1):
        priority = item.get("priority", "Medium")
        text_color, _ = _priority_colors(priority)

        data.append([
            _p(str(index), styles["action_body"]),
            _p(item.get("task") or "To be confirmed", styles["action_body"]),
            _p(item.get("owner") or "Owner to be assigned", styles["action_body"]),
            _p(item.get("deadline") or "To be confirmed", styles["action_body"]),
            _raw_p(
                f'<font color="{text_color.hexval()}"><b>{escape(priority)}</b></font>',
                styles["priority"],
            ),
        ])

    available_width = 17.5 * cm

    table = Table(
        data,
        colWidths=[
            available_width * 0.08,
            available_width * 0.38,
            available_width * 0.22,
            available_width * 0.18,
            available_width * 0.14,
        ],
        repeatRows=1,
        hAlign="LEFT",
    )

    commands = [
        ("GRID", (0, 0), (-1, -1), 0.8, TABLE_BORDER),
        ("BACKGROUND", (0, 0), (-1, 0), ACTION_HEADER_BG),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("ALIGN", (0, 1), (0, -1), "LEFT"),
        ("ALIGN", (4, 1), (4, -1), "LEFT"),
    ]

    for row_idx, item in enumerate(action_items, start=1):
        _, bg = _priority_colors(item.get("priority", "Medium"))
        commands.append(("BACKGROUND", (4, row_idx), (4, row_idx), bg))

    table.setStyle(TableStyle(commands))
    story.append(table)
    story.append(Spacer(1, 0.38 * cm))


def _format_mom_template_pdf(content: str, title: str, styles):
    soup = BeautifulSoup(content or "", "html.parser")

    meta = {
        "meeting_title": _get_meta_value(soup, "Meeting Title") or (title or "").replace("MOM - ", "") or "To be confirmed",
        "date": _get_meta_value(soup, "Date") or datetime.now().strftime("%d %b %Y"),
        "time": _get_meta_value(soup, "Time") or "To be confirmed",
        "location": _get_meta_value(soup, "Location / Platform") or "To be confirmed",
        "attendees": _get_meta_value(soup, "Attendees") or "To be confirmed",
        "prepared_by": _get_meta_value(soup, "Prepared By") or "To be confirmed",
    }

    story = [
        Paragraph("MINUTES OF MEETING", styles["title"]),
        Paragraph(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", styles["generated"]),
    ]

    _add_meta_table(story, meta, styles)

    number = 1

    _add_section_heading(story, "Meeting Objective", styles)
    _add_body(story, _section_paragraph(soup, "Meeting Objective"), styles)

    _add_section_heading(story, "Meeting Overview", styles)
    _add_body(story, _section_paragraph(soup, "Meeting Overview"), styles)

    _add_section_heading(story, "Key Discussion Points", styles)
    number = _add_numbered_items(story, _section_items(soup, "Key Discussion Points"), styles, number)

    _add_section_heading(story, "Decisions Taken", styles)
    number = _add_numbered_items(story, _section_items(soup, "Decisions Taken"), styles, number)

    _add_section_heading(story, "Action Items", styles)
    _add_action_table(story, _extract_action_items(soup), styles)

    _add_section_heading(story, "Risks / Dependencies", styles)
    number = _add_numbered_items(story, _section_items(soup, "Risks / Dependencies"), styles, number)

    _add_section_heading(story, "Next Steps", styles)
    number = _add_numbered_items(story, _section_items(soup, "Next Steps"), styles, number)

    _add_section_heading(story, "Closing Summary", styles)
    _add_body(story, _section_paragraph(soup, "Closing Summary"), styles)

    return story


def _add_basic_content(content: str, story, styles):
    soup = BeautifulSoup(content or "", "html.parser")
    text = soup.get_text("\n") if soup.find() else content or ""

    for line in text.split("\n"):
        line = _clean_text(line)
        if line:
            story.append(_p(line, styles["body"]))


def export_to_pdf(content: str, doc_type: str, title: str = "") -> str:
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
        rightMargin=1.75 * cm,
        leftMargin=1.75 * cm,
        topMargin=1.55 * cm,
        bottomMargin=1.45 * cm,
    )

    styles = _make_styles()

    if doc_type == "meeting":
        story = _format_mom_template_pdf(content, title, styles)
    else:
        story = [
            Paragraph(escape(title or doc_type.upper()), styles["title"]),
            Paragraph(
                f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
                styles["generated"],
            ),
            Spacer(1, 0.3 * cm),
        ]
        _add_basic_content(content, story, styles)

    doc.build(story)
    return filepath