import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="hidden xl:block border-t border-zinc-200/90 dark:border-zinc-800/90 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md py-6 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-2">
          <span className="font-bold text-zinc-700 dark:text-zinc-300">GoetheVocab PWA</span>
          <span>•</span>
          <span>A1, A2, B1 Official Goethe-Institut Wordlists</span>
        </div>
        <div className="flex items-center gap-3 font-semibold">
          <span>🇩🇪 German</span>
          <span>🇬🇧 English</span>
          <span>🇹🇷 Türkçe</span>
          <span>🇪🇸 Spanish</span>
          <span>🇸🇦 Arabic</span>
        </div>
      </div>
    </footer>
  );
};
