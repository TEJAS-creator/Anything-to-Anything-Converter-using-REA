import React from 'react';
import { motion } from 'framer-motion';
import type { ConversionTool } from '../types';
import {
  FileText,
  FileCheck,
  Presentation,
  FileUp,
  Table,
  Copy,
  Scissors,
  Minimize2,
  RotateCw,
  Hash,
  Images,
  ImagePlus,
  Image,
  Scaling,
  Database,
  Headphones,
  Film,
  Video,
  BookOpen,
  AlignLeft,
  Code,
  Archive,
  FolderArchive,
  Layers,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface ToolGridProps {
  tools: ConversionTool[];
  onSelectTool: (tool: ConversionTool) => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  FileText,
  FileCheck,
  Presentation,
  FileUp,
  Table,
  Sheet: Table,
  Copy,
  Scissors,
  Minimize2,
  RotateCw,
  Hash,
  Images,
  ImagePlus,
  Image,
  Scaling,
  Database,
  Headphones,
  Film,
  Video,
  BookOpen,
  AlignLeft,
  Code,
  Archive,
  FolderArchive
};

export const ToolGrid: React.FC<ToolGridProps> = ({ tools, onSelectTool }) => {
  if (tools.length === 0) {
    return (
      <div className="text-center py-16 bg-slate-900/30 border border-dashed border-slate-800 rounded-3xl">
        <Layers className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-slate-300">No tools matched your search</h3>
        <p className="text-xs text-slate-500 mt-1">Try another keyword like 'pdf', 'word', 'media', or 'image'.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {tools.map((tool, idx) => {
        const Icon = ICON_MAP[tool.iconName] || Layers;

        return (
          <motion.div
            key={tool.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.02, duration: 0.25 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            onClick={() => onSelectTool(tool)}
            className="group relative flex flex-col justify-between p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 hover:bg-slate-900/90 shadow-lg hover:shadow-2xl transition-all cursor-pointer overflow-hidden"
          >
            {/* Top row: Icon and Badges */}
            <div>
              <div className="flex items-start justify-between gap-2 mb-3.5">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${tool.color} flex items-center justify-center text-white shadow-md shadow-slate-950/40 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1.5 flex-wrap justify-end">
                  {tool.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-rose-400" />
                      {tool.badge}
                    </span>
                  )}
                  {tool.clientSideCapable && (
                    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      WASM
                    </span>
                  )}
                </div>
              </div>

              {/* Title & Description */}
              <h3 className="font-bold text-sm text-slate-100 group-hover:text-white transition-colors mb-1.5">
                {tool.name}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                {tool.description}
              </p>
            </div>

            {/* Bottom row: Formats and action pill */}
            <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
              <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                <span className="bg-slate-800/80 px-1.5 py-0.5 rounded text-slate-300 uppercase">
                  {tool.fromExt[0]}
                </span>
                <span className="text-slate-600">→</span>
                <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-1.5 py-0.5 rounded font-bold uppercase">
                  {tool.defaultTarget || tool.toExt[0]}
                </span>
              </div>

              <span className="text-slate-500 group-hover:text-rose-400 group-hover:translate-x-1 transition-all">
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
