import { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { CategoryNav } from './components/CategoryNav';
import { ToolGrid } from './components/ToolGrid';
import { FileUploadZone } from './components/FileUploadZone';
import { ConversionOptionsModal } from './components/ConversionOptionsModal';
import { ConversionQueueManager } from './components/ConversionQueueManager';
import { BatchDownloadBar } from './components/BatchDownloadBar';
import { CONVERSION_TOOLS } from './utils/toolsData';
import type { CategoryType, ConversionTool, QueueItem, BackendHealth } from './types';
import { checkBackendHealth, executeConversion } from './utils/api';
import { Sparkles, ArrowLeft, ShieldCheck, Zap, Lock } from 'lucide-react';

export function App() {
  const [health, setHealth] = useState<BackendHealth>({ status: 'checking' });
  const [activeCategory, setActiveCategory] = useState<CategoryType>('all');
  const [activeTool, setActiveTool] = useState<ConversionTool>(CONVERSION_TOOLS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [preferClient, setPreferClient] = useState(false);
  const [toolOptions, setToolOptions] = useState<Record<string, Record<string, any>>>({});
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeView, setActiveView] = useState<'catalog' | 'tool'>('catalog');

  // Check backend health on load and every 15s
  useEffect(() => {
    const probe = async () => {
      const res = await checkBackendHealth();
      setHealth(res);
    };
    probe();
    const interval = setInterval(probe, 15000);
    return () => clearInterval(interval);
  }, []);

  // Filter tools based on search and category
  const filteredTools = useMemo(() => {
    return CONVERSION_TOOLS.filter((tool) => {
      const matchesCategory =
        activeCategory === 'all' || tool.category === activeCategory;
      const matchesSearch =
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.fromExt.some((e) => e.toLowerCase().includes(searchQuery.toLowerCase())) ||
        tool.toExt.some((e) => e.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  // Handle selecting a tool
  const handleSelectTool = (tool: ConversionTool) => {
    setActiveTool(tool);
    setActiveView('tool');
    // Initialize default options for this tool if not already
    if (!toolOptions[tool.id]) {
      const defaults: Record<string, any> = {
        target_format: tool.defaultTarget || tool.toExt[0]
      };
      tool.optionsConfig?.forEach((cfg) => {
        defaults[cfg.id] = cfg.defaultValue;
      });
      setToolOptions((prev) => ({ ...prev, [tool.id]: defaults }));
    }
  };

  // Add files to queue
  const handleFilesSelected = (files: File[]) => {
    const currentOptions = toolOptions[activeTool.id] || {
      target_format: activeTool.defaultTarget || activeTool.toExt[0]
    };

    const newItems: QueueItem[] = files.map((file) => {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      return {
        id: `${file.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        toolId: activeTool.id,
        sourceExt: ext,
        targetExt: currentOptions.target_format || activeTool.defaultTarget || activeTool.toExt[0],
        status: 'idle',
        progress: 0,
        options: { ...currentOptions }
      };
    });

    setQueue((prev) => [...prev, ...newItems]);
  };

  // Update options for active tool
  const handleOptionsChange = (newOptions: Record<string, any>) => {
    setToolOptions((prev) => ({
      ...prev,
      [activeTool.id]: newOptions
    }));

    // Update pending items in queue for this tool
    setQueue((prev) =>
      prev.map((item) => {
        if (item.status === 'idle' && item.toolId === activeTool.id) {
          return {
            ...item,
            targetExt: newOptions.target_format || item.targetExt,
            options: { ...newOptions }
          };
        }
        return item;
      })
    );
  };

  // Run conversion for all pending items
  const handleConvertAll = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    const pending = queue.filter((i) => i.status === 'idle' || i.status === 'error');

    // Check if this is a multi-file merge or images-to-pdf
    if (activeTool.id === 'merge-pdf' || activeTool.id === 'images-to-pdf' || activeTool.id === 'archive-create') {
      const files = queue.map((q) => q.file);
      // Mark all as converting
      setQueue((prev) =>
        prev.map((i) => ({ ...i, status: 'converting', progress: 40 }))
      );

      try {
        const options = toolOptions[activeTool.id] || {};
        const { blob, fileName, engine } = await executeConversion(
          activeTool,
          files,
          options,
          preferClient
        );

        setQueue((prev) =>
          prev.map((i, idx) => ({
            ...i,
            status: 'completed',
            progress: 100,
            engineUsed: engine,
            resultBlob: idx === 0 ? blob : undefined,
            resultFileName: idx === 0 ? fileName : undefined
          }))
        );
      } catch (err: any) {
        setQueue((prev) =>
          prev.map((i) => ({
            ...i,
            status: 'error',
            progress: 0,
            errorMessage: err.message || 'Batch conversion failed'
          }))
        );
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    // Otherwise process item-by-item
    for (const item of pending) {
      // Set to converting
      setQueue((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: 'converting', progress: 25 } : i))
      );

      try {
        const tool = CONVERSION_TOOLS.find((t) => t.id === item.toolId) || activeTool;
        // Progress ticker simulation
        const progressTimer = setInterval(() => {
          setQueue((prev) =>
            prev.map((i) =>
              i.id === item.id && i.status === 'converting' && i.progress < 85
                ? { ...i, progress: i.progress + 15 }
                : i
            )
          );
        }, 300);

        const { blob, fileName, engine } = await executeConversion(
          tool,
          [item.file],
          item.options,
          preferClient
        );

        clearInterval(progressTimer);

        setQueue((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? {
                  ...i,
                  status: 'completed',
                  progress: 100,
                  resultBlob: blob,
                  resultFileName: fileName,
                  engineUsed: engine
                }
              : i
          )
        );
      } catch (err: any) {
        setQueue((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? {
                  ...i,
                  status: 'error',
                  progress: 0,
                  errorMessage: err.message || 'Conversion failed'
                }
              : i
          )
        );
      }
    }

    setIsProcessing(false);
  };

  // Retry item
  const handleRetryItem = (id: string) => {
    setQueue((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: 'idle', errorMessage: undefined } : i))
    );
  };

  // Remove item
  const handleRemoveItem = (id: string) => {
    setQueue((prev) => prev.filter((i) => i.id !== id));
  };

  // Clear queue
  const handleClearQueue = () => {
    setQueue([]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500/30 selection:text-rose-200">
      {/* Navbar */}
      <Navbar
        health={health}
        searchQuery={searchQuery}
        setSearchQuery={(q) => {
          setSearchQuery(q);
          if (q.trim()) setActiveView('catalog');
        }}
        preferClient={preferClient}
        setPreferClient={setPreferClient}
        onLogoClick={() => {
          setActiveView('catalog');
          setActiveCategory('all');
          setSearchQuery('');
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Hero Banner (Shown when on catalog view or queue is empty) */}
        {activeView === 'catalog' && (
          <div className="text-center max-w-3xl mx-auto mb-10 pt-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-rose-500/10 via-purple-500/10 to-indigo-500/10 border border-rose-500/20 text-xs font-semibold text-rose-300 mb-4">
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              <span>Full Local Conversion Microservice & Client Wasm Engine</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4">
              Convert <span className="bg-gradient-to-r from-rose-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">Anything</span> to Anything.
            </h1>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed mb-6">
              100% private, local-first document layout reconstruction, image optimization, video transcoding, and spreadsheet parsing. No file uploads to external clouds.
            </p>

            {/* Feature highlights */}
            <div className="grid grid-cols-3 gap-3 max-w-xl mx-auto pt-2 text-left">
              <div className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800/80">
                <div className="flex items-center gap-2 text-xs font-bold text-white mb-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  100% Private
                </div>
                <p className="text-[11px] text-slate-400">Processed completely on your local machine.</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800/80">
                <div className="flex items-center gap-2 text-xs font-bold text-white mb-1">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Zero Limits
                </div>
                <p className="text-[11px] text-slate-400">No file size caps or artificial daily rate limits.</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800/80">
                <div className="flex items-center gap-2 text-xs font-bold text-white mb-1">
                  <Lock className="w-4 h-4 text-indigo-400" />
                  Layout Fidelity
                </div>
                <p className="text-[11px] text-slate-400">Preserves tables, fonts, headings and slides.</p>
              </div>
            </div>
          </div>
        )}

        {/* View Switch: Catalog vs Active Tool Workspace */}
        {activeView === 'tool' ? (
          <div className="space-y-6">
            {/* Back to All Tools button */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setActiveView('catalog')}
                className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span>Back to All Tools</span>
              </button>

              <span className="text-xs font-mono text-slate-400">
                Active Tool: <strong className="text-rose-400">{activeTool.name}</strong>
              </span>
            </div>

            {/* Dropzone */}
            <FileUploadZone
              activeTool={activeTool}
              onFilesSelected={handleFilesSelected}
            />

            {/* Conversion Options */}
            <ConversionOptionsModal
              tool={activeTool}
              options={toolOptions[activeTool.id] || {}}
              onOptionsChange={handleOptionsChange}
            />

            {/* Queue & Progress */}
            <ConversionQueueManager
              queue={queue}
              onRemoveItem={handleRemoveItem}
              onRetryItem={handleRetryItem}
            />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Category Navigation Bar */}
            <CategoryNav
              activeCategory={activeCategory}
              onSelectCategory={setActiveCategory}
            />

            {/* Tool Cards Grid */}
            <ToolGrid
              tools={filteredTools}
              onSelectTool={handleSelectTool}
            />

            {/* If files are currently in queue, show them below the grid */}
            {queue.length > 0 && (
              <div className="pt-10 border-t border-slate-800">
                <ConversionQueueManager
                  queue={queue}
                  onRemoveItem={handleRemoveItem}
                  onRetryItem={handleRetryItem}
                />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Sticky Batch Download Action Bar */}
      <BatchDownloadBar
        queue={queue}
        onConvertAll={handleConvertAll}
        onClearQueue={handleClearQueue}
        isProcessing={isProcessing}
      />
    </div>
  );
}

export default App;
