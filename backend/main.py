"""
Local Conversion Microservice API.
High-fidelity local conversions for PDF, Office (PPTX, DOCX, XLSX),
Images, Media (FFmpeg), Data formats, E-Books, and Archives.
"""

import os
import shutil
import uuid
import tempfile
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse

from converters.pdf_pptx import pdf_to_pptx, pptx_to_pdf
from converters.pdf_docx import pdf_to_docx, docx_to_pdf
from converters.pdf_xlsx import pdf_to_xlsx, xlsx_to_pdf
from converters.pdf_ops import merge_pdfs, split_pdf, compress_pdf, rotate_pdf, number_pdf
from converters.images import convert_image, images_to_pdf, pdf_to_images
from converters.data_converter import convert_data
from converters.media_converter import convert_media, get_ffmpeg_path
from converters.ebook_text import epub_to_pdf, txt_to_pdf, pdf_to_txt, markdown_to_html, html_to_markdown
from converters.archive_converter import create_archive, extract_archive

app = FastAPI(
    title="Anything-to-Anything Local Conversion API",
    version="1.0.0",
    description="High-fidelity local file conversion engine inspired by iLovePDF and CloudConvert."
)

# Enable CORS for local Vite development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

TEMP_DIR = os.path.join(tempfile.gettempdir(), "allinone_converter")
os.makedirs(TEMP_DIR, exist_ok=True)


def cleanup_files(*file_paths):
    """Background task to remove temporary files after response."""
    for p in file_paths:
        try:
            if os.path.isdir(p):
                shutil.rmtree(p, ignore_errors=True)
            elif os.path.exists(p):
                os.remove(p)
        except Exception:
            pass


@app.get("/api/health")
def health_check():
    """Returns microservice status and system capabilities."""
    ffmpeg_ok = False
    try:
        ffmpeg_bin = get_ffmpeg_path()
        ffmpeg_ok = os.path.exists(ffmpeg_bin) or shutil.which(ffmpeg_bin) is not None
    except Exception:
        ffmpeg_ok = False

    return {
        "status": "online",
        "service": "Anything-to-Anything Conversion Microservice",
        "version": "1.0.0",
        "capabilities": {
            "document_suite": ["pdf_to_pptx", "pptx_to_pdf", "pdf_to_docx", "docx_to_pdf", "pdf_to_xlsx", "xlsx_to_pdf"],
            "pdf_ops": ["merge", "split", "compress", "rotate", "number"],
            "images": ["jpg", "png", "webp", "gif", "bmp", "tiff", "images_to_pdf", "pdf_to_images"],
            "data": ["csv", "xlsx", "json", "xml", "markdown"],
            "media": {
                "available": ffmpeg_ok,
                "formats": ["mp4", "mp3", "wav", "webm", "gif", "avi"]
            },
            "ebook_text": ["epub_to_pdf", "txt_to_pdf", "pdf_to_txt", "markdown_to_html", "html_to_markdown"],
            "archives": ["zip", "tar", "tar.gz"]
        }
    }


# ==========================================
# 1. DOCUMENT & PRESENTATION SUITE
# ==========================================

