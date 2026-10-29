import React, { useState, useRef } from 'react';
import { UploadCloud, ArrowUpRight } from 'lucide-react';
import type { ConversionTool } from '../types';

interface FileUploadZoneProps {
  activeTool: ConversionTool;
  onFilesSelected: (files: File[]) => void;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  activeTool,
  onFilesSelected
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(Array.from(e.target.files));
    }
  };

  // Build accept attribute string
  const acceptAttr = activeTool.fromExt.includes('*')
    ? undefined
    : activeTool.fromExt.map((ext) => `.${ext}`).join(',');

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`relative w-full rounded-3xl border-2 border-dashed p-8 md:p-12 text-center transition-all cursor-pointer overflow-hidden ${
        isDragOver
          ? 'border-rose-500 bg-rose-500/10 scale-[1.01] shadow-2xl shadow-rose-500/20'
          : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/60'
      }`}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept={acceptAttr}
        multiple
        className="hidden"
      />

      {/* Decorative Glow */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-32 bg-rose-500/10 blur-3xl pointer-events-none rounded-full" />

      <div className="relative z-10 flex flex-col items-center max-w-lg mx-auto">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 ${
          isDragOver ? 'scale-110 bg-rose-500 text-white' : 'bg-slate-800 text-rose-400 border border-slate-700'
        }`}>
          <UploadCloud className="w-8 h-8" />
        </div>

        <h3 className="text-lg md:text-xl font-extrabold text-white mb-2">
          Drop your files here to start converting
        </h3>
        <p className="text-xs md:text-sm text-slate-400 mb-6">
          Selected tool: <span className="text-rose-400 font-semibold">{activeTool.name}</span>. Click or drag & drop files from your computer.
        </p>

        {/* Accepted Formats Badges */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 mb-6">
          <span className="text-[11px] text-slate-400 mr-1">Accepted:</span>
          {activeTool.fromExt.map((ext) => (
            <span
              key={ext}
              className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 uppercase"
            >
              .{ext}
            </span>
          ))}
          <span className="text-[11px] text-slate-400 mx-1">→</span>
          {activeTool.toExt.map((ext) => (
            <span
              key={ext}
              className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 uppercase"
            >
              .{ext}
            </span>
          ))}
        </div>

        {/* Browse Button */}
        <button
          type="button"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 text-white text-xs font-bold shadow-lg shadow-rose-500/25 transition-all hover:scale-105"
        >
          <span>Choose Files</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
