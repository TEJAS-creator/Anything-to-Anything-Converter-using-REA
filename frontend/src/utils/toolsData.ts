import type { ConversionTool } from '../types';

export const CONVERSION_TOOLS: ConversionTool[] = [
  // --- PDF & Office Suite ---
  {
    id: 'pdf-to-word',
    name: 'PDF to Word',
    description: 'Convert PDF files to editable DOCX documents with preserved paragraphs and tables.',
    category: 'office',
    iconName: 'FileText',
    fromExt: ['pdf'],
    toExt: ['docx'],
    defaultTarget: 'docx',
    endpoint: '/api/convert/pdf-to-docx',
    popular: true,
    color: 'from-blue-600 to-indigo-600',
    badge: 'High Fidelity'
  },
  {
    id: 'word-to-pdf',
    name: 'Word to PDF',
    description: 'Render DOCX documents into clean, portable PDF files with table formatting.',
    category: 'office',
    iconName: 'FileCheck',
    fromExt: ['docx'],
    toExt: ['pdf'],
    defaultTarget: 'pdf',
    endpoint: '/api/convert/docx-to-pdf',
    popular: true,
    color: 'from-blue-500 to-cyan-600',
    badge: 'Popular'
  },
  {
    id: 'pdf-to-ppt',
    name: 'PDF to PowerPoint',
    description: 'Extract layout, text boxes, and tables into editable PPTX slides.',
    category: 'office',
    iconName: 'Presentation',
    fromExt: ['pdf'],
    toExt: ['pptx'],
    defaultTarget: 'pptx',
    endpoint: '/api/convert/pdf-to-pptx',
    popular: true,
    color: 'from-orange-500 to-red-600',
    badge: 'Smart Layout'
  },
  {
    id: 'ppt-to-pdf',
    name: 'PowerPoint to PDF',
    description: 'Convert PPTX presentation slides into high-resolution PDF pages.',
    category: 'office',
    iconName: 'FileUp',
    fromExt: ['pptx'],
    toExt: ['pdf'],
    defaultTarget: 'pdf',
    endpoint: '/api/convert/pptx-to-pdf',
    color: 'from-amber-500 to-orange-600'
  },
  {
    id: 'pdf-to-excel',
    name: 'PDF to Excel',
    description: 'Extract tables and structured grids directly from PDF into XLSX worksheets.',
    category: 'office',
    iconName: 'Table',
    fromExt: ['pdf'],
    toExt: ['xlsx'],
    defaultTarget: 'xlsx',
    endpoint: '/api/convert/pdf-to-xlsx',
    popular: true,
    color: 'from-emerald-600 to-teal-700',
    badge: 'Table AI'
  },
  {
    id: 'excel-to-pdf',
    name: 'Excel to PDF',
    description: 'Convert spreadsheets and tabular sheets into formatted PDF tables.',
    category: 'office',
    iconName: 'Sheet',
    fromExt: ['xlsx', 'xls'],
    toExt: ['pdf'],
    defaultTarget: 'pdf',
    endpoint: '/api/convert/xlsx-to-pdf',
    color: 'from-green-600 to-emerald-700'
  },
  {
    id: 'merge-pdf',
    name: 'Merge PDF',
    description: 'Combine multiple PDF documents into a single unified file in custom order.',
    category: 'pdf',
    iconName: 'Copy',
    fromExt: ['pdf'],
    toExt: ['pdf'],
    defaultTarget: 'pdf',
    endpoint: '/api/pdf/merge',
    popular: true,
    clientSideCapable: true,
    color: 'from-rose-500 to-pink-600',
    badge: 'Client Wasm'
  },
  {
    id: 'split-pdf',
    name: 'Split PDF',
    description: 'Extract specific page ranges or extract pages into separate files.',
    category: 'pdf',
    iconName: 'Scissors',
    fromExt: ['pdf'],
    toExt: ['pdf'],
    defaultTarget: 'pdf',
    endpoint: '/api/pdf/split',
    clientSideCapable: true,
    color: 'from-pink-500 to-rose-600',
    optionsConfig: [
      {
        id: 'page_range',
        label: 'Page Range (e.g. 1-3, 5, 7-end)',
        type: 'text',
        defaultValue: '1-end',
        placeholder: '1-end'
      }
    ]
  },
  {
    id: 'compress-pdf',
    name: 'Compress PDF',
    description: 'Reduce PDF file size while maintaining text and visual clarity.',
    category: 'pdf',
    iconName: 'Minimize2',
    fromExt: ['pdf'],
    toExt: ['pdf'],
    defaultTarget: 'pdf',
    endpoint: '/api/pdf/compress',
    popular: true,
    color: 'from-purple-600 to-violet-700'
  },
  {
    id: 'rotate-pdf',
    name: 'Rotate PDF',
    description: 'Rotate PDF pages clockwise by 90, 180, or 270 degrees.',
    category: 'pdf',
    iconName: 'RotateCw',
    fromExt: ['pdf'],
    toExt: ['pdf'],
    defaultTarget: 'pdf',
    endpoint: '/api/pdf/rotate',
    clientSideCapable: true,
    color: 'from-indigo-500 to-blue-600',
    optionsConfig: [
      {
        id: 'angle',
        label: 'Rotation Angle',
        type: 'select',
        defaultValue: 90,
        options: [
          { label: '90° Clockwise', value: 90 },
          { label: '180° Flip', value: 180 },
          { label: '270° Counter-Clockwise', value: 270 }
        ]
      }
    ]
  },
  {
    id: 'number-pdf',
    name: 'Page Numbers',
    description: 'Add custom page number stamps (e.g., Page 1 of 10) to your PDF.',
    category: 'pdf',
    iconName: 'Hash',
    fromExt: ['pdf'],
    toExt: ['pdf'],
    defaultTarget: 'pdf',
    endpoint: '/api/pdf/number',
    clientSideCapable: true,
    color: 'from-cyan-600 to-blue-600',
    optionsConfig: [
      {
        id: 'position',
        label: 'Position',
        type: 'select',
        defaultValue: 'bottom-right',
        options: [
          { label: 'Bottom Right', value: 'bottom-right' },
          { label: 'Bottom Center', value: 'bottom-center' },
          { label: 'Bottom Left', value: 'bottom-left' },
          { label: 'Top Right', value: 'top-right' }
        ]
      },
      {
        id: 'format_str',
        label: 'Format Pattern',
        type: 'text',
        defaultValue: 'Page {n} of {total}',
        placeholder: 'Page {n} of {total}'
      }
    ]
  },
  {
    id: 'pdf-to-images',
    name: 'PDF to Images',
    description: 'Rasterize PDF pages into a zipped archive of PNG, JPG, or WEBP images.',
    category: 'pdf',
    iconName: 'Images',
    fromExt: ['pdf'],
    toExt: ['zip'],
    defaultTarget: 'zip',
    endpoint: '/api/convert/pdf-to-images',
    popular: true,
    color: 'from-fuchsia-600 to-rose-600',
    optionsConfig: [
      {
        id: 'img_format',
        label: 'Image Format',
        type: 'select',
        defaultValue: 'png',
        options: [
          { label: 'PNG (Lossless)', value: 'png' },
          { label: 'JPG (Compressed)', value: 'jpg' },
          { label: 'WEBP (Next-Gen)', value: 'webp' }
        ]
      }
    ]
  },
  {
    id: 'images-to-pdf',
    name: 'Images to PDF',
    description: 'Bundle multiple JPG, PNG, WEBP, or BMP images into a clean single PDF.',
    category: 'pdf',
    iconName: 'ImagePlus',
    fromExt: ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'tiff'],
    toExt: ['pdf'],
    defaultTarget: 'pdf',
    endpoint: '/api/convert/images-to-pdf',
    popular: true,
    clientSideCapable: true,
    color: 'from-violet-600 to-indigo-600'
  },

  // --- Image Studio ---
  {
    id: 'image-converter',
    name: 'Image Converter',
    description: 'Cross-convert between JPG, PNG, WEBP, GIF, BMP, and TIFF formats.',
    category: 'image',
    iconName: 'Image',
    fromExt: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'tiff'],
    toExt: ['png', 'jpg', 'webp', 'bmp', 'tiff', 'gif'],
    defaultTarget: 'webp',
    endpoint: '/api/convert/image',
    popular: true,
    clientSideCapable: true,
    color: 'from-emerald-500 to-teal-600',
    badge: 'Universal',
    optionsConfig: [
      {
        id: 'target_format',
        label: 'Output Format',
        type: 'select',
        defaultValue: 'webp',
        options: [
          { label: 'WEBP (Next-Gen)', value: 'webp' },
          { label: 'PNG (Lossless)', value: 'png' },
          { label: 'JPG (Compact)', value: 'jpg' },
          { label: 'BMP (Bitmap)', value: 'bmp' },
          { label: 'TIFF (Print)', value: 'tiff' }
        ]
      },
      {
        id: 'quality',
        label: 'Quality (10-100%)',
        type: 'range',
        defaultValue: 90,
        min: 10,
        max: 100,
        step: 5
      }
    ]
  },
  {
    id: 'resize-image',
    name: 'Resize & Scale Image',
    description: 'Scale image dimensions (width/height) with Lanczos filtering.',
    category: 'image',
    iconName: 'Scaling',
    fromExt: ['jpg', 'jpeg', 'png', 'webp', 'bmp'],
    toExt: ['png', 'jpg', 'webp'],
    defaultTarget: 'png',
    endpoint: '/api/convert/image',
    clientSideCapable: true,
    color: 'from-blue-500 to-teal-500',
    optionsConfig: [
      {
        id: 'width',
        label: 'Max Width (px, leave 0 for auto)',
        type: 'number',
        defaultValue: 1200,
        min: 0,
        max: 8000
      },
      {
        id: 'quality',
        label: 'Quality (10-100%)',
        type: 'range',
        defaultValue: 90,
        min: 10,
        max: 100
      }
    ]
  },

  // --- Data & Spreadsheet Engine ---
  {
    id: 'data-converter',
    name: 'Data Format Matrix',
    description: 'Convert smoothly between CSV, XLSX, JSON, XML, and Markdown tables.',
    category: 'data',
    iconName: 'Database',
    fromExt: ['csv', 'xlsx', 'xls', 'json', 'xml', 'md', 'markdown'],
    toExt: ['csv', 'xlsx', 'json', 'xml', 'md'],
    defaultTarget: 'csv',
    endpoint: '/api/convert/data',
    popular: true,
    clientSideCapable: true,
    color: 'from-teal-600 to-cyan-700',
    badge: 'Multi-Way',
    optionsConfig: [
      {
        id: 'target_format',
        label: 'Target Data Format',
        type: 'select',
        defaultValue: 'csv',
        options: [
          { label: 'CSV (Comma-Separated)', value: 'csv' },
          { label: 'XLSX (Excel Workbook)', value: 'xlsx' },
          { label: 'JSON (Structured Array)', value: 'json' },
          { label: 'XML (Tree Nodes)', value: 'xml' },
          { label: 'Markdown Table', value: 'md' }
        ]
      }
    ]
  },

  // --- Media Engine (Audio / Video) ---
  {
    id: 'video-to-audio',
    name: 'Extract Audio (MP3 / WAV)',
    description: 'Extract crisp high-bitrate MP3 or lossless WAV audio from video files.',
    category: 'media',
    iconName: 'Headphones',
    fromExt: ['mp4', 'avi', 'webm', 'mov', 'mkv'],
    toExt: ['mp3', 'wav'],
    defaultTarget: 'mp3',
    endpoint: '/api/convert/media',
    popular: true,
    color: 'from-amber-500 to-red-500',
    badge: 'FFmpeg 8.1',
    optionsConfig: [
      {
        id: 'target_format',
        label: 'Audio Format',
        type: 'select',
        defaultValue: 'mp3',
        options: [
          { label: 'MP3 (192 kbps)', value: 'mp3' },
          { label: 'WAV (Lossless PCM)', value: 'wav' }
        ]
      },
      {
        id: 'audio_bitrate',
        label: 'Bitrate',
        type: 'select',
        defaultValue: '192k',
        options: [
          { label: '128 kbps (Standard)', value: '128k' },
          { label: '192 kbps (High Quality)', value: '192k' },
          { label: '320 kbps (Extreme)', value: '320k' }
        ]
      }
    ]
  },
  {
    id: 'video-to-gif',
    name: 'Video to Animated GIF',
    description: 'Create smooth two-pass palette-optimized animated GIFs from MP4 or WEBM.',
    category: 'media',
    iconName: 'Film',
    fromExt: ['mp4', 'avi', 'webm', 'mov'],
    toExt: ['gif'],
    defaultTarget: 'gif',
    endpoint: '/api/convert/media',
    popular: true,
    color: 'from-rose-500 to-amber-600',
    optionsConfig: [
      {
        id: 'fps',
        label: 'Frame Rate (FPS)',
        type: 'select',
        defaultValue: 15,
        options: [
          { label: '10 FPS (Compact)', value: 10 },
          { label: '15 FPS (Balanced)', value: 15 },
          { label: '24 FPS (Cinematic)', value: 24 }
        ]
      },
      {
        id: 'gif_scale',
        label: 'Max Width (px)',
        type: 'select',
        defaultValue: 480,
        options: [
          { label: '360px', value: 360 },
          { label: '480px', value: 480 },
          { label: '640px', value: 640 }
        ]
      }
    ]
  },
  {
    id: 'video-transcode',
    name: 'Video Transcoder (MP4 / WEBM / AVI)',
    description: 'Transcode between modern video formats (MP4, WEBM VP9, AVI).',
    category: 'media',
    iconName: 'Video',
    fromExt: ['mp4', 'webm', 'avi', 'mov'],
    toExt: ['mp4', 'webm', 'avi'],
    defaultTarget: 'mp4',
    endpoint: '/api/convert/media',
    color: 'from-red-600 to-rose-700',
    optionsConfig: [
      {
        id: 'target_format',
        label: 'Output Container',
        type: 'select',
        defaultValue: 'mp4',
        options: [
          { label: 'MP4 (H.264 / AAC)', value: 'mp4' },
          { label: 'WEBM (VP9 / Opus)', value: 'webm' },
          { label: 'AVI (XviD)', value: 'avi' }
        ]
      }
    ]
  },

  // --- E-Book & Text Formats ---
  {
    id: 'epub-to-pdf',
    name: 'EPUB to PDF',
    description: 'Convert digital EPUB books into printable, paginated PDF documents.',
    category: 'ebook',
    iconName: 'BookOpen',
    fromExt: ['epub'],
    toExt: ['pdf'],
    defaultTarget: 'pdf',
    endpoint: '/api/convert/ebook-text',
    color: 'from-violet-600 to-purple-800'
  },
  {
    id: 'txt-to-pdf',
    name: 'TXT to PDF',
    description: 'Turn raw plaintext logs and files into clean, readable PDF documents.',
    category: 'ebook',
    iconName: 'FileText',
    fromExt: ['txt', 'log'],
    toExt: ['pdf'],
    defaultTarget: 'pdf',
    endpoint: '/api/convert/ebook-text',
    color: 'from-slate-600 to-slate-800'
  },
  {
    id: 'pdf-to-txt',
    name: 'PDF to Plain Text',
    description: 'Extract raw text stream and page-by-page transcripts from PDF documents.',
    category: 'ebook',
    iconName: 'AlignLeft',
    fromExt: ['pdf'],
    toExt: ['txt'],
    defaultTarget: 'txt',
    endpoint: '/api/convert/ebook-text',
    color: 'from-stone-600 to-neutral-800'
  },
  {
    id: 'md-to-html',
    name: 'Markdown to HTML',
    description: 'Compile Markdown files with syntax highlighting and GitHub-style HTML.',
    category: 'ebook',
    iconName: 'Code',
    fromExt: ['md', 'markdown'],
    toExt: ['html'],
    defaultTarget: 'html',
    endpoint: '/api/convert/ebook-text',
    clientSideCapable: true,
    color: 'from-sky-500 to-indigo-600'
  },

  // --- Archive Engine ---
  {
    id: 'archive-create',
    name: 'Create Archive (ZIP / TAR / GZ)',
    description: 'Compress multiple files into an encrypted-ready ZIP or TAR archive.',
    category: 'archive',
    iconName: 'Archive',
    fromExt: ['*'],
    toExt: ['zip', 'tar', 'tar.gz'],
    defaultTarget: 'zip',
    endpoint: '/api/archive/create',
    popular: true,
    clientSideCapable: true,
    color: 'from-amber-600 to-yellow-600',
    optionsConfig: [
      {
        id: 'archive_format',
        label: 'Archive Type',
        type: 'select',
        defaultValue: 'zip',
        options: [
          { label: 'ZIP (.zip)', value: 'zip' },
          { label: 'TAR (.tar)', value: 'tar' },
          { label: 'GZ Compressed (.tar.gz)', value: 'tar.gz' }
        ]
      }
    ]
  },
  {
    id: 'archive-extract',
    name: 'Extract Archive (Unzip)',
    description: 'Decompress and unpack ZIP, TAR, and GZ archives into individual files.',
    category: 'archive',
    iconName: 'FolderArchive',
    fromExt: ['zip', 'tar', 'gz', 'tgz'],
    toExt: ['zip'],
    defaultTarget: 'zip',
    endpoint: '/api/archive/extract',
    clientSideCapable: true,
    color: 'from-yellow-600 to-amber-700'
  }
];

export const CATEGORIES = [
  { id: 'all', name: 'All Tools', count: CONVERSION_TOOLS.length },
  { id: 'pdf', name: 'PDF Tools', count: CONVERSION_TOOLS.filter(t => t.category === 'pdf').length },
  { id: 'office', name: 'Office Suite', count: CONVERSION_TOOLS.filter(t => t.category === 'office').length },
  { id: 'image', name: 'Image Studio', count: CONVERSION_TOOLS.filter(t => t.category === 'image').length },
  { id: 'data', name: 'Data & Sheets', count: CONVERSION_TOOLS.filter(t => t.category === 'data').length },
  { id: 'media', name: 'Audio & Video', count: CONVERSION_TOOLS.filter(t => t.category === 'media').length },
  { id: 'ebook', name: 'E-Book & Text', count: CONVERSION_TOOLS.filter(t => t.category === 'ebook').length },
  { id: 'archive', name: 'Archives', count: CONVERSION_TOOLS.filter(t => t.category === 'archive').length }
];
