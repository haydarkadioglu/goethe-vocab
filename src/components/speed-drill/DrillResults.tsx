import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Volume2, RotateCcw, Check } from 'lucide-react';
import { VocabWord, SupportedLanguage } from '../../types';
import { speechService } from '../../services/speech';
import { getWordMeaning } from '../../utils/meaning';

interface MistakeItem {
  word: VocabWord;
  chosenArticle: string;
  correctArticle: string;
}

interface DrillResultsProps {
  correctWords: VocabWord[];
  mistakes: MistakeItem[];
  targetCount: number;
  targetLang: SupportedLanguage;
  onRestartFull: () => void;
  onPracticeMissed: (words: VocabWord[]) => void;
  onChangeSettings: () => void;
}

export const DrillResults: React.FC<DrillResultsProps> = ({
  correctWords,
  mistakes,
  targetCount,
  targetLang,
  onRestartFull,
  onPracticeMissed,
  onChangeSettings
}) => {
  const [reviewTab, setReviewTab] = useState<'all' | 'mistakes' | 'correct'>('all');
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

      {/* Results Review Tabs */}
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
                    (You picked: <span className="line-through">{m.chosenArticle}</span>)
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Meaning: <strong className="text-zinc-700 dark:text-zinc-200">{getWordMeaning(m.word, targetLang)}</strong>
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
                  Meaning: <strong className="text-zinc-700 dark:text-zinc-200">{getWordMeaning(w, targetLang)}</strong>
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
            onClick={() => onPracticeMissed(mistakes.map(m => m.word))}
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
            onClick={onRestartFull}
            className="flex-1 w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Again ({targetCount} Words)</span>
          </motion.button>
          <button
            onClick={onChangeSettings}
            className="w-full sm:w-auto px-5 py-3.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold rounded-2xl transition-all text-sm"
          >
            Change Settings
          </button>
        </div>
      </div>
    </motion.div>
  );
};
