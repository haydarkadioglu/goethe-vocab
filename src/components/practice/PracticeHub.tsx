import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Layers, Award, Headphones, PenTool, ArrowRight, Sparkles } from 'lucide-react';
import { AppView, CEFRLevel } from '../../types';

interface PracticeHubProps {
  onSelectMode: (mode: AppView) => void;
  selectedLevel: CEFRLevel;
  onSelectLevel: (lvl: CEFRLevel) => void;
  counts: { all: number; a1: number; a2: number; b1: number };
  learnedCount: number;
  favoritesCount: number;
  highScore: number;
}

export const PracticeHub: React.FC<PracticeHubProps> = ({
  onSelectMode,
  selectedLevel,
  onSelectLevel,
  counts,
  learnedCount,
  favoritesCount,
  highScore,
}) => {
  const levels: { id: CEFRLevel; label: string; count: number }[] = [
    { id: 'ALL', label: 'All Levels (A1-B1)', count: counts.all },
    { id: 'A1', label: 'A1 Beginner', count: counts.a1 },
    { id: 'A2', label: 'A2 Elementary', count: counts.a2 },
    { id: 'B1', label: 'B1 Intermediate', count: counts.b1 },
  ];

  const modes = [
    {
      id: 'speed-drill' as AppView,
      title: '⚡ "Der, Die, Das" Speed Drill',
      subtitle: 'Rapid Reflex Drill',
      desc: 'Pick the correct gender article against the clock, build combos (🔥 2x, 3x), and make article recall second nature.',
      badge: highScore > 0 ? `High Score: ${highScore} pts` : 'Speed & Reflex',
      badgeColor: 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      icon: <Zap className="w-6 h-6 text-amber-500" />,
      btnText: 'Launch Speed Drill',
    },
    {
      id: 'flashcards' as AppView,
      title: '🗂️ 3D Flashcards',
      subtitle: 'Interactive Vocabulary Cards',
      desc: 'Spaced repetition cards with 3D flip animation, native German pronunciation, plural forms, and Goethe sample sentences.',
      badge: `${learnedCount} Cards Learned`,
      badgeColor: 'bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800',
      icon: <Layers className="w-6 h-6 text-rose-500" />,
      btnText: 'Open Flashcards',
    },
    {
      id: 'quiz' as AppView,
      title: '📝 Smart Goethe Quiz',
      subtitle: 'Authentic Exam-Style Quizzes',
      desc: 'Test your vocabulary with fill-in-the-blank exam questions, articles, and definitions with immediate explanations.',
      badge: 'Fill-in & Definitions',
      badgeColor: 'bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800',
      icon: <Award className="w-6 h-6 text-purple-500" />,
      btnText: 'Start Quiz',
    },
    {
      id: 'listening' as AppView,
      title: '🎧 Hörverstehen (Listening Quiz)',
      subtitle: 'Ear Training & Audio Recall',
      desc: 'Listen to native German speech without seeing prompt text first, train your auditory comprehension, and pick the matching word.',
      badge: 'Audio Recall & Speed Control',
      badgeColor: 'bg-indigo-100 dark:bg-indigo-950/70 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
      icon: <Headphones className="w-6 h-6 text-indigo-500" />,
      btnText: 'Start Listening Quiz',
    },
    {
      id: 'spelling' as AppView,
      title: '✍️ Schreibtrainer (Spelling & Writing)',
      subtitle: 'Accurate German Writing Drill',
      desc: 'Practice typing German headwords from listening or definitions. Includes instant on-screen umlaut keys (ä, ö, ü, ß).',
      badge: 'NEW • Goethe Written Exam Prep',
      badgeColor: 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      icon: <PenTool className="w-6 h-6 text-emerald-500" />,
      btnText: 'Practice Spelling',
    },
  ];

  return (
    <div className="space-y-8 py-2">
      
      {/* Top Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/95 dark:bg-zinc-900/95 rounded-3xl border border-zinc-200/90 dark:border-zinc-800/90 p-6 sm:p-8 shadow-xs backdrop-blur-md"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/80 text-amber-900 dark:text-amber-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Practice & Training Arena</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
              How Would You Like to Practice?
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-xl">
              Reinforce your memory, master article reflexes, and prepare for official Goethe exams with 5 targeted study modes.
            </p>
          </div>

          {/* Target Level Filter */}
          <div className="w-full md:w-auto bg-zinc-100 dark:bg-zinc-800/80 p-1.5 rounded-2xl border border-zinc-200/80 dark:border-zinc-700">
            <div className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 px-2 pb-1">
              Study Level:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
              {levels.map(lvl => {
                const isActive = selectedLevel === lvl.id;
                return (
                  <button
                    key={lvl.id}
                    onClick={() => onSelectLevel(lvl.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-white/60 dark:hover:bg-zinc-700/60'
                    }`}
                  >
                    <span>{lvl.id}</span>
                    <span className="text-[10px] ml-1 opacity-80">({lvl.count})</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Modes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {modes.map((mode, idx) => (
          <motion.div
            key={mode.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: idx * 0.05 }}
            whileHover={{ y: -3 }}
            className="bg-white/95 dark:bg-zinc-900/95 rounded-3xl border border-zinc-200/90 dark:border-zinc-800/90 p-6 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-amber-400/60 dark:hover:border-amber-600/60 transition-all group"
          >
            <div>
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                  {mode.icon}
                </div>
                <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border ${mode.badgeColor}`}>
                  {mode.badge}
                </span>
              </div>

              {/* Title & Subtitle */}
              <h3 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                {mode.title}
              </h3>
              <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 mb-2">
                {mode.subtitle}
              </p>

              {/* Description */}
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
                {mode.desc}
              </p>
            </div>

            {/* Launch Button */}
            <button
              onClick={() => onSelectMode(mode.id)}
              className="w-full py-3 px-4 bg-zinc-900 dark:bg-zinc-800 hover:bg-amber-500 dark:hover:bg-amber-500 text-white font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-2 group-hover:shadow-md group-hover:shadow-amber-500/20"
            >
              <span>{mode.btnText}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        ))}
      </div>

    </div>
  );
};
