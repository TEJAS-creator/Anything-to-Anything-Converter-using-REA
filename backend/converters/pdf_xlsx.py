"""
PDF <-> XLSX Table and Grid Layout Converter.
Extracts tables and structured grids from PDF into Excel worksheets.
Renders XLSX sheets and tabular data into clean PDF documents.
"""

import pdfplumber
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
from reportlab.lib.pagesizes import letter, landscape
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors


def pdf_to_xlsx(pdf_path: str, output_path: str) -> str:
    """
    Extracts tables from PDF pages and writes them to styled XLSX sheets.
    """
    wb = openpyxl.Workbook()
    # Remove default sheet
    wb.remove(wb.active)

    header_font = Font(name='Calibri', size=11, bold=True, color='FFFFFF')
    header_fill = PatternFill(start_color='1E3A8A', end_color='1E3A8A', fill_type='solid')
    body_font = Font(name='Calibri', size=10)
    thin_border = Border(
        left=Side(style='thin', color='CBD5E1'),
        right=Side(style='thin', color='CBD5E1'),
        top=Side(style='thin', color='CBD5E1'),
        bottom=Side(style='thin', color='CBD5E1')
    )

    with pdfplumber.open(pdf_path) as pdf:
        sheet_count = 0
        for p_idx, page in enumerate(pdf.pages):
            tables = page.extract_tables()
            if not tables:
                # If no formal table detected, try extract_words grid
                text = page.extract_text()
                if text:
                    ws = wb.create_sheet(title=f"Page_{p_idx + 1}")
                    sheet_count += 1
                    lines = [l.strip() for l in text.splitlines() if l.strip()]
                    for r_idx, line in enumerate(lines, start=1):
                        parts = line.split()
                        for c_idx, part in enumerate(parts, start=1):
                            cell = ws.cell(row=r_idx, column=c_idx, value=part)
                            cell.font = body_font
                continue

            for t_idx, table in enumerate(tables):
                sheet_count += 1
                title = f"P{p_idx + 1}_Table{t_idx + 1}"[:31]
                ws = wb.create_sheet(title=title)

                for r_idx, row in enumerate(table, start=1):
                    for c_idx, val in enumerate(row, start=1):
                        cell_value = str(val or "").strip()
                        # Attempt numeric conversion if possible
                        try:
                            if "." in cell_value:
                                num = float(cell_value.replace(",", ""))
                                cell = ws.cell(row=r_idx, column=c_idx, value=num)
                            else:
                                num = int(cell_value.replace(",", ""))
                                cell = ws.cell(row=r_idx, column=c_idx, value=num)
                        except (ValueError, AttributeError):
                            cell = ws.cell(row=r_idx, column=c_idx, value=cell_value)

                        cell.border = thin_border
                        if r_idx == 1:
                            cell.font = header_font
                            cell.fill = header_fill
                            cell.alignment = Alignment(horizontal='center', vertical='center')
                        else:
                            cell.font = body_font
                            cell.alignment = Alignment(vertical='center')

                # Auto-adjust column widths
                for col in ws.columns:
                    max_len = 0
                    col_letter = get_column_letter(col[0].column)
                    for cell in col:
                        val_str = str(cell.value or "")
                        max_len = max(max_len, len(val_str))
                    ws.column_dimensions[col_letter].width = max(max_len + 3, 10)

        if sheet_count == 0:
            ws = wb.create_sheet(title="Extracted Data")
            ws.cell(row=1, column=1, value="No tabular data could be extracted from this PDF.")

    wb.save(output_path)
    return output_path


def xlsx_to_pdf(xlsx_path: str, output_path: str) -> str:
    """
    Renders XLSX worksheets into a clean PDF document with grid tables.
    """
    wb = openpyxl.load_workbook(xlsx_path, data_only=True)
    pdf_doc = SimpleDocTemplate(
        output_path,
        pagesize=landscape(letter),
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle('SheetTitle', parent=styles['Heading2'], fontSize=14, spaceAfter=8, textColor=colors.HexColor('#1e3a8a'))
    cell_style = ParagraphStyle('CellText', parent=styles['Normal'], fontSize=8.5, leading=10, textColor=colors.HexColor('#0f172a'))
    header_style = ParagraphStyle('HeaderCell', parent=styles['Normal'], fontSize=9, leading=11, fontName='Helvetica-Bold', textColor=colors.white)

    story = []

    for sheet_name in wb.sheetnames:
        ws = wb[sheet_name]
        story.append(Paragraph(f"Sheet: {sheet_name}", title_style))

        data = []
        for row in ws.iter_rows(values_only=True):
            if any(cell is not None for cell in row):
                row_vals = []
                for val in row:
                    text = str(val if val is not None else "").strip()
                    row_vals.append(text)
                data.append(row_vals)

        if not data:
            story.append(Paragraph("(Empty Sheet)", cell_style))
            story.append(Spacer(1, 15))
            continue

        cols_count = max(len(r) for r in data)
        # Normalize rows to same column count
        normalized_data = []
        for r_idx, r in enumerate(data):
            row_cells = []
            for c_idx in range(cols_count):
                val = r[c_idx] if c_idx < len(r) else ""
                val_safe = val.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
                if r_idx == 0:
                    row_cells.append(Paragraph(val_safe, header_style))
                else:
                    row_cells.append(Paragraph(val_safe, cell_style))
            normalized_data.append(row_cells)

        avail_w = landscape(letter)[0] - 72
        col_w = avail_w / max(cols_count, 1)

        t = Table(normalized_data, colWidths=[col_w] * cols_count)
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e3a8a')),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8fafc')]),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ]))
        story.append(t)
        story.append(Spacer(1, 20))

    if not story:
        story.append(Paragraph("Empty Workbook", cell_style))

    pdf_doc.build(story)
    return output_path
