import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Layers, Award, Download, ExternalLink, ArrowRight, CheckCircle2, Sparkles, Volume2, Globe, FileSpreadsheet, FileCode, ShieldCheck, Zap, Headphones } from 'lucide-react';
import { AppView, CEFRLevel } from '../../types';

interface HomePageProps {
  onNavigate: (view: AppView, level?: CEFRLevel) => void;
  counts: { all: number; a1: number; a2: number; b1: number };
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, counts }) => {
  const sources = [
    {
      level: 'A1' as CEFRLevel,
      title: 'Start Deutsch 1',
      subtitle: 'A1_SD1_Wortliste_02.pdf',
      wordsCount: counts.a1,
      badgeColor: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80',
      heroBorder: 'hover:border-emerald-300 dark:hover:border-emerald-700',
      description: 'Foundational vocabulary for everyday situations, greetings, shopping, numbers, time, family, and essential survival German with English, Turkish, Spanish & Arabic translations.',
      pdfUrl: 'https://www.goethe.de/pro/relaunch/prf/de/A1_SD1_Wortliste_02.pdf',
      csvFile: './data/words_a1_tr.csv',
      jsonFile: './data/words_a1.json',
    },
    {
      level: 'A2' as CEFRLevel,
      title: 'Goethe-Zertifikat A2',
      subtitle: 'Goethe-Zertifikat_A2_Wortliste.pdf',
      wordsCount: counts.a2,
      badgeColor: 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800/80',
      heroBorder: 'hover:border-sky-300 dark:hover:border-sky-700',
      description: 'Elementary vocabulary covering workplace routines, leisure, health, travel, past tenses (Perfekt & Präteritum forms), and expressing opinions.',
      pdfUrl: 'https://www.goethe.de/pro/relaunch/prf/de/Goethe-Zertifikat_A2_Wortliste.pdf',
      csvFile: './data/words_a2_tr.csv',
      jsonFile: './data/words_a2.json',
    },
    {
      level: 'B1' as CEFRLevel,
      title: 'Goethe-Zertifikat B1',
      subtitle: 'Goethe-Zertifikat_B1_Wortliste.pdf',
      wordsCount: counts.b1,
      badgeColor: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/80',
      heroBorder: 'hover:border-indigo-300 dark:hover:border-indigo-700',
      description: 'Intermediate German developed jointly with ÖSD and Uni Freiburg (Schweiz). Pluricentric vocabulary across Germany, Austria, and Switzerland.',
      pdfUrl: 'https://www.goethe.de/pro/relaunch/prf/de/Goethe-Zertifikat_B1_Wortliste.pdf',
      csvFile: './data/words_b1_tr.csv',
      jsonFile: './data/words_b1.json',
    },
  ];

  const features = [
    {
      icon: <Zap className="w-5 h-5 text-amber-500" />,
      title: '⚡ "Der, Die, Das" Speed Drill',
      description: 'Rapid-fire article reflex drill with configurable word goals (default: 25) and combo multipliers (🔥 2x, 3x).'
    },
    {
      icon: <Headphones className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
      title: '🎧 Hörverstehen (Listening Quiz)',
      description: 'Listen to native German speech audio with adjustable playback speeds (0.75x slow, 1.0x) and test your comprehension.'
    },
    {
      icon: <Globe className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      title: '🇬🇧, 🇹🇷, 🇪🇸 & 🇸🇦 Pre-Translated Offline Data',
      description: 'All 5,791 words have English (meaning_en), Turkish (meaning_tr), Spanish (meaning_es), and Arabic (meaning_ar) baked directly into the dataset for 0ms instant display.'
    },
    {
      icon: <Layers className="w-5 h-5 text-rose-600 dark:text-rose-400" />,
      title: 'Interactive 3D Flashcards',
      description: 'Configure session size (10, 25, 50, or custom), flip with Spacebar, listen with "A", and review learned cards.'
    },
    {
      icon: <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
      title: 'Smart Practice Quizzes',
      description: 'Custom question sizing (10Q, 25Q, 50Q) testing gender articles, Goethe exam sentence fill-ins, and meanings with instant explanations.'
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      title: '📱 PWA & IndexedDB Offline App',
      description: 'Installable on mobile and desktop as a native-feeling app. Runs 100% offline with zero server requirements.'
    }
  ];

  return (
    <div className="space-y-12 sm:space-y-16 py-4 text-zinc-900 dark:text-zinc-100">
      
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative bg-white/95 dark:bg-zinc-900/95 rounded-3xl border border-zinc-200/90 dark:border-zinc-800/90 shadow-[0_10px_35px_-5px_rgba(0,0,0,0.05)] dark:shadow-[0_10px_35px_-5px_rgba(0,0,0,0.4)] p-6 sm:p-12 overflow-hidden transition-colors"
      >
        <div className="max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-4 shadow-2xs">
            <span className="text-base">🇩🇪</span>
            <span>Official Goethe-Institut Wordlists</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 text-[10px]">A1 • A2 • B1</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight mb-4">
            Master German Vocabulary with Authentic Goethe Materials
          </h1>

          <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed mb-8">
            Complete database of <strong className="text-zinc-900 dark:text-white">{counts.all.toLocaleString()} words</strong> pre-translated into English, Turkish, Spanish, and Arabic. Features authentic Goethe example sentences, audio with speed control, ⚡ "Der Die Das" speed drill, and 100% offline PWA support.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate('speed-drill')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-2xl shadow-md shadow-amber-500/25 transition-all"
            >
              <Zap className="w-4 h-4" />
              <span>Play "Der, Die, Das" Drill</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate('listening')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-2xl shadow-md shadow-indigo-600/25 transition-all"
            >
              <Headphones className="w-4 h-4" />
              <span>Listening Mode (Hörverstehen)</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate('explorer', 'ALL')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-700 text-white font-bold text-sm rounded-2xl border border-zinc-200/90 dark:border-zinc-700 shadow-xs transition-all"
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>Browse All Words</span>
            </motion.button>
          </div>
        </div>
      </motion.section>

      {/* 3 Source Books Section */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">Official Vocabulary Levels</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Carefully curated and extracted directly from Goethe-Institut official certified wordlist PDFs.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {sources.map((src) => (
            <div
              key={src.level}
              className={`bg-white/95 dark:bg-zinc-900/95 rounded-3xl border border-zinc-200/90 dark:border-zinc-800/90 p-6 flex flex-col justify-between shadow-xs transition-all ${src.heroBorder}`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 rounded-xl text-xs font-black border ${src.badgeColor}`}>
                    {src.level} Level
                  </span>
                  <span className="text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400">
                    {src.wordsCount.toLocaleString()} words
                  </span>
                </div>

                <h3 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight mb-1">
                  {src.title}
                </h3>
                <p className="text-xs font-mono text-zinc-400 mb-3">{src.subtitle}</p>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
                  {src.description}
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  onClick={() => onNavigate('explorer', src.level)}
                  className="w-full py-2.5 bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-700 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Study {src.level} Words</span>
                </button>

                <div className="flex items-center gap-2">
                  <a
                    href={src.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2 bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-[11px] font-semibold rounded-xl transition-all flex items-center justify-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Official PDF</span>
                  </a>
                  <a
                    href={src.csvFile}
                    download
                    className="flex-1 py-2 bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-[11px] font-semibold rounded-xl transition-all flex items-center justify-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    <span>CSV</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* App Features Grid */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">Interactive Study Engine</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Everything built for fast learning, muscle memory, and active recall.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {features.map((feat, idx) => (
            <div
              key={idx}
              className="bg-white/95 dark:bg-zinc-900/95 rounded-3xl border border-zinc-200/90 dark:border-zinc-800/90 p-5 sm:p-6 shadow-xs"
            >
              <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-3">
                {feat.icon}
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-1.5">{feat.title}</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{feat.description}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
