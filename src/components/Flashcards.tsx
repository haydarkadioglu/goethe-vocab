import React, { useState, useEffect } from 'react';
import { Volume2, RotateCw, ArrowLeft, ArrowRight, CheckCircle2, Star, Shuffle, SlidersHorizontal, Settings2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { VocabWord, SupportedLanguage } from '../types';
import { speechService } from '../services/speech';
import { translateText } from '../services/translator';
import { localDb } from '../services/storage';

interface FlashcardsProps {
  words: VocabWord[];
  targetLang: SupportedLanguage;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}

export const Flashcards: React.FC<FlashcardsProps> = ({
  words,
  targetLang,
  favorites,
  onToggleFavorite
}) => {
  // Configurable session word count
  const [sessionCount, setSessionCount] = useState<number>(() => {
    return Math.min(20, words.length || 20);
  });
  const [deck, setDeck] = useState<VocabWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [learnedIds, setLearnedIds] = useState<Set<string>>(new Set());
  const [translation, setTranslation] = useState<string>('');
  const [loadingTrans, setLoadingTrans] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [showConfig, setShowConfig] = useState(false);
  const [filterFavoritesOnly, setFilterFavoritesOnly] = useState(false);

  // Load learned cards from IndexedDB on mount
  useEffect(() => {
    localDb.getLearnedCards().then(ids => {
      setLearnedIds(new Set(ids));
    });
  }, []);

  // Build deck whenever words, sessionCount, or filterFavoritesOnly change
  useEffect(() => {
    let pool = words;
    if (filterFavoritesOnly) {
      pool = words.filter(w => favorites.includes(w.id));
    }
    const count = Math.min(Math.max(1, sessionCount), pool.length || 1);
    const sliced = pool.slice(0, count);
    setDeck(sliced);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [words, sessionCount, filterFavoritesOnly, favorites]);

  const currentWord = deck[currentIndex];

  useEffect(() => {
    if (!currentWord) return;
    if (targetLang === 'en' && currentWord.meaning_en) {
      setTranslation(currentWord.meaning_en);
      setLoadingTrans(false);
      return;
    }
    let isMounted = true;
    setLoadingTrans(true);
    translateText(currentWord.word, targetLang).then((res) => {
      if (isMounted) {
        setTranslation(res);
        setLoadingTrans(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [currentWord, targetLang]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input
      if ((e.target as HTMLElement).tagName === 'INPUT') return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped(prev => !prev);
      } else if (e.code === 'ArrowRight') {
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        handlePrev();
      } else if (e.code === 'KeyA') {
        if (currentWord) speechService.speak(currentWord.word);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, deck, currentWord]);

  const handleNext = () => {
    setDirection(1);
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1 < deck.length ? prev + 1 : 0));
  };

  const handlePrev = () => {
    setDirection(-1);
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 >= 0 ? prev - 1 : deck.length - 1));
  };

  const handleShuffle = () => {
    let pool = words;
    if (filterFavoritesOnly) {
      pool = words.filter(w => favorites.includes(w.id));
    }
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, sessionCount);
    setDeck(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const toggleLearned = (id: string) => {
    setLearnedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      // Persist to IndexedDB
      localDb.saveLearnedCards(Array.from(next));
      return next;
    });
  };

  const maxAvailable = filterFavoritesOnly 
    ? words.filter(w => favorites.includes(w.id)).length 
    : words.length;

  if (deck.length === 0) {
    return (
      <div className="text-center py-20 bg-white/90 dark:bg-zinc-900/90 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 shadow-xs max-w-xl mx-auto p-8">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
          {filterFavoritesOnly ? 'No saved words to practice' : 'No words match current filters'}
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          {filterFavoritesOnly ? 'Star some words in the dictionary first!' : 'Try selecting "All Levels" or reset search.'}
        </p>
        {filterFavoritesOnly && (
          <button
            onClick={() => setFilterFavoritesOnly(false)}
            className="mt-4 px-4 py-2 bg-zinc-900 dark:bg-zinc-800 text-white rounded-xl text-xs font-semibold"
          >
            Switch to All Words
          </button>
        )}
      </div>
    );
  }

  const isLearned = currentWord ? learnedIds.has(currentWord.id) : false;
  const isFav = currentWord ? favorites.includes(currentWord.id) : false;

  return (
    <div className="max-w-2xl mx-auto flex flex-col items-center">
      
      {/* Session Size & Deck Options Bar */}
      <div className="w-full bg-white/95 dark:bg-zinc-900/95 border border-zinc-200/90 dark:border-zinc-800 rounded-3xl p-4 mb-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-200/70 dark:bg-zinc-800 px-3 py-1 rounded-xl border border-zinc-300/60 dark:border-zinc-700">
              Card {currentIndex + 1} of {deck.length}
            </span>
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50/90 dark:bg-emerald-950/60 px-2.5 py-1 rounded-xl border border-emerald-200/80 dark:border-emerald-800">
              Learned: {learnedIds.size}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Word Count Selector Input */}
            <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-xl border border-zinc-200 dark:border-zinc-700">
              <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">Words:</span>
              <input
                type="number"
                min={1}
                max={maxAvailable || 1000}
                value={sessionCount}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  setSessionCount(Math.min(Math.max(1, val), maxAvailable || 1));
                }}
                className="w-14 bg-white dark:bg-zinc-900 text-xs font-black text-zinc-900 dark:text-white px-2 py-0.5 rounded-lg border border-zinc-300 dark:border-zinc-600 text-center focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <span className="text-[10px] text-zinc-400">/ {maxAvailable}</span>
            </div>

            {/* Quick Count Preset Pills */}
            <div className="hidden sm:flex items-center gap-1">
              {[10, 25, 50].map((n) => (
                <button
                  key={n}
                  onClick={() => setSessionCount(Math.min(n, maxAvailable))}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                    sessionCount === n
                      ? 'bg-zinc-900 dark:bg-zinc-700 text-white'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setSessionCount(maxAvailable)}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                  sessionCount === maxAvailable
                    ? 'bg-zinc-900 dark:bg-zinc-700 text-white'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
                }`}
              >
                All
              </button>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleShuffle}
              title="Shuffle deck"
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all shadow-2xs"
            >
              <Shuffle className="w-3 h-3 text-amber-600" />
              <span>Shuffle</span>
            </motion.button>
          </div>

        </div>
      </div>

      {/* Animated Progress Bar */}
      <div className="w-full h-1.5 bg-zinc-200/80 dark:bg-zinc-800 rounded-full mb-6 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-amber-500 to-indigo-600"
          animate={{ width: `${((currentIndex + 1) / deck.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* 3D Card Animation Container with Slide Transition */}
      <div className="w-full h-[390px] sm:h-[430px] perspective-1000 select-none">
        <AnimatePresence mode="wait" initial={false}>
          {currentWord && (
            <motion.div
              key={currentWord.id}
              initial={{ opacity: 0, x: direction * 40, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -direction * 40, scale: 0.98 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              onClick={() => setIsFlipped(!isFlipped)}
              className="w-full h-full cursor-pointer"
            >
              <div
                className={`relative w-full h-full transition-transform duration-500 transform-style-3d rounded-3xl border border-zinc-200/90 dark:border-zinc-800 shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] ${
                  isFlipped ? 'rotate-y-180' : ''
                }`}
              >
                {/* FRONT SIDE */}
                <div className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-white via-zinc-50/50 to-amber-50/20 dark:from-zinc-900 dark:via-zinc-900/90 dark:to-zinc-950 rounded-3xl p-8 flex flex-col justify-between border-2 border-transparent hover:border-amber-200/80 dark:hover:border-zinc-700 transition-colors">
                  
                  {/* Front Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700">
                        {currentWord.level}
                      </span>
                      {currentWord.article && (
                        <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-extrabold uppercase bg-zinc-800 dark:bg-zinc-700 text-white">
                          {currentWord.article}
                        </span>
                      )}
                      {currentWord.pos && (
                        <span className="text-xs text-zinc-400 capitalize">{currentWord.pos}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <motion.button
                        whileTap={{ scale: 0.8 }}
                        onClick={() => onToggleFavorite(currentWord.id)}
                        className="p-2 rounded-xl text-zinc-400 hover:text-amber-500 hover:bg-zinc-100/80 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <Star className={`w-5 h-5 ${isFav ? 'text-amber-500 fill-amber-500' : ''}`} />
                      </motion.button>
                    </div>
                  </div>

                  {/* Front Center: Word & Pronounce */}
                  <div className="text-center my-auto">
                    <h2 className="text-4xl sm:text-5xl font-black text-zinc-900 dark:text-white tracking-tight mb-3">
                      {currentWord.word}
                    </h2>
                    {currentWord.plural && (
                      <p className="text-sm font-mono text-zinc-500 dark:text-zinc-400">
                        Plural: <strong className="text-zinc-800 dark:text-zinc-200">{currentWord.plural}</strong>
                      </p>
                    )}
                    {currentWord.forms && (
                      <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 italic mt-1">
                        ({currentWord.forms})
                      </p>
                    )}

                    <div className="mt-6 flex justify-center" onClick={(e) => e.stopPropagation()}>
                      <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => speechService.speak(currentWord.word)}
                        title="Listen (Shortcut: A)"
                        className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-md shadow-amber-500/25 transition-all"
                      >
                        <Volume2 className="w-4 h-4" />
                        <span>Pronounce</span>
                      </motion.button>
                    </div>
                  </div>

                  {/* Front Footer */}
                  <div className="flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-500 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    <span>Press <kbd className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded border border-zinc-300 dark:border-zinc-700 font-mono text-zinc-700 dark:text-zinc-300">Space</kbd> to flip</span>
                    <span className="flex items-center gap-1 text-amber-600 dark:text-amber-500 font-semibold">
                      <RotateCw className="w-3.5 h-3.5" /> Tap to reveal meaning
                    </span>
                  </div>
                </div>

                {/* BACK SIDE */}
                <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-zinc-900 via-slate-900 to-zinc-950 text-white rounded-3xl p-8 flex flex-col justify-between border-2 border-zinc-700/50 shadow-2xl">
                  
                  {/* Back Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-white/10 text-zinc-300 border border-white/10">
                        {currentWord.level}
                      </span>
                      <span className="text-xs text-zinc-400">Meaning ({targetLang.toUpperCase()})</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        speechService.speak(currentWord.word);
                      }}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-white"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Back Center: Translation & Example */}
                  <div className="my-auto overflow-y-auto max-h-[220px] pr-1">
                    <div className="text-center mb-4">
                      <h3 className="text-3xl sm:text-4xl font-extrabold text-amber-300 tracking-tight">
                        {loadingTrans ? 'Translating...' : translation || currentWord.word}
                      </h3>
                    </div>

                    {currentWord.examples && currentWord.examples.length > 0 && (
                      <div className="bg-white/10 rounded-2xl p-4 border border-white/10 backdrop-blur-xs text-left">
                        <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider mb-1 flex items-center justify-between">
                          <span>Authentic Example:</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              speechService.speak(currentWord.examples[0]);
                            }}
                            className="text-zinc-300 hover:text-white"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </p>
                        <p className="text-sm text-zinc-100 font-medium leading-relaxed">
                          {currentWord.examples[0]}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Back Footer */}
                  <div className="flex items-center justify-between text-xs text-zinc-400 pt-2 border-t border-white/10">
                    <span>Goethe PDF Page {currentWord.page}</span>
                    <span className="text-zinc-300">Space to flip back</span>
                  </div>

                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      <div className="w-full flex items-center justify-between gap-3 mt-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handlePrev}
          className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-sm rounded-2xl border border-zinc-200/90 dark:border-zinc-800 shadow-xs transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </motion.button>

        {currentWord && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => toggleLearned(currentWord.id)}
            className={`flex items-center gap-2 px-6 py-2.5 font-bold text-sm rounded-2xl shadow-xs transition-all ${
              isLearned
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                : 'bg-white dark:bg-zinc-900 hover:bg-emerald-50 dark:hover:bg-zinc-800 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-zinc-800'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isLearned ? 'Learned ✓' : 'Mark Learned'}</span>
          </motion.button>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleNext}
          className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-700 text-white font-semibold text-sm rounded-2xl shadow-xs transition-all"
        >
          <span>Next</span>
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Keyboard Shortcuts Hint */}
      <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-4 text-center">
        Shortcuts: <kbd className="px-1.5 py-0.5 bg-zinc-200/70 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-700 dark:text-zinc-300 font-mono">Space</kbd> Flip • <kbd className="px-1.5 py-0.5 bg-zinc-200/70 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-700 dark:text-zinc-300 font-mono">← / →</kbd> Next/Prev • <kbd className="px-1.5 py-0.5 bg-zinc-200/70 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-700 dark:text-zinc-300 font-mono">A</kbd> Audio
      </p>

    </div>
  );
};
