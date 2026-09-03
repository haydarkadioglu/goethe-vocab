import React from 'react';
import { motion } from 'framer-motion';
import { Volume2, RotateCw, Star } from 'lucide-react';
import { VocabWord, SupportedLanguage } from '../../types';
import { speechService } from '../../services/speech';

interface FlashcardCardProps {
  currentWord: VocabWord;
  isFlipped: boolean;
  direction: 1 | -1;
  isFav: boolean;
  targetLang: SupportedLanguage;
  translation: string;
  loadingTrans: boolean;
  onFlip: () => void;
  onToggleFav: () => void;
}

export const FlashcardCard: React.FC<FlashcardCardProps> = ({
  currentWord,
  isFlipped,
  direction,
  isFav,
  targetLang,
  translation,
  loadingTrans,
  onFlip,
  onToggleFav
}) => {
  return (
    <div className="w-full h-[360px] sm:h-[420px] perspective-1000 select-none">
      <motion.div
        key={currentWord.id}
        initial={{ opacity: 0, x: direction * 35, scale: 0.98 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: -direction * 35, scale: 0.98 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        onClick={onFlip}
        className="w-full h-full cursor-pointer"
      >
        <div
          className={`relative w-full h-full transition-transform duration-500 transform-style-3d rounded-3xl border border-zinc-200/90 dark:border-zinc-800 shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* FRONT SIDE */}
          <div className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-white via-zinc-50/50 to-amber-50/20 dark:from-zinc-900 dark:via-zinc-900/90 dark:to-zinc-950 rounded-3xl p-5 sm:p-8 flex flex-col justify-between border-2 border-transparent hover:border-amber-200/80 dark:hover:border-zinc-700 transition-colors">
            
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
                  onClick={onToggleFav}
                  className="p-2 rounded-xl text-zinc-400 hover:text-amber-500 hover:bg-zinc-100/80 dark:hover:bg-zinc-800 transition-colors"
                >
                  <Star className={`w-5 h-5 ${isFav ? 'text-amber-500 fill-amber-500' : ''}`} />
                </motion.button>
              </div>
            </div>

            {/* Front Center: Word & Pronounce */}
            <div className="text-center my-auto">
              <h2 className="text-3xl sm:text-5xl font-black text-zinc-900 dark:text-white tracking-tight mb-2 sm:mb-3">
                {currentWord.word}
              </h2>
              {currentWord.plural && (
                <p className="text-xs sm:text-sm font-mono text-zinc-500 dark:text-zinc-400">
                  Plural: <strong className="text-zinc-800 dark:text-zinc-200">{currentWord.plural}</strong>
                </p>
              )}
              {currentWord.forms && (
                <p className="text-[11px] sm:text-xs font-mono text-zinc-500 dark:text-zinc-400 italic mt-1">
                  ({currentWord.forms})
                </p>
              )}

              <div className="mt-4 sm:mt-5 flex justify-center" onClick={(e) => e.stopPropagation()}>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => speechService.speak(currentWord.word)}
                  title="Listen (Shortcut: A)"
                  className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-amber-500/25 transition-all"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Listen (A)</span>
                </motion.button>
              </div>
            </div>

            {/* Front Footer */}
            <div className="flex items-center justify-between text-[11px] sm:text-xs text-zinc-400 dark:text-zinc-500 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <span>Flip: <kbd className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded border border-zinc-300 dark:border-zinc-700 font-mono text-zinc-700 dark:text-zinc-300">Space</kbd></span>
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-500 font-semibold">
                <RotateCw className="w-3.5 h-3.5" /> Click to view meaning
              </span>
            </div>
          </div>

          {/* BACK SIDE */}
          <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-zinc-900 via-slate-900 to-zinc-950 text-white rounded-3xl p-5 sm:p-8 flex flex-col justify-between border-2 border-zinc-700/50 shadow-2xl">
            
            {/* Back Header */}
            <div className="flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-white/10 text-zinc-300 border border-white/10">
                  {currentWord.level}
                </span>
                <span className="text-[10px] sm:text-xs text-zinc-400 uppercase tracking-wider">{targetLang.toUpperCase()} Meaning</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  speechService.speak(currentWord.word);
                }}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white"
                title="Pronounce"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            {/* Back Center: Scrollable Content with Safe Padding */}
            <div className="flex-1 my-2 overflow-y-auto max-h-[200px] sm:max-h-[250px] pr-1 no-scrollbar flex flex-col justify-center">
              <div className="text-center mb-3">
                <h3 className="text-2xl sm:text-4xl font-extrabold text-amber-300 tracking-tight leading-snug">
                  {loadingTrans ? 'Translating...' : translation || currentWord.word}
                </h3>
              </div>

              {currentWord.examples && currentWord.examples.length > 0 && (
                <div className="bg-white/10 rounded-2xl p-3 sm:p-4 border border-white/10 backdrop-blur-xs text-left">
                  <p className="text-[10px] sm:text-xs text-zinc-400 font-bold uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>Goethe Example Sentence:</span>
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
                  <p className="text-xs sm:text-sm text-zinc-100 font-medium leading-relaxed">
                    {currentWord.examples[0]}
                  </p>
                </div>
              )}
            </div>

            {/* Back Footer */}
            <div className="flex items-center justify-between text-[11px] sm:text-xs text-zinc-400 pt-2 border-t border-white/10 shrink-0">
              <span>PDF Page {currentWord.page}</span>
              <span className="text-zinc-300">Press Space to flip back</span>
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
};
