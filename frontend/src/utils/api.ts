import saveAs from 'file-saver';
import type { ConversionTool, BackendHealth } from '../types';
import {
  clientMergePdf,
  clientRotatePdf,
  clientNumberPdf,
  clientConvertData,
  clientConvertImage,
  clientCreateZip
} from './clientConverters';

const API_BASE = 'http://127.0.0.1:8000';

export async function checkBackendHealth(): Promise<BackendHealth> {
  try {
    const res = await fetch(`${API_BASE}/api/health`, { method: 'GET' });
    if (res.ok) {
      const data = await res.json();
      return {
        status: 'online',
        version: data.version,
        capabilities: data.capabilities
      };
    }
  } catch (e) {
    // Backend offline
  }
  return { status: 'offline' };
}

export async function executeConversion(
  tool: ConversionTool,
  files: File[],
  options: Record<string, any> = {},
  preferClient: boolean = false
): Promise<{ blob: Blob; fileName: string; engine: 'client' | 'microservice' }> {
  const primaryFile = files[0];
  const targetExt = options.target_format || tool.defaultTarget || tool.toExt[0];
  const baseName = primaryFile.name.substring(0, primaryFile.name.lastIndexOf('.')) || primaryFile.name;
  const resultFileName = `${baseName}.${targetExt}`;

  // 1. Check if client-side execution is suitable
  if (preferClient && tool.clientSideCapable) {
    try {
      if (tool.id === 'merge-pdf' && files.length > 1) {
        const blob = await clientMergePdf(files);
        return { blob, fileName: 'merged_document.pdf', engine: 'client' };
      }
      if (tool.id === 'rotate-pdf') {
        const angle = Number(options.angle || 90);
        const blob = await clientRotatePdf(primaryFile, angle);
        return { blob, fileName: `${baseName}_rotated.pdf`, engine: 'client' };
      }
      if (tool.id === 'number-pdf') {
        const pos = options.position || 'bottom-right';
        const fmt = options.format_str || 'Page {n} of {total}';
        const blob = await clientNumberPdf(primaryFile, pos, fmt);
        return { blob, fileName: `${baseName}_numbered.pdf`, engine: 'client' };
      }
      if (tool.id === 'image-converter' || tool.id === 'resize-image') {
        const quality = Number(options.quality || 90);
        const width = options.width ? Number(options.width) : undefined;
        const blob = await clientConvertImage(primaryFile, targetExt, quality, width);
        return { blob, fileName: `${baseName}.${targetExt}`, engine: 'client' };
      }
      if (tool.id === 'data-converter' && ['csv', 'xlsx', 'json'].includes(targetExt)) {
        const blob = await clientConvertData(primaryFile, targetExt);
        return { blob, fileName: `${baseName}.${targetExt}`, engine: 'client' };
      }
      if (tool.id === 'archive-create' && (options.archive_format === 'zip' || !options.archive_format)) {
        const blob = await clientCreateZip(files);
        return { blob, fileName: 'archive.zip', engine: 'client' };
      }
    } catch (clientErr) {
      console.warn('Client converter fallback to Python microservice:', clientErr);
    }
  }

  // 2. Dispatch to Python Microservice for high-fidelity conversion
  const formData = new FormData();

  if (tool.id === 'merge-pdf' || tool.id === 'images-to-pdf' || tool.id === 'archive-create') {
    files.forEach((f) => formData.append('files', f));
  } else {
    formData.append('file', primaryFile);
  }

  // Attach options to FormData
  Object.entries(options).forEach(([k, v]) => {
    if (v !== undefined && v !== null) {
      formData.append(k, String(v));
    }
  });

  const url = `${API_BASE}${tool.endpoint}`;

  const response = await fetch(url, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    let errorDetail = 'Conversion failed';
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errorDetail;
    } catch {
      errorDetail = `Server responded with HTTP ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorDetail);
  }

  // Parse suggested filename from Content-Disposition header if present
  let downloadName = resultFileName;
  const disposition = response.headers.get('content-disposition');
  if (disposition && disposition.includes('filename=')) {
    const match = disposition.match(/filename=["']?([^"';]+)["']?/);
    if (match && match[1]) {
      downloadName = match[1];
    }
  }

  const blob = await response.blob();
  return { blob, fileName: downloadName, engine: 'microservice' };
}

export function downloadBlob(blob: Blob, fileName: string) {
  saveAs(blob, fileName);
}
