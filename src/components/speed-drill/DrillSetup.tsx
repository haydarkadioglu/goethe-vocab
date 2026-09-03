import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Target, Layers, BookOpen, Timer } from 'lucide-react';
import { CEFRLevel } from '../../types';

interface DrillSetupProps {
  nounsCount: number;
  targetCount: number;
  setTargetCount: (n: number) => void;
  selectedLevel: CEFRLevel;
  setSelectedLevel: (lvl: CEFRLevel) => void;
  drillMode: 'timer' | 'practice';
  setDrillMode: (mode: 'timer' | 'practice') => void;
  duration: number;
  setDuration: (d: number) => void;
  onStart: () => void;
}

export const DrillSetup: React.FC<DrillSetupProps> = ({
  nounsCount,
  targetCount,
  setTargetCount,
  selectedLevel,
  setSelectedLevel,
  drillMode,
  setDrillMode,
  duration,
  setDuration,
  onStart
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-xl mx-auto bg-white/95 dark:bg-zinc-900/95 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 shadow-[0_12px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.5)] p-5 sm:p-8 text-center text-zinc-900 dark:text-white"
    >
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-amber-500 text-white flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg shadow-amber-500/25">
        <Zap className="w-7 h-7 sm:w-8 sm:h-8" />
      </div>

      <h2 className="text-2xl sm:text-3xl font-black tracking-tight">"Der, Die, Das" Article Speed Drill</h2>
      <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1.5 max-w-md mx-auto">
        Master German noun genders into muscle memory. Choose your target word count and practice at your own pace or against the clock!
      </p>

      {/* Target Words Count Input & Presets */}
      <div className="my-4 p-4 bg-amber-50/60 dark:bg-amber-950/30 rounded-2xl border border-amber-200/80 dark:border-amber-900/60 text-left">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
            <Target className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Target Words Count:</span>
          </span>
          <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400">
            Default: 25 words
          </span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            max={nounsCount || 1000}
            value={targetCount}
            onChange={(e) => {
              const val = parseInt(e.target.value) || 1;
              setTargetCount(Math.min(Math.max(1, val), nounsCount || 1));
            }}
            className="w-24 bg-white dark:bg-zinc-900 text-sm font-black text-zinc-900 dark:text-white px-3 py-2 rounded-xl border border-amber-300 dark:border-amber-800 text-center focus:outline-none focus:ring-2 focus:ring-amber-500"
          />

          <div className="flex-1 grid grid-cols-4 gap-1.5">
            {[10, 25, 50].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setTargetCount(n)}
                className={`py-2 rounded-xl text-xs font-bold transition-all ${
                  targetCount === n
                    ? 'bg-amber-500 text-white shadow-xs font-black'
                    : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100'
                }`}
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setTargetCount(nounsCount || 100)}
              className={`py-2 rounded-xl text-xs font-bold transition-all ${
                targetCount === nounsCount
                  ? 'bg-amber-500 text-white shadow-xs font-black'
                  : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100'
              }`}
            >
              All
            </button>
          </div>
        </div>
      </div>

      {/* CEFR Level Selector Filter */}
      <div className="mb-4 p-3.5 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200/80 dark:border-zinc-700 text-left">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-500" />
            <span>Drill Level:</span>
          </span>
          <span className="text-[11px] font-mono font-bold text-amber-600 dark:text-amber-400">
            {nounsCount} Nouns Found
          </span>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {(['ALL', 'A1', 'A2', 'B1'] as CEFRLevel[]).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedLevel(lvl)}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition-all text-center ${
                selectedLevel === lvl
                  ? 'bg-zinc-900 dark:bg-amber-500 text-white dark:text-zinc-950 shadow-xs'
                  : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100'
              }`}
            >
              {lvl === 'ALL' ? 'All' : lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Mode Selector Toggle Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5 text-left">
        <button
          onClick={() => setDrillMode('practice')}
          className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between ${
            drillMode === 'practice'
              ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-500 shadow-xs'
              : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200/80 dark:border-zinc-700 hover:border-zinc-300'
          }`}
        >
          <div>
            <div className="flex items-center gap-1.5 font-black text-sm text-zinc-900 dark:text-white mb-1">
              <BookOpen className="w-4 h-4 text-amber-500" />
              <span>Practice Mode (Zen)</span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug">
              Study {targetCount} words with instant feedback and audio. Click Next or press Space to proceed.
            </p>
          </div>
          <span className={`text-[10px] font-bold uppercase tracking-wider mt-2.5 ${drillMode === 'practice' ? 'text-amber-600 dark:text-amber-400' : 'text-zinc-400'}`}>
            {drillMode === 'practice' ? '✓ Selected' : 'Select'}
          </span>
        </button>

        <button
          onClick={() => setDrillMode('timer')}
          className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between ${
            drillMode === 'timer'
              ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-500 shadow-xs'
              : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200/80 dark:border-zinc-700 hover:border-zinc-300'
          }`}
        >
          <div>
            <div className="flex items-center gap-1.5 font-black text-sm text-zinc-900 dark:text-white mb-1">
              <Timer className="w-4 h-4 text-amber-500" />
              <span>Speed Reflex (Timer)</span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug">
              Against the clock. If you make a mistake, the timer pauses automatically so you can study the correction.
            </p>
          </div>
          <span className={`text-[10px] font-bold uppercase tracking-wider mt-2.5 ${drillMode === 'timer' ? 'text-amber-600 dark:text-amber-400' : 'text-zinc-400'}`}>
            {drillMode === 'timer' ? '✓ Selected' : 'Select'}
          </span>
        </button>
      </div>

      {/* Timer Duration (if in timer mode) */}
      {drillMode === 'timer' && (
        <div className="mb-5">
          <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-2">
            Round Duration:
          </label>
          <div className="flex items-center justify-center gap-2">
            {[30, 60, 90].map((sec) => (
              <button
                key={sec}
                onClick={() => setDuration(sec)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all border ${
                  duration === sec
                    ? 'bg-zinc-900 dark:bg-amber-500 text-white dark:text-zinc-950 border-transparent shadow-xs'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200'
                }`}
              >
                {sec} Seconds
              </button>
            ))}
          </div>
        </div>
      )}

      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={onStart}
        disabled={nounsCount === 0}
        className="w-full py-4 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-base rounded-2xl shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2"
      >
        <Zap className="w-5 h-5" />
        <span>Start Drill ({Math.min(targetCount, nounsCount)} Words)</span>
      </motion.button>
    </motion.div>
  );
};
