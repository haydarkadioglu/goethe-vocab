import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Volume2, RotateCcw, RefreshCw, Check } from 'lucide-react';
import { VocabWord, SupportedLanguage } from '../../types';
import { speechService } from '../../services/speech';
import { getWordMeaning } from '../../utils/meaning';

interface ListeningMistake {
  word: VocabWord;
  selected: string;
  correctAnswer: string;
}

interface ListeningResultsProps {
  questionsCount: number;
  score: number;
  correctWords: VocabWord[];
  mistakes: ListeningMistake[];
  questionCount: number;
  targetLang: SupportedLanguage;
  onPracticeMissed: (words: VocabWord[], count: number) => void;
  onRestartNew: () => void;
}

export const ListeningResults: React.FC<ListeningResultsProps> = ({
  questionsCount,
  score,
  correctWords,
  mistakes,
  questionCount,
  targetLang,
  onPracticeMissed,
  onRestartNew
}) => {
  const [reviewTab, setReviewTab] = useState<'all' | 'mistakes' | 'correct'>('all');
  const percentage = Math.round((score / questionsCount) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-xl mx-auto bg-white/95 dark:bg-zinc-900/95 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 p-5 sm:p-8 text-center text-zinc-900 dark:text-white shadow-xl"
    >
      <div className="w-16 h-16 rounded-3xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4 border border-indigo-200 dark:border-indigo-800">
        <Award className="w-8 h-8" />
      </div>

      <h2 className="text-2xl font-black tracking-tight">Listening Practice Complete!</h2>
      
      {/* Results Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 my-5">
        <div className="bg-zinc-50 dark:bg-zinc-800/70 p-3 sm:p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-700">
          <span className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">{percentage}%</span>
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

      {/* Breakdown Tabs */}
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
            All Words ({questionsCount})
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

        <div className="mt-2 space-y-2 max-h-56 overflow-y-auto pr-1">
          {(reviewTab === 'all' || reviewTab === 'mistakes') && mistakes.map((m, idx) => (
            <div
              key={`m-${idx}`}
              className="p-3 bg-rose-50/60 dark:bg-rose-950/30 rounded-2xl border border-rose-200/80 dark:border-rose-900/60 text-xs flex items-center justify-between gap-2"
            >
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-zinc-900 dark:text-white text-sm">
                    {m.correctAnswer}
                  </span>
                  <span className="text-rose-600 dark:text-rose-400 text-[11px] font-semibold">
                    (Selected: <span className="line-through">{m.selected}</span>)
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Meaning: <strong className="text-zinc-700 dark:text-zinc-200">{getWordMeaning(m.word, targetLang)}</strong>
                </p>
              </div>

              <button
                onClick={() => speechService.speak(m.correctAnswer, 0.85)}
                className="p-2 bg-white dark:bg-zinc-800 hover:bg-zinc-100 text-indigo-600 dark:text-indigo-300 rounded-xl shrink-0 shadow-2xs"
                title="Listen again"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {(reviewTab === 'all' || reviewTab === 'correct') && correctWords.map((w, idx) => (
            <div
              key={`c-${idx}`}
              className="p-3 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/60 text-xs flex items-center justify-between gap-2"
            >
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-zinc-900 dark:text-white text-sm">
                    {w.word}
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold flex items-center gap-0.5">
                    <Check className="w-3.5 h-3.5" /> Correct
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Meaning: <strong className="text-zinc-700 dark:text-zinc-200">{getWordMeaning(w, targetLang)}</strong>
                </p>
              </div>

              <button
                onClick={() => speechService.speak(w.word, 0.85)}
                className="p-2 bg-white dark:bg-zinc-800 hover:bg-zinc-100 text-indigo-600 dark:text-indigo-300 rounded-xl shrink-0 shadow-2xs"
                title="Listen again"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2.5 pt-2">
        {mistakes.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onPracticeMissed(mistakes.map(m => m.word), mistakes.length)}
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
            onClick={onRestartNew}
            className="flex-1 w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Restart with {questionCount} Words</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
