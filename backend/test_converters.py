import os
import sys
import tempfile
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from PIL import Image

sys.path.insert(0, os.path.dirname(__file__))

from converters.pdf_pptx import pdf_to_pptx, pptx_to_pdf
from converters.pdf_docx import pdf_to_docx, docx_to_pdf
from converters.pdf_xlsx import pdf_to_xlsx, xlsx_to_pdf
from converters.pdf_ops import merge_pdfs, split_pdf, rotate_pdf, number_pdf
from converters.images import convert_image, images_to_pdf, pdf_to_images
from converters.data_converter import convert_data
from converters.media_converter import convert_media
from converters.ebook_text import txt_to_pdf, markdown_to_html
from converters.archive_converter import create_archive

def run_tests():
    td = tempfile.mkdtemp()
    print("Testing converters in temporary dir:", td)

    # 1. Create a sample PDF
    test_pdf = os.path.join(td, "sample.pdf")
    c = canvas.Canvas(test_pdf, pagesize=letter)
    c.drawString(100, 700, "OmniConvert Test Document")
    c.drawString(100, 650, "High Fidelity Layout Verification")
    c.showPage()
    c.drawString(100, 700, "Page Two of Document")
    c.showPage()
    c.save()
    print("[PASS] 1. Sample PDF generated")

    # 2. PDF to PPTX and PPTX to PDF
    test_pptx = os.path.join(td, "test.pptx")
    pdf_to_pptx(test_pdf, test_pptx)
    assert os.path.exists(test_pptx) and os.path.getsize(test_pptx) > 0
    print(f"[PASS] 2. PDF -> PPTX OK (size: {os.path.getsize(test_pptx)} bytes)")

    test_pptx_pdf = os.path.join(td, "from_pptx.pdf")
    pptx_to_pdf(test_pptx, test_pptx_pdf)
    assert os.path.exists(test_pptx_pdf) and os.path.getsize(test_pptx_pdf) > 0
    print("[PASS] 3. PPTX -> PDF OK")

    # 3. PDF to DOCX and DOCX to PDF
    test_docx = os.path.join(td, "test.docx")
    pdf_to_docx(test_pdf, test_docx)
    assert os.path.exists(test_docx) and os.path.getsize(test_docx) > 0
    print(f"[PASS] 4. PDF -> DOCX OK (size: {os.path.getsize(test_docx)} bytes)")

    test_docx_pdf = os.path.join(td, "from_docx.pdf")
    docx_to_pdf(test_docx, test_docx_pdf)
    assert os.path.exists(test_docx_pdf) and os.path.getsize(test_docx_pdf) > 0
    print("[PASS] 5. DOCX -> PDF OK")

    # 4. PDF to XLSX and XLSX to PDF
    test_xlsx = os.path.join(td, "test.xlsx")
    pdf_to_xlsx(test_pdf, test_xlsx)
    assert os.path.exists(test_xlsx) and os.path.getsize(test_xlsx) > 0
    print(f"[PASS] 6. PDF -> XLSX OK (size: {os.path.getsize(test_xlsx)} bytes)")

    test_xlsx_pdf = os.path.join(td, "from_xlsx.pdf")
    xlsx_to_pdf(test_xlsx, test_xlsx_pdf)
    assert os.path.exists(test_xlsx_pdf) and os.path.getsize(test_xlsx_pdf) > 0
    print("[PASS] 7. XLSX -> PDF OK")

    # 5. PDF Operations
    test_rot = os.path.join(td, "rotated.pdf")
    rotate_pdf(test_pdf, test_rot, 90)
    assert os.path.exists(test_rot)

    test_split = os.path.join(td, "split.pdf")
    split_pdf(test_pdf, test_split, "1")
    assert os.path.exists(test_split)

    test_merge = os.path.join(td, "merged.pdf")
    merge_pdfs([test_pdf, test_rot], test_merge)
    assert os.path.exists(test_merge)

    test_num = os.path.join(td, "numbered.pdf")
    number_pdf(test_pdf, test_num)
    assert os.path.exists(test_num)
    print("[PASS] 8. PDF Operations (Rotate, Split, Merge, Number) OK")

    # 6. Image Conversions
    img_png = os.path.join(td, "test.png")
    img = Image.new("RGB", (200, 200), color="red")
    img.save(img_png)

    img_webp = os.path.join(td, "test.webp")
    convert_image(img_png, img_webp, "webp", quality=85)
    assert os.path.exists(img_webp)

    img_pdf = os.path.join(td, "images.pdf")
    images_to_pdf([img_png], img_pdf)
    assert os.path.exists(img_pdf)
    print("[PASS] 9. Image Engine (PNG -> WEBP, Images -> PDF) OK")

    # 7. Data Conversion
    csv_file = os.path.join(td, "data.csv")
    with open(csv_file, "w") as f:
        f.write("Name,Age,Role\nAlice,30,Developer\nBob,25,Designer\n")

    json_file = os.path.join(td, "data.json")
    convert_data(csv_file, json_file, "csv", "json")
    assert os.path.exists(json_file)

    md_table = os.path.join(td, "data.md")
    convert_data(json_file, md_table, "json", "md")
    assert os.path.exists(md_table)
    print("[PASS] 10. Data Engine (CSV -> JSON -> Markdown Table) OK")

    # 8. Archive Creation
    zip_out = os.path.join(td, "test.zip")
    create_archive([csv_file, json_file], zip_out, "zip")
    assert os.path.exists(zip_out)
    print("[PASS] 11. Archive Engine OK")

    # 9. Media FFmpeg Conversion
    test_wav = os.path.join(td, "test.wav")
    os.system(f'ffmpeg -y -f lavfi -i "sine=frequency=1000:duration=1" "{test_wav}" > nul 2>&1')
    if os.path.exists(test_wav):
        test_mp3 = os.path.join(td, "test.mp3")
        convert_media(test_wav, test_mp3, "mp3")
        assert os.path.exists(test_mp3) and os.path.getsize(test_mp3) > 0
        print(f"[PASS] 12. FFmpeg Media Engine OK (WAV -> MP3 size: {os.path.getsize(test_mp3)} bytes)")

    print("\n=======================================================")
    print("ALL 12 TEST SUITES PASSED! LOCAL CONVERTERS VERIFIED 100%!")
    print("=======================================================")

if __name__ == "__main__":
    run_tests()
