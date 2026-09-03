import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Volume2, RotateCcw, Check } from 'lucide-react';
import { VocabWord, SupportedLanguage } from '../../types';
import { speechService } from '../../services/speech';
import { getWordMeaning } from '../../utils/meaning';

interface FlashcardsResultsProps {
  deck: VocabWord[];
  masteredInSession: VocabWord[];
  unlearnedInSession: VocabWord[];
  sessionCount: number;
  targetLang: SupportedLanguage;
  onReviewUnlearned: () => void;
  onStartNewSession: () => void;
}

export const FlashcardsResults: React.FC<FlashcardsResultsProps> = ({
  deck,
  masteredInSession,
  unlearnedInSession,
  sessionCount,
  targetLang,
  onReviewUnlearned,
  onStartNewSession
}) => {
  const [summaryTab, setSummaryTab] = useState<'all' | 'learned' | 'unlearned'>('all');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-xl mx-auto bg-white/95 dark:bg-zinc-900/95 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 shadow-[0_12px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.5)] p-5 sm:p-8 text-center text-zinc-900 dark:text-white"
    >
      <div className="w-16 h-16 rounded-3xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-200 dark:border-amber-800">
        <Trophy className="w-8 h-8" />
      </div>

      <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Flashcards Session Complete!</h2>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
        You completed all {deck.length} flashcards in this set.
      </p>

      {/* Results Stats */}
      <div className="grid grid-cols-2 gap-3 my-5">
        <div className="bg-emerald-50/70 dark:bg-emerald-950/40 p-4 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/60">
          <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{masteredInSession.length}</span>
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 mt-1">Mastered / Learned (✓)</p>
        </div>
        <div className="bg-amber-50/70 dark:bg-amber-950/40 p-4 rounded-2xl border border-amber-200/80 dark:border-amber-900/60">
          <span className="text-3xl font-black text-amber-600 dark:text-amber-400">{unlearnedInSession.length}</span>
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 mt-1">To Review (✗)</p>
        </div>
      </div>

      {/* Summary Breakdown Tabs */}
      <div className="my-5 text-left border-t border-zinc-200 dark:border-zinc-800 pt-4">
        <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl mb-3 text-xs">
          <button
            onClick={() => setSummaryTab('all')}
            className={`flex-1 py-1.5 rounded-lg font-bold transition-all text-center ${
              summaryTab === 'all'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-2xs'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            All Cards ({deck.length})
          </button>
          <button
            onClick={() => setSummaryTab('unlearned')}
            className={`flex-1 py-1.5 rounded-lg font-bold transition-all text-center ${
              summaryTab === 'unlearned'
                ? 'bg-white dark:bg-zinc-900 text-amber-600 dark:text-amber-400 shadow-2xs'
                : 'text-zinc-500 hover:text-amber-600'
            }`}
          >
            To Review ({unlearnedInSession.length})
          </button>
          <button
            onClick={() => setSummaryTab('learned')}
            className={`flex-1 py-1.5 rounded-lg font-bold transition-all text-center ${
              summaryTab === 'learned'
                ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                : 'text-zinc-500 hover:text-emerald-600'
            }`}
          >
            Mastered ({masteredInSession.length})
          </button>
        </div>

        <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
          {(summaryTab === 'all' || summaryTab === 'unlearned') && unlearnedInSession.map((w) => (
            <div
              key={`u-${w.id}`}
              className="p-3 bg-amber-50/50 dark:bg-amber-950/30 rounded-2xl border border-amber-200/70 dark:border-amber-900/60 flex items-center justify-between text-xs gap-2"
            >
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  {w.article && (
                    <span className="px-2 py-0.5 rounded font-mono font-black uppercase text-white bg-zinc-800 dark:bg-zinc-700">
                      {w.article}
                    </span>
                  )}
                  <span className="font-bold text-zinc-900 dark:text-white text-sm">{w.word}</span>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">(To Review)</span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {getWordMeaning(w, targetLang)}
                </p>
              </div>
              <button
                onClick={() => speechService.speak(w.word)}
                className="p-2 rounded-xl bg-white dark:bg-zinc-800 hover:bg-zinc-100 text-zinc-600 dark:text-zinc-300 shadow-2xs shrink-0"
                title="Pronounce"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {(summaryTab === 'all' || summaryTab === 'learned') && masteredInSession.map((w) => (
            <div
              key={`l-${w.id}`}
              className="p-3 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200/70 dark:border-emerald-900/60 flex items-center justify-between text-xs gap-2"
            >
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  {w.article && (
                    <span className="px-2 py-0.5 rounded font-mono font-black uppercase text-white bg-emerald-600">
                      {w.article}
                    </span>
                  )}
                  <span className="font-bold text-zinc-900 dark:text-white text-sm">{w.word}</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                    <Check className="w-3.5 h-3.5" /> Learned
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {getWordMeaning(w, targetLang)}
                </p>
              </div>
              <button
                onClick={() => speechService.speak(w.word)}
                className="p-2 rounded-xl bg-white dark:bg-zinc-800 hover:bg-zinc-100 text-zinc-600 dark:text-zinc-300 shadow-2xs shrink-0"
                title="Pronounce"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2.5 pt-2">
        {unlearnedInSession.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onReviewUnlearned}
            className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Review Unlearned Cards Only ({unlearnedInSession.length})</span>
          </motion.button>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onStartNewSession}
            className="flex-1 w-full py-3.5 bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-700 text-white font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Start New Set ({sessionCount} Cards)</span>
          </motion.button>
        </div>
      </div>

    </motion.div>
  );
};
