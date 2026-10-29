"""
PDF <-> DOCX layout fidelity converter.
Extracts text hierarchy, font weights, tables, and paragraphs from PDF into DOCX.
Extracts DOCX document structure into a formatted PDF using ReportLab.
"""

import os
import pdfplumber
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors


def pdf_to_docx(pdf_path: str, output_path: str) -> str:
    """
    Parses PDF structure with pdfplumber and creates a structured Word document.
    """
    doc = Document()

    # Set standard margins
    for section in doc.sections:
        section.top_margin = Inches(1)
        section.bottom_margin = Inches(1)
        section.left_margin = Inches(1)
        section.right_margin = Inches(1)

    with pdfplumber.open(pdf_path) as pdf:
        for p_idx, page in enumerate(pdf.pages):
            if p_idx > 0:
                doc.add_page_break()

            # Find tables to avoid duplicate text extraction
            tables = page.extract_tables()
            table_bboxes = []
            found_tables = page.find_tables()
            for t in found_tables:
                table_bboxes.append(t.bbox)

            # Extract words and detect lines
            words = page.extract_words(keep_blank_chars=False)
            
            # Sort words reading order: top-to-bottom, left-to-right
            words = sorted(words, key=lambda w: (round(w['top'] / 4) * 4, w['x0']))

            lines = []
            current_line = []
            last_top = None

            for w in words:
                # Skip words that are part of an extracted table
                inside_table = False
                for bbox in table_bboxes:
                    if bbox[0] <= w['x0'] and w['x1'] <= bbox[2] and bbox[1] <= w['top'] and w['bottom'] <= bbox[3]:
                        inside_table = True
                        break
                if inside_table:
                    continue

                if last_top is None or abs(w['top'] - last_top) < 4:
                    current_line.append(w)
                    last_top = w['top']
                else:
                    if current_line:
                        lines.append(current_line)
                    current_line = [w]
                    last_top = w['top']
            if current_line:
                lines.append(current_line)

            # Write paragraphs and headings
            for line in lines:
                text = " ".join([w['text'] for w in line]).strip()
                if not text:
                    continue
                avg_size = sum(w.get('size', 11) for w in line) / len(line)

                if avg_size > 18:
                    p = doc.add_heading(text, level=1)
                elif avg_size > 14:
                    p = doc.add_heading(text, level=2)
                elif avg_size > 12:
                    p = doc.add_heading(text, level=3)
                else:
                    p = doc.add_paragraph()
                    run = p.add_run(text)
                    run.font.size = Pt(max(min(avg_size, 14), 9))

            # Add extracted tables
            for t_data in tables:
                if not t_data or not t_data[0]:
                    continue
                rows = len(t_data)
                cols = max(len(r) for r in t_data)
                t_elem = doc.add_table(rows=rows, cols=cols)
                t_elem.style = 'Table Grid'

                for r_idx, row in enumerate(t_data):
                    for c_idx, cell_value in enumerate(row):
                        if c_idx < cols:
                            cell = t_elem.cell(r_idx, c_idx)
                            cell.text = str(cell_value or "").strip()
                            if r_idx == 0:
                                for p in cell.paragraphs:
                                    for r in p.runs:
                                        r.font.bold = True

                doc.add_paragraph()  # Spacing after table

    doc.save(output_path)
    return output_path


def docx_to_pdf(docx_path: str, output_path: str) -> str:
    """
    Renders DOCX paragraphs, headings, bullet lists, and tables into PDF using ReportLab.
    """
    doc = Document(docx_path)
    pdf_doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()
    
    # Custom styles
    h1_style = ParagraphStyle('DocH1', parent=styles['Heading1'], fontSize=20, leading=24, spaceAfter=10, textColor=colors.HexColor('#0f172a'))
    h2_style = ParagraphStyle('DocH2', parent=styles['Heading2'], fontSize=16, leading=20, spaceAfter=8, textColor=colors.HexColor('#1e293b'))
    h3_style = ParagraphStyle('DocH3', parent=styles['Heading3'], fontSize=13, leading=16, spaceAfter=6, textColor=colors.HexColor('#334155'))
    body_style = ParagraphStyle('DocBody', parent=styles['Normal'], fontSize=10.5, leading=14, spaceAfter=6, textColor=colors.HexColor('#1e293b'))

    story = []

    for elem in doc.element.body:
        tag = elem.tag.split('}')[-1]
        if tag == 'p':
            p_obj = None
            for p in doc.paragraphs:
                if p._p == elem:
                    p_obj = p
                    break
            if not p_obj or not p_obj.text.strip():
                continue

            text = p_obj.text.strip()
            # Escape XML entities for ReportLab
            safe_text = text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')

            style_name = p_obj.style.name.lower()
            if 'heading 1' in style_name:
                story.append(Paragraph(safe_text, h1_style))
            elif 'heading 2' in style_name:
                story.append(Paragraph(safe_text, h2_style))
            elif 'heading 3' in style_name:
                story.append(Paragraph(safe_text, h3_style))
            else:
                story.append(Paragraph(safe_text, body_style))

        elif tag == 'tbl':
            tbl_obj = None
            for t in doc.tables:
                if t._tbl == elem:
                    tbl_obj = t
                    break
            if not tbl_obj:
                continue

            table_data = []
            for row in tbl_obj.rows:
                r_vals = []
                for cell in row.cells:
                    c_txt = cell.text.strip().replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
                    r_vals.append(Paragraph(c_txt, body_style))
                table_data.append(r_vals)

            if table_data:
                col_count = len(table_data[0])
                col_width = (letter[0] - 108) / max(col_count, 1)
                t_flow = Table(table_data, colWidths=[col_width] * col_count)
                t_flow.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f1f5f9')),
                    ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#0f172a')),
                    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
                    ('TOPPADDING', (0, 0), (-1, -1), 6),
                    ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
                ]))
                story.append(t_flow)
                story.append(Spacer(1, 10))

    if not story:
        story.append(Paragraph("Empty Document", body_style))

    pdf_doc.build(story)
    return output_path
