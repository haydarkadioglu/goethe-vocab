import React, { useState, useEffect, useCallback } from 'react';
import { Volume2, Award, Headphones, RefreshCw, ArrowRight, CheckCircle2, XCircle, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { VocabWord, SupportedLanguage } from '../types';
import { speechService } from '../services/speech';

interface ListeningQuizProps {
  words: VocabWord[];
  targetLang: SupportedLanguage;
}

interface ListeningQuestion {
  word: VocabWord;
  options: string[];
  correctAnswer: string;
}

interface ListeningMistake {
  word: VocabWord;
  selected: string;
  correctAnswer: string;
}

export const ListeningQuiz: React.FC<ListeningQuizProps> = ({ words, targetLang }) => {
  const [questions, setQuestions] = useState<ListeningQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [playbackRate, setPlaybackRate] = useState<number>(0.85);
  const [mistakes, setMistakes] = useState<ListeningMistake[]>([]);
  const [showMistakes, setShowMistakes] = useState(true);

  const generateListeningQuiz = () => {
    setLoading(true);
    setIsFinished(false);
    setCurrentIndex(0);
    setScore(0);
    setSelectedOption(null);
    setIsSubmitted(false);
    setMistakes([]);

    if (words.length < 4) {
      setQuestions([]);
      setLoading(false);
      return;
    }

    const shuffled = [...words].sort(() => Math.random() - 0.5).slice(0, 10);
    const newQuestions: ListeningQuestion[] = shuffled.map(w => {
      const distractors = words
        .filter(x => x.id !== w.id && x.pos === w.pos)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(x => x.word);

      const opts = Array.from(new Set([w.word, ...distractors])).sort(() => Math.random() - 0.5);

      return {
        word: w,
        options: opts,
        correctAnswer: w.word
      };
    });

    setQuestions(newQuestions);
    setLoading(false);
  };

  useEffect(() => {
    generateListeningQuiz();
  }, [words]);

  const currentQ = questions[currentIndex];

  const playCurrentAudio = useCallback((rateParam?: number) => {
    if (currentQ) {
      speechService.speak(currentQ.word.word, rateParam ?? playbackRate);
    }
  }, [currentQ, playbackRate]);

  // Auto-play pronunciation when advancing to next question
  useEffect(() => {
    if (currentQ && !isSubmitted) {
      const timer = setTimeout(() => {
        playCurrentAudio();
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [currentQ, currentIndex, isSubmitted, playCurrentAudio]);

  const handleSelectOption = useCallback((option: string) => {
    if (isSubmitted || !currentQ) return;
    setSelectedOption(option);
    setIsSubmitted(true);

    if (option === currentQ.correctAnswer) {
      setScore(s => s + 1);
    } else {
      setMistakes(m => [
        ...m,
        { word: currentQ.word, selected: option, correctAnswer: currentQ.correctAnswer }
      ]);
    }
  }, [isSubmitted, currentQ]);

  const handleNext = useCallback(() => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(i => i + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
    } else {
      setIsFinished(true);
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  }, [currentIndex, questions.length]);

  // Keyboard navigation: R/Space for audio, 1-4 for options, Enter for next
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;

      if (isSubmitted) {
        if (e.code === 'Space' || e.code === 'Enter') {
          e.preventDefault();
          handleNext();
        } else if (e.key.toLowerCase() === 'r') {
          playCurrentAudio();
        }
        return;
      }

      // Replay audio
      if (e.code === 'Space' || e.key.toLowerCase() === 'r') {
        e.preventDefault();
        playCurrentAudio();
        return;
      }

      if (!currentQ) return;
      const opts = currentQ.options;
      if (e.key === '1' && opts[0]) handleSelectOption(opts[0]);
      else if (e.key === '2' && opts[1]) handleSelectOption(opts[1]);
      else if (e.key === '3' && opts[2]) handleSelectOption(opts[2]);
      else if (e.key === '4' && opts[3]) handleSelectOption(opts[3]);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSubmitted, currentQ, handleSelectOption, handleNext, playCurrentAudio]);

  if (loading) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center bg-white/95 dark:bg-zinc-900/95 rounded-3xl border border-zinc-200/90 dark:border-zinc-800">
        <Sparkles className="w-10 h-10 text-indigo-500 animate-spin mx-auto mb-3" />
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Dinleme Soruları Hazırlanıyor...</h3>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center bg-white/95 dark:bg-zinc-900/95 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 p-8">
        <Headphones className="w-12 h-12 text-zinc-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">Filtreye uygun kelime bulunamadı</h3>
      </div>
    );
  }

  if (isFinished) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl mx-auto bg-white/95 dark:bg-zinc-900/95 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 p-6 sm:p-8 text-center text-zinc-900 dark:text-white shadow-xl"
      >
        <div className="w-16 h-16 rounded-3xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4 border border-indigo-200 dark:border-indigo-800">
          <Award className="w-8 h-8" />
        </div>

        <h2 className="text-2xl font-black tracking-tight">Dinleme Pratiği Tamamlandı!</h2>
        <div className="my-6 py-6 bg-zinc-50 dark:bg-zinc-800/80 rounded-2xl border border-zinc-200/80 dark:border-zinc-700">
          <span className="text-5xl font-black">{percentage}%</span>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mt-1">{score} / {questions.length} Doğru</p>
        </div>

        {/* Mistakes Review with Audio Buttons */}
        {mistakes.length > 0 && (
          <div className="my-6 text-left border-t border-zinc-200 dark:border-zinc-800 pt-4">
            <button
              onClick={() => setShowMistakes(!showMistakes)}
              className="w-full flex items-center justify-between py-2 text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400"
            >
              <div className="flex items-center gap-1.5">
                <XCircle className="w-4 h-4" />
                <span>Yanlış Duyulan Kelimeleri İncele ({mistakes.length})</span>
              </div>
              {showMistakes ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showMistakes && (
              <div className="mt-2 space-y-2 max-h-56 overflow-y-auto pr-1">
                {mistakes.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-zinc-50 dark:bg-zinc-800/80 rounded-2xl border border-zinc-200/80 dark:border-zinc-700 text-xs flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-900 dark:text-white text-sm">
                          {m.correctAnswer}
                        </span>
                        <span className="text-zinc-400 text-[11px]">
                          (Seçiminiz: <span className="line-through text-rose-500">{m.selected}</span>)
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        {targetLang === 'tr' ? m.word.meaning_tr : m.word.meaning_en}
                      </p>
                    </div>

                    <button
                      onClick={() => speechService.speak(m.correctAnswer, 0.85)}
                      className="p-2 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-300 rounded-xl"
                      title="Tekrar dinle"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={generateListeningQuiz}
          className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Yeni Kelimelerle Tekrar Başlat</span>
        </motion.button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-4 text-zinc-900 dark:text-white">
      
      {/* Listening Header Bar */}
      <div className="bg-white/95 dark:bg-zinc-900/95 border border-zinc-200/90 dark:border-zinc-800 rounded-3xl p-4 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Headphones className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300">
            Dinleme Sorusu {currentIndex + 1} / {questions.length}
          </span>
        </div>

        {/* Audio Speed Selection */}
        <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs">
          <span className="text-[11px] font-semibold text-zinc-500">Hız:</span>
          {[0.75, 0.9, 1.0].map((rate) => (
            <button
              key={rate}
              onClick={() => {
                setPlaybackRate(rate);
                playCurrentAudio(rate);
              }}
              className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                playbackRate === rate ? 'bg-indigo-600 text-white' : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>
      </div>

      {/* Main Listening Card */}
      <div className="bg-white/95 dark:bg-zinc-900/95 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 shadow-[0_8px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] p-6 sm:p-8 text-center backdrop-blur-md">
        
        {/* Giant Speaker Audio Button */}
        <div className="py-4 sm:py-6 flex flex-col items-center">
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => playCurrentAudio()}
            className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-indigo-600 to-sky-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25 mb-3 group"
          >
            <Volume2 className="w-10 h-10 group-hover:scale-110 transition-transform" />
          </motion.button>
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Almanca Sesi Dinleyin (Tekrar: <kbd className="px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-800 rounded font-mono text-zinc-700 dark:text-zinc-300">Space</kbd> / <kbd className="px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-800 rounded font-mono text-zinc-700 dark:text-zinc-300">R</kbd>)
          </span>
        </div>

        {/* Revealed Word if submitted */}
        {isSubmitted && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
          >
            <h3 className="text-2xl font-black text-zinc-900 dark:text-white">
              {currentQ.word.word}
            </h3>
            {(currentQ.word.meaning_tr || currentQ.word.meaning_en) && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Anlam: <strong className="text-zinc-700 dark:text-zinc-200">{targetLang === 'tr' ? currentQ.word.meaning_tr : currentQ.word.meaning_en}</strong>
              </p>
            )}
          </motion.div>
        )}

        {/* 4 Choices */}
        <div className="space-y-2.5 mb-4">
          {currentQ.options.map((opt, idx) => {
            let btnClass = 'bg-zinc-50/90 dark:bg-zinc-800/80 hover:bg-zinc-100 dark:hover:bg-zinc-700 border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200';
            if (isSubmitted) {
              if (opt === currentQ.correctAnswer) {
                btnClass = 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-300 font-bold';
              } else if (opt === selectedOption) {
                btnClass = 'bg-rose-50 dark:bg-rose-950/60 border-rose-400 text-rose-900 dark:text-rose-300 font-bold';
              } else {
                btnClass = 'opacity-40 border-zinc-200 dark:border-zinc-800';
              }
            }

            return (
              <motion.button
                key={idx}
                whileHover={!isSubmitted ? { scale: 1.01 } : {}}
                whileTap={!isSubmitted ? { scale: 0.99 } : {}}
                onClick={() => handleSelectOption(opt)}
                disabled={isSubmitted}
                className={`w-full text-left px-5 py-3.5 rounded-2xl border-2 transition-all flex items-center justify-between text-sm ${btnClass}`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-lg bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 font-mono text-xs flex items-center justify-center font-bold">
                    {idx + 1}
                  </span>
                  <span className="font-semibold text-base">{opt}</span>
                </div>
                {isSubmitted && opt === currentQ.correctAnswer && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                )}
                {isSubmitted && opt === selectedOption && opt !== currentQ.correctAnswer && (
                  <XCircle className="w-5 h-5 text-rose-600" />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Next Button */}
        {isSubmitted && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleNext}
            className="w-full py-3.5 bg-zinc-900 dark:bg-indigo-600 hover:bg-zinc-800 dark:hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-sm"
          >
            <span>{currentIndex + 1 < questions.length ? 'Sonraki Kelime (İleri) →' : 'Sonuçları Gör'}</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        )}

      </div>

    </div>
  );
};
