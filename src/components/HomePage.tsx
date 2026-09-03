import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Layers, Award, Download, ExternalLink, ArrowRight, CheckCircle2, Sparkles, Volume2, Globe, FileSpreadsheet, FileCode, ShieldCheck, Zap, Headphones } from 'lucide-react';
import { AppView, CEFRLevel } from '../types';

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
      description: 'Foundational vocabulary for everyday situations, greetings, shopping, numbers, time, family, and essential survival German with English & Turkish translations.',
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
      description: 'Rapid-fire 60-second article reflex game with combo streaks (🔥 2x, 3x) and keyboard shortcuts (1=der, 2=die, 3=das).'
    },
    {
      icon: <Headphones className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
      title: '🎧 Hörverstehen (Listening Quiz)',
      description: 'Train your ear: listen to native German speech audio with adjustable playback speeds (0.75x slow, 1.0x) and test your comprehension.'
    },
    {
      icon: <Globe className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      title: '🇬🇧, 🇹🇷, 🇪🇸 & 🇸🇦 Pre-Translated Offline Data',
      description: 'All 5,791 words have English (meaning_en), Turkish (meaning_tr), Spanish (meaning_es), and Arabic (meaning_ar) baked directly into the dataset for 0ms instant display.'
    },
    {
      icon: <Layers className="w-5 h-5 text-rose-600 dark:text-rose-400" />,
      title: 'Interactive 3D Flashcards',
      description: 'Configure session size (10, 25, 50, or custom), flip with Spacebar, listen with "A", and mark learned cards saved permanently in browser DB.'
    },
    {
      icon: <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
      title: 'Smart Practice Quizzes',
      description: 'Custom question sizing (5Q, 10Q, 20Q) testing gender articles, Goethe exam sentence fill-ins, and meanings with instant explanations.'
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
            Complete database of <strong className="text-zinc-900 dark:text-white">{counts.all.toLocaleString()} words</strong> pre-translated into English & Turkish. Features authentic Goethe example sentences, audio with speed control, ⚡ "Der Die Das" speed drill, and 100% offline PWA support.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate('speed-drill')}
              className="flex items-center gap-2 px-6 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-2xl shadow-md shadow-amber-500/25 transition-all"
            >
              <Zap className="w-4 h-4" />
              <span>Play "Der, Die, Das" Drill</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate('listening')}
              className="flex items-center gap-2 px-5 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-2xl shadow-md shadow-indigo-600/25 transition-all"
            >
              <Headphones className="w-4 h-4" />
              <span>Listening Mode (Hörverstehen)</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate('explorer', 'ALL')}
              className="flex items-center gap-2 px-5 py-3.5 bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-700 text-white font-bold text-sm rounded-2xl border border-zinc-200/90 dark:border-zinc-700 shadow-xs transition-all"
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>Browse All Words</span>
            </motion.button>
          </div>
        </div>

        {/* Hero Background Glow */}
        <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-amber-500/10 dark:bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-32 -top-16 w-80 h-80 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      </motion.section>

      {/* Official Sources & Downloadable Sub-files Section */}
      <section className="space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-500 mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Official Curriculum & Downloads</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
            Original Goethe Sources & Modular Datasets
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Download individual CSV or JSON files with English & Turkish translations, or view the original Goethe-Institut PDF documents.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sources.map((src, idx) => (
            <motion.div
              key={src.level}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.08 }}
              className={`bg-white/95 dark:bg-zinc-900/95 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/90 shadow-[0_4px_24px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.06)] transition-all p-6 flex flex-col justify-between ${src.heroBorder}`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`px-2.5 py-0.5 rounded-lg text-xs font-black border ${src.badgeColor}`}>
                    CEFR {src.level}
                  </span>
                  <span className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 rounded-lg border border-zinc-200 dark:border-zinc-700">
                    {src.wordsCount.toLocaleString()} words
                  </span>
                </div>

                <h3 className="text-xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-1">
                  {src.title}
                </h3>
                
                <a
                  href={src.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-mono text-zinc-400 dark:text-zinc-500 hover:text-amber-600 dark:hover:text-amber-400 transition-colors mb-3"
                  title="View original official PDF"
                >
                  <span>{src.subtitle}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed mb-6">
                  {src.description}
                </p>
              </div>

              <div className="space-y-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  onClick={() => onNavigate('explorer', src.level)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
                >
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  <span>Browse {src.level} Vocabulary</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={src.csvFile}
                    download={`goethe_${src.level.toLowerCase()}_vocab.csv`}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 bg-zinc-100/90 dark:bg-zinc-800 hover:bg-zinc-200/70 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-semibold rounded-xl border border-zinc-200/80 dark:border-zinc-700 transition-all text-center"
                    title={`Download ${src.level} as CSV`}
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>{src.level} CSV (TR/EN)</span>
                  </a>

                  <a
                    href={src.jsonFile}
                    download={`goethe_${src.level.toLowerCase()}_vocab.json`}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 bg-zinc-100/90 dark:bg-zinc-800 hover:bg-zinc-200/70 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-semibold rounded-xl border border-zinc-200/80 dark:border-zinc-700 transition-all text-center"
                    title={`Download ${src.level} as JSON`}
                  >
                    <FileCode className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span>{src.level} JSON</span>
                  </a>
                </div>
              </div>

            </motion.div>
          ))}
        </div>

        {/* Master Consolidated Download Banner */}
        <div className="bg-gradient-to-r from-zinc-900 via-slate-900 to-zinc-950 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-950 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl border border-zinc-800">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/10 text-amber-400 text-xs font-bold mb-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Full Goethe Archive (A1 + A2 + B1)</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight">
              Download Complete Master Database with EN & TR
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
              All 5,791 words consolidated in a single CSV file with German headwords, articles, plural forms, verb conjugations, English translations, Turkish translations, and authentic example sentences.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href="./data/goethe_vocab_tr.csv"
              download="goethe_vocab_master.csv"
              className="flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-2xl shadow-lg shadow-emerald-600/20 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Master CSV (5,791 words)</span>
            </a>
            <a
              href="./data/goethe_vocab.json"
              download="goethe_vocab_master.json"
              className="flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-2xl border border-white/20 transition-all"
            >
              <FileCode className="w-4 h-4" />
              <span>Master JSON</span>
            </a>
          </div>
        </div>
      </section>

      {/* Platform Features Grid */}
      <section className="space-y-6">
        <div>
          <div className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
            Built-in Learning Tools
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
            Designed for Efficient German Learning
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="bg-white/95 dark:bg-zinc-900/95 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/90 p-5 shadow-[0_2px_14px_rgba(0,0,0,0.03)] dark:shadow-[0_2px_14px_rgba(0,0,0,0.2)] hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-3 border border-zinc-200/70 dark:border-zinc-700">
                {feat.icon}
              </div>
              <h4 className="text-sm font-bold text-zinc-900 dark:text-white mb-1">
                {feat.title}
              </h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                {feat.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

    </div>
  );
};
