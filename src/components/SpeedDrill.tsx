import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Flame, Timer, Trophy, RotateCcw, Volume2, Sparkles, CheckCircle2, XCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { VocabWord } from '../types';
import { speechService } from '../services/speech';

interface SpeedDrillProps {
  words: VocabWord[];
}

export const SpeedDrill: React.FC<SpeedDrillProps> = ({ words }) => {
  // Filter only nouns with definite articles
  const nouns = React.useMemo(() => {
    return words.filter(w => w.article && (w.article === 'der' || w.article === 'die' || w.article === 'das'));
  }, [words]);

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
  const [shuffledNouns, setShuffledNouns] = useState<VocabWord[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const startGame = useCallback((customDuration?: number) => {
    const d = customDuration ?? duration;
    const shuffled = [...nouns].sort(() => Math.random() - 0.5);
    setShuffledNouns(shuffled);
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setTimeLeft(d);
    setFeedback(null);
    setGameState('playing');
  }, [nouns, duration]);

  // Timer countdown
  useEffect(() => {
    if (gameState !== 'playing') return;
    if (timeLeft <= 0) {
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
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(t => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, timeLeft, score, highScore]);

  const currentWord = shuffledNouns[currentIndex];

  const handleAnswer = useCallback((selectedArticle: 'der' | 'die' | 'das') => {
    if (gameState !== 'playing' || !currentWord) return;

    const isCorrect = selectedArticle === currentWord.article;

    if (isCorrect) {
      setFeedback('correct');
      const multiplier = streak >= 10 ? 3 : streak >= 5 ? 2 : 1;
      const points = 10 * multiplier;
      setScore(s => s + points);
      setStreak(st => {
        const next = st + 1;
        setBestStreak(b => Math.max(b, next));
        return next;
      });
      speechService.speak(`${currentWord.article} ${currentWord.word.replace(/^(der|die|das)\s+/, '')}`);
    } else {
      setFeedback('wrong');
      setStreak(0);
    }

    // Advance to next word
    setTimeout(() => {
      setFeedback(null);
      setCurrentIndex(i => (i + 1 < shuffledNouns.length ? i + 1 : 0));
    }, 180);
  }, [gameState, currentWord, streak, shuffledNouns.length]);

  // Keyboard navigation: 1/D for der, 2/I for die, 3/A for das
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;

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
  }, [gameState, handleAnswer]);

  if (nouns.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center bg-white/95 dark:bg-zinc-900/95 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 p-8 shadow-xs">
        <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">No German nouns found in current filter</h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Please select "All Levels" or reset search to play.</p>
      </div>
    );
  }

  // IDLE SCREEN
  if (gameState === 'idle') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl mx-auto bg-white/95 dark:bg-zinc-900/95 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 shadow-[0_12px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.5)] p-8 text-center text-zinc-900 dark:text-white"
      >
        <div className="w-16 h-16 rounded-3xl bg-amber-500 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/25">
          <Zap className="w-8 h-8" />
        </div>

        <h2 className="text-3xl font-black tracking-tight">"Der, Die, Das" Speed Drill</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 max-w-md mx-auto">
          Test your German noun gender instincts against the clock! Pick the correct article as fast as possible.
        </p>

        {/* High Score Banner */}
        <div className="my-6 py-4 px-6 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200/80 dark:border-zinc-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">All-Time High Score:</span>
          </div>
          <span className="text-2xl font-black text-amber-600 dark:text-amber-400">{highScore} pts</span>
        </div>

        {/* Time Selector */}
        <div className="mb-6">
          <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-2">
            Select Round Duration:
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

        {/* Keyboard Hints */}
        <div className="text-xs text-zinc-400 dark:text-zinc-500 mb-6 flex items-center justify-center gap-3">
          <span>Key <kbd className="px-1.5 py-0.5 bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 rounded font-mono font-bold">1</kbd> der</span>
          <span>Key <kbd className="px-1.5 py-0.5 bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 rounded font-mono font-bold">2</kbd> die</span>
          <span>Key <kbd className="px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded font-mono font-bold">3</kbd> das</span>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => startGame()}
          className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white font-black text-base rounded-2xl shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2"
        >
          <Zap className="w-5 h-5" />
          <span>Start Drill ({nouns.length} Nouns Ready)</span>
        </motion.button>
      </motion.div>
    );
  }

  // GAME OVER SCREEN
  if (gameState === 'gameover') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg mx-auto bg-white/95 dark:bg-zinc-900/95 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 shadow-[0_12px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.5)] p-8 text-center text-zinc-900 dark:text-white"
      >
        <div className="w-16 h-16 rounded-3xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-200 dark:border-amber-800">
          <Trophy className="w-8 h-8" />
        </div>

        <h2 className="text-3xl font-black tracking-tight">Time's Up!</h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Excellent article reflex practice</p>

        <div className="grid grid-cols-2 gap-3 my-6">
          <div className="bg-zinc-50 dark:bg-zinc-800/70 p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-700">
            <span className="text-4xl font-black text-amber-600 dark:text-amber-400">{score}</span>
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mt-1">Final Score</p>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-800/70 p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-700">
            <div className="flex items-center justify-center gap-1 text-rose-500">
              <Flame className="w-6 h-6 fill-rose-500" />
              <span className="text-4xl font-black">{bestStreak}</span>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mt-1">Best Streak</p>
          </div>
        </div>

        {score >= highScore && score > 0 && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-bold rounded-xl mb-6">
            🎉 New High Score Record!
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => startGame()}
          className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Play Again</span>
        </motion.button>
      </motion.div>
    );
  }

  // ACTIVE PLAYING SCREEN
  const bareNoun = currentWord.word.replace(/^(der|die|das)\s+/, '').split(',')[0].trim();

  return (
    <div className="max-w-xl mx-auto space-y-4">
      
      {/* Top Bar: Timer, Streak & Score */}
      <div className="bg-white/95 dark:bg-zinc-900/95 border border-zinc-200/90 dark:border-zinc-800 rounded-3xl p-4 shadow-xs">
        <div className="flex items-center justify-between">
          
          {/* Timer */}
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl ${timeLeft <= 10 ? 'bg-rose-100 text-rose-600 animate-pulse' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'}`}>
              <Timer className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-black text-zinc-900 dark:text-white">{timeLeft}s</span>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Remaining</p>
            </div>
          </div>

          {/* Streak Multiplier */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50/80 dark:bg-rose-950/50 rounded-2xl border border-rose-200/80 dark:border-rose-900">
            <Flame className={`w-5 h-5 ${streak >= 5 ? 'text-rose-500 fill-rose-500 animate-bounce' : 'text-zinc-400'}`} />
            <div>
              <span className="text-xs font-black text-rose-700 dark:text-rose-300">{streak} streak</span>
              {streak >= 5 && (
                <span className="ml-1 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                  ({streak >= 10 ? '3x' : '2x'} pts!)
                </span>
              )}
            </div>
          </div>

          {/* Score */}
          <div className="text-right">
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400">{score}</span>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Points</p>
          </div>

        </div>
      </div>

      {/* Main Flash Drill Card */}
      <motion.div
        key={currentWord.id}
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`bg-white/95 dark:bg-zinc-900/95 rounded-3xl border-2 shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] p-8 text-center text-zinc-900 dark:text-white transition-colors duration-150 relative overflow-hidden ${
          feedback === 'correct'
            ? 'border-emerald-500 bg-emerald-50/20'
            : feedback === 'wrong'
            ? 'border-rose-500 bg-rose-50/20'
            : 'border-zinc-200/90 dark:border-zinc-800'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
            {currentWord.level}
          </span>
          {currentWord.plural && (
            <span className="text-xs font-mono text-zinc-400">Plural: {currentWord.plural}</span>
          )}
        </div>

        {/* Noun Prompt */}
        <div className="py-6">
          <span className="text-base text-zinc-400 uppercase tracking-widest font-extrabold">_____</span>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight mt-1 mb-2 text-zinc-900 dark:text-white">
            {bareNoun}
          </h2>
          {(currentWord.meaning_en || currentWord.meaning_tr) && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
              {currentWord.meaning_tr || currentWord.meaning_en}
            </p>
          )}
        </div>

        {/* 3 Giant Article Choice Buttons */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-4">
          
          {/* DER */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleAnswer('der')}
            className="flex flex-col items-center justify-center py-4 sm:py-5 rounded-2xl bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900/60 border-2 border-sky-300 dark:border-sky-800 text-sky-800 dark:text-sky-200 font-black transition-all shadow-xs"
          >
            <span className="text-2xl sm:text-3xl tracking-tight">der</span>
            <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 mt-1 uppercase font-mono">Key 1 / D</span>
          </motion.button>

          {/* DIE */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleAnswer('die')}
            className="flex flex-col items-center justify-center py-4 sm:py-5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 border-2 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 font-black transition-all shadow-xs"
          >
            <span className="text-2xl sm:text-3xl tracking-tight">die</span>
            <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 mt-1 uppercase font-mono">Key 2 / I</span>
          </motion.button>

          {/* DAS */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleAnswer('das')}
            className="flex flex-col items-center justify-center py-4 sm:py-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 font-black transition-all shadow-xs"
          >
            <span className="text-2xl sm:text-3xl tracking-tight">das</span>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-1 uppercase font-mono">Key 3 / A</span>
          </motion.button>

        </div>

      </motion.div>

    </div>
  );
};
