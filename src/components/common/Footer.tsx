import React, { useState } from 'react';
import { RotateCw, Sparkles } from 'lucide-react';
import { clearAppCacheAndReload } from '../../utils/cache';

export const Footer: React.FC = () => {
  const [clearing, setClearing] = useState(false);

  const handleClearCache = async () => {
    if (clearing) return;
    setClearing(true);
    await clearAppCacheAndReload();
  };

  return (
    <footer className="border-t border-zinc-200/90 dark:border-zinc-800/90 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md pt-5 pb-20 lg:pb-6 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-zinc-500 dark:text-zinc-400">
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-center md:text-left">
          <span className="font-bold text-zinc-700 dark:text-zinc-300">GoetheVocab PWA</span>
          <span className="hidden sm:inline">•</span>
          <span>A1, A2, B1 Official Goethe-Institut Wordlists</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <div className="hidden sm:flex items-center gap-2 font-medium text-zinc-400 dark:text-zinc-500 text-[11px]">
            <span>🇩🇪 DE</span>
            <span>🇬🇧 EN</span>
            <span>🇹🇷 TR</span>
            <span>🇪🇸 ES</span>
            <span>🇸🇦 AR</span>
          </div>

          <button
            onClick={handleClearCache}
            disabled={clearing}
            title="Check for updates and purge browser service worker cache (preserves saved words)"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-800 transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            <RotateCw className={`w-3 h-3 ${clearing ? 'animate-spin text-amber-500' : ''}`} />
            <span>{clearing ? 'Updating...' : 'Check Update & Clear Cache'}</span>
          </button>
        </div>
      </div>
    </footer>
  );
};

