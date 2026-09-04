import os
import re
import uuid
from datetime import datetime

from bs4 import BeautifulSoup, NavigableString, Tag
from docx import Document
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT, WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor

from app.config import settings


def _ensure_dir(path: str):
    os.makedirs(path, exist_ok=True)


def _clean_text(text: str) -> str:
    if not text:
        return ""

    text = str(text).replace("\xa0", " ")
    text = re.sub(r"\s+", " ", text)
    text = text.replace("Decision:", "Decision: ")
    text = text.replace("withSayeli", "with Sayeli")
    text = text.replace("Chkraborty", "Chakraborty")

    return text.strip()


def _set_run_style(run, bold=False, italic=False, color=None, size=None):
    run.bold = bold
    run.italic = italic

    if color:
        run.font.color.rgb = RGBColor(*color)

    if size:
        run.font.size = Pt(size)


def _set_cell_shading(cell, fill: str):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:fill"), fill)
    tc_pr.append(shd)


def _set_cell_border(cell, color="D9E2F3", size="8"):
    tc = cell._tc
    tc_pr = tc.get_or_add_tcPr()
    tc_borders = tc_pr.first_child_found_in("w:tcBorders")

    if tc_borders is None:
        tc_borders = OxmlElement("w:tcBorders")
        tc_pr.append(tc_borders)

    for edge in ("top", "left", "bottom", "right"):
        tag = f"w:{edge}"
        element = tc_borders.find(qn(tag))

        if element is None:
            element = OxmlElement(tag)
            tc_borders.append(element)

        element.set(qn("w:val"), "single")
        element.set(qn("w:sz"), size)
        element.set(qn("w:space"), "0")
        element.set(qn("w:color"), color)


def _style_table_cell(cell, bold=False, color=None, fill=None):
    cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER

    if fill:
        _set_cell_shading(cell, fill)

    _set_cell_border(cell)

    for paragraph in cell.paragraphs:
        paragraph.alignment = WD_ALIGN_PARAGRAPH.LEFT

        for run in paragraph.runs:
            run.font.size = Pt(9)
            run.bold = bold

            if color:
                run.font.color.rgb = RGBColor(*color)


def _priority_color(priority: str):
    priority = (priority or "").lower()

    if priority == "high":
        return (185, 28, 28), "FEE2E2"

    if priority == "low":
        return (4, 120, 87), "DCFCE7"

    return (180, 83, 9), "FEF3C7"


def _add_title(doc: Document, title: str):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER

    run = p.add_run((title or "Document").upper())
    run.bold = True
    run.font.size = Pt(18)
    run.font.color.rgb = RGBColor(31, 83, 138)


def _add_subtitle(doc: Document, text: str):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER

    run = p.add_run(text)
    run.italic = True
    run.font.size = Pt(9)
    run.font.color.rgb = RGBColor(107, 114, 128)


def _add_inline_runs(paragraph, node, bold=False, italic=False):
    if isinstance(node, NavigableString):
        text = str(node)

        if text:
            run = paragraph.add_run(text)
            _set_run_style(run, bold=bold, italic=italic, size=10)

        return

    if not isinstance(node, Tag):
        return

    tag = node.name.lower()

    if tag in ["strong", "b"]:
        for child in node.children:
            _add_inline_runs(paragraph, child, bold=True, italic=italic)
        return

    if tag in ["em", "i"]:
        for child in node.children:
            _add_inline_runs(paragraph, child, bold=bold, italic=True)
        return

    if tag == "span":
        class_text = " ".join(node.get("class", [])).lower()
        span_text = node.get_text(" ", strip=True)

        if "priority-high" in class_text:
            run = paragraph.add_run("High Priority")
            _set_run_style(run, bold=True, color=(185, 28, 28), size=10)
            return

        if "priority-medium" in class_text:
            run = paragraph.add_run("Medium Priority")
            _set_run_style(run, bold=True, color=(180, 83, 9), size=10)
            return

        if "priority-low" in class_text:
            run = paragraph.add_run("Low Priority")
            _set_run_style(run, bold=True, color=(4, 120, 87), size=10)
            return

        run = paragraph.add_run(span_text)
        _set_run_style(run, bold=bold, italic=italic, size=10)
        return

    for child in node.children:
        _add_inline_runs(paragraph, child, bold=bold, italic=italic)


