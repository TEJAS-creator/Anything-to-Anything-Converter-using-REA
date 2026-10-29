# OmniConvert — Anything-to-Anything Local Converter

> A high-fidelity, privacy-first local file conversion powerhouse inspired by **iLovePDF** and **CloudConvert**. Run conversions locally with zero file size limits and zero data leaving your machine.

---

## 🌟 Overview

**OmniConvert** combines the speed of client-side browser WebAssembly engines with the deep layout fidelity of a local Python microservice. Whether extracting complex PDF tables into Excel, converting presentation slides, rendering multi-page documents into Word with preserved formatting, transcoding high-bitrate media with FFmpeg, or bundling archives, OmniConvert handles it all in a unified dashboard.

---

## 🚀 Key Capabilities (6 Core Engines)

### 1. 📄 Document & Presentation Suite
- **PDF ↔ PPTX:** Extracts pages, text coordinates, font weights, and tables into editable PowerPoint presentations. Renders PPTX slides into vector-crisp PDF documents.
- **PDF ↔ DOCX:** Reconstructs heading hierarchies, paragraph flows, and structured table grids into Microsoft Word (.docx). Converts DOCX documents to print-ready PDF files.
- **PDF ↔ XLSX:** Extracts data tables with cell coordinates and auto-formatted columns into Microsoft Excel sheets. Converts XLSX spreadsheets to formatted PDF tables.
- **PDF Operations:**
  - **Merge PDF:** Combine multiple PDFs in any custom order.
  - **Split PDF:** Extract specific page ranges (e.g., `1-3, 5, 8-end`).
  - **Compress PDF:** Recompress streams and strip redundant metadata.
  - **Rotate PDF:** Rotate pages by 90°, 180°, or 270°.
  - **Page Numbering:** Overlay dynamic page numbers (`Page X of Y`) in multiple positions.

### 2. 🖼️ Image Studio
- **Format Conversion:** Convert between **JPG, PNG, WEBP, SVG, GIF, BMP, and TIFF**.
- **Resize & Compress:** Scale dimensions with high-quality Lanczos filtering and adjust quality (10%–100%).
- **Images to PDF:** Bundle multiple images into a clean, multi-page PDF.
- **PDF to Images:** Rasterize PDF pages into individual PNG/JPG/WEBP images packed into a ZIP archive.

### 3. 📊 Data & Spreadsheet Engine
- **Cross-Convert:** Seamless matrix conversion between **CSV ↔ XLSX ↔ JSON ↔ XML ↔ Markdown Tables**.
- Preserves tabular schemas, nested structures, and auto-generates Markdown pipe tables.

### 4. 🎬 Media Lab (Audio & Video)
- Powered by local **FFmpeg 8.1**:
  - **Video to Audio:** Extract high-bitrate MP3 (128k–320k) or lossless WAV from MP4, AVI, WEBM, MOV.
  - **Video to Animated GIF:** Two-pass palette generation (`palettegen` / `paletteuse`) for cinematic GIFs.
  - **Video Transcoder:** Transcode between MP4 (H.264), WEBM (VP9), and AVI.

### 5. 📚 E-Book & Text Formats
- **EPUB ↔ PDF:** Convert digital eBooks into paginated, readable PDFs with chapter preservation.
- **TXT ↔ PDF:** Turn plain text and server logs into formatted, monospace-aligned PDFs.
- **Markdown ↔ HTML:** Compile Markdown into styled GitHub-flavored HTML templates or extract Markdown from HTML.

### 6. 📦 Archive Engine
- **Create Archives:** Package multiple files into `.zip`, `.tar`, or compressed `.tar.gz`.
- **Extract Archives:** Unpack `.zip`, `.tar`, and `.gz` archives directly on your machine.

---

## 🛠️ Tech Stack

- **Frontend:**
  - React 19 + TypeScript
  - Vite 8
  - Tailwind CSS v4
  - Framer Motion (animated drag-and-drop dropzone, category layout transitions)
  - Lucide Icons
  - `pdf-lib` (Client-side PDF manipulations)
  - `xlsx` (SheetJS client-side spreadsheet engine)
  - `jszip` & `file-saver` (Client-side ZIP bundling & batch downloads)
  - HTML5 Canvas (Instant client-side image resizing and format re-encoding)
