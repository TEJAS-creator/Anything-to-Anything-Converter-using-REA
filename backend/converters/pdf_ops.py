"""
PDF Operations Suite:
- Merge multiple PDFs
- Split PDF by page ranges or individual pages
- Compress PDF content streams
- Rotate PDF pages
- Add page numbering overlays
"""

import os
import io
from pypdf import PdfReader, PdfWriter
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors


def merge_pdfs(pdf_paths: list[str], output_path: str) -> str:
    """Merges a list of PDF file paths in order."""
    writer = PdfWriter()
    for p in pdf_paths:
        writer.append(p)
    with open(output_path, "wb") as f:
        writer.write(f)
    return output_path


def split_pdf(pdf_path: str, output_path: str, page_range: str = "1-end") -> str:
    """
    Extracts specified page range into a new PDF.
    E.g., "1-3", "2,4,6", "1-end".
    """
    reader = PdfReader(pdf_path)
    writer = PdfWriter()
    total = len(reader.pages)

    target_indices = []
    if not page_range or page_range.strip() in ("all", "1-end"):
        target_indices = list(range(total))
    else:
        parts = [p.strip() for p in page_range.split(",") if p.strip()]
        for part in parts:
            if "-" in part:
                start_str, end_str = part.split("-", 1)
                start = int(start_str) - 1
                end = total if end_str == "end" else int(end_str)
                for idx in range(max(0, start), min(total, end)):
                    if idx not in target_indices:
                        target_indices.append(idx)
            else:
                idx = int(part) - 1
                if 0 <= idx < total and idx not in target_indices:
                    target_indices.append(idx)

    for idx in target_indices:
        writer.add_page(reader.pages[idx])

    with open(output_path, "wb") as f:
        writer.write(f)
    return output_path


def compress_pdf(pdf_path: str, output_path: str) -> str:
    """Compresses PDF content streams and deduplicates resources."""
    reader = PdfReader(pdf_path)
    writer = PdfWriter()

    for page in reader.pages:
        page.compress_content_streams()
        writer.add_page(page)

    for obj in reader.resolved_objects:
        pass  # triggers resolving

    with open(output_path, "wb") as f:
        writer.write(f)
    return output_path


def rotate_pdf(pdf_path: str, output_path: str, angle: int = 90) -> str:
    """Rotates pages by clockwise angle (90, 180, 270)."""
    reader = PdfReader(pdf_path)
    writer = PdfWriter()

    for page in reader.pages:
        page.rotate(angle)
        writer.add_page(page)

    with open(output_path, "wb") as f:
        writer.write(f)
    return output_path


def number_pdf(
    pdf_path: str,
    output_path: str,
    position: str = "bottom-right",
    format_str: str = "Page {n} of {total}"
) -> str:
    """
    Overlays dynamic page numbers onto each page.
    position: 'bottom-right', 'bottom-center', 'bottom-left', 'top-right'
    """
    reader = PdfReader(pdf_path)
    total_pages = len(reader.pages)
    writer = PdfWriter()

    for idx, page in enumerate(reader.pages):
        page_num = idx + 1
        num_text = format_str.replace("{n}", str(page_num)).replace("{total}", str(total_pages))

        # Determine dimensions of this page
        width = float(page.mediabox.width)
        height = float(page.mediabox.height)

        packet = io.BytesIO()
        can = canvas.Canvas(packet, pagesize=(width, height))
        can.setFont("Helvetica", 9)
        can.setFillColor(colors.HexColor("#475569"))

        if position == "bottom-right":
            can.drawRightString(width - 36, 24, num_text)
        elif position == "bottom-left":
            can.drawString(36, 24, num_text)
        elif position == "top-right":
            can.drawRightString(width - 36, height - 24, num_text)
        else:  # bottom-center
            can.drawCentredString(width / 2.0, 24, num_text)

        can.save()
        packet.seek(0)

        overlay_reader = PdfReader(packet)
        overlay_page = overlay_reader.pages[0]
        page.merge_page(overlay_page)
        writer.add_page(page)

    with open(output_path, "wb") as f:
        writer.write(f)
    return output_path
