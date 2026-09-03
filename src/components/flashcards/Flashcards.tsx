import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Shuffle, BookmarkCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { VocabWord, SupportedLanguage } from '../../types';
import { speechService } from '../../services/speech';
import { translateText } from '../../services/translator';
import { localDb } from '../../services/storage';
import { FlashcardCard } from './FlashcardCard';
import { FlashcardsResults } from './FlashcardsResults';

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
  const [deckFilter, setDeckFilter] = useState<'all' | 'unlearned' | 'favorites'>('all');
  const [sessionCount, setSessionCount] = useState<number>(25);
  const [deck, setDeck] = useState<VocabWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [learnedIds, setLearnedIds] = useState<Set<string>>(new Set());
  
  const [sessionLearnedIds, setSessionLearnedIds] = useState<Set<string>>(new Set());
  const [isSessionFinished, setIsSessionFinished] = useState(false);

  const [translation, setTranslation] = useState<string>('');
  const [loadingTrans, setLoadingTrans] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);

  useEffect(() => {
    localDb.getLearnedCards().then(ids => {
      setLearnedIds(new Set(ids));
    });
  }, []);

  const filteredPool = useMemo(() => {
    if (deckFilter === 'favorites') {
      return words.filter(w => favorites.includes(w.id));
    }
    if (deckFilter === 'unlearned') {
      return words.filter(w => !learnedIds.has(w.id));
    }
    return words;
  }, [words, deckFilter, favorites, learnedIds]);

  const startSession = useCallback((customPool?: VocabWord[]) => {
    const pool = customPool ?? filteredPool;
    const count = customPool ? customPool.length : Math.min(Math.max(1, sessionCount), pool.length || 1);
    const sliced = pool.slice(0, count);
    setDeck(sliced);
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionLearnedIds(new Set());
    setIsSessionFinished(false);
  }, [filteredPool, sessionCount]);

  useEffect(() => {
    startSession();
  }, [startSession]);

  const currentWord = deck[currentIndex];

  useEffect(() => {
    if (!currentWord) return;
    if (targetLang === 'en' && currentWord.meaning_en) {
      setTranslation(currentWord.meaning_en);
      setLoadingTrans(false);
      return;
    }
    if (targetLang === 'tr' && currentWord.meaning_tr) {
      setTranslation(currentWord.meaning_tr);
      setLoadingTrans(false);
      return;
    }
    if (targetLang === 'es' && currentWord.meaning_es) {
      setTranslation(currentWord.meaning_es);
      setLoadingTrans(false);
      return;
    }
    if (targetLang === 'ar' && currentWord.meaning_ar) {
      setTranslation(currentWord.meaning_ar);
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

  const finishSession = useCallback(() => {
    setIsSessionFinished(true);
    confetti({ particleCount: 130, spread: 90, origin: { y: 0.6 } });
  }, []);

  const handleNext = useCallback(() => {
    if (currentIndex + 1 < deck.length) {
      setDirection(1);
      setIsFlipped(false);
      setCurrentIndex(prev => prev + 1);
    } else {
      finishSession();
    }
  }, [currentIndex, deck.length, finishSession]);

  const handlePrev = useCallback(() => {
    setDirection(-1);
    setIsFlipped(false);
    setCurrentIndex(prev => (prev - 1 >= 0 ? prev - 1 : deck.length - 1));
  }, [deck.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      if (isSessionFinished) return;

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
  }, [currentIndex, deck, currentWord, isSessionFinished, handleNext, handlePrev]);

  const handleShuffle = () => {
    const shuffled = [...filteredPool].sort(() => Math.random() - 0.5).slice(0, sessionCount);
    setDeck(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionLearnedIds(new Set());
    setIsSessionFinished(false);
  };

  const toggleLearned = (id: string) => {
    setLearnedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localDb.saveLearnedCards(Array.from(next));
      return next;
    });

    setSessionLearnedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (isSessionFinished) {
    const masteredInSession = deck.filter(w => sessionLearnedIds.has(w.id) || learnedIds.has(w.id));
    const unlearnedInSession = deck.filter(w => !masteredInSession.some(m => m.id === w.id));

    return (
      <FlashcardsResults
        deck={deck}
        masteredInSession={masteredInSession}
        unlearnedInSession={unlearnedInSession}
        sessionCount={sessionCount}
        targetLang={targetLang}
        onReviewUnlearned={() => startSession(unlearnedInSession)}
        onStartNewSession={() => startSession()}
      />
    );
  }

  if (deck.length === 0) {
    return (
      <div className="text-center py-16 sm:py-20 bg-white/90 dark:bg-zinc-900/90 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 shadow-xs max-w-xl mx-auto p-6 sm:p-8">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
          {deckFilter === 'favorites'
            ? 'No saved words found'
            : deckFilter === 'unlearned'
            ? 'Congratulations! You have mastered all words in this filter!'
            : 'No words match current filter'}
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          {deckFilter === 'favorites'
            ? 'Star words in the Dictionary to review them here.'
            : 'Switch to "All" to review completed cards.'}
        </p>
        <button
          onClick={() => setDeckFilter('all')}
          className="mt-4 px-5 py-2.5 bg-zinc-900 dark:bg-zinc-800 text-white rounded-xl text-xs font-semibold"
        >
          Show All Words
        </button>
      </div>
    );
  }

  const isLearned = currentWord ? learnedIds.has(currentWord.id) : false;
  const isFav = currentWord ? favorites.includes(currentWord.id) : false;

  return (
    <div className="max-w-2xl mx-auto flex flex-col items-center">
      
      {/* Session Filter Bar & Count */}
      <div className="w-full bg-white/95 dark:bg-zinc-900/95 border border-zinc-200/90 dark:border-zinc-800 rounded-3xl p-3 sm:p-4 mb-4 shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
          
          {/* 3-way filter pill */}
          <div className="grid grid-cols-3 sm:flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-2xl border border-zinc-200 dark:border-zinc-700 text-xs">
            {(['all', 'unlearned', 'favorites'] as const).map(f => (
              <button
                key={f}
                onClick={() => setDeckFilter(f)}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl font-bold transition-all text-center ${
                  deckFilter === f
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-2xs'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                {f === 'all' && `All (${words.length})`}
                {f === 'unlearned' && `Unlearned (${words.filter(w => !learnedIds.has(w.id)).length})`}
                {f === 'favorites' && `Saved (${words.filter(w => favorites.includes(w.id)).length})`}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2">
            <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-xl border border-zinc-200 dark:border-zinc-700">
              <span className="text-[11px] font-semibold text-zinc-500">Deck:</span>
              <input
                type="number"
                min={1}
                max={filteredPool.length || 1000}
                value={sessionCount}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  setSessionCount(Math.min(Math.max(1, val), filteredPool.length || 1));
                }}
                className="w-12 bg-white dark:bg-zinc-900 text-xs font-black text-zinc-900 dark:text-white px-2 py-0.5 rounded-lg border border-zinc-300 dark:border-zinc-600 text-center focus:outline-none"
              />
              
              <div className="hidden sm:flex items-center gap-1">
                {[10, 25, 50].map(n => (
                  <button
                    key={n}
                    onClick={() => setSessionCount(n)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      sessionCount === n ? 'bg-amber-500 text-white' : 'text-zinc-500 hover:text-zinc-800'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
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

      {/* Counter & Progress Bar */}
      <div className="w-full flex items-center justify-between mb-2 px-1 text-xs">
        <span className="font-bold text-zinc-600 dark:text-zinc-300">
          Card {currentIndex + 1} of {deck.length}
        </span>
        <button
          onClick={finishSession}
          className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
        >
          <BookmarkCheck className="w-3.5 h-3.5" />
          <span>Finish Session & View Results</span>
        </button>
      </div>

      <div className="w-full h-1.5 bg-zinc-200/80 dark:bg-zinc-800 rounded-full mb-5 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-amber-500 to-indigo-600"
          animate={{ width: `${((currentIndex + 1) / deck.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* 3D Card */}
      <AnimatePresence mode="wait" initial={false}>
        {currentWord && (
          <FlashcardCard
            key={currentWord.id}
            currentWord={currentWord}
            isFlipped={isFlipped}
            direction={direction}
            isFav={isFav}
            targetLang={targetLang}
            translation={translation}
            loadingTrans={loadingTrans}
            onFlip={() => setIsFlipped(!isFlipped)}
            onToggleFav={() => onToggleFavorite(currentWord.id)}
          />
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="w-full flex items-center justify-between gap-2.5 sm:gap-3 mt-5">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handlePrev}
          className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2.5 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-xs sm:text-sm rounded-2xl border border-zinc-200/90 dark:border-zinc-800 shadow-xs transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </motion.button>

        {currentWord && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => toggleLearned(currentWord.id)}
            className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 font-bold text-xs sm:text-sm rounded-2xl shadow-xs transition-all ${
              isLearned
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                : 'bg-white dark:bg-zinc-900 hover:bg-emerald-50 dark:hover:bg-zinc-800 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-zinc-800'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isLearned ? 'Learned ✓' : 'Mark as Learned'}</span>
          </motion.button>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleNext}
          className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2.5 bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-700 text-white font-semibold text-xs sm:text-sm rounded-2xl shadow-xs transition-all"
        >
          <span>{currentIndex + 1 >= deck.length ? 'Finish Session 🏆' : 'Next'}</span>
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Keyboard Shortcuts Hint */}
      <p className="text-[10px] sm:text-[11px] text-zinc-400 dark:text-zinc-500 mt-3 sm:mt-4 text-center">
        Shortcuts: <kbd className="px-1.5 py-0.5 bg-zinc-200/70 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-700 dark:text-zinc-300 font-mono">Space</kbd> Flip • <kbd className="px-1.5 py-0.5 bg-zinc-200/70 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-700 dark:text-zinc-300 font-mono">← / →</kbd> Next/Prev • <kbd className="px-1.5 py-0.5 bg-zinc-200/70 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-700 dark:text-zinc-300 font-mono">A</kbd> Audio
      </p>

    </div>
  );
};
