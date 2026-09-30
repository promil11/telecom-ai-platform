import React from 'react';
import { Activity, Radio, Cpu, Sparkles, Server, Zap, Sun, Moon } from 'lucide-react';
import { MicroserviceStatus } from '../../types';

interface HeaderProps {
  activeTab: 'LEAD_SCORING' | 'GEO_CAMPAIGNS' | 'AI_STUDIO' | 'ANALYTICS';
  setActiveTab: (tab: 'LEAD_SCORING' | 'GEO_CAMPAIGNS' | 'AI_STUDIO' | 'ANALYTICS') => void;
  microservices: MicroserviceStatus[];
  gatewayStatus: string;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  microservices,
  gatewayStatus,
  isDarkMode,
  setIsDarkMode
}) => {
  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-200/80 dark:border-white/10 px-6 md:px-8 py-3.5 rounded-none mb-6 shadow-sm w-full">
      <div className="w-full flex flex-col xl:flex-row items-center justify-between gap-4">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-500 p-0.5 shadow-md shadow-indigo-500/20">
            <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white font-heading">
                AetherTel <span className="text-indigo-600 dark:text-indigo-400">CorePlatform</span>
              </h1>
              <span className="badge badge-success text-[10px] py-0.5 px-2">v2.4 Microservices</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Telecom Enterprise Sales & Hyperlocal Marketing Engine</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900/80 p-1.5 rounded-xl border border-slate-200 dark:border-white/10">
          <button
            onClick={() => setActiveTab('LEAD_SCORING')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'LEAD_SCORING'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>AI B2B Lead Scoring</span>
          </button>

          <button
            onClick={() => setActiveTab('GEO_CAMPAIGNS')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'GEO_CAMPAIGNS'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Hyperlocal Geo Engine</span>
          </button>

          <button
            onClick={() => setActiveTab('AI_STUDIO')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'AI_STUDIO'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Multilingual AI Copy</span>
          </button>

          <button
            onClick={() => setActiveTab('ANALYTICS')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'ANALYTICS'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Campaign Analytics</span>
          </button>
        </nav>

        {/* Right Controls: Microservices Indicator + Light/Dark Theme Switcher */}
        <div className="flex items-center gap-3">
          {/* Microservices Status Indicator */}
          <div className="flex items-center gap-3 bg-white dark:bg-slate-900/80 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs shadow-xs">
            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold">
              <Server className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="font-mono text-[11px]">API Gateway</span>
              <span className={`w-2 h-2 rounded-full ${gatewayStatus === 'ONLINE' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
            </div>

            <div className="h-3 w-px bg-slate-200 dark:bg-white/10" />

            <div className="flex items-center gap-2">
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">Services:</span>
              <div className="flex items-center gap-1">
                {microservices.map((svc, idx) => (
                  <span
                    key={idx}
                    title={`${svc.name}: ${svc.status}`}
                    className={`w-2.5 h-2.5 rounded-full ${
                      svc.status === 'ONLINE' ? 'bg-emerald-500 shadow-xs shadow-emerald-500' : 'bg-rose-500'
                    }`}
                  />
                ))}
              </div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
                {microservices.filter(s => s.status === 'ONLINE').length}/4 Active
              </span>
            </div>
          </div>

          {/* Theme Switcher */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            title={isDarkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all shadow-xs"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>
        </div>
      </div>
    </header>
  );
};