def _extract_action_items_from_html(section):
    action_items = []

    for row in section.find_all("tr"):
        cells = row.find_all(["td", "th"])

        if len(cells) < 4:
            continue

        first = _clean_text(cells[0].get_text(" ", strip=True)).lower()

        if first in ["#", "task", "no", "sl no"]:
            continue

        if len(cells) >= 5:
            task = _clean_text(cells[1].get_text(" ", strip=True))
            owner = _clean_text(cells[2].get_text(" ", strip=True))
            deadline = _clean_text(cells[3].get_text(" ", strip=True))
            priority = _clean_text(cells[4].get_text(" ", strip=True))
        else:
            task = _clean_text(cells[0].get_text(" ", strip=True))
            owner = _clean_text(cells[1].get_text(" ", strip=True))
            deadline = _clean_text(cells[2].get_text(" ", strip=True))
            priority = _clean_text(cells[3].get_text(" ", strip=True))

        if task:
            action_items.append(
                {
                    "task": task,
                    "owner": owner or "Owner to be assigned",
                    "deadline": deadline or "To be confirmed",
                    "priority": priority or "Medium",
                }
            )

    if action_items:
        return action_items

    for li in section.find_all("li"):
        text = _clean_text(li.get_text(" ", strip=True))

        if not text:
            continue

        task = ""
        owner = ""
        deadline = ""
        priority = "Medium"

        task_match = re.search(
            r"Task:\s*(.*?)(Owner:|Deadline:|Priority:|High Priority|Medium Priority|Low Priority|$)",
            text,
            flags=re.I,
        )
        owner_match = re.search(
            r"Owner:\s*(.*?)(Deadline:|Priority:|High Priority|Medium Priority|Low Priority|$)",
            text,
            flags=re.I,
        )
        deadline_match = re.search(
            r"Deadline:\s*(.*?)(Priority:|High Priority|Medium Priority|Low Priority|$)",
            text,
            flags=re.I,
        )

        if task_match:
            task = _clean_text(task_match.group(1))

        if owner_match:
            owner = _clean_text(owner_match.group(1))

        if deadline_match:
            deadline = _clean_text(deadline_match.group(1))

        if "high priority" in text.lower():
            priority = "High"
        elif "low priority" in text.lower():
            priority = "Low"
        elif "medium priority" in text.lower():
            priority = "Medium"

        if not task:
            task = re.sub(
                r"(Owner:|Deadline:|Priority:|High Priority|Medium Priority|Low Priority).*",
                "",
                text,
                flags=re.I,
            ).strip()

        if task:
            action_items.append(
                {
                    "task": task,
                    "owner": owner or "Owner to be assigned",
                    "deadline": deadline or "To be confirmed",
                    "priority": priority,
                }
            )

    return action_items


def _add_action_table(doc: Document, action_items):
    if not action_items:
        return

    table = doc.add_table(rows=1, cols=5)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = True

    headers = ["#", "Task", "Owner", "Deadline", "Priority"]

    for i, header in enumerate(headers):
        cell = table.rows[0].cells[i]
        cell.text = header
        _style_table_cell(cell, bold=True, color=(255, 255, 255), fill="4F46E5")

    for index, item in enumerate(action_items, start=1):
        row = table.add_row().cells

        row[0].text = str(index)
        row[1].text = item.get("task", "To be confirmed")
        row[2].text = item.get("owner", "Owner to be assigned")
        row[3].text = item.get("deadline", "To be confirmed")

        priority = item.get("priority", "Medium")
        priority_lower = priority.lower()

        if "high" in priority_lower:
            priority = "High"
        elif "low" in priority_lower:
            priority = "Low"
        else:
            priority = "Medium"

        row[4].text = priority

        for cell in row:
            _style_table_cell(cell)

        color, fill = _priority_color(priority)
        _style_table_cell(row[4], bold=True, color=color, fill=fill)

    doc.add_paragraph()


def _is_action_items_heading(text: str) -> bool:
    return "action item" in (text or "").lower()


