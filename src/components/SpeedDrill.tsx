import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Flame, Timer, Trophy, RotateCcw, Volume2, ArrowRight, CheckCircle2, XCircle, BookOpen, PauseCircle, Layers, Target, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { VocabWord, CEFRLevel, SupportedLanguage } from '../types';
import { speechService } from '../services/speech';

interface SpeedDrillProps {
  words: VocabWord[];
  targetLang: SupportedLanguage;
}

interface MistakeItem {
  word: VocabWord;
  chosenArticle: string;
  correctArticle: string;
}

export const SpeedDrill: React.FC<SpeedDrillProps> = ({ words, targetLang }) => {
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel>('ALL');
  const [targetCount, setTargetCount] = useState<number>(25);

  // Filter only nouns with definite articles matching selected level
  const nouns = useMemo(() => {
    return words.filter(w => {
      const isNounWithArticle = w.article && (w.article === 'der' || w.article === 'die' || w.article === 'das');
      if (!isNounWithArticle) return false;
      if (selectedLevel !== 'ALL' && w.level !== selectedLevel) return false;
      return true;
    });
  }, [words, selectedLevel]);

  const [drillMode, setDrillMode] = useState<'timer' | 'practice'>('practice');
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [duration, setDuration] = useState<number>(60);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    try {
      const saved = localStorage.getItem('goethe_drill_highscore');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [drillDeck, setDrillDeck] = useState<VocabWord[]>([]);
  
  const [answerState, setAnswerState] = useState<{
    answered: boolean;
    isCorrect: boolean;
    chosenArticle: string | null;
  }>({
    answered: false,
    isCorrect: false,
    chosenArticle: null,
  });

  const [correctWords, setCorrectWords] = useState<VocabWord[]>([]);
  const [mistakes, setMistakes] = useState<MistakeItem[]>([]);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [reviewTab, setReviewTab] = useState<'all' | 'mistakes' | 'correct'>('all');

  const getWordMeaning = useCallback((w: VocabWord) => {
    if (targetLang === 'tr') return w.meaning_tr || w.meaning_en || '';
    if (targetLang === 'es') return w.meaning_es || w.meaning_en || '';
    return w.meaning_en || w.meaning_tr || '';
  }, [targetLang]);

  const startGame = useCallback((customPool?: VocabWord[], modeParam?: 'timer' | 'practice', customDuration?: number) => {
    const pool = customPool ?? nouns;
    const count = customPool ? customPool.length : Math.min(Math.max(1, targetCount), pool.length || 1);
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, count);
    
    setDrillDeck(shuffled);
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setTimeLeft(customDuration ?? duration);
    setCorrectWords([]);
    setMistakes([]);
    setIsTimerPaused(false);
    setAnswerState({ answered: false, isCorrect: false, chosenArticle: null });
    setReviewTab('all');
    setGameState('playing');
  }, [nouns, targetCount, duration]);

  // Timer countdown
  useEffect(() => {
    if (gameState !== 'playing' || drillMode !== 'timer' || isTimerPaused) return;

    if (timeLeft <= 0) {
      finishGame();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(t => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, drillMode, isTimerPaused, timeLeft]);

  const finishGame = useCallback(() => {
    setGameState('gameover');
    if (score > highScore) {
      setHighScore(score);
      try {
        localStorage.setItem('goethe_drill_highscore', score.toString());
      } catch {}
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 }
      });
    }
  }, [score, highScore]);

  const currentWord = drillDeck[currentIndex];

  const handleNextWord = useCallback(() => {
    if (currentIndex + 1 >= drillDeck.length) {
      finishGame();
      return;
    }
    setAnswerState({ answered: false, isCorrect: false, chosenArticle: null });
    setIsTimerPaused(false);
    setCurrentIndex(i => i + 1);
  }, [currentIndex, drillDeck.length, finishGame]);

  const handleAnswer = useCallback((selectedArticle: 'der' | 'die' | 'das') => {
    if (gameState !== 'playing' || !currentWord || answerState.answered) return;

    const isCorrect = selectedArticle === currentWord.article;

    setAnswerState({
      answered: true,
      isCorrect,
      chosenArticle: selectedArticle,
    });

    speechService.speak(`${currentWord.article} ${currentWord.word.replace(/^(der|die|das)\s+/, '')}`);

    if (isCorrect) {
      const multiplier = streak >= 10 ? 3 : streak >= 5 ? 2 : 1;
      const points = 10 * multiplier;
      setScore(s => s + points);
      setStreak(st => {
        const next = st + 1;
        setBestStreak(b => Math.max(b, next));
        return next;
      });
      setCorrectWords(prev => [...prev, currentWord]);

      if (drillMode === 'timer') {
        setTimeout(() => {
          handleNextWord();
        }, 650);
      }
    } else {
      setStreak(0);
      setMistakes(prev => [
        ...prev,
        { word: currentWord, chosenArticle: selectedArticle, correctArticle: currentWord.article! }
      ]);

      if (drillMode === 'timer') {
        setIsTimerPaused(true);
      }
    }
  }, [gameState, currentWord, answerState.answered, streak, drillMode, handleNextWord]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;

      if (answerState.answered) {
        if (e.code === 'Space' || e.code === 'Enter' || e.code === 'ArrowRight') {
          e.preventDefault();
          handleNextWord();
        }
        return;
      }

      if (e.key === '1' || e.key.toLowerCase() === 'd') {
        handleAnswer('der');
      } else if (e.key === '2' || e.key.toLowerCase() === 'i') {
        handleAnswer('die');
      } else if (e.key === '3' || e.key.toLowerCase() === 'a') {
        handleAnswer('das');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, answerState.answered, handleAnswer, handleNextWord]);

  // IDLE SCREEN: Target Count, Level, Mode Selection
  if (gameState === 'idle') {
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
              max={nouns.length || 1000}
              value={targetCount}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 1;
                setTargetCount(Math.min(Math.max(1, val), nouns.length || 1));
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
                onClick={() => setTargetCount(nouns.length || 100)}
                className={`py-2 rounded-xl text-xs font-bold transition-all ${
                  targetCount === nouns.length
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
              {nouns.length} Nouns Found
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
          onClick={() => startGame()}
          disabled={nouns.length === 0}
          className="w-full py-4 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-base rounded-2xl shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2"
        >
          <Zap className="w-5 h-5" />
          <span>Start Drill ({Math.min(targetCount, nouns.length)} Words)</span>
        </motion.button>
      </motion.div>
    );
  }

  // GAME OVER SCREEN with Full Correct vs Incorrect Results
  if (gameState === 'gameover') {
    const totalAnswered = correctWords.length + mistakes.length;
    const accuracy = totalAnswered > 0 ? Math.round((correctWords.length / totalAnswered) * 100) : 0;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl mx-auto bg-white/95 dark:bg-zinc-900/95 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 shadow-[0_12px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.5)] p-5 sm:p-8 text-center text-zinc-900 dark:text-white"
      >
        <div className="w-16 h-16 rounded-3xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-200 dark:border-amber-800">
          <Trophy className="w-8 h-8" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Drill Completed!</h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Here is your full performance breakdown:</p>

        {/* Score and Stats Grid */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 my-5">
          <div className="bg-zinc-50 dark:bg-zinc-800/70 p-3 sm:p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-700">
            <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">{accuracy}%</span>
            <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-zinc-400 mt-1">Accuracy</p>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-800/70 p-3 sm:p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-700">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">{correctWords.length}</span>
            <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-zinc-400 mt-1">Correct</p>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-800/70 p-3 sm:p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-700">
            <span className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400">{mistakes.length}</span>
            <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-zinc-400 mt-1">Missed</p>
          </div>
        </div>

        {/* Results Review Tabs (All, Missed, Correct) */}
        <div className="my-5 text-left border-t border-zinc-200 dark:border-zinc-800 pt-4">
          
          <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl mb-3 text-xs">
            <button
              onClick={() => setReviewTab('all')}
              className={`flex-1 py-1.5 rounded-lg font-bold transition-all text-center ${
                reviewTab === 'all'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-2xs'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              All Words ({totalAnswered})
            </button>
            <button
              onClick={() => setReviewTab('mistakes')}
              className={`flex-1 py-1.5 rounded-lg font-bold transition-all text-center ${
                reviewTab === 'mistakes'
                  ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-2xs'
                  : 'text-zinc-500 hover:text-rose-600'
              }`}
            >
              Missed ({mistakes.length})
            </button>
            <button
              onClick={() => setReviewTab('correct')}
              className={`flex-1 py-1.5 rounded-lg font-bold transition-all text-center ${
                reviewTab === 'correct'
                  ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                  : 'text-zinc-500 hover:text-emerald-600'
              }`}
            >
              Correct ({correctWords.length})
            </button>
          </div>

          {/* List Content */}
          <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
            
            {/* Show Mistakes */}
            {(reviewTab === 'all' || reviewTab === 'mistakes') && mistakes.map((m, idx) => (
              <div
                key={`m-${idx}`}
                className="bg-rose-50/50 dark:bg-rose-950/30 p-3 rounded-2xl border border-rose-200/70 dark:border-rose-900/60 flex items-center justify-between text-xs gap-2"
              >
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded font-mono font-black uppercase text-white bg-emerald-600">
                      {m.correctArticle}
                    </span>
                    <span className="font-bold text-zinc-900 dark:text-white text-sm">
                      {m.word.word.replace(/^(der|die|das)\s+/, '')}
                    </span>
                    <span className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold">
                      (You selected: <span className="line-through">{m.chosenArticle}</span>)
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Meaning: <strong className="text-zinc-700 dark:text-zinc-200">{getWordMeaning(m.word)}</strong>
                  </p>
                </div>

                <button
                  onClick={() => speechService.speak(`${m.correctArticle} ${m.word.word}`)}
                  className="p-2 rounded-xl bg-white dark:bg-zinc-800 hover:bg-zinc-100 text-zinc-600 dark:text-zinc-300 shadow-2xs shrink-0"
                  title="Pronounce"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            {/* Show Correct Words */}
            {(reviewTab === 'all' || reviewTab === 'correct') && correctWords.map((w, idx) => (
              <div
                key={`c-${idx}`}
                className="bg-emerald-50/50 dark:bg-emerald-950/30 p-3 rounded-2xl border border-emerald-200/70 dark:border-emerald-900/60 flex items-center justify-between text-xs gap-2"
              >
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded font-mono font-black uppercase text-white bg-emerald-600">
                      {w.article}
                    </span>
                    <span className="font-bold text-zinc-900 dark:text-white text-sm">
                      {w.word.replace(/^(der|die|das)\s+/, '')}
                    </span>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                      <Check className="w-3.5 h-3.5" /> Correct
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Meaning: <strong className="text-zinc-700 dark:text-zinc-200">{getWordMeaning(w)}</strong>
                  </p>
                </div>

                <button
                  onClick={() => speechService.speak(`${w.article} ${w.word}`)}
                  className="p-2 rounded-xl bg-white dark:bg-zinc-800 hover:bg-zinc-100 text-zinc-600 dark:text-zinc-300 shadow-2xs shrink-0"
                  title="Pronounce"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            {totalAnswered === 0 && (
              <p className="text-center py-6 text-zinc-400 text-xs">No words answered.</p>
            )}

          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 pt-2">
          {mistakes.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => startGame(mistakes.map(m => m.word))}
              className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Practice Missed Words ({mistakes.length})</span>
            </motion.button>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => startGame()}
              className="flex-1 w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Play Again ({targetCount} Words)</span>
            </motion.button>
            <button
              onClick={() => setGameState('idle')}
              className="w-full sm:w-auto px-5 py-3.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold rounded-2xl transition-all text-sm"
            >
              Change Settings
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // ACTIVE PLAYING SCREEN
  const bareNoun = currentWord.word.replace(/^(der|die|das)\s+/, '').split(',')[0].trim();
  const wordMeaning = getWordMeaning(currentWord);

  return (
    <div className="max-w-xl mx-auto space-y-4">
      
      {/* Top Bar: Timer/Mode, Streak & Score */}
      <div className="bg-white/95 dark:bg-zinc-900/95 border border-zinc-200/90 dark:border-zinc-800 rounded-3xl p-3 sm:p-4 shadow-xs">
        <div className="flex items-center justify-between gap-2">
          
          {/* Mode / Timer */}
          <div className="flex items-center gap-2 shrink-0">
            {drillMode === 'timer' ? (
              <>
                <div className={`p-2 rounded-xl ${
                  isTimerPaused
                    ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 animate-pulse'
                    : timeLeft <= 10
                    ? 'bg-rose-100 text-rose-600 animate-pulse'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                }`}>
                  {isTimerPaused ? <PauseCircle className="w-4 h-4 sm:w-5 sm:h-5" /> : <Timer className="w-4 h-4 sm:w-5 sm:h-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-lg sm:text-xl font-black text-zinc-900 dark:text-white">{timeLeft}s</span>
                    {isTimerPaused && (
                      <span className="text-[9px] font-bold px-1 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400">
                        Paused
                      </span>
                    )}
                  </div>
                  <p className="text-[9px] sm:text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    {isTimerPaused ? 'Review Time' : 'Time Left'}
                  </p>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                  <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">Practice Mode</span>
                  <p className="text-[9px] sm:text-[10px] text-zinc-400">Target: {drillDeck.length} words</p>
                </div>
              </div>
            )}
          </div>

          {/* Streak Multiplier */}
          <div className="flex items-center gap-1 px-2.5 sm:px-3 py-1 bg-rose-50/80 dark:bg-rose-950/50 rounded-2xl border border-rose-200/80 dark:border-rose-900">
            <Flame className={`w-4 h-4 ${streak >= 5 ? 'text-rose-500 fill-rose-500 animate-bounce' : 'text-zinc-400'}`} />
            <div>
              <span className="text-xs font-black text-rose-700 dark:text-rose-300">{streak} streak</span>
              {streak >= 5 && (
                <span className="ml-1 text-[9px] font-bold text-amber-600 dark:text-amber-400">
                  ({streak >= 10 ? '3x' : '2x'})
                </span>
              )}
            </div>
          </div>

          {/* Score & Counter */}
          <div className="text-right shrink-0">
            <span className="text-lg sm:text-2xl font-black text-amber-600 dark:text-amber-400">{score}</span>
            <p className="text-[9px] sm:text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              {currentIndex + 1} / {drillDeck.length}
            </p>
          </div>

        </div>
      </div>

      {/* Main Flash Drill Card */}
      <motion.div
        key={currentWord.id}
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`bg-white/95 dark:bg-zinc-900/95 rounded-3xl border-2 shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] p-5 sm:p-8 text-center text-zinc-900 dark:text-white transition-all duration-200 relative overflow-hidden ${
          answerState.answered && answerState.isCorrect
            ? 'border-emerald-500 bg-emerald-50/20'
            : answerState.answered && !answerState.isCorrect
            ? 'border-rose-500 bg-rose-50/20'
            : 'border-zinc-200/90 dark:border-zinc-800'
        }`}
      >
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
            {currentWord.level}
          </span>
          {currentWord.plural && (
            <span className="text-xs font-mono text-zinc-400">Plural: {currentWord.plural}</span>
          )}
        </div>

        {/* Noun Prompt */}
        <div className="py-4 sm:py-6">
          {answerState.answered ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl font-mono font-black text-lg uppercase shadow-xs mb-2 text-white bg-emerald-600"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>{currentWord.article}</span>
            </motion.div>
          ) : (
            <span className="text-base text-zinc-400 uppercase tracking-widest font-extrabold block mb-1">
              [ ? ]
            </span>
          )}

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight mt-1 mb-2 text-zinc-900 dark:text-white">
            {bareNoun}
          </h2>

          {wordMeaning && (
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium capitalize">
              {wordMeaning}
            </p>
          )}
        </div>

        {/* Feedback Banner if Answered */}
        <AnimatePresence>
          {answerState.answered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`p-3 rounded-2xl mb-4 border text-xs sm:text-sm font-bold flex items-center justify-between gap-2 ${
                answerState.isCorrect
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300'
                  : 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-300'
              }`}
            >
              <div className="flex items-center gap-2 text-left">
                {answerState.isCorrect ? (
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600 shrink-0" />
                )}
                <div>
                  <p>
                    {answerState.isCorrect
                      ? `Correct! Full word: "${currentWord.article} ${bareNoun}"`
                      : `Wrong: You picked "${answerState.chosenArticle}". Correct is: "${currentWord.article} ${bareNoun}"`}
                  </p>
                </div>
              </div>

              <button
                onClick={() => speechService.speak(`${currentWord.article} ${bareNoun}`)}
                className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 shrink-0 text-zinc-700 dark:text-zinc-200"
                title="Replay audio"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 3 Article Buttons */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-2">
          
          {/* DER */}
          {(() => {
            let btnBorder = 'border-sky-300 dark:border-sky-800';
            let btnBg = 'bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900/60 text-sky-800 dark:text-sky-200';
            if (answerState.answered) {
              if (currentWord.article === 'der') {
                btnBorder = 'border-emerald-500 ring-4 ring-emerald-500/20';
                btnBg = 'bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 font-black';
              } else if (answerState.chosenArticle === 'der') {
                btnBorder = 'border-rose-500';
                btnBg = 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-200 opacity-80';
              } else {
                btnBg = 'opacity-30 border-zinc-200 dark:border-zinc-800 text-zinc-400';
              }
            }

            return (
              <motion.button
                whileHover={!answerState.answered ? { scale: 1.03 } : {}}
                whileTap={!answerState.answered ? { scale: 0.95 } : {}}
                onClick={() => handleAnswer('der')}
                disabled={answerState.answered}
                className={`flex flex-col items-center justify-center py-3.5 sm:py-5 rounded-2xl border-2 font-black transition-all shadow-xs ${btnBorder} ${btnBg}`}
              >
                <span className="text-xl sm:text-3xl tracking-tight">der</span>
                <span className="text-[9px] sm:text-[10px] font-bold mt-1 uppercase font-mono">1 / D</span>
              </motion.button>
            );
          })()}

          {/* DIE */}
          {(() => {
            let btnBorder = 'border-rose-300 dark:border-rose-800';
            let btnBg = 'bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-800 dark:text-rose-200';
            if (answerState.answered) {
              if (currentWord.article === 'die') {
                btnBorder = 'border-emerald-500 ring-4 ring-emerald-500/20';
                btnBg = 'bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 font-black';
              } else if (answerState.chosenArticle === 'die') {
                btnBorder = 'border-rose-500';
                btnBg = 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-200 opacity-80';
              } else {
                btnBg = 'opacity-30 border-zinc-200 dark:border-zinc-800 text-zinc-400';
              }
            }

            return (
              <motion.button
                whileHover={!answerState.answered ? { scale: 1.03 } : {}}
                whileTap={!answerState.answered ? { scale: 0.95 } : {}}
                onClick={() => handleAnswer('die')}
                disabled={answerState.answered}
                className={`flex flex-col items-center justify-center py-3.5 sm:py-5 rounded-2xl border-2 font-black transition-all shadow-xs ${btnBorder} ${btnBg}`}
              >
                <span className="text-xl sm:text-3xl tracking-tight">die</span>
                <span className="text-[9px] sm:text-[10px] font-bold mt-1 uppercase font-mono">2 / I</span>
              </motion.button>
            );
          })()}

          {/* DAS */}
          {(() => {
            let btnBorder = 'border-emerald-300 dark:border-emerald-800';
            let btnBg = 'bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200';
            if (answerState.answered) {
              if (currentWord.article === 'das') {
                btnBorder = 'border-emerald-500 ring-4 ring-emerald-500/20';
                btnBg = 'bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 font-black';
              } else if (answerState.chosenArticle === 'das') {
                btnBorder = 'border-rose-500';
                btnBg = 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-200 opacity-80';
              } else {
                btnBg = 'opacity-30 border-zinc-200 dark:border-zinc-800 text-zinc-400';
              }
            }

            return (
              <motion.button
                whileHover={!answerState.answered ? { scale: 1.03 } : {}}
                whileTap={!answerState.answered ? { scale: 0.95 } : {}}
                onClick={() => handleAnswer('das')}
                disabled={answerState.answered}
                className={`flex flex-col items-center justify-center py-3.5 sm:py-5 rounded-2xl border-2 font-black transition-all shadow-xs ${btnBorder} ${btnBg}`}
              >
                <span className="text-xl sm:text-3xl tracking-tight">das</span>
                <span className="text-[9px] sm:text-[10px] font-bold mt-1 uppercase font-mono">3 / A</span>
              </motion.button>
            );
          })()}

        </div>

        {/* NEXT BUTTON */}
        {answerState.answered && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3"
          >
            <div className="text-xs text-zinc-400 text-left hidden sm:block">
              Press <kbd className="px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-800 rounded font-mono text-zinc-700 dark:text-zinc-300">Space</kbd> or <kbd className="px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-800 rounded font-mono text-zinc-700 dark:text-zinc-300">Enter</kbd> to proceed
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleNextWord}
              className="w-full sm:w-auto px-7 py-3.5 bg-zinc-900 dark:bg-amber-500 hover:bg-zinc-800 dark:hover:bg-amber-600 text-white dark:text-zinc-950 font-black rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-sm ml-auto"
            >
              <span>{currentIndex + 1 >= drillDeck.length ? 'View Final Results 🏆' : 'Next Word (Advance) →'}</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        )}

      </motion.div>

    </div>
  );
};
