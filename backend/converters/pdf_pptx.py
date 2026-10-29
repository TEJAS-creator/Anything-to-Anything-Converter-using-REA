"""
PDF <-> PPTX layout reconstruction converter.
Extracts pages, text blocks, bounding boxes, tables, and creates PowerPoint slides.
Renders PPTX slides into PDF.
"""

import os
import io
import pdfplumber
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor
from reportlab.lib.pagesizes import letter, landscape
from reportlab.pdfgen import canvas
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors


def pdf_to_pptx(pdf_path: str, output_path: str) -> str:
    """
    Extracts text blocks, bounding boxes, and tables from a PDF
    and places them into PowerPoint slides preserving layout.
    """
    prs = Presentation()
    # Default 16:9 widescreen or match first page aspect ratio
    prs.slide_width = Inches(10)
    prs.slide_height = Inches(7.5)

    blank_slide_layout = prs.slide_layouts[6]  # Blank layout

    with pdfplumber.open(pdf_path) as pdf:
        for page_idx, page in enumerate(pdf.pages):
            page_w = page.width
            page_h = page.height

            # Match slide aspect ratio
            slide = prs.slides.add_slide(blank_slide_layout)
            scale_x = prs.slide_width / Inches(page_w / 72.0)
            scale_y = prs.slide_height / Inches(page_h / 72.0)

            # 1. Extract and place tables
            tables = page.extract_tables()
            table_bboxes = []
            if tables:
                found_tables = page.find_tables()
                for t_idx, t in enumerate(found_tables):
                    table_bboxes.append(t.bbox)
                    data = t.extract()
                    if not data or not data[0]:
                        continue
                    rows = len(data)
                    cols = max(len(r) for r in data)
                    
                    x0, top, x1, bottom = t.bbox
                    left_in = Inches((x0 / 72.0) * (prs.slide_width / Inches(page_w / 72.0)))
                    top_in = Inches((top / 72.0) * (prs.slide_height / Inches(page_h / 72.0)))
                    width_in = Inches(((x1 - x0) / 72.0) * (prs.slide_width / Inches(page_w / 72.0)))
                    height_in = Inches(((bottom - top) / 72.0) * (prs.slide_height / Inches(page_h / 72.0)))

                    shape = slide.shapes.add_table(rows, cols, left_in, top_in, width_in, height_in)
                    tbl = shape.table
                    for r_i, row in enumerate(data):
                        for c_i, val in enumerate(row):
                            if c_i < cols:
                                cell = tbl.cell(r_i, c_i)
                                cell.text = str(val or "")
                                for p in cell.text_frame.paragraphs:
                                    p.font.size = Pt(9)

            # 2. Extract words and group them into text blocks
            words = page.extract_words(keep_blank_chars=False)
            # Group words by approximate vertical line position (tolerance 3pt)
            lines = []
            current_line = []
            last_top = None

            for w in words:
                # Check if word falls inside an extracted table
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

            # Combine lines into logical blocks
            for line in lines:
                if not line:
                    continue
                line_text = " ".join([w['text'] for w in line]).strip()
                if not line_text:
                    continue

                min_x = min(w['x0'] for w in line)
                max_x = max(w['x1'] for w in line)
                min_top = min(w['top'] for w in line)
                max_bottom = max(w['bottom'] for w in line)
                avg_size = sum(w.get('size', 11) for w in line) / len(line)

                left = Inches(min_x / page_w * 10)
                top = Inches(min_top / page_h * 7.5)
                width = Inches(max((max_x - min_x) / page_w * 10, 1.5))
                height = Inches(max((max_bottom - min_top) / page_h * 7.5, 0.4))

                tx_box = slide.shapes.add_textbox(left, top, width, height)
                tf = tx_box.text_frame
                tf.word_wrap = True
                p = tf.paragraphs[0]
                p.text = line_text
                p.font.size = Pt(max(min(avg_size * 0.95, 28), 9))
                if avg_size > 14:
                    p.font.bold = True

    prs.save(output_path)
    return output_path


def pptx_to_pdf(pptx_path: str, output_path: str) -> str:
    """
    Renders PowerPoint slides into a PDF document using ReportLab.
    """
    prs = Presentation(pptx_path)
    width_pt = prs.slide_width.pt
    height_pt = prs.slide_height.pt

    c = canvas.Canvas(output_path, pagesize=(width_pt, height_pt))

    for slide in prs.slides:
        # Background
        c.setFillColor(colors.whitesmoke)
        c.rect(0, 0, width_pt, height_pt, fill=True, stroke=False)

        for shape in slide.shapes:
            if shape.has_text_frame:
                tf = shape.text_frame
                shape_x = shape.left.pt
                shape_y = height_pt - shape.top.pt - shape.height.pt
                
                cur_y = height_pt - shape.top.pt - 14
                for p in tf.paragraphs:
                    text = p.text.strip()
                    if not text:
                        cur_y -= 14
                        continue
                    font_size = p.font.size.pt if p.font.size else 12
                    font_name = "Helvetica-Bold" if p.font.bold else "Helvetica"
                    c.setFont(font_name, font_size)
                    c.setFillColor(colors.black)
                    c.drawString(shape_x, cur_y, text)
                    cur_y -= (font_size + 4)

            elif shape.has_table:
                tbl = shape.table
                table_data = []
                for row in tbl.rows:
                    row_data = [cell.text.strip() for cell in row.cells]
                    table_data.append(row_data)
                if table_data:
                    col_w = shape.width.pt / len(table_data[0])
                    t = Table(table_data, colWidths=[col_w] * len(table_data[0]))
                    t.setStyle(TableStyle([
                        ('BACKGROUND', (0, 0), (-1, 0), colors.navy),
                        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                        ('FONTSIZE', (0, 0), (-1, -1), 9),
                        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
                        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
                    ]))
                    t.wrapOn(c, shape.width.pt, shape.height.pt)
                    t.drawOn(c, shape.left.pt, height_pt - shape.top.pt - shape.height.pt)

        c.showPage()

    c.save()
    return output_path
