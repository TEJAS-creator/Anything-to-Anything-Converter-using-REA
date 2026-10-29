import React from 'react';
import { Layers, Search, Cpu, HardDrive } from 'lucide-react';
import type { BackendHealth } from '../types';

interface NavbarProps {
  health: BackendHealth;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  preferClient: boolean;
  setPreferClient: (val: boolean) => void;
  onLogoClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  health,
  searchQuery,
  setSearchQuery,
  preferClient,
  setPreferClient,
  onLogoClick
}) => {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo and Brand */}
        <div 
          onClick={onLogoClick}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 via-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-rose-500/20 group-hover:scale-105 transition-transform duration-200">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                OmniConvert
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                PRO LOCAL
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Anything-to-Anything Document & Media Engine
            </p>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-md relative hidden md:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search tools (e.g. 'pdf to word', 'resize', 'mp3', 'merge')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/90 border border-slate-800 rounded-full pl-10 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500/50 focus:ring-2 focus:ring-rose-500/20 transition-all"
          />
        </div>

        {/* System Capabilities & Mode Toggle */}
        <div className="flex items-center gap-3">
          {/* Microservice Status Badge */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-xs">
            {health.status === 'online' ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-emerald-400 font-medium hidden sm:inline">Backend Service: Live</span>
                <span className="text-slate-500 text-[10px] hidden lg:inline">(FastAPI + FFmpeg)</span>
              </>
            ) : health.status === 'checking' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                <span className="text-amber-300 font-medium text-xs">Connecting...</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span className="text-amber-400 font-medium text-xs">Client Wasm Mode</span>
              </>
            )}
          </div>

          {/* Engine Mode Toggle */}
          <button
            onClick={() => setPreferClient(!preferClient)}
            title={preferClient ? "Client Wasm Mode prioritized" : "Python Microservice Fidelity prioritized"}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              preferClient
                ? 'bg-purple-950/60 border-purple-500/40 text-purple-300 shadow-sm shadow-purple-500/20'
                : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            {preferClient ? <Cpu className="w-3.5 h-3.5 text-purple-400" /> : <HardDrive className="w-3.5 h-3.5 text-rose-400" />}
            <span className="hidden sm:inline">
              {preferClient ? 'Wasm Mode' : 'High Fidelity'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
