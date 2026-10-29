import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { QueueItem } from '../types';
import {
  FileText,
  Download,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  Cpu,
  HardDrive
} from 'lucide-react';
import { downloadBlob } from '../utils/api';

interface ConversionQueueManagerProps {
  queue: QueueItem[];
  onRemoveItem: (id: string) => void;
  onRetryItem: (id: string) => void;
}

export const ConversionQueueManager: React.FC<ConversionQueueManagerProps> = ({
  queue,
  onRemoveItem,
  onRetryItem
}) => {
  if (queue.length === 0) return null;

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="w-full space-y-3 mb-24">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Conversion Workspace ({queue.length} {queue.length === 1 ? 'file' : 'files'})
        </h4>
        <span className="text-xs text-slate-500">
          Ready for local conversion & batch download
        </span>
      </div>

      <AnimatePresence>
        {queue.map((item) => {
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className={`p-4 rounded-2xl border transition-all ${
                item.status === 'completed'
                  ? 'bg-slate-900/90 border-emerald-500/30'
                  : item.status === 'error'
                  ? 'bg-slate-900/90 border-rose-500/40'
                  : item.status === 'converting'
                  ? 'bg-slate-900/90 border-rose-500/30 shadow-lg shadow-rose-500/5'
                  : 'bg-slate-900/70 border-slate-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* File info */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    item.status === 'completed'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : item.status === 'error'
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}>
                    <FileText className="w-5 h-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-xs sm:text-sm font-semibold text-slate-100 truncate">
                        {item.file.name}
                      </p>
                      <span className="text-[10px] font-mono text-slate-500 shrink-0">
                        {formatFileSize(item.file.size)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      {/* Format change pill */}
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 uppercase">
                        {item.sourceExt}
                      </span>
                      <span className="text-[10px] text-slate-600">→</span>
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 uppercase">
                        {item.targetExt}
                      </span>

                      {/* Engine Tag */}
                      {item.engineUsed && (
                        <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400 flex items-center gap-1">
                          {item.engineUsed === 'client' ? (
                            <>
                              <Cpu className="w-2.5 h-2.5 text-purple-400" />
                              Wasm
                            </>
                          ) : (
                            <>
                              <HardDrive className="w-2.5 h-2.5 text-rose-400" />
                              Microservice
                            </>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  {/* Status Indicator */}
                  {item.status === 'idle' && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      Queued
                    </span>
                  )}

                  {item.status === 'converting' && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-rose-400 font-semibold animate-pulse">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Converting...
                    </span>
                  )}

                  {item.status === 'completed' && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Ready
                    </span>
                  )}

                  {item.status === 'error' && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-rose-400 font-semibold">
                      <AlertCircle className="w-4 h-4 text-rose-400" />
                      Failed
                    </span>
                  )}

                  {/* Individual Download Button */}
                  {item.status === 'completed' && item.resultBlob && (
                    <button
                      onClick={() => downloadBlob(item.resultBlob!, item.resultFileName || 'converted_file')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all hover:scale-105"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </button>
                  )}

                  {/* Retry Button */}
                  {item.status === 'error' && (
                    <button
                      onClick={() => onRetryItem(item.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="Retry conversion"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  )}

                  {/* Remove Button */}
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    title="Remove from queue"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Progress Bar (during converting) */}
              {item.status === 'converting' && (
                <div className="mt-3 w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
                  <motion.div
                    className="bg-gradient-to-r from-rose-500 to-indigo-500 h-1.5 rounded-full"
                    animate={{ width: `${item.progress}%` }}
                    transition={{ ease: 'easeOut' }}
                  />
                </div>
              )}

              {/* Error Detail */}
              {item.status === 'error' && item.errorMessage && (
                <div className="mt-2.5 p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-300">
                  {item.errorMessage}
                </div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
