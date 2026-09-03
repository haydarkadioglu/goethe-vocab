import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, BookOpen, Flame, CheckCircle2, XCircle, Volume2, ArrowRight, PauseCircle } from 'lucide-react';
import { VocabWord, SupportedLanguage } from '../../types';
import { speechService } from '../../services/speech';
import { getWordMeaning } from '../../utils/meaning';

interface DrillActiveProps {
  currentWord: VocabWord;
  currentIndex: number;
  totalWords: number;
  drillMode: 'timer' | 'practice';
  timeLeft: number;
  isTimerPaused: boolean;
  score: number;
  streak: number;
  targetLang: SupportedLanguage;
  answerState: {
    answered: boolean;
    isCorrect: boolean;
    chosenArticle: string | null;
  };
  onAnswer: (article: 'der' | 'die' | 'das') => void;
  onNextWord: () => void;
}

export const DrillActive: React.FC<DrillActiveProps> = ({
  currentWord,
  currentIndex,
  totalWords,
  drillMode,
  timeLeft,
  isTimerPaused,
  score,
  streak,
  targetLang,
  answerState,
  onAnswer,
  onNextWord
}) => {
  const bareNoun = currentWord.word.replace(/^(der|die|das)\s+/, '').split(',')[0].trim();
  const wordMeaning = getWordMeaning(currentWord, targetLang);

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
                  <p className="text-[9px] sm:text-[10px] text-zinc-400">Target: {totalWords} words</p>
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
              {currentIndex + 1} / {totalWords}
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
          
          {(['der', 'die', 'das'] as const).map((art, idx) => {
            const numKey = idx + 1;
            const letterKey = art === 'der' ? 'D' : art === 'die' ? 'I' : 'A';
            const baseTheme = art === 'der'
              ? 'border-sky-300 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-200'
              : art === 'die'
              ? 'border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200'
              : 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200';

            let dynamicStyle = baseTheme;
            if (answerState.answered) {
              if (currentWord.article === art) {
                dynamicStyle = 'border-emerald-500 ring-4 ring-emerald-500/20 bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 font-black';
              } else if (answerState.chosenArticle === art) {
                dynamicStyle = 'border-rose-500 bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-200 opacity-80';
              } else {
                dynamicStyle = 'opacity-30 border-zinc-200 dark:border-zinc-800 text-zinc-400';
              }
            }

            return (
              <motion.button
                key={art}
                whileHover={!answerState.answered ? { scale: 1.03 } : {}}
                whileTap={!answerState.answered ? { scale: 0.95 } : {}}
                onClick={() => onAnswer(art)}
                disabled={answerState.answered}
                className={`flex flex-col items-center justify-center py-3.5 sm:py-5 rounded-2xl border-2 font-black transition-all shadow-xs ${dynamicStyle}`}
              >
                <span className="text-xl sm:text-3xl tracking-tight">{art}</span>
                <span className="text-[9px] sm:text-[10px] font-bold mt-1 uppercase font-mono">{numKey} / {letterKey}</span>
              </motion.button>
            );
          })}

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
              onClick={onNextWord}
              className="w-full sm:w-auto px-7 py-3.5 bg-zinc-900 dark:bg-amber-500 hover:bg-zinc-800 dark:hover:bg-amber-600 text-white dark:text-zinc-950 font-black rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-sm ml-auto"
            >
              <span>{currentIndex + 1 >= totalWords ? 'View Final Results 🏆' : 'Next Word (Advance) →'}</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        )}

      </motion.div>

    </div>
  );
};
