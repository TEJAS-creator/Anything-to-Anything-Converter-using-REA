import React, { useState } from 'react';
import { Download, Play, RefreshCw, Archive } from 'lucide-react';
import type { QueueItem } from '../types';
import JSZip from 'jszip';
import { downloadBlob } from '../utils/api';

interface BatchDownloadBarProps {
  queue: QueueItem[];
  onConvertAll: () => void;
  onClearQueue: () => void;
  isProcessing: boolean;
}

export const BatchDownloadBar: React.FC<BatchDownloadBarProps> = ({
  queue,
  onConvertAll,
  onClearQueue,
  isProcessing
}) => {
  const [isZipping, setIsZipping] = useState(false);

  if (queue.length === 0) return null;

  const completedItems = queue.filter((i) => i.status === 'completed' && i.resultBlob);
  const pendingItems = queue.filter((i) => i.status === 'idle' || i.status === 'error');

  const handleDownloadAllZip = async () => {
    if (completedItems.length === 0) return;
    setIsZipping(true);

    try {
      const zip = new JSZip();
      for (const item of completedItems) {
        if (item.resultBlob) {
          const fname = item.resultFileName || `${item.file.name.split('.')[0]}.${item.targetExt}`;
          zip.file(fname, item.resultBlob);
        }
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      downloadBlob(zipBlob, `converted_bundle_${Date.now()}.zip`);
    } catch (err) {
      console.error('Error generating ZIP bundle:', err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-3xl px-4">
      <div className="backdrop-blur-2xl bg-slate-950/95 border border-slate-800 rounded-3xl p-4 shadow-2xl shadow-black/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Status Counts */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-rose-400">
            <Archive className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>{queue.length} {queue.length === 1 ? 'file' : 'files'} in queue</span>
              {completedItems.length > 0 && (
                <span className="text-[10px] text-emerald-400 font-normal">
                  ({completedItems.length} completed)
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              {pendingItems.length > 0
                ? `${pendingItems.length} ready to convert`
                : 'All items successfully converted!'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {/* Clear Queue */}
          <button
            onClick={onClearQueue}
            disabled={isProcessing}
            className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition-colors disabled:opacity-40"
          >
            Clear All
          </button>

          {/* Download All as ZIP (Available when at least 1 is done) */}
          {completedItems.length > 0 && (
            <button
              onClick={handleDownloadAllZip}
              disabled={isZipping}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white text-xs font-bold transition-all hover:scale-105 shadow-md shadow-slate-900/40 disabled:opacity-50"
            >
              {isZipping ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-rose-400" />
              ) : (
                <Download className="w-3.5 h-3.5 text-rose-400" />
              )}
              <span>Download ZIP ({completedItems.length})</span>
            </button>
          )}

          {/* Convert All Button */}
          {pendingItems.length > 0 && (
            <button
              onClick={onConvertAll}
              disabled={isProcessing}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 text-white text-xs font-bold shadow-lg shadow-rose-500/25 transition-all hover:scale-105 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Converting...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Convert All</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
