import React, { useState, useEffect, useCallback } from 'react';
import { Volume2, Headphones, ArrowRight, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { VocabWord, SupportedLanguage } from '../../types';
import { speechService } from '../../services/speech';
import { getWordMeaning } from '../../utils/meaning';
import { ListeningResults } from './ListeningResults';

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
  const [questionCount, setQuestionCount] = useState<number>(25);
  const [questions, setQuestions] = useState<ListeningQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [playbackRate, setPlaybackRate] = useState<number>(0.85);
  const [mistakes, setMistakes] = useState<ListeningMistake[]>([]);
  const [correctWords, setCorrectWords] = useState<VocabWord[]>([]);

  const generateListeningQuiz = useCallback((customPool?: VocabWord[], customCount?: number) => {
    const pool = customPool ?? words;
    const count = customCount ?? Math.min(questionCount, pool.length || 1);
    setLoading(true);
    setIsFinished(false);
    setCurrentIndex(0);
    setScore(0);
    setSelectedOption(null);
    setIsSubmitted(false);
    setMistakes([]);
    setCorrectWords([]);

    if (pool.length < 4) {
      setQuestions([]);
      setLoading(false);
      return;
    }

    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, count);
    const newQuestions: ListeningQuestion[] = shuffled.map(w => {
      const optsSet = new Set<string>([w.word]);

      const samePosCandidates = words
        .filter(x => x.id !== w.id && x.pos === w.pos)
        .sort(() => Math.random() - 0.5);

      for (const c of samePosCandidates) {
        if (!optsSet.has(c.word)) {
          optsSet.add(c.word);
          if (optsSet.size === 4) break;
        }
      }

      if (optsSet.size < 4) {
        const anyCandidates = words
          .filter(x => x.id !== w.id)
          .sort(() => Math.random() - 0.5);

        for (const c of anyCandidates) {
          if (!optsSet.has(c.word)) {
            optsSet.add(c.word);
            if (optsSet.size === 4) break;
          }
        }
      }

      const opts = Array.from(optsSet).sort(() => Math.random() - 0.5);

      return {
        word: w,
        options: opts,
        correctAnswer: w.word
      };
    });

    setQuestions(newQuestions);
    setLoading(false);
  }, [words, questionCount]);

  useEffect(() => {
    generateListeningQuiz();
  }, [generateListeningQuiz]);

  const currentQ = questions[currentIndex];

  const playCurrentAudio = useCallback((rateParam?: number) => {
    if (currentQ) {
      speechService.speak(currentQ.word.word, rateParam ?? playbackRate);
    }
  }, [currentQ, playbackRate]);

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
      setCorrectWords(prev => [...prev, currentQ.word]);
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
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    }
  }, [currentIndex, questions.length]);

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
      <div className="max-w-xl mx-auto py-16 sm:py-20 text-center bg-white/95 dark:bg-zinc-900/95 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 p-6">
        <Sparkles className="w-10 h-10 text-indigo-500 animate-spin mx-auto mb-3" />
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Generating Listening Questions...</h3>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center bg-white/95 dark:bg-zinc-900/95 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 p-6 sm:p-8">
        <Headphones className="w-12 h-12 text-zinc-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">No words match current filter</h3>
      </div>
    );
  }

  if (isFinished) {
    return (
      <ListeningResults
        questionsCount={questions.length}
        score={score}
        correctWords={correctWords}
        mistakes={mistakes}
        questionCount={questionCount}
        targetLang={targetLang}
        onPracticeMissed={(missedWords, count) => generateListeningQuiz(missedWords, count)}
        onRestartNew={() => generateListeningQuiz()}
      />
    );
  }

  const wordMeaning = currentQ ? getWordMeaning(currentQ.word, targetLang) : '';

  return (
    <div className="max-w-xl mx-auto space-y-4 text-zinc-900 dark:text-white">
      
      {/* Listening Header Bar */}
      <div className="bg-white/95 dark:bg-zinc-900/95 border border-zinc-200/90 dark:border-zinc-800 rounded-3xl p-3 sm:p-4 shadow-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Headphones className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50/90 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
            Score: {score}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs shrink-0">
            <span className="text-[10px] font-semibold text-zinc-500">Speed:</span>
            {[0.75, 0.9, 1.0].map((rate) => (
              <button
                key={rate}
                onClick={() => {
                  setPlaybackRate(rate);
                  playCurrentAudio(rate);
                }}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  playbackRate === rate ? 'bg-indigo-600 text-white' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>

          <div className="hidden sm:flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs shrink-0">
            <span className="text-[10px] font-semibold text-zinc-500">Words:</span>
            {[10, 25, 50].map((n) => (
              <button
                key={n}
                onClick={() => {
                  setQuestionCount(n);
                  generateListeningQuiz(undefined, n);
                }}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  questionCount === n ? 'bg-indigo-600 text-white' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Listening Card */}
      <div className="bg-white/95 dark:bg-zinc-900/95 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 shadow-[0_8px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] p-5 sm:p-8 text-center backdrop-blur-md">
        
        {/* Giant Speaker Audio Button */}
        <div className="py-4 sm:py-6 flex flex-col items-center">
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => playCurrentAudio()}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-indigo-600 to-sky-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25 mb-3 group"
          >
            <Volume2 className="w-8 h-8 sm:w-10 sm:h-10 group-hover:scale-110 transition-transform" />
          </motion.button>
          <span className="text-[11px] sm:text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Listen to German audio (Replay: <kbd className="px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-800 rounded font-mono text-zinc-700 dark:text-zinc-300">Space</kbd> / <kbd className="px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-800 rounded font-mono text-zinc-700 dark:text-zinc-300">R</kbd>)
          </span>
        </div>

        {/* Revealed Word if submitted */}
        {isSubmitted && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 sm:mb-6 p-3.5 sm:p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
          >
            <h3 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white">
              {currentQ.word.word}
            </h3>
            {wordMeaning && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Meaning: <strong className="text-zinc-700 dark:text-zinc-200">{wordMeaning}</strong>
              </p>
            )}
          </motion.div>
        )}

        {/* 4 Choices */}
        <div className="space-y-2 sm:space-y-2.5 mb-4">
          {currentQ.options.map((opt, idx) => {
            let btnClass = 'bg-zinc-50/90 dark:bg-zinc-800/80 hover:bg-zinc-100 dark:hover:bg-zinc-700 border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200';
            if (isSubmitted) {
              if (opt === currentQ.correctAnswer) {
                btnClass = 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-300 font-bold shadow-xs';
              } else if (opt === selectedOption) {
                btnClass = 'bg-rose-50 dark:bg-rose-950/60 border-rose-400 text-rose-900 dark:text-rose-300 font-bold';
              } else {
                btnClass = 'bg-zinc-50/40 dark:bg-zinc-900/40 border-zinc-200/60 dark:border-zinc-800 text-zinc-400 opacity-60';
              }
            }

            return (
              <motion.button
                key={idx}
                whileHover={!isSubmitted ? { scale: 1.01 } : {}}
                whileTap={!isSubmitted ? { scale: 0.99 } : {}}
                onClick={() => handleSelectOption(opt)}
                disabled={isSubmitted}
                className={`w-full text-left px-4 sm:px-5 py-3 sm:py-3.5 rounded-2xl border-2 transition-all flex items-center justify-between text-xs sm:text-sm ${btnClass}`}
              >
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <span className="w-5 h-5 rounded-lg bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 font-mono text-xs flex items-center justify-center font-bold shrink-0">
                    {idx + 1}
                  </span>
                  <span className="font-semibold">{opt}</span>
                </div>
                {isSubmitted && opt === currentQ.correctAnswer && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                )}
                {isSubmitted && opt === selectedOption && opt !== currentQ.correctAnswer && (
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Next Question / Finish Button */}
        {isSubmitted && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-3"
          >
            <span className="text-xs text-zinc-400 hidden sm:inline">
              Press <kbd className="px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-800 rounded font-mono text-zinc-700 dark:text-zinc-300">Space</kbd> or <kbd className="px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-800 rounded font-mono text-zinc-700 dark:text-zinc-300">Enter</kbd> to proceed
            </span>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNext}
              className="w-full sm:w-auto px-7 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-md transition-all text-xs sm:text-sm ml-auto flex items-center justify-center gap-2"
            >
              <span>{currentIndex + 1 < questions.length ? 'Next Word (Advance) →' : 'View Final Results 🏆'}</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        )}

      </div>

    </div>
  );
};
