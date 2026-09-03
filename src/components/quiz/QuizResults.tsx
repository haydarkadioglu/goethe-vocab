import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Volume2, RotateCcw, RefreshCw, Check } from 'lucide-react';
import { VocabWord } from '../../types';
import { speechService } from '../../services/speech';

interface Question {
  type: 'article' | 'meaning' | 'fillIn';
  prompt: string;
  subPrompt?: string;
  options: string[];
  correctAnswer: string;
  word: VocabWord;
  explanation: string;
}

interface UserAnswer {
  question: Question;
  selected: string;
  isCorrect: boolean;
}

interface QuizResultsProps {
  questions: Question[];
  userHistory: UserAnswer[];
  score: number;
  questionCount: number;
  onRetakeMissed: (words: VocabWord[], count: number) => void;
  onRetakeNew: () => void;
}

export const QuizResults: React.FC<QuizResultsProps> = ({
  questions,
  userHistory,
  score,
  questionCount,
  onRetakeMissed,
  onRetakeNew
}) => {
  const [reviewFilter, setReviewFilter] = useState<'all' | 'mistakes' | 'correct'>('all');
  const percentage = Math.round((score / questions.length) * 100);
  const mistakes = userHistory.filter(h => !h.isCorrect);
  const corrects = userHistory.filter(h => h.isCorrect);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-xl mx-auto bg-white/95 dark:bg-zinc-900/95 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 shadow-[0_12px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.5)] p-5 sm:p-8 text-center text-zinc-900 dark:text-white"
    >
      <div className="w-16 h-16 rounded-3xl bg-amber-100/80 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-200/80 dark:border-amber-800 shadow-xs">
        <Award className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-black tracking-tight">Quiz Complete!</h2>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Here is your full question review breakdown:</p>

      {/* Score & Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 my-5">
        <div className="bg-zinc-50 dark:bg-zinc-800/70 p-3 sm:p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-700">
          <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">{percentage}%</span>
          <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-zinc-400 mt-1">Score</p>
        </div>
        <div className="bg-zinc-50 dark:bg-zinc-800/70 p-3 sm:p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-700">
          <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">{corrects.length}</span>
          <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-zinc-400 mt-1">Correct</p>
        </div>
        <div className="bg-zinc-50 dark:bg-zinc-800/70 p-3 sm:p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-700">
          <span className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400">{mistakes.length}</span>
          <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-zinc-400 mt-1">Missed</p>
        </div>
      </div>

      {/* Review Breakdown Tabs */}
      <div className="my-5 text-left border-t border-zinc-200 dark:border-zinc-800 pt-4">
        
        <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl mb-3 text-xs">
          <button
            onClick={() => setReviewFilter('all')}
            className={`flex-1 py-1.5 rounded-lg font-bold transition-all text-center ${
              reviewFilter === 'all'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-2xs'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            All Questions ({questions.length})
          </button>
          <button
            onClick={() => setReviewFilter('mistakes')}
            className={`flex-1 py-1.5 rounded-lg font-bold transition-all text-center ${
              reviewFilter === 'mistakes'
                ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-2xs'
                : 'text-zinc-500 hover:text-rose-600'
            }`}
          >
            Missed ({mistakes.length})
          </button>
          <button
            onClick={() => setReviewFilter('correct')}
            className={`flex-1 py-1.5 rounded-lg font-bold transition-all text-center ${
              reviewFilter === 'correct'
                ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                : 'text-zinc-500 hover:text-emerald-600'
            }`}
          >
            Correct ({corrects.length})
          </button>
        </div>

        <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
          {(reviewFilter === 'all' || reviewFilter === 'mistakes') && mistakes.map((m, idx) => (
            <div
              key={`m-${idx}`}
              className="p-3 bg-rose-50/60 dark:bg-rose-950/30 rounded-2xl border border-rose-200/80 dark:border-rose-900/60 text-xs space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-zinc-900 dark:text-white">
                  {m.question.prompt}
                </span>
                <button
                  onClick={() => speechService.speak(m.question.word.word)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-rose-600"
                  title="Pronounce"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
              {m.question.subPrompt && (
                <p className="text-zinc-500 italic text-[11px]">"{m.question.subPrompt}"</p>
              )}
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <span className="text-rose-600 dark:text-rose-400 font-semibold line-through">
                  Selected: {m.selected}
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  ✓ Correct: {m.question.correctAnswer}
                </span>
              </div>
            </div>
          ))}

          {(reviewFilter === 'all' || reviewFilter === 'correct') && corrects.map((c, idx) => (
            <div
              key={`c-${idx}`}
              className="p-3 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/60 text-xs space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-zinc-900 dark:text-white">
                  {c.question.prompt}
                </span>
                <button
                  onClick={() => speechService.speak(c.question.word.word)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-emerald-600"
                  title="Pronounce"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
              {c.question.subPrompt && (
                <p className="text-zinc-500 italic text-[11px]">"{c.question.subPrompt}"</p>
              )}
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
                  <Check className="w-3.5 h-3.5" /> Correct Answer: {c.question.correctAnswer}
                </span>
              </div>
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
            onClick={() => onRetakeMissed(mistakes.map(m => m.question.word), mistakes.length)}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl shadow-md transition-all text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake Missed Questions Only ({mistakes.length})</span>
          </motion.button>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onRetakeNew}
            className="flex-1 w-full flex items-center justify-center gap-2 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl shadow-md transition-all text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retake with {questionCount} Questions</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
