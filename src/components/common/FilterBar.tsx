import React from 'react';
import { Search, X, Shuffle, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { CEFRLevel, PartOfSpeech } from '../../types';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedLevel: CEFRLevel;
  onSelectLevel: (lvl: CEFRLevel) => void;
  selectedPos: PartOfSpeech;
  onSelectPos: (pos: PartOfSpeech) => void;
  counts: { all: number; a1: number; a2: number; b1: number };
  onRandomWord: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedLevel,
  onSelectLevel,
  selectedPos,
  onSelectPos,
  counts,
  onRandomWord,
}) => {
  const levels: { id: CEFRLevel; label: string; count: number }[] = [
    { id: 'ALL', label: 'All Levels', count: counts.all },
    { id: 'A1', label: 'A1 Beginner', count: counts.a1 },
    { id: 'A2', label: 'A2 Elementary', count: counts.a2 },
    { id: 'B1', label: 'B1 Intermediate', count: counts.b1 },
  ];

  const posOptions: { id: PartOfSpeech; label: string }[] = [
    { id: 'all', label: 'All Parts of Speech' },
    { id: 'noun', label: 'Nouns (Substantive)' },
    { id: 'verb', label: 'Verbs (Verben)' },
    { id: 'adjective', label: 'Adjectives (Adjektive)' },
    { id: 'adverb', label: 'Adverbs (Adverbien)' },
    { id: 'preposition', label: 'Prepositions (Präpositionen)' },
    { id: 'conjunction', label: 'Conjunctions (Konjunktionen)' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white/95 dark:bg-zinc-900/95 rounded-3xl border border-zinc-200/90 dark:border-zinc-800/90 shadow-[0_4px_24px_-6px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)] p-3.5 sm:p-5 mb-6 backdrop-blur-md transition-colors"
    >
      <div className="flex flex-col gap-3.5">
        
        {/* Top row: Search input + Random word */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative flex-1 group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-amber-600 transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search German headword, English meaning, examples, or forms..."
              className="w-full pl-10 pr-9 py-2.5 bg-zinc-50/80 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700 rounded-2xl text-xs sm:text-sm placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:bg-white dark:focus:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-zinc-800 dark:text-zinc-100"
            />
            {searchQuery && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </motion.button>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onRandomWord}
            title="Pick a random word to explore"
            className="flex items-center gap-1.5 px-3 py-2.5 bg-zinc-100/90 dark:bg-zinc-800 hover:bg-zinc-200/70 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 font-semibold text-xs rounded-2xl transition-all shrink-0 border border-zinc-200/80 dark:border-zinc-700 shadow-2xs"
          >
            <Shuffle className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">Random Word</span>
          </motion.button>
        </div>

        {/* Bottom row: Animated CEFR Level Pills + POS Dropdown */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          
          {/* Level Pills with Sliding Glider */}
          <div className="grid grid-cols-4 sm:flex items-center gap-1 p-1 bg-zinc-100/80 dark:bg-zinc-950/80 rounded-2xl border border-zinc-200/70 dark:border-zinc-800">
            {levels.map((lvl) => {
              const active = selectedLevel === lvl.id;
              return (
                <button
                  key={lvl.id}
                  onClick={() => onSelectLevel(lvl.id)}
                  className={`relative flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors duration-200 select-none ${
                    active ? 'text-zinc-900 dark:text-white' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="filter-active-pill"
                      className="absolute inset-0 bg-white dark:bg-zinc-800 rounded-xl shadow-xs border border-zinc-200/80 dark:border-zinc-700"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10 hidden sm:inline">{lvl.label}</span>
                  <span className="relative z-10 sm:hidden">{lvl.id === 'ALL' ? 'All' : lvl.id}</span>
                  <span
                    className={`relative z-10 text-[10px] px-1 py-0.2 rounded-full font-mono transition-colors hidden sm:inline ${
                      active ? 'bg-zinc-100 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold' : 'bg-zinc-200/70 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    {lvl.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Part of Speech Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-zinc-400 shrink-0 hidden sm:block" />
            <select
              value={selectedPos}
              onChange={(e) => onSelectPos(e.target.value as PartOfSpeech)}
              className="w-full sm:w-auto bg-zinc-50/90 dark:bg-zinc-800 border border-zinc-200/90 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer shadow-2xs hover:bg-white dark:hover:bg-zinc-700 transition-all"
            >
              {posOptions.map((opt) => (
                <option key={opt.id} value={opt.id} className="dark:bg-zinc-800">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

        </div>

      </div>
    </motion.div>
  );
};