- **Local Microservice Backend:**
  - FastAPI + Uvicorn (Asynchronous REST API with auto-generated Swagger UI)
  - `pdfplumber` (High-fidelity PDF layout and table extraction)
  - `pypdf` (PDF stream operations, rotations, splitting, merging)
  - `python-docx` (Word document generation and parsing)
  - `python-pptx` (PowerPoint presentation generation and shape placement)
  - `openpyxl` (Excel workbook generation and styling)
  - `reportlab` (Vector PDF document creation)
  - `Pillow` (Advanced image manipulation and compression)
  - `EbookLib` & `BeautifulSoup4` (eBook structure parsing)
  - `FFmpeg 8.1` (Hardware-accelerated media transcoding)

---

## 📁 Project Structure

```
ALLInOneConverter/
├── backend/
│   ├── converters/
│   │   ├── pdf_pptx.py          # PDF ↔ PPTX layout extraction and slide creation
│   │   ├── pdf_docx.py          # PDF ↔ DOCX text hierarchy and table reconstruction
│   │   ├── pdf_xlsx.py          # PDF ↔ XLSX grid table parsing and styling
│   │   ├── pdf_ops.py           # Merge, Split, Compress, Rotate, Page Numbering
│   │   ├── images.py            # JPG, PNG, WEBP, GIF, BMP, TIFF, Images to PDF
│   │   ├── data_converter.py    # CSV ↔ XLSX ↔ JSON ↔ XML ↔ Markdown tables
│   │   ├── media_converter.py   # FFmpeg media transcoding (MP4, MP3, WAV, GIF, WEBM)
│   │   ├── ebook_text.py        # EPUB ↔ PDF, TXT ↔ PDF, Markdown ↔ HTML
│   │   └── archive_converter.py # ZIP, TAR, TAR.GZ creation & extraction
│   ├── main.py                  # FastAPI application with CORS and streaming endpoints
│   ├── run_server.py            # Microservice boot script (port 8000)
│   ├── test_converters.py       # End-to-end verification test suite (12/12 passing)
│   └── requirements.txt         # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx                 # Status indicator, search, engine toggle
│   │   │   ├── CategoryNav.tsx            # Animated category pills
│   │   │   ├── ToolGrid.tsx               # iLovePDF-style tool cards
│   │   │   ├── FileUploadZone.tsx         # Drag-and-drop dropzone with format filters
│   │   │   ├── ConversionOptionsModal.tsx  # Dynamic tool options (quality, scale, etc.)
│   │   │   ├── ConversionQueueManager.tsx # Per-file status, progress, download buttons
│   │   │   └── BatchDownloadBar.tsx       # "Convert All" & "Download All as ZIP"
│   │   ├── utils/
│   │   │   ├── clientConverters.ts        # Client Wasm & SheetJS handlers
│   │   │   ├── api.ts                     # API bridge with blob downloads
│   │   │   └── toolsData.ts               # Matrix of all supported conversion routes
│   │   ├── types/
│   │   │   └── index.ts                   # TypeScript interfaces
│   │   ├── App.tsx                        # Master layout & conversion queue coordinator
│   │   └── index.css                      # Tailwind v4 theme styling
│   ├── package.json
│   └── vite.config.ts
│
├── start.bat                    # One-click Windows CMD launcher
├── start.ps1                    # One-click PowerShell launcher
└── README.md
```

---

## ⚡ Quick Start

### Prerequisites
- **Python 3.10+** (Python 3.12 recommended)
- **Node.js 18+** (Node.js 22/24 recommended)
- **FFmpeg** (Pre-installed or available in system PATH for audio/video features)

---

### Method 1: One-Click Startup (Windows)

Simply double-click **`start.bat`** or run in PowerShell:
```powershell
.\start.ps1
```
This opens two terminal windows running both services automatically.

---

### Method 2: Manual Terminal Startup

#### 1. Setup & Start Backend Microservice:
```powershell
# Install backend dependencies
pip install -r backend/requirements.txt

# Start the FastAPI server
python backend/run_server.py
```
> The API will start at: `http://127.0.0.1:8000`  
> Interactive Swagger documentation: `http://127.0.0.1:8000/docs`

#### 2. Setup & Start Frontend:
```powershell
# Open a second terminal
cd frontend
npm install
npm run dev
```
> The UI will open at: `http://localhost:5173`

---

## 🧪 Verification & Automated Testing

You can run the built-in end-to-end converter test suite to verify all 12 conversion engines:

```powershell
python backend/test_converters.py
```

