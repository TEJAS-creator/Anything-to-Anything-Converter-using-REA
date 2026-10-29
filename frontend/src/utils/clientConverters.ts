import { PDFDocument, degrees, rgb, StandardFonts } from 'pdf-lib';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';

/**
 * Client-Side PDF Merge using pdf-lib
 */
export async function clientMergePdf(files: File[]): Promise<Blob> {
  const mergedPdf = await PDFDocument.create();

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  const pdfBytes = await mergedPdf.save();
  return new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}

/**
 * Client-Side PDF Rotate using pdf-lib
 */
export async function clientRotatePdf(file: File, angle: number = 90): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  const pages = pdf.getPages();

  for (const page of pages) {
    const currentAngle = page.getRotation().angle;
    page.setRotation(degrees((currentAngle + angle) % 360));
  }

  const pdfBytes = await pdf.save();
  return new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}

/**
 * Client-Side PDF Page Numbering using pdf-lib
 */
export async function clientNumberPdf(
  file: File,
  position: string = 'bottom-right',
  formatStr: string = 'Page {n} of {total}'
): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  const pages = pdf.getPages();
  const total = pages.length;
  const font = await pdf.embedFont(StandardFonts.Helvetica);

  pages.forEach((page, idx) => {
    const { width, height } = page.getSize();
    const text = formatStr.replace('{n}', `${idx + 1}`).replace('{total}', `${total}`);
    const textSize = 9;
    const textWidth = font.widthOfTextAtSize(text, textSize);

    let x = width - textWidth - 36;
    let y = 24;

    if (position === 'bottom-center') {
      x = (width - textWidth) / 2;
    } else if (position === 'bottom-left') {
      x = 36;
    } else if (position === 'top-right') {
      x = width - textWidth - 36;
      y = height - 28;
    }

    page.drawText(text, {
      x,
      y,
      size: textSize,
      font,
      color: rgb(0.3, 0.35, 0.42),
    });
  });

  const pdfBytes = await pdf.save();
  return new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}

/**
 * Client-Side Data Matrix Conversion using SheetJS (XLSX, CSV, JSON)
 */
export async function clientConvertData(file: File, targetExt: string): Promise<Blob> {
  const tgt = targetExt.toLowerCase().replace('.', '');
  const arrayBuffer = await file.arrayBuffer();

  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  if (tgt === 'csv') {
    const csvData = XLSX.utils.sheet_to_csv(worksheet);
    return new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
  } else if (tgt === 'json') {
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    return new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
  } else if (tgt === 'xlsx') {
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    return new Blob([wbout as ArrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }

  throw new Error(`Client format '${tgt}' not directly supported client-side. Using microservice.`);
}

/**
 * Client-Side Image Transformation using HTML5 Canvas
 */
export async function clientConvertImage(
  file: File,
  targetExt: string,
  quality: number = 90,
  targetWidth?: number,
  targetHeight?: number
): Promise<Blob> {
  const tgt = targetExt.toLowerCase().replace('.', '');
  const mimeMap: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp'
  };

  const mime = mimeMap[tgt] || 'image/png';
  const imgUrl = URL.createObjectURL(file);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(imgUrl);
      let width = img.naturalWidth;
      let height = img.naturalHeight;

      if (targetWidth && targetHeight) {
        width = targetWidth;
        height = targetHeight;
      } else if (targetWidth && targetWidth < width) {
        const ratio = targetWidth / width;
        width = targetWidth;
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas 2D context unavailable'));
        return;
      }

      // Fill white background for non-transparent JPEG
      if (mime === 'image/jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
      }

      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Canvas export to blob failed'));
          }
        },
        mime,
        quality / 100
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(imgUrl);
      reject(new Error('Failed to load image in browser'));
    };
    img.src = imgUrl;
  });
}

/**
 * Client-Side ZIP Archive Bundler
 */
export async function clientCreateZip(files: File[]): Promise<Blob> {
  const zip = new JSZip();
  for (const f of files) {
    zip.file(f.name, f);
  }
  return await zip.generateAsync({ type: 'blob' });
}
