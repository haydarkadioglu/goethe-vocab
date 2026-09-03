import React, { useState, useEffect, useCallback } from 'react';
import { Volume2, CheckCircle2, XCircle, RefreshCw, ArrowRight, Sparkles, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { VocabWord, SupportedLanguage } from '../../types';
import { speechService } from '../../services/speech';
import { translateText } from '../../services/translator';
import { QuizResults } from './QuizResults';

interface QuizProps {
  words: VocabWord[];
  targetLang: SupportedLanguage;
}

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

export const Quiz: React.FC<QuizProps> = ({ words, targetLang }) => {
  const [questionCount, setQuestionCount] = useState<number>(25);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userHistory, setUserHistory] = useState<UserAnswer[]>([]);

  const addMeaningQuestion = async (
    targetWord: VocabWord,
    pool: VocabWord[],
    qList: Question[],
    lang: SupportedLanguage
  ) => {
    try {
      let correctMeaning = '';
      if (lang === 'en' && targetWord.meaning_en) {
        correctMeaning = targetWord.meaning_en;
      } else if (lang === 'tr' && targetWord.meaning_tr) {
        correctMeaning = targetWord.meaning_tr;
      } else if (lang === 'es' && targetWord.meaning_es) {
        correctMeaning = targetWord.meaning_es;
      } else if (lang === 'ar' && targetWord.meaning_ar) {
        correctMeaning = targetWord.meaning_ar;
      } else {
        correctMeaning = await translateText(targetWord.word, lang);
      }

      const optsSet = new Set<string>([correctMeaning]);
      const candidates = pool
        .filter(x => x.id !== targetWord.id)
        .sort(() => Math.random() - 0.5);

      for (const d of candidates) {
        let m = '';
        if (lang === 'en' && d.meaning_en) m = d.meaning_en;
        else if (lang === 'tr' && d.meaning_tr) m = d.meaning_tr;
        else if (lang === 'es' && d.meaning_es) m = d.meaning_es;
        else if (lang === 'ar' && d.meaning_ar) m = d.meaning_ar;
        else m = await translateText(d.word, lang);

        if (m && !optsSet.has(m)) {
          optsSet.add(m);
          if (optsSet.size === 4) break;
        }
      }

      const allOpts = Array.from(optsSet).sort(() => Math.random() - 0.5);

      qList.push({
        type: 'meaning',
        prompt: lang === 'tr'
          ? `"${targetWord.word}" kelimesinin anlamı nedir?`
          : `What is the meaning of "${targetWord.word}"?`,
        subPrompt: targetWord.examples && targetWord.examples[0] ? `Example: "${targetWord.examples[0]}"` : undefined,
        options: allOpts,
        correctAnswer: correctMeaning,
        word: targetWord,
        explanation: `"${targetWord.word}" -> "${correctMeaning}".`
      });
    } catch {}
  };

  const generateQuiz = useCallback(async (customPoolWords?: VocabWord[], customCount?: number) => {
    const pool = customPoolWords ?? words;
    const totalToGenerate = customCount || Math.min(questionCount, pool.length || 1);
    setLoading(true);
    setIsFinished(false);
    setCurrentIndex(0);
    setScore(0);
    setSelectedOption(null);
    setIsSubmitted(false);
    setUserHistory([]);

    if (pool.length < 4) {
      setQuestions([]);
      setLoading(false);
      return;
    }

    const shuffledWords = [...pool].sort(() => Math.random() - 0.5).slice(0, totalToGenerate);
    const newQuestions: Question[] = [];

    for (const w of shuffledWords) {
      const bareNoun = w.word.replace(/^(der|die|das)\s+/, '').split(',')[0].trim();

      if (w.article && Math.random() > 0.4) {
        newQuestions.push({
          type: 'article',
          prompt: targetLang === 'tr' 
            ? `"${bareNoun}" isminin artikeli hangisidir?` 
            : `What is the correct grammatical gender article for "${bareNoun}"?`,
          subPrompt: w.examples && w.examples[0] ? `Example: "${w.examples[0]}"` : undefined,
          options: ['der', 'die', 'das'],
          correctAnswer: w.article,
          word: w,
          explanation: `German: "${w.article} ${w.word}". ${w.plural ? `Plural: ${w.plural}` : ''}`
        });
      } else if (w.examples && w.examples.length > 0 && Math.random() > 0.5) {
        const sentence = w.examples[0];
        const baseWord = bareNoun;
        const regex = new RegExp(`\\b${baseWord}\\w*`, 'i');
        if (regex.test(sentence)) {
          const blanked = sentence.replace(regex, '_______');
          const optsSet = new Set<string>([baseWord]);

          const candidates = words
            .filter(x => x.id !== w.id)
            .sort(() => Math.random() - 0.5);

          for (const c of candidates) {
            const clean = c.word.replace(/^(der|die|das)\s+/, '').split(',')[0].trim();
            if (clean && !optsSet.has(clean)) {
              optsSet.add(clean);
              if (optsSet.size === 4) break;
            }
          }

          const opts = Array.from(optsSet).sort(() => Math.random() - 0.5);

          newQuestions.push({
            type: 'fillIn',
            prompt: targetLang === 'tr'
              ? 'Goethe örnek cümlesindeki boşluğu doldurun:'
              : 'Fill in the blank in the authentic Goethe sentence:',
            subPrompt: blanked,
            options: opts,
            correctAnswer: baseWord,
            word: w,
            explanation: `Original Goethe sentence: "${sentence}"`
          });
        } else {
          await addMeaningQuestion(w, words, newQuestions, targetLang);
        }
      } else {
        await addMeaningQuestion(w, words, newQuestions, targetLang);
      }
    }

    setQuestions(newQuestions.slice(0, totalToGenerate));
    setLoading(false);
  }, [words, targetLang, questionCount]);

  useEffect(() => {
    generateQuiz();
  }, [generateQuiz]);

  const handleSelectOption = useCallback((option: string) => {
    if (isSubmitted || !questions[currentIndex]) return;
    setSelectedOption(option);
    setIsSubmitted(true);

    const isCorrect = option === questions[currentIndex].correctAnswer;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    setUserHistory(prev => [
      ...prev,
      { question: questions[currentIndex], selected: option, isCorrect }
    ]);
  }, [isSubmitted, questions, currentIndex]);

  const handleNextQuestion = useCallback(() => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
    } else {
      setIsFinished(true);
      confetti({ particleCount: 130, spread: 90, origin: { y: 0.6 } });
    }
  }, [currentIndex, questions.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;

      if (isSubmitted) {
        if (e.code === 'Space' || e.code === 'Enter') {
          e.preventDefault();
          handleNextQuestion();
        }
        return;
      }

      if (!questions[currentIndex]) return;
      const opts = questions[currentIndex].options;

      if (e.key === '1' && opts[0]) handleSelectOption(opts[0]);
      else if (e.key === '2' && opts[1]) handleSelectOption(opts[1]);
      else if (e.key === '3' && opts[2]) handleSelectOption(opts[2]);
      else if (e.key === '4' && opts[3]) handleSelectOption(opts[3]);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSubmitted, questions, currentIndex, handleSelectOption, handleNextQuestion]);

  if (loading) {
    return (
      <div className="max-w-xl mx-auto py-16 sm:py-20 text-center bg-white/95 dark:bg-zinc-900/95 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-6 sm:p-8">
        <Sparkles className="w-10 h-10 text-amber-500 animate-spin mx-auto mb-3" />
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Preparing Practice Quiz...</h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Generating {questionCount} questions from official Goethe wordlists</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center bg-white/95 dark:bg-zinc-900/95 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 shadow-xs p-6 sm:p-8">
        <HelpCircle className="w-12 h-12 text-zinc-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">Not enough words in current filter</h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Please reset search or select another level.</p>
      </div>
    );
  }

  if (isFinished) {
    return (
      <QuizResults
        questions={questions}
        userHistory={userHistory}
        score={score}
        questionCount={questionCount}
        onRetakeMissed={(missedWords, count) => generateQuiz(missedWords, count)}
        onRetakeNew={() => generateQuiz()}
      />
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="max-w-xl mx-auto space-y-4">
      
      {/* Quiz Configuration Bar */}
      <div className="bg-white/95 dark:bg-zinc-900/95 border border-zinc-200/90 dark:border-zinc-800 rounded-3xl p-3 sm:p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3">
          
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50/90 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200/80 dark:border-emerald-800">
              Score: {score}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-xl border border-zinc-200 dark:border-zinc-700">
              <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">Questions:</span>
              <input
                type="number"
                min={3}
                max={50}
                value={questionCount}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 5;
                  setQuestionCount(Math.min(Math.max(3, val), 50));
                }}
                className="w-12 bg-white dark:bg-zinc-900 text-xs font-black text-zinc-900 dark:text-white px-2 py-0.5 rounded-lg border border-zinc-300 dark:border-zinc-600 text-center focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div className="hidden sm:flex items-center gap-1">
              {[10, 25, 50].map((n) => (
                <button
                  key={n}
                  onClick={() => {
                    setQuestionCount(n);
                    generateQuiz(undefined, n);
                  }}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                    questionCount === n
                      ? 'bg-zinc-900 dark:bg-zinc-700 text-white'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
                  }`}
                >
                  {n}Q
                </button>
              ))}
            </div>

            <button
              onClick={() => generateQuiz(undefined, questionCount)}
              title="Restart with fresh questions"
              className="p-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white/95 dark:bg-zinc-900/95 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 shadow-[0_8px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] p-5 sm:p-8 backdrop-blur-md text-zinc-900 dark:text-white">
        
        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-zinc-200/70 dark:bg-zinc-800 rounded-full mb-5 sm:mb-6 overflow-hidden">
          <motion.div
            className="h-full bg-amber-500"
            animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Animated Question Transition */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Prompt */}
            <div className="mb-5 sm:mb-6 text-center">
              <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 mb-2">
                Level {currentQ.word.level}
              </span>
              <h3 className="text-base sm:text-lg font-black leading-snug">
                {currentQ.prompt}
              </h3>
              {currentQ.subPrompt && (
                <div className="mt-2.5 p-3 bg-zinc-50/90 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700 rounded-2xl text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 italic flex items-center justify-between gap-2">
                  <span>"{currentQ.subPrompt}"</span>
                  <button
                    onClick={() => speechService.speak(currentQ.word.word)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-amber-600 hover:bg-white dark:hover:bg-zinc-700 shrink-0 transition-colors"
                    title="Pronounce"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Options Grid */}
            <div className="space-y-2 sm:space-y-2.5 mb-5">
              {currentQ.options.map((opt, idx) => {
                let btnClass = 'bg-zinc-50/90 dark:bg-zinc-800/80 hover:bg-zinc-100/90 dark:hover:bg-zinc-700/80 border-zinc-200/80 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200';
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

            {/* Explanation & Next */}
            {isSubmitted && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-col gap-3"
              >
                <p className="text-xs text-zinc-600 dark:text-zinc-300 bg-zinc-50/90 dark:bg-zinc-800/80 p-3 rounded-2xl border border-zinc-200/80 dark:border-zinc-700">
                  💡 {currentQ.explanation}
                </p>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-zinc-400 hidden sm:inline">
                    Press <kbd className="px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-800 rounded font-mono text-zinc-700 dark:text-zinc-300">Space</kbd> or <kbd className="px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-800 rounded font-mono text-zinc-700 dark:text-zinc-300">Enter</kbd> to proceed
                  </span>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleNextQuestion}
                    className="w-full sm:w-auto px-7 py-3.5 bg-zinc-900 dark:bg-amber-500 hover:bg-zinc-800 dark:hover:bg-amber-600 text-white dark:text-zinc-950 font-bold rounded-2xl shadow-md transition-all text-xs sm:text-sm ml-auto flex items-center justify-center gap-2"
                  >
                    <span>{currentIndex + 1 < questions.length ? 'Next Question (Advance) →' : 'View Final Results 🏆'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

      </div>

    </div>
  );
};