@app.post("/api/convert/pdf-to-pptx")
async def api_pdf_to_pptx(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    req_id = str(uuid.uuid4())
    in_path = os.path.join(TEMP_DIR, f"{req_id}_{file.filename}")
    out_path = os.path.join(TEMP_DIR, f"{req_id}_converted.pptx")

    with open(in_path, "wb") as f:
        f.write(await file.read())

    try:
        pdf_to_pptx(in_path, out_path)
        background_tasks.add_task(cleanup_files, in_path, out_path)
        return FileResponse(out_path, filename=f"{os.path.splitext(file.filename)[0]}.pptx", media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation")
    except Exception as e:
        cleanup_files(in_path, out_path)
        raise HTTPException(status_code=500, detail=f"PDF to PPTX conversion failed: {str(e)}")


@app.post("/api/convert/pptx-to-pdf")
async def api_pptx_to_pdf(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    req_id = str(uuid.uuid4())
    in_path = os.path.join(TEMP_DIR, f"{req_id}_{file.filename}")
    out_path = os.path.join(TEMP_DIR, f"{req_id}_converted.pdf")

    with open(in_path, "wb") as f:
        f.write(await file.read())

    try:
        pptx_to_pdf(in_path, out_path)
        background_tasks.add_task(cleanup_files, in_path, out_path)
        return FileResponse(out_path, filename=f"{os.path.splitext(file.filename)[0]}.pdf", media_type="application/pdf")
    except Exception as e:
        cleanup_files(in_path, out_path)
        raise HTTPException(status_code=500, detail=f"PPTX to PDF conversion failed: {str(e)}")


@app.post("/api/convert/pdf-to-docx")
async def api_pdf_to_docx(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    req_id = str(uuid.uuid4())
    in_path = os.path.join(TEMP_DIR, f"{req_id}_{file.filename}")
    out_path = os.path.join(TEMP_DIR, f"{req_id}_converted.docx")

    with open(in_path, "wb") as f:
        f.write(await file.read())

    try:
        pdf_to_docx(in_path, out_path)
        background_tasks.add_task(cleanup_files, in_path, out_path)
        return FileResponse(out_path, filename=f"{os.path.splitext(file.filename)[0]}.docx", media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document")
    except Exception as e:
        cleanup_files(in_path, out_path)
        raise HTTPException(status_code=500, detail=f"PDF to DOCX conversion failed: {str(e)}")


@app.post("/api/convert/docx-to-pdf")
async def api_docx_to_pdf(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    req_id = str(uuid.uuid4())
    in_path = os.path.join(TEMP_DIR, f"{req_id}_{file.filename}")
    out_path = os.path.join(TEMP_DIR, f"{req_id}_converted.pdf")

    with open(in_path, "wb") as f:
        f.write(await file.read())

    try:
        docx_to_pdf(in_path, out_path)
        background_tasks.add_task(cleanup_files, in_path, out_path)
        return FileResponse(out_path, filename=f"{os.path.splitext(file.filename)[0]}.pdf", media_type="application/pdf")
    except Exception as e:
        cleanup_files(in_path, out_path)
        raise HTTPException(status_code=500, detail=f"DOCX to PDF conversion failed: {str(e)}")


@app.post("/api/convert/pdf-to-xlsx")
async def api_pdf_to_xlsx(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    req_id = str(uuid.uuid4())
    in_path = os.path.join(TEMP_DIR, f"{req_id}_{file.filename}")
    out_path = os.path.join(TEMP_DIR, f"{req_id}_converted.xlsx")

    with open(in_path, "wb") as f:
        f.write(await file.read())

    try:
        pdf_to_xlsx(in_path, out_path)
        background_tasks.add_task(cleanup_files, in_path, out_path)
        return FileResponse(out_path, filename=f"{os.path.splitext(file.filename)[0]}.xlsx", media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    except Exception as e:
        cleanup_files(in_path, out_path)
        raise HTTPException(status_code=500, detail=f"PDF to XLSX conversion failed: {str(e)}")


@app.post("/api/convert/xlsx-to-pdf")
async def api_xlsx_to_pdf(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    req_id = str(uuid.uuid4())
    in_path = os.path.join(TEMP_DIR, f"{req_id}_{file.filename}")
    out_path = os.path.join(TEMP_DIR, f"{req_id}_converted.pdf")

    with open(in_path, "wb") as f:
        f.write(await file.read())

    try:
        xlsx_to_pdf(in_path, out_path)
        background_tasks.add_task(cleanup_files, in_path, out_path)
        return FileResponse(out_path, filename=f"{os.path.splitext(file.filename)[0]}.pdf", media_type="application/pdf")
    except Exception as e:
        cleanup_files(in_path, out_path)
        raise HTTPException(status_code=500, detail=f"XLSX to PDF conversion failed: {str(e)}")


# ==========================================
# PDF OPERATIONS
# ==========================================

@app.post("/api/pdf/merge")
async def api_pdf_merge(background_tasks: BackgroundTasks, files: List[UploadFile] = File(...)):
    req_id = str(uuid.uuid4())
    saved_paths = []
    out_path = os.path.join(TEMP_DIR, f"{req_id}_merged.pdf")

    try:
        for f in files:
            p = os.path.join(TEMP_DIR, f"{req_id}_{f.filename}")
            with open(p, "wb") as buf:
                buf.write(await f.read())
            saved_paths.append(p)

        merge_pdfs(saved_paths, out_path)
        background_tasks.add_task(cleanup_files, *saved_paths, out_path)
        return FileResponse(out_path, filename="merged_document.pdf", media_type="application/pdf")
    except Exception as e:
        cleanup_files(*saved_paths, out_path)
        raise HTTPException(status_code=500, detail=f"PDF Merge failed: {str(e)}")


@app.post("/api/pdf/split")
async def api_pdf_split(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    page_range: str = Form("1-end")
):
    req_id = str(uuid.uuid4())
    in_path = os.path.join(TEMP_DIR, f"{req_id}_{file.filename}")
    out_path = os.path.join(TEMP_DIR, f"{req_id}_split.pdf")

    with open(in_path, "wb") as f:
        f.write(await file.read())

    try:
        split_pdf(in_path, out_path, page_range)
        background_tasks.add_task(cleanup_files, in_path, out_path)
        return FileResponse(out_path, filename=f"{os.path.splitext(file.filename)[0]}_split.pdf", media_type="application/pdf")
    except Exception as e:
        cleanup_files(in_path, out_path)
        raise HTTPException(status_code=500, detail=f"PDF Split failed: {str(e)}")


@app.post("/api/pdf/compress")
async def api_pdf_compress(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    req_id = str(uuid.uuid4())
    in_path = os.path.join(TEMP_DIR, f"{req_id}_{file.filename}")
    out_path = os.path.join(TEMP_DIR, f"{req_id}_compressed.pdf")

    with open(in_path, "wb") as f:
        f.write(await file.read())

    try:
        compress_pdf(in_path, out_path)
        background_tasks.add_task(cleanup_files, in_path, out_path)
        return FileResponse(out_path, filename=f"{os.path.splitext(file.filename)[0]}_compressed.pdf", media_type="application/pdf")
    except Exception as e:
        cleanup_files(in_path, out_path)
        raise HTTPException(status_code=500, detail=f"PDF Compression failed: {str(e)}")


@app.post("/api/pdf/rotate")
async def api_pdf_rotate(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    angle: int = Form(90)
):
    req_id = str(uuid.uuid4())
    in_path = os.path.join(TEMP_DIR, f"{req_id}_{file.filename}")
    out_path = os.path.join(TEMP_DIR, f"{req_id}_rotated.pdf")

    with open(in_path, "wb") as f:
        f.write(await file.read())

    try:
        rotate_pdf(in_path, out_path, angle)
        background_tasks.add_task(cleanup_files, in_path, out_path)
        return FileResponse(out_path, filename=f"{os.path.splitext(file.filename)[0]}_rotated.pdf", media_type="application/pdf")
    except Exception as e:
        cleanup_files(in_path, out_path)
        raise HTTPException(status_code=500, detail=f"PDF Rotation failed: {str(e)}")


@app.post("/api/pdf/number")
async def api_pdf_number(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    position: str = Form("bottom-right"),
    format_str: str = Form("Page {n} of {total}")
):
    req_id = str(uuid.uuid4())
    in_path = os.path.join(TEMP_DIR, f"{req_id}_{file.filename}")
    out_path = os.path.join(TEMP_DIR, f"{req_id}_numbered.pdf")

    with open(in_path, "wb") as f:
        f.write(await file.read())

    try:
        number_pdf(in_path, out_path, position, format_str)
        background_tasks.add_task(cleanup_files, in_path, out_path)
        return FileResponse(out_path, filename=f"{os.path.splitext(file.filename)[0]}_numbered.pdf", media_type="application/pdf")
    except Exception as e:
        cleanup_files(in_path, out_path)
        raise HTTPException(status_code=500, detail=f"PDF Page Numbering failed: {str(e)}")


# ==========================================
# 2. IMAGE CONVERSION ENGINE
# ==========================================

@app.post("/api/convert/image")
async def api_convert_image(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    target_format: str = Form("png"),
    quality: int = Form(90),
    width: Optional[int] = Form(None),
    height: Optional[int] = Form(None)
):
    req_id = str(uuid.uuid4())
    in_path = os.path.join(TEMP_DIR, f"{req_id}_{file.filename}")
    fmt = target_format.lower().replace('.', '')
    out_path = os.path.join(TEMP_DIR, f"{req_id}_converted.{fmt}")

    with open(in_path, "wb") as f:
        f.write(await file.read())

    try:
        convert_image(in_path, out_path, fmt, quality, width, height)
        background_tasks.add_task(cleanup_files, in_path, out_path)
        return FileResponse(out_path, filename=f"{os.path.splitext(file.filename)[0]}.{fmt}")
    except Exception as e:
        cleanup_files(in_path, out_path)
        raise HTTPException(status_code=500, detail=f"Image conversion failed: {str(e)}")


@app.post("/api/convert/images-to-pdf")
async def api_images_to_pdf(background_tasks: BackgroundTasks, files: List[UploadFile] = File(...)):
    req_id = str(uuid.uuid4())
    saved_paths = []
    out_path = os.path.join(TEMP_DIR, f"{req_id}_images.pdf")

    try:
        for f in files:
            p = os.path.join(TEMP_DIR, f"{req_id}_{f.filename}")
            with open(p, "wb") as buf:
                buf.write(await f.read())
            saved_paths.append(p)

        images_to_pdf(saved_paths, out_path)
        background_tasks.add_task(cleanup_files, *saved_paths, out_path)
        return FileResponse(out_path, filename="images_bundle.pdf", media_type="application/pdf")
    except Exception as e:
        cleanup_files(*saved_paths, out_path)
        raise HTTPException(status_code=500, detail=f"Images to PDF failed: {str(e)}")


@app.post("/api/convert/pdf-to-images")
async def api_pdf_to_images(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    img_format: str = Form("png")
):
    req_id = str(uuid.uuid4())
    in_path = os.path.join(TEMP_DIR, f"{req_id}_{file.filename}")
    out_zip = os.path.join(TEMP_DIR, f"{req_id}_images.zip")

    with open(in_path, "wb") as f:
        f.write(await file.read())

    try:
        pdf_to_images(in_path, out_zip, img_format)
        background_tasks.add_task(cleanup_files, in_path, out_zip)
        return FileResponse(out_zip, filename=f"{os.path.splitext(file.filename)[0]}_images.zip", media_type="application/zip")
    except Exception as e:
        cleanup_files(in_path, out_zip)
        raise HTTPException(status_code=500, detail=f"PDF to Images failed: {str(e)}")


# ==========================================
# 3. DATA & SPREADSHEET ENGINE
# ==========================================

@app.post("/api/convert/data")
async def api_convert_data(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    target_format: str = Form("csv"),
    src_format: Optional[str] = Form(None)
):
    req_id = str(uuid.uuid4())
    in_path = os.path.join(TEMP_DIR, f"{req_id}_{file.filename}")
    fmt_src = src_format or os.path.splitext(file.filename)[1].replace('.', '')
    fmt_target = target_format.lower().replace('.', '')
    out_path = os.path.join(TEMP_DIR, f"{req_id}_converted.{fmt_target}")

    with open(in_path, "wb") as f:
        f.write(await file.read())

    try:
        convert_data(in_path, out_path, fmt_src, fmt_target)
        background_tasks.add_task(cleanup_files, in_path, out_path)
        return FileResponse(out_path, filename=f"{os.path.splitext(file.filename)[0]}.{fmt_target}")
    except Exception as e:
        cleanup_files(in_path, out_path)
        raise HTTPException(status_code=500, detail=f"Data conversion failed: {str(e)}")


# ==========================================
# 4. MEDIA ENGINE (AUDIO / VIDEO)
# ==========================================

@app.post("/api/convert/media")
async def api_convert_media(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    target_format: str = Form("mp3"),
    audio_bitrate: str = Form("192k"),
    fps: int = Form(15),
    gif_scale: int = Form(480)
):
    req_id = str(uuid.uuid4())
    in_path = os.path.join(TEMP_DIR, f"{req_id}_{file.filename}")
    fmt = target_format.lower().replace('.', '')
    out_path = os.path.join(TEMP_DIR, f"{req_id}_converted.{fmt}")

    with open(in_path, "wb") as f:
        f.write(await file.read())

    try:
        convert_media(in_path, out_path, fmt, audio_bitrate, fps, gif_scale)
        background_tasks.add_task(cleanup_files, in_path, out_path)
        return FileResponse(out_path, filename=f"{os.path.splitext(file.filename)[0]}.{fmt}")
    except Exception as e:
        cleanup_files(in_path, out_path)
        raise HTTPException(status_code=500, detail=f"Media conversion failed: {str(e)}")


# ==========================================
# 5. E-BOOK & TEXT FORMATS
# ==========================================

@app.post("/api/convert/ebook-text")
async def api_convert_ebook_text(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    target_format: str = Form("pdf")
):
    req_id = str(uuid.uuid4())
    in_path = os.path.join(TEMP_DIR, f"{req_id}_{file.filename}")
    src_ext = os.path.splitext(file.filename)[1].lower().replace('.', '')
    tgt_ext = target_format.lower().replace('.', '')
    out_path = os.path.join(TEMP_DIR, f"{req_id}_converted.{tgt_ext}")

    with open(in_path, "wb") as f:
        f.write(await file.read())

    try:
        if src_ext == 'epub' and tgt_ext == 'pdf':
            epub_to_pdf(in_path, out_path)
        elif src_ext == 'txt' and tgt_ext == 'pdf':
            txt_to_pdf(in_path, out_path)
        elif src_ext == 'pdf' and tgt_ext == 'txt':
            pdf_to_txt(in_path, out_path)
        elif src_ext in ('md', 'markdown') and tgt_ext == 'html':
            markdown_to_html(in_path, out_path)
        elif src_ext in ('html', 'htm') and tgt_ext in ('md', 'markdown'):
            html_to_markdown(in_path, out_path)
        else:
            raise ValueError(f"Unsupported transition from {src_ext} to {tgt_ext}")

        background_tasks.add_task(cleanup_files, in_path, out_path)
        return FileResponse(out_path, filename=f"{os.path.splitext(file.filename)[0]}.{tgt_ext}")
    except Exception as e:
        cleanup_files(in_path, out_path)
        raise HTTPException(status_code=500, detail=f"E-Book/Text conversion failed: {str(e)}")


# ==========================================
# 6. ARCHIVE ENGINE
# ==========================================

@app.post("/api/archive/create")
async def api_archive_create(
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(...),
    archive_format: str = Form("zip")
):
    req_id = str(uuid.uuid4())
    saved_paths = []
    fmt = archive_format.lower().replace('.', '')
    out_ext = "tar.gz" if fmt in ('tar.gz', 'tgz', 'gz') else fmt
    out_path = os.path.join(TEMP_DIR, f"{req_id}_archive.{out_ext}")

    try:
        for f in files:
            p = os.path.join(TEMP_DIR, f"{req_id}_{f.filename}")
            with open(p, "wb") as buf:
                buf.write(await f.read())
            saved_paths.append(p)

        create_archive(saved_paths, out_path, fmt)
        background_tasks.add_task(cleanup_files, *saved_paths, out_path)
        return FileResponse(out_path, filename=f"archive.{out_ext}")
    except Exception as e:
        cleanup_files(*saved_paths, out_path)
        raise HTTPException(status_code=500, detail=f"Archive creation failed: {str(e)}")


@app.post("/api/archive/extract")
async def api_archive_extract(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    req_id = str(uuid.uuid4())
    in_path = os.path.join(TEMP_DIR, f"{req_id}_{file.filename}")
    extract_dir = os.path.join(TEMP_DIR, f"{req_id}_extracted")
    out_zip = os.path.join(TEMP_DIR, f"{req_id}_unpacked.zip")

    with open(in_path, "wb") as f:
        f.write(await file.read())

    try:
        extracted = extract_archive(in_path, extract_dir)
        # Re-pack as standard zip for easy browser download
        create_archive(extracted, out_zip, 'zip')
        background_tasks.add_task(cleanup_files, in_path, extract_dir, out_zip)
        return FileResponse(out_zip, filename=f"{os.path.splitext(file.filename)[0]}_extracted.zip", media_type="application/zip")
    except Exception as e:
        cleanup_files(in_path, extract_dir, out_zip)
        raise HTTPException(status_code=500, detail=f"Archive extraction failed: {str(e)}")


# ==========================================
# UNIVERSAL CONVERTER DISPATCHER ROUTE
# ==========================================

@app.post("/api/convert/universal")
async def api_universal_convert(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    target_format: str = Form(...),
    source_format: Optional[str] = Form(None)
):
    src = (source_format or os.path.splitext(file.filename)[1]).lower().replace('.', '')
    tgt = target_format.lower().replace('.', '')

    # Dispatch to appropriate handler
    if src == 'pdf' and tgt == 'pptx':
        return await api_pdf_to_pptx(background_tasks, file)
    elif src == 'pptx' and tgt == 'pdf':
        return await api_pptx_to_pdf(background_tasks, file)
    elif src == 'pdf' and tgt == 'docx':
        return await api_pdf_to_docx(background_tasks, file)
    elif src == 'docx' and tgt == 'pdf':
        return await api_docx_to_pdf(background_tasks, file)
    elif src == 'pdf' and tgt == 'xlsx':
        return await api_pdf_to_xlsx(background_tasks, file)
    elif src == 'xlsx' and tgt == 'pdf':
        return await api_xlsx_to_pdf(background_tasks, file)
    elif src == 'pdf' and tgt in ('png', 'jpg', 'jpeg', 'webp'):
        return await api_pdf_to_images(background_tasks, file, tgt)
    elif src in ('jpg', 'jpeg', 'png', 'webp', 'bmp', 'tiff', 'gif') and tgt in ('jpg', 'jpeg', 'png', 'webp', 'bmp', 'tiff', 'gif'):
        return await api_convert_image(background_tasks, file, tgt)
    elif src in ('csv', 'xlsx', 'json', 'xml', 'md', 'markdown') and tgt in ('csv', 'xlsx', 'json', 'xml', 'md', 'markdown'):
        return await api_convert_data(background_tasks, file, tgt, src)
    elif src in ('mp4', 'avi', 'webm', 'mov', 'mkv', 'mp3', 'wav') and tgt in ('mp3', 'wav', 'gif', 'webm', 'avi', 'mp4'):
        return await api_convert_media(background_tasks, file, tgt)
    elif (src in ('epub', 'txt', 'md', 'markdown', 'html') or tgt in ('epub', 'txt', 'md', 'markdown', 'html')):
        return await api_convert_ebook_text(background_tasks, file, tgt)
    else:
        raise HTTPException(status_code=400, detail=f"No route found for conversion from '{src}' to '{tgt}'")