**Output:**
```
Testing converters in temporary dir: ...
[PASS] 1. Sample PDF generated
[PASS] 2. PDF -> PPTX OK
[PASS] 3. PPTX -> PDF OK
[PASS] 4. PDF -> DOCX OK
[PASS] 5. DOCX -> PDF OK
[PASS] 6. PDF -> XLSX OK
[PASS] 7. XLSX -> PDF OK
[PASS] 8. PDF Operations (Rotate, Split, Merge, Number) OK
[PASS] 9. Image Engine (PNG -> WEBP, Images -> PDF) OK
[PASS] 10. Data Engine (CSV -> JSON -> Markdown Table) OK
[PASS] 11. Archive Engine OK
[PASS] 12. FFmpeg Media Engine OK (WAV -> MP3)

=======================================================
ALL 12 TEST SUITES PASSED! LOCAL CONVERTERS VERIFIED 100%!
=======================================================
```

---

## 🔌 API Route Matrix

| Category | HTTP Route | Input Format | Output Format | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Document** | `POST /api/convert/pdf-to-pptx` | `.pdf` | `.pptx` | Preserves bounding boxes, slides, and tables |
| **Document** | `POST /api/convert/pptx-to-pdf` | `.pptx` | `.pdf` | Vector slide rendering to PDF |
| **Document** | `POST /api/convert/pdf-to-docx` | `.pdf` | `.docx` | Paragraph hierarchy and table grid mapping |
| **Document** | `POST /api/convert/docx-to-pdf` | `.docx` | `.pdf` | Document styles, tables, and spacing to PDF |
| **Document** | `POST /api/convert/pdf-to-xlsx` | `.pdf` | `.xlsx` | Table extraction to formatted Excel worksheets |
| **Document** | `POST /api/convert/xlsx-to-pdf` | `.xlsx` | `.pdf` | Tabular data rendering to PDF |
| **PDF Operations** | `POST /api/pdf/merge` | `.pdf` (multiple) | `.pdf` | Concatenates multiple PDFs |
| **PDF Operations** | `POST /api/pdf/split` | `.pdf` | `.pdf` | Slices page ranges (e.g. `1-3, 5`) |
| **PDF Operations** | `POST /api/pdf/compress` | `.pdf` | `.pdf` | Deduplicates streams and compresses content |
| **PDF Operations** | `POST /api/pdf/rotate` | `.pdf` | `.pdf` | Clockwise rotation (90°, 180°, 270°) |
| **PDF Operations** | `POST /api/pdf/number` | `.pdf` | `.pdf` | Stamped page numbers with customizable position |
| **Images** | `POST /api/convert/image` | JPG, PNG, WEBP, etc. | Target format | Quality tuning, resizing, format conversion |
| **Images** | `POST /api/convert/images-to-pdf` | Images (multiple) | `.pdf` | Multi-image compilation to PDF |
| **Images** | `POST /api/convert/pdf-to-images` | `.pdf` | `.zip` | High-DPI rasterization of pages into ZIP |
| **Data** | `POST /api/convert/data` | CSV, XLSX, JSON, XML, MD | Target format | Cross-conversion preserving column schemas |
| **Media** | `POST /api/convert/media` | MP4, AVI, WEBM, MOV | MP3, WAV, GIF | Audio extraction, palette GIFs, video transcoding |
| **E-Books** | `POST /api/convert/ebook-text` | EPUB, TXT, MD, HTML | Target format | eBook chapters, plain text logs, Markdown compilation |
| **Archives** | `POST /api/archive/create` | Any files (multiple) | `.zip`, `.tar`, `.tar.gz` | Packs files into selected archive container |
| **Archives** | `POST /api/archive/extract` | `.zip`, `.tar`, `.gz` | `.zip` (extracted bundle) | Unpacks archive contents |
| **Universal** | `POST /api/convert/universal` | Any supported format | Target format | Automatic dispatcher based on file extensions |
| **System** | `GET /api/health` | - | JSON | Reports status, active modules, and FFmpeg detection |

---

## 🔒 Privacy & Performance Benefits

1. **100% On-Premise / Local:** Files never leave your device. Ideal for sensitive legal, financial, healthcare, or private enterprise documents.
2. **No Rate Limits or Quotas:** Convert hundreds of megabytes or batch-convert entire folders without paywalls or daily caps.
3. **Dual-Engine Architecture:** Lightweight tasks (e.g. PDF page rotation, merging, spreadsheet conversions) can run instantly in-browser using WebAssembly, while complex layout parsing delegates smoothly to the local Python microservice.
4. **Batch ZIP Downloader:** Completed queue items can be downloaded individually or packaged into a single ZIP file with one click.

---

## 📜 License
MIT License. Free for personal, commercial, and educational use.

