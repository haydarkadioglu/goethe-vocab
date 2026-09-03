import React, { useState, useEffect } from 'react';
import { Volume2, Star, Globe, Loader2, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { VocabWord, SupportedLanguage } from '../types';
import { speechService } from '../services/speech';
import { translateText } from '../services/translator';

interface VocabCardProps {
  word: VocabWord;
  targetLang: SupportedLanguage;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  index?: number;
}

export const VocabCard: React.FC<VocabCardProps> = ({
  word,
  targetLang,
  isFavorite,
  onToggleFavorite,
  index = 0
}) => {
  // Pre-translated meaning (English, Turkish, Spanish, or Arabic)
  const getPreTranslated = () => {
    if (targetLang === 'en') return word.meaning_en || null;
    if (targetLang === 'tr') return word.meaning_tr || null;
    if (targetLang === 'es') return word.meaning_es || null;
    if (targetLang === 'ar') return word.meaning_ar || null;
    return null;
  };

  const [wordTranslation, setWordTranslation] = useState<string | null>(getPreTranslated());
  const [exampleTranslations, setExampleTranslations] = useState<Record<number, string>>({});
  const [loadingWordTrans, setLoadingWordTrans] = useState(false);
  const [loadingExTrans, setLoadingExTrans] = useState<Record<number, boolean>>({});
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Update translation when target language changes
  useEffect(() => {
    const pre = getPreTranslated();
    setWordTranslation(pre);
    setExampleTranslations({});
  }, [targetLang, word.meaning_en, word.meaning_tr, word.meaning_es, word.meaning_ar]);

  // Subscribe to speech state
  useEffect(() => {
    return speechService.subscribe((speaking, text) => {
      if (!speaking) {
        setIsPlayingAudio(false);
      } else if (text === word.word) {
        setIsPlayingAudio(true);
      }
    });
  }, [word.word]);

  const getArticleBadge = () => {
    if (!word.article) return null;
    const styles: Record<string, { bg: string; text: string; border: string }> = {
      der: { bg: 'bg-sky-50/90 dark:bg-sky-950/60', text: 'text-sky-700 dark:text-sky-300', border: 'border-sky-200/80 dark:border-sky-800/60' },
      die: { bg: 'bg-rose-50/90 dark:bg-rose-950/60', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200/80 dark:border-rose-800/60' },
      das: { bg: 'bg-emerald-50/90 dark:bg-emerald-950/60', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200/80 dark:border-emerald-800/60' },
    };
    const s = styles[word.article] || { bg: 'bg-zinc-100 dark:bg-zinc-800', text: 'text-zinc-700 dark:text-zinc-300', border: 'border-zinc-200 dark:border-zinc-700' };
    return (
      <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-mono font-bold uppercase tracking-wider border ${s.bg} ${s.text} ${s.border}`}>
        {word.article}
      </span>
    );
  };

  const getLevelBadge = () => {
    const map = {
      A1: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60',
      A2: 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200/80 dark:border-sky-800/60',
      B1: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800/60',
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold border ${map[word.level]}`}>
        {word.level}
      </span>
    );
  };

  const isPreTranslated = targetLang === 'en' || targetLang === 'tr' || targetLang === 'es' || targetLang === 'ar';

  const handleTranslateWord = async () => {
    if (wordTranslation && !isPreTranslated) {
      setWordTranslation(null);
      return;
    }
    setLoadingWordTrans(true);
    try {
      const res = await translateText(word.word, targetLang);
      setWordTranslation(res);
    } catch {
      setWordTranslation('Translation unavailable');
    } finally {
      setLoadingWordTrans(false);
    }
  };

  const handleTranslateExample = async (idx: number, sentence: string) => {
    if (exampleTranslations[idx]) {
      setExampleTranslations(prev => {
        const copy = { ...prev };
        delete copy[idx];
        return copy;
      });
      return;
    }
    setLoadingExTrans(prev => ({ ...prev, [idx]: true }));
    try {
      const res = await translateText(sentence, targetLang);
      setExampleTranslations(prev => ({ ...prev, [idx]: res }));
    } catch {
      setExampleTranslations(prev => ({ ...prev, [idx]: 'Translation unavailable' }));
    } finally {
      setLoadingExTrans(prev => ({ ...prev, [idx]: false }));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25, delay: Math.min((index % 12) * 0.03, 0.3) }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="bg-white/95 dark:bg-zinc-900/95 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/90 shadow-[0_2px_14px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] dark:hover:border-zinc-700 transition-all p-5 flex flex-col justify-between group backdrop-blur-xs relative overflow-hidden text-zinc-900 dark:text-zinc-100"
    >
      <div>
        
        {/* Top Badges & Favorite */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            {getLevelBadge()}
            {getArticleBadge()}
            {word.pos && word.pos !== 'other' && (
              <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200/60 dark:border-zinc-700/60">
                {word.pos}
              </span>
            )}
          </div>

          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={() => onToggleFavorite(word.id)}
            title={isFavorite ? 'Remove from saved' : 'Save to favorites'}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-amber-500 hover:bg-amber-50/60 dark:hover:bg-zinc-800 transition-colors"
          >
            <Star className={`w-4 h-4 transition-all ${isFavorite ? 'text-amber-500 fill-amber-500 scale-110' : ''}`} />
          </motion.button>
        </div>

        {/* Headword, Audio & Translation */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <h3 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight leading-snug">
              {word.word}
            </h3>
            {(word.plural || word.forms) && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono mt-0.5">
                {word.plural && <span className="mr-2">Pl: <strong className="text-zinc-700 dark:text-zinc-200">{word.plural}</strong></span>}
                {word.forms && <span className="italic text-zinc-600 dark:text-zinc-300">({word.forms})</span>}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Audio Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => speechService.speak(word.word)}
              title="Listen to German pronunciation"
              className={`p-2 rounded-xl transition-all border ${
                isPlayingAudio
                  ? 'bg-amber-500 text-white border-amber-600 shadow-sm shadow-amber-500/30'
                  : 'bg-zinc-100/90 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200/80 dark:border-zinc-700 hover:bg-amber-50 dark:hover:bg-zinc-700 hover:text-amber-700'
              }`}
            >
              {isPlayingAudio ? (
                <div className="w-4 h-4 flex items-center justify-center gap-0.5">
                  <span className="w-0.5 bg-white rounded-full animate-wave-1" />
                  <span className="w-0.5 bg-white rounded-full animate-wave-2" />
                  <span className="w-0.5 bg-white rounded-full animate-wave-3" />
                </div>
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </motion.button>

            {/* Translate Button for other languages */}
            {!isPreTranslated && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleTranslateWord}
                title={`Translate headword to ${targetLang.toUpperCase()}`}
                className={`p-2 rounded-xl border transition-all ${
                  wordTranslation
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 shadow-xs'
                    : 'bg-zinc-100/90 dark:bg-zinc-800 border-zinc-200/80 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/70 dark:hover:bg-zinc-700'
                }`}
              >
                {loadingWordTrans ? (
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600 dark:text-indigo-400" />
                ) : (
                  <Globe className="w-4 h-4" />
                )}
              </motion.button>
            )}
          </div>
        </div>

        {/* Pre-translated Translation Box */}
        <AnimatePresence>
          {wordTranslation && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden mb-3"
            >
              <div className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-50/80 to-sky-50/80 dark:from-zinc-800/80 dark:to-zinc-800/40 border border-indigo-100/80 dark:border-zinc-700/80 text-xs font-semibold text-indigo-900 dark:text-indigo-300 flex items-center justify-between">
                <span>{wordTranslation}</span>
                <span className="text-[10px] text-indigo-500 dark:text-indigo-400 font-bold uppercase tracking-wider">{targetLang}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Authentic Goethe Examples */}
        {word.examples && word.examples.length > 0 && (
          <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
            <div className="text-[10px] font-extrabold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              <span>Goethe Example Sentences</span>
            </div>
            {word.examples.slice(0, 3).map((sentence, idx) => (
              <div key={idx} className="bg-zinc-50/90 dark:bg-zinc-800/70 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-2xl p-2.5 border border-zinc-200/60 dark:border-zinc-700/60 text-xs transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-zinc-800 dark:text-zinc-200 leading-relaxed font-normal">
                    {sentence}
                  </p>
                  <div className="flex items-center gap-1 shrink-0 mt-0.5">
                    <button
                      onClick={() => speechService.speak(sentence, 0.85)}
                      title="Listen to sentence"
                      className="p-1 rounded-lg text-zinc-400 hover:text-amber-600 hover:bg-amber-50/80 dark:hover:bg-zinc-700 transition-colors"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleTranslateExample(idx, sentence)}
                      title="Translate sentence"
                      className="p-1 rounded-lg text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50/80 dark:hover:bg-zinc-700 transition-colors"
                    >
                      {loadingExTrans[idx] ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Globe className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {exampleTranslations[idx] && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.18 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-1.5 pt-1.5 border-t border-zinc-200/60 dark:border-zinc-700/60 text-zinc-600 dark:text-zinc-400 italic">
                        {exampleTranslations[idx]}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 pt-2.5 flex items-center justify-between text-[10px] font-mono text-zinc-400 dark:text-zinc-500 border-t border-zinc-100 dark:border-zinc-800">
        <span>ID: {word.id}</span>
        <span>Goethe PDF p.{word.page}</span>
      </div>

    </motion.div>
  );
};
