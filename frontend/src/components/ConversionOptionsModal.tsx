import React from 'react';
import { Sliders, X } from 'lucide-react';
import type { ConversionTool } from '../types';

interface ConversionOptionsModalProps {
  tool: ConversionTool;
  options: Record<string, any>;
  onOptionsChange: (newOptions: Record<string, any>) => void;
  onClose?: () => void;
}

export const ConversionOptionsModal: React.FC<ConversionOptionsModalProps> = ({
  tool,
  options,
  onOptionsChange,
  onClose
}) => {
  const configs = tool.optionsConfig || [];

  const handleFieldChange = (key: string, val: any) => {
    onOptionsChange({
      ...options,
      [key]: val
    });
  };

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-5 mb-6 shadow-xl">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-rose-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Conversion Settings ({tool.name})
          </h4>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {/* Output format selector if multiple toExt available */}
        {tool.toExt.length > 1 && (
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Target Extension
            </label>
            <select
              value={options.target_format || tool.defaultTarget || tool.toExt[0]}
              onChange={(e) => handleFieldChange('target_format', e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
            >
              {tool.toExt.map((ext) => (
                <option key={ext} value={ext}>
                  .{ext.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Dynamic Tool Specific Configs */}
        {configs.map((cfg) => {
          const val = options[cfg.id] !== undefined ? options[cfg.id] : cfg.defaultValue;

          if (cfg.type === 'select') {
            return (
              <div key={cfg.id}>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {cfg.label}
                </label>
                <select
                  value={val}
                  onChange={(e) => handleFieldChange(cfg.id, e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                >
                  {cfg.options?.map((opt) => (
                    <option key={String(opt.value)} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            );
          }

          if (cfg.type === 'range') {
            return (
              <div key={cfg.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    {cfg.label}
                  </label>
                  <span className="text-xs font-mono font-bold text-rose-400">
                    {val}%
                  </span>
                </div>
                <input
                  type="range"
                  min={cfg.min ?? 10}
                  max={cfg.max ?? 100}
                  step={cfg.step ?? 5}
                  value={val}
                  onChange={(e) => handleFieldChange(cfg.id, Number(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer"
                />
              </div>
            );
          }

          if (cfg.type === 'number') {
            return (
              <div key={cfg.id}>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {cfg.label}
                </label>
                <input
                  type="number"
                  min={cfg.min}
                  max={cfg.max}
                  value={val}
                  onChange={(e) => handleFieldChange(cfg.id, Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            );
          }

          return (
            <div key={cfg.id}>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {cfg.label}
              </label>
              <input
                type="text"
                placeholder={cfg.placeholder}
                value={val}
                onChange={(e) => handleFieldChange(cfg.id, e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
