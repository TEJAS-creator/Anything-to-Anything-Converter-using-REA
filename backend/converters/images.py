"""
Image Engine:
- Convert between JPG, PNG, WEBP, SVG, GIF, BMP, TIFF
- Image Resizing & Quality Compression
- Images to PDF
- PDF to Images (bundle into ZIP)
"""

import os
import io
import zipfile
from PIL import Image
import pdfplumber
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader


SUPPORTED_FORMATS = {
    'jpg': 'JPEG',
    'jpeg': 'JPEG',
    'png': 'PNG',
    'webp': 'WEBP',
    'bmp': 'BMP',
    'tiff': 'TIFF',
    'tif': 'TIFF',
    'gif': 'GIF'
}


def convert_image(
    input_path: str,
    output_path: str,
    target_format: str,
    quality: int = 90,
    width: int = None,
    height: int = None
) -> str:
    """Converts image format, optionally resizes and compresses."""
    fmt = target_format.lower().replace('.', '')
    pil_format = SUPPORTED_FORMATS.get(fmt, 'PNG')

    with Image.open(input_path) as img:
        # Handle RGBA to RGB for JPEG/BMP
        if pil_format in ('JPEG', 'BMP') and img.mode in ('RGBA', 'LA', 'P'):
            background = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'P':
                img = img.convert('RGBA')
            background.paste(img, mask=img.split()[-1] if 'A' in img.mode else None)
            img = background
        elif img.mode != 'RGB' and pil_format == 'JPEG':
            img = img.convert('RGB')

        # Resize if requested
        if width or height:
            orig_w, orig_h = img.size
            if width and height:
                new_size = (width, height)
            elif width:
                ratio = width / orig_w
                new_size = (width, int(orig_h * ratio))
            else:
                ratio = height / orig_h
                new_size = (int(orig_w * ratio), height)
            img = img.resize(new_size, Image.Resampling.LANCZOS)

        # Save with parameters
        save_kwargs = {}
        if pil_format in ('JPEG', 'WEBP'):
            save_kwargs['quality'] = max(10, min(quality, 100))
            save_kwargs['optimize'] = True
        elif pil_format == 'PNG':
            save_kwargs['optimize'] = True

        img.save(output_path, format=pil_format, **save_kwargs)

    return output_path


def images_to_pdf(image_paths: list[str], output_path: str) -> str:
    """Converts a collection of images into a multi-page PDF."""
    if not image_paths:
        raise ValueError("No images provided")

    c = canvas.Canvas(output_path)

    for p in image_paths:
        with Image.open(p) as img:
            w, h = img.size
            c.setPageSize((w, h))
            c.drawImage(p, 0, 0, width=w, height=h)
            c.showPage()

    c.save()
    return output_path


def pdf_to_images(pdf_path: str, output_zip_path: str, img_format: str = 'png') -> str:
    """
    Renders pages of a PDF to images and bundles them in a ZIP archive.
    Uses pdfplumber page image rasterization.
    """
    fmt = img_format.lower().replace('.', '')
    if fmt not in ('png', 'jpg', 'jpeg', 'webp'):
        fmt = 'png'

    with zipfile.ZipFile(output_zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
        with pdfplumber.open(pdf_path) as pdf:
            for p_idx, page in enumerate(pdf.pages):
                # Render page at 150 DPI for crisp resolution
                im = page.to_image(resolution=150)
                pil_img = im.original

                img_bytes = io.BytesIO()
                pil_fmt = 'JPEG' if fmt in ('jpg', 'jpeg') else ('WEBP' if fmt == 'webp' else 'PNG')
                if pil_fmt == 'JPEG' and pil_img.mode in ('RGBA', 'LA'):
                    pil_img = pil_img.convert('RGB')
                pil_img.save(img_bytes, format=pil_fmt)

                filename = f"page_{p_idx + 1:03d}.{fmt}"
                zf.writestr(filename, img_bytes.getvalue())

    return output_zip_path