def _add_html_node_to_doc(doc: Document, node):
    if isinstance(node, NavigableString):
        text = str(node).strip()

        if text:
            p = doc.add_paragraph()
            run = p.add_run(_clean_text(text))
            run.font.size = Pt(10)

        return

    if not isinstance(node, Tag):
        return

    tag = node.name.lower()

    if tag in ["section", "div"]:
        heading = node.find(["h1", "h2", "h3", "h4"], recursive=False)
        heading_text = heading.get_text(" ", strip=True) if heading else ""

        if heading_text and _is_action_items_heading(heading_text):
            doc.add_heading(heading_text, level=2)
            _add_action_table(doc, _extract_action_items_from_html(node))
            return

        for child in node.children:
            _add_html_node_to_doc(doc, child)

        return

    if tag in ["h1", "h2"]:
        doc.add_heading(node.get_text(" ", strip=True), level=1)
        return

    if tag in ["h3", "h4"]:
        doc.add_heading(node.get_text(" ", strip=True), level=2)
        return

    if tag == "p":
        text = _clean_text(node.get_text(" ", strip=True))

        if not text:
            return

        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(4)
        _add_inline_runs(p, node)
        return

    if tag in ["ol", "ul"]:
        style_name = "List Number" if tag == "ol" else "List Bullet"

        for li in node.find_all("li", recursive=False):
            p = doc.add_paragraph(style=style_name)
            p.paragraph_format.space_after = Pt(3)
            _add_inline_runs(p, li)

        return

    if tag == "table":
        rows = node.find_all("tr")

        if not rows:
            return

        col_count = max(len(r.find_all(["td", "th"])) for r in rows)

        if col_count <= 0:
            return

        table = doc.add_table(rows=0, cols=col_count)
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        table.autofit = True

        for row_index, tr in enumerate(rows):
            cells = tr.find_all(["td", "th"])
            doc_row = table.add_row().cells

            for cell_index, cell in enumerate(cells):
                if cell_index >= len(doc_row):
                    continue

                doc_row[cell_index].text = _clean_text(cell.get_text(" ", strip=True))

                if row_index == 0 or cell.name == "th":
                    _style_table_cell(doc_row[cell_index], bold=True, fill="EEF2FF")
                else:
                    _style_table_cell(doc_row[cell_index])

        doc.add_paragraph()
        return

    text = _clean_text(node.get_text(" ", strip=True))

    if text:
        p = doc.add_paragraph()
        run = p.add_run(text)
        run.font.size = Pt(10)


def _add_text_content_to_doc(doc: Document, content: str):
    for line in (content or "").split("\n"):
        stripped = line.strip()

        if not stripped:
            doc.add_paragraph()
            continue

        if stripped.startswith("## "):
            doc.add_heading(stripped[3:], level=2)

        elif stripped.startswith("# "):
            doc.add_heading(stripped[2:], level=1)

        elif stripped.startswith("- ") or stripped.startswith("* "):
            p = doc.add_paragraph(style="List Bullet")
            run = p.add_run(stripped[2:])
            run.font.size = Pt(10)

        elif re.match(r"^\d+\.\s+", stripped):
            p = doc.add_paragraph(style="List Number")
            run = p.add_run(re.sub(r"^\d+\.\s+", "", stripped))
            run.font.size = Pt(10)

        else:
            p = doc.add_paragraph()
            run = p.add_run(stripped)
            run.font.size = Pt(10)


def _add_content_to_doc(doc: Document, content: str):
    content = content or ""

    if re.search(r"<\s*(section|div|h1|h2|h3|h4|p|ol|ul|li|strong|span|table)\b", content, flags=re.I):
        soup = BeautifulSoup(content, "html.parser")

        for child in soup.contents:
            _add_html_node_to_doc(doc, child)

        return

    _add_text_content_to_doc(doc, content)


def export_to_docx(content: str, doc_type: str, title: str = "") -> str:
    _ensure_dir(settings.OUTPUT_DIR)

    folder_map = {
        "email": settings.EMAILS_DIR,
        "report": settings.REPORTS_DIR,
        "meeting": settings.MOMS_DIR,
        "task": settings.TASKS_DIR,
    }

    folder = folder_map.get(doc_type, settings.OUTPUT_DIR)
    _ensure_dir(folder)

    filename = f"{doc_type}_{uuid.uuid4().hex[:8]}_{datetime.now().strftime('%Y%m%d%H%M%S')}.docx"
    filepath = os.path.join(folder, filename)

    doc = Document()

    for section in doc.sections:
        section.top_margin = Inches(0.7)
        section.bottom_margin = Inches(0.7)
        section.left_margin = Inches(0.8)
        section.right_margin = Inches(0.8)

    heading = doc.add_heading(title or doc_type.upper(), level=1)
    heading.alignment = WD_ALIGN_PARAGRAPH.CENTER

    for run in heading.runs:
        run.font.color.rgb = RGBColor(31, 83, 138)

    ts = doc.add_paragraph(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    ts.alignment = WD_ALIGN_PARAGRAPH.RIGHT

    if ts.runs:
        ts.runs[0].font.size = Pt(9)
        ts.runs[0].font.color.rgb = RGBColor(136, 136, 136)

    doc.add_paragraph()
    _add_content_to_doc(doc, content)

    doc.save(filepath)
    return filepath