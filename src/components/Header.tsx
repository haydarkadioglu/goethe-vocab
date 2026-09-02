import React, { useState, useEffect } from 'react';
import { Home, BookOpen, Layers, Award, Star, Download, Globe, Sun, Moon, Laptop, Zap, Headphones, Gauge } from 'lucide-react';
import { motion } from 'framer-motion';
import { AppView, SupportedLanguage, ThemeMode } from '../types';
import { SUPPORTED_LANGUAGES } from '../services/translator';
import { speechService } from '../services/speech';

interface HeaderProps {
  currentView: AppView;
  onSelectView: (view: AppView) => void;
  targetLang: SupportedLanguage;
  onChangeLang: (lang: SupportedLanguage) => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  favoritesCount: number;
  totalWords: number;
  filteredCount: number;
  onDownloadCSV: () => void;
  onDownloadJSON: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onSelectView,
  targetLang,
  onChangeLang,
  theme,
  onToggleTheme,
  favoritesCount,
  totalWords,
  filteredCount,
  onDownloadCSV,
  onDownloadJSON
}) => {
  const [speechRate, setSpeechRate] = useState<number>(speechService.getRate());

  const toggleSpeechRate = () => {
    const nextRate = speechRate === 0.75 ? 1.0 : speechRate === 1.0 ? 1.2 : 0.75;
    speechService.setRate(nextRate);
    setSpeechRate(nextRate);
  };

  const navItems: { id: AppView; label: string; icon: React.ReactNode; badge?: number | string }[] = [
    { id: 'home', label: 'Home', icon: <Home className="w-4 h-4" /> },
    { id: 'explorer', label: 'Dictionary', icon: <BookOpen className="w-4 h-4" />, badge: filteredCount },
    { id: 'speed-drill', label: 'Speed Drill', icon: <Zap className="w-4 h-4 text-amber-500" /> },
    { id: 'flashcards', label: 'Flashcards', icon: <Layers className="w-4 h-4" /> },
    { id: 'quiz', label: 'Quiz', icon: <Award className="w-4 h-4" /> },
    { id: 'listening', label: 'Listening', icon: <Headphones className="w-4 h-4 text-indigo-500" /> },
    { id: 'favorites', label: 'Saved', icon: <Star className="w-4 h-4" />, badge: favoritesCount > 0 ? favoritesCount : undefined },
  ];

  const getThemeIcon = () => {
    if (theme === 'dark') return <Moon className="w-4 h-4 text-amber-400" />;
    if (theme === 'light') return <Sun className="w-4 h-4 text-amber-500" />;
    return <Laptop className="w-4 h-4 text-zinc-400" />;
  };

  return (
    <header className="sticky top-0 z-40 bg-zinc-100/90 dark:bg-zinc-950/85 backdrop-blur-xl border-b border-zinc-200/90 dark:border-zinc-800/90 shadow-[0_2px_16px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand */}
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => onSelectView('home')}
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20 border border-white/40 group-hover:scale-105 transition-transform">
              <span className="text-xl select-none">🇩🇪</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-zinc-900 dark:text-white">
                  Goethe<span className="text-amber-600 dark:text-amber-500">Vocab</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-200/90 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300/80 dark:border-zinc-700">
                  A1-B1
                </span>
              </div>
              <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 hidden sm:block">
                Official Goethe-Institut ({totalWords.toLocaleString()} words)
              </p>
            </div>
          </motion.div>

          {/* Desktop Navigation Modes with Animated Glider Pill */}
          <nav className="hidden lg:flex items-center gap-1 bg-zinc-200/70 dark:bg-zinc-900/90 p-1.5 rounded-2xl border border-zinc-300/60 dark:border-zinc-800 shadow-inner">
            {navItems.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectView(item.id)}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors duration-200 select-none ${
                    isActive ? 'text-zinc-900 dark:text-white' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="header-active-pill"
                      className="absolute inset-0 bg-white dark:bg-zinc-800 rounded-xl shadow-xs border border-zinc-200/90 dark:border-zinc-700"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    />
                  )}
                  <span className={`relative z-10 ${isActive ? 'text-amber-600 dark:text-amber-400' : 'text-zinc-500 dark:text-zinc-400'}`}>
                    {item.icon}
                  </span>
                  <span className="relative z-10">{item.label}</span>
                  {item.badge !== undefined && (
                    <span
                      className={`relative z-10 text-[10px] px-1.5 py-0.2 rounded-full font-mono transition-colors ${
                        isActive
                          ? 'bg-zinc-100 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold'
                          : 'bg-zinc-300/70 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Tools */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            
            {/* Audio Speed Controller Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleSpeechRate}
              title={`Speech Speed: ${speechRate}x (Click to change)`}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-white/90 dark:bg-zinc-900/90 border border-zinc-200/90 dark:border-zinc-800 rounded-2xl shadow-xs text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
            >
              <Gauge className="w-3.5 h-3.5 text-amber-500" />
              <span>{speechRate}x</span>
            </motion.button>

            {/* Theme Toggle Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onToggleTheme}
              title="Toggle Theme (Light / Dark / System)"
              className="p-2 bg-white/90 dark:bg-zinc-900/90 border border-zinc-200/90 dark:border-zinc-800 rounded-2xl shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex items-center justify-center text-zinc-700 dark:text-zinc-300"
            >
              {getThemeIcon()}
            </motion.button>

            {/* Language Selector Dropdown */}
            <motion.div 
              whileHover={{ scale: 1.01 }}
              className="relative flex items-center bg-white/90 dark:bg-zinc-900/90 border border-zinc-200/90 dark:border-zinc-800 rounded-2xl px-2.5 sm:px-3 py-1.5 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
            >
              <Globe className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 mr-1.5 shrink-0" />
              <select
                value={targetLang}
                onChange={(e) => onChangeLang(e.target.value as SupportedLanguage)}
                className="bg-transparent text-xs font-bold text-zinc-800 dark:text-zinc-200 focus:outline-none cursor-pointer pr-1"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code} className="dark:bg-zinc-900 dark:text-zinc-200">
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </motion.div>

            {/* Quick Export Buttons */}
            <div className="hidden xl:flex items-center gap-1.5 border-l border-zinc-200/80 dark:border-zinc-800 pl-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onDownloadCSV}
                title="Download CSV"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all shadow-xs"
              >
                <Download className="w-3 h-3 text-zinc-500 dark:text-zinc-400" />
                <span>CSV</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onDownloadJSON}
                title="Download JSON"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all shadow-xs"
              >
                <Download className="w-3 h-3 text-zinc-500 dark:text-zinc-400" />
                <span>JSON</span>
              </motion.button>
            </div>

          </div>

        </div>

        {/* Mobile / Tablet Navigation Row */}
        <div className="flex lg:hidden items-center justify-around py-2 border-t border-zinc-200/60 dark:border-zinc-800/60 overflow-x-auto">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectView(item.id)}
                className={`flex flex-col items-center py-1 px-2 text-[11px] font-medium whitespace-nowrap transition-colors ${
                  isActive ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                }`}
              >
                <div className="mb-0.5">{item.icon}</div>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};
