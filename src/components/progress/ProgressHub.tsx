import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Star, Award, Layers, Sparkles, Download, ArrowRight, BookOpen, Volume2, Search, Printer, FileText } from 'lucide-react';
import { VocabWord, SupportedLanguage, CEFRLevel, AppView } from '../../types';
import { VocabCard } from '../dictionary/VocabCard';

interface ProgressHubProps {
  allWords: VocabWord[];
  favorites: string[];
  learnedCards: string[];
  onToggleFavorite: (id: string) => void;
  targetLang: SupportedLanguage;
  onNavigateToPractice: (mode: AppView) => void;
  onNavigateToDictionary: (level?: CEFRLevel) => void;
  onOpenExportStudio?: (pool?: 'favorites') => void;
}

export const ProgressHub: React.FC<ProgressHubProps> = ({
  allWords,
  favorites,
  learnedCards,
  onToggleFavorite,
  targetLang,
  onNavigateToPractice,
  onNavigateToDictionary,
  onOpenExportStudio,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const favoriteWords = useMemo(() => {
    return allWords.filter(w => favorites.includes(w.id));
  }, [allWords, favorites]);

  const filteredFavorites = useMemo(() => {
    if (!searchQuery.trim()) return favoriteWords;
    const q = searchQuery.toLowerCase().trim();
    return favoriteWords.filter(w => {
      const matchWord = w.word.toLowerCase().includes(q);
      const matchEn = w.meaning_en?.toLowerCase().includes(q);
      const matchTr = w.meaning_tr?.toLowerCase().includes(q);
      return matchWord || matchEn || matchTr;
    });
  }, [favoriteWords, searchQuery]);

  // Level statistics
  const stats = useMemo(() => {
    const a1Total = allWords.filter(w => w.level === 'A1').length || 1;
    const a2Total = allWords.filter(w => w.level === 'A2').length || 1;
    const b1Total = allWords.filter(w => w.level === 'B1').length || 1;

    const learnedSet = new Set(learnedCards);
    const a1Learned = allWords.filter(w => w.level === 'A1' && learnedSet.has(w.id)).length;
    const a2Learned = allWords.filter(w => w.level === 'A2' && learnedSet.has(w.id)).length;
    const b1Learned = allWords.filter(w => w.level === 'B1' && learnedSet.has(w.id)).length;

    return {
      a1: { total: a1Total, learned: a1Learned, pct: Math.round((a1Learned / a1Total) * 100) },
      a2: { total: a2Total, learned: a2Learned, pct: Math.round((a2Learned / a2Total) * 100) },
      b1: { total: b1Total, learned: b1Learned, pct: Math.round((b1Learned / b1Total) * 100) },
      totalLearned: learnedCards.length,
      totalWords: allWords.length,
      totalFavorites: favorites.length,
    };
  }, [allWords, learnedCards, favorites]);

  const handleExportFavoritesAnki = () => {
    if (favoriteWords.length === 0) return;
    const rows = favoriteWords.map(w => {
      const front = `${w.article ? w.article + ' ' : ''}${w.word}${w.plural ? ' (' + w.plural + ')' : ''}`;
      const back = `${w.meaning_tr || w.meaning_en || ''}<br><small>${w.examples?.[0] || ''}</small>`;
      return `${front}\t${back}`;
    });
    const tsvContent = '\uFEFF' + rows.join('\r\n');
    const blob = new Blob([tsvContent], { type: 'text/tab-separated-values;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `goethe_favorites_anki.tsv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
              <Award className="w-3.5 h-3.5" />
              <span>Learning Progress & Saved Words</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
              Progress & Saved Vocabulary
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-xl">
              Track your vocabulary mastery, manage starred words, and launch study sessions with your personal word list.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/70 rounded-2xl border border-zinc-200/80 dark:border-zinc-700 text-center">
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
                {stats.totalFavorites}
              </div>
              <div className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">
                Saved Words
              </div>
            </div>
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/70 rounded-2xl border border-zinc-200/80 dark:border-zinc-700 text-center">
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {stats.totalLearned}
              </div>
              <div className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">
                Learned Cards
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* CEFR Level Mastery Progress */}
      <section className="space-y-4">
        <h2 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight">
          Goethe Level Completion
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* A1 */}
          <div className="bg-white/95 dark:bg-zinc-900/95 rounded-3xl border border-zinc-200/90 dark:border-zinc-800/90 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                A1 Beginner
              </span>
              <span className="text-xs font-mono font-bold text-zinc-500">
                {stats.a1.learned} / {stats.a1.total}
              </span>
            </div>
            <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.max(stats.a1.pct, 3)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-zinc-500">
              <span>{stats.a1.pct}% Completed</span>
              <button
                onClick={() => onNavigateToDictionary('A1')}
                className="text-amber-600 dark:text-amber-400 font-bold hover:underline"
              >
                Browse A1 Words →
              </button>
            </div>
          </div>

          {/* A2 */}
          <div className="bg-white/95 dark:bg-zinc-900/95 rounded-3xl border border-zinc-200/90 dark:border-zinc-800/90 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                A2 Elementary
              </span>
              <span className="text-xs font-mono font-bold text-zinc-500">
                {stats.a2.learned} / {stats.a2.total}
              </span>
            </div>
            <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-sky-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.max(stats.a2.pct, 3)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-zinc-500">
              <span>{stats.a2.pct}% Completed</span>
              <button
                onClick={() => onNavigateToDictionary('A2')}
                className="text-amber-600 dark:text-amber-400 font-bold hover:underline"
              >
                Browse A2 Words →
              </button>
            </div>
          </div>

          {/* B1 */}
          <div className="bg-white/95 dark:bg-zinc-900/95 rounded-3xl border border-zinc-200/90 dark:border-zinc-800/90 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                B1 Intermediate
              </span>
              <span className="text-xs font-mono font-bold text-zinc-500">
                {stats.b1.learned} / {stats.b1.total}
              </span>
            </div>
            <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.max(stats.b1.pct, 3)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-zinc-500">
              <span>{stats.b1.pct}% Completed</span>
              <button
                onClick={() => onNavigateToDictionary('B1')}
                className="text-amber-600 dark:text-amber-400 font-bold hover:underline"
              >
                Browse B1 Words →
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* Saved Words Section */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              <span>Starred Words ({favoriteWords.length})</span>
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Words starred in the dictionary are saved here for focused review.
            </p>
          </div>

          {favoriteWords.length > 0 && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => onNavigateToPractice('flashcards')}
                className="flex-1 sm:flex-initial px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Study with Cards</span>
              </button>
              {onOpenExportStudio && (
                <button
                  onClick={() => onOpenExportStudio('favorites')}
                  title="Print cuttable cards or export to Notion / Apple Notes"
                  className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 shadow-amber-500/20"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Export Notes</span>
                </button>
              )}
              <button
                onClick={handleExportFavoritesAnki}
                title="Download as Anki deck (.tsv)"
                className="px-3 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold text-xs rounded-xl border border-zinc-200/80 dark:border-zinc-700 transition-all flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Anki (.tsv)</span>
              </button>
            </div>
          )}
        </div>

        {/* Search inside favorites */}
        {favoriteWords.length > 0 && (
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search inside saved words..."
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-2xl text-xs sm:text-sm text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
        )}

        {/* Favorite Cards Grid */}
        {favoriteWords.length === 0 ? (
          <div className="text-center py-16 bg-white/95 dark:bg-zinc-900/95 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 shadow-xs max-w-lg mx-auto p-6">
            <Star className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">
              No saved words yet
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 mb-4">
              Click the star icon on any vocabulary card while browsing or practicing to save words here.
            </p>
            <button
              onClick={() => onNavigateToDictionary('ALL')}
              className="px-5 py-2.5 bg-zinc-900 dark:bg-zinc-800 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 dark:hover:bg-zinc-700 transition-all shadow-xs"
            >
              Go to Dictionary
            </button>
          </div>
        ) : filteredFavorites.length === 0 ? (
          <div className="text-center py-12 bg-white/95 dark:bg-zinc-900/95 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 p-6">
            <p className="text-xs text-zinc-500">No saved words match your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredFavorites.map((word, idx) => (
              <VocabCard
                key={word.id}
                word={word}
                targetLang={targetLang}
                isFavorite={true}
                onToggleFavorite={onToggleFavorite}
                index={idx}
              />
            ))}
          </div>
        )}
      </section>

    </div>
  );
};
