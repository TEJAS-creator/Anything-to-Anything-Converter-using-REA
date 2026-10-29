"""
E-Book & Text Formats Engine:
- EPUB <-> PDF
- TXT <-> PDF
- Markdown <-> HTML
"""

import os
import io
import markdown as md_lib
from bs4 import BeautifulSoup
import ebooklib
from ebooklib import epub
from pypdf import PdfReader
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Preformatted
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors


def epub_to_pdf(epub_path: str, output_path: str) -> str:
    """Extracts text and chapters from an EPUB and renders to PDF."""
    book = epub.read_epub(epub_path)
    pdf_doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle('BookTitle', parent=styles['Heading1'], fontSize=22, spaceAfter=14, textColor=colors.HexColor('#0f172a'))
    h2_style = ParagraphStyle('ChapterTitle', parent=styles['Heading2'], fontSize=16, spaceAfter=10, textColor=colors.HexColor('#1e293b'))
    body_style = ParagraphStyle('BookBody', parent=styles['Normal'], fontSize=11, leading=16, spaceAfter=8, textColor=colors.HexColor('#334155'))

    story = []

    # Book metadata
    title = book.get_metadata('DC', 'title')
    if title:
        story.append(Paragraph(title[0][0], title_style))
        story.append(Spacer(1, 20))

    # Read items of document type
    for item in book.get_items():
        if item.get_type() == ebooklib.ITEM_DOCUMENT:
            soup = BeautifulSoup(item.get_content(), 'html.parser')
            # Extract headings and paragraphs
            for elem in soup.find_all(['h1', 'h2', 'h3', 'p']):
                text = elem.get_text().strip()
                if not text:
                    continue
                safe_text = text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
                if elem.name == 'h1':
                    story.append(Paragraph(safe_text, title_style))
                elif elem.name in ('h2', 'h3'):
                    story.append(Paragraph(safe_text, h2_style))
                else:
                    story.append(Paragraph(safe_text, body_style))

            story.append(Spacer(1, 14))

    if not story:
        story.append(Paragraph("Empty EPUB", body_style))

    pdf_doc.build(story)
    return output_path


def txt_to_pdf(txt_path: str, output_path: str) -> str:
    """Renders plaintext file into a readable paginated PDF document."""
    pdf_doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()
    txt_style = ParagraphStyle('TxtLine', parent=styles['Normal'], fontName='Courier', fontSize=9.5, leading=13, spaceAfter=3, textColor=colors.HexColor('#1e293b'))

    story = []
    with open(txt_path, 'r', encoding='utf-8', errors='replace') as f:
        for line in f:
            clean_line = line.rstrip('\r\n')
            if not clean_line:
                story.append(Spacer(1, 8))
            else:
                safe_line = clean_line.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
                story.append(Paragraph(safe_line, txt_style))

    if not story:
        story.append(Paragraph("(Empty File)", txt_style))

    pdf_doc.build(story)
    return output_path


def pdf_to_txt(pdf_path: str, output_path: str) -> str:
    """Extracts all text from PDF pages and saves as TXT."""
    reader = PdfReader(pdf_path)
    with open(output_path, 'w', encoding='utf-8') as f:
        for idx, page in enumerate(reader.pages):
            f.write(f"--- Page {idx + 1} ---\n\n")
            text = page.extract_text() or ""
            f.write(text)
            f.write("\n\n")
    return output_path


def markdown_to_html(md_path: str, output_path: str) -> str:
    """Converts Markdown to styled HTML with CSS stylesheet."""
    with open(md_path, 'r', encoding='utf-8') as f:
        md_content = f.read()

    html_body = md_lib.markdown(
        md_content,
        extensions=['tables', 'fenced_code', 'toc', 'nl2br']
    )

    template = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Converted Document</title>
  <style>
    body {{
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      max-width: 860px;
      margin: 40px auto;
      padding: 0 20px;
      color: #1e293b;
      background: #ffffff;
    }}
    h1, h2, h3, h4 {{ color: #0f172a; margin-top: 24px; margin-bottom: 12px; }}
    table {{ border-collapse: collapse; width: 100%; margin: 20px 0; }}
    th, td {{ border: 1px solid #cbd5e1; padding: 10px 14px; text-align: left; }}
    th {{ background: #f1f5f9; font-weight: 600; }}
    code {{ background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace; }}
    pre {{ background: #0f172a; color: #f8fafc; padding: 16px; border-radius: 8px; overflow-x: auto; }}
    pre code {{ background: none; color: inherit; padding: 0; }}
    blockquote {{ border-left: 4px solid #3b82f6; margin: 0; padding-left: 16px; color: #64748b; }}
  </style>
</head>
<body>
{html_body}
</body>
</html>"""

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(template)
    return output_path


def html_to_markdown(html_path: str, output_path: str) -> str:
    """Extracts Markdown from HTML content."""
    with open(html_path, 'r', encoding='utf-8', errors='replace') as f:
        soup = BeautifulSoup(f.read(), 'html.parser')

    lines = []
    for tag in soup.find_all(['h1', 'h2', 'h3', 'h4', 'p', 'pre', 'li']):
        text = tag.get_text().strip()
        if not text:
            continue
        if tag.name == 'h1':
            lines.append(f"# {text}\n")
        elif tag.name == 'h2':
            lines.append(f"## {text}\n")
        elif tag.name == 'h3':
            lines.append(f"### {text}\n")
        elif tag.name == 'li':
            lines.append(f"- {text}")
        elif tag.name == 'pre':
            lines.append(f"```\n{text}\n```\n")
        else:
            lines.append(f"{text}\n")

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write("\n".join(lines))
    return output_path
