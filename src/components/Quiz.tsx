import React, { useState, useEffect } from 'react';
import { Volume2, Award, CheckCircle2, XCircle, RefreshCw, ArrowRight, Sparkles, HelpCircle, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { VocabWord, SupportedLanguage } from '../types';
import { speechService } from '../services/speech';
import { translateText } from '../services/translator';

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

export const Quiz: React.FC<QuizProps> = ({ words, targetLang }) => {
  // Configurable number of questions
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [loading, setLoading] = useState(true);

  const generateQuiz = async (customCount?: number) => {
    const totalToGenerate = customCount || questionCount;
    setLoading(true);
    setIsFinished(false);
    setCurrentIndex(0);
    setScore(0);
    setSelectedOption(null);
    setIsSubmitted(false);

    if (words.length < 4) {
      setQuestions([]);
      setLoading(false);
      return;
    }

    const shuffledWords = [...words].sort(() => Math.random() - 0.5).slice(0, totalToGenerate);
    const newQuestions: Question[] = [];

    for (const w of shuffledWords) {
      if (w.article && Math.random() > 0.4) {
        newQuestions.push({
          type: 'article',
          prompt: `Which article belongs to the noun: "${w.word.replace(/^(der|die|das)\s+/, '')}"?`,
          subPrompt: w.examples && w.examples[0] ? `Example: ${w.examples[0]}` : undefined,
          options: ['der', 'die', 'das'],
          correctAnswer: w.article,
          word: w,
          explanation: `In German: "${w.article} ${w.word}". ${w.plural ? `Plural: ${w.plural}` : ''}`
        });
      } else if (w.examples && w.examples.length > 0 && Math.random() > 0.5) {
        const sentence = w.examples[0];
        const baseWord = w.word.replace(/^(der|die|das)\s+/, '').split(',')[0].trim();
        const regex = new RegExp(`\\b${baseWord}\\w*`, 'i');
        if (regex.test(sentence)) {
          const blanked = sentence.replace(regex, '_______');
          const distractors = words
            .filter(x => x.id !== w.id && x.pos === w.pos)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3)
            .map(x => x.word.replace(/^(der|die|das)\s+/, '').split(',')[0].trim());

          const opts = [baseWord, ...distractors].sort(() => Math.random() - 0.5);

          newQuestions.push({
            type: 'fillIn',
            prompt: 'Fill in the blank from this Goethe sentence:',
            subPrompt: blanked,
            options: opts,
            correctAnswer: baseWord,
            word: w,
            explanation: `Authentic Goethe sentence: "${sentence}"`
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
  };

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
      } else {
        correctMeaning = await translateText(targetWord.word, lang);
      }

      const distractorsRaw = pool
        .filter(x => x.id !== targetWord.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      const distractorMeanings = await Promise.all(
        distractorsRaw.map(async d => {
          if (lang === 'en' && d.meaning_en) return d.meaning_en;
          return await translateText(d.word, lang);
        })
      );

      const allOpts = Array.from(new Set([correctMeaning, ...distractorMeanings])).sort(() => Math.random() - 0.5);

      qList.push({
        type: 'meaning',
        prompt: `What does "${targetWord.word}" mean?`,
        subPrompt: targetWord.examples && targetWord.examples[0] ? `Example: ${targetWord.examples[0]}` : undefined,
        options: allOpts,
        correctAnswer: correctMeaning,
        word: targetWord,
        explanation: `"${targetWord.word}" translates to "${correctMeaning}".`
      });
    } catch {}
  };

  useEffect(() => {
    generateQuiz();
  }, [words, targetLang]);

  const handleSelectOption = (option: string) => {
    if (isSubmitted) return;
    setSelectedOption(option);
    setIsSubmitted(true);

    const isCorrect = option === questions[currentIndex].correctAnswer;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
    } else {
      setIsFinished(true);
      confetti({
        particleCount: 130,
        spread: 90,
        origin: { y: 0.6 }
      });
    }
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center bg-white/95 dark:bg-zinc-900/95 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
        <Sparkles className="w-10 h-10 text-amber-500 animate-spin mx-auto mb-3" />
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Preparing Practice Quiz...</h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Generating {questionCount} questions from official Goethe wordlists</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center bg-white/95 dark:bg-zinc-900/95 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 shadow-xs">
        <HelpCircle className="w-12 h-12 text-zinc-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">Not enough words to generate a quiz</h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Please reset search or select another level.</p>
      </div>
    );
  }

  if (isFinished) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg mx-auto bg-white/95 dark:bg-zinc-900/95 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 shadow-[0_12px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.5)] p-8 text-center text-zinc-900 dark:text-white"
      >
        <div className="w-16 h-16 rounded-3xl bg-amber-100/80 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-200/80 dark:border-amber-800 shadow-xs">
          <Award className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black tracking-tight">Quiz Complete!</h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Great practice on your German vocabulary</p>

        <div className="my-6 py-6 bg-zinc-50/90 dark:bg-zinc-800/80 rounded-2xl border border-zinc-200/70 dark:border-zinc-700">
          <span className="text-5xl font-black">{percentage}%</span>
          <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mt-1">
            {score} of {questions.length} Correct
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => generateQuiz()}
            className="flex-1 w-full flex items-center justify-center gap-2 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl shadow-md shadow-amber-500/20 transition-all text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retake with {questionCount} Questions</span>
          </motion.button>
        </div>
      </motion.div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="max-w-xl mx-auto space-y-4">
      
      {/* Quiz Configuration Bar */}
      <div className="bg-white/95 dark:bg-zinc-900/95 border border-zinc-200/90 dark:border-zinc-800 rounded-3xl p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50/90 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200/80 dark:border-emerald-800">
              Score: {score}
            </span>
          </div>

          {/* User Custom Question Count Input & Presets */}
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
              {[5, 10, 20].map((n) => (
                <button
                  key={n}
                  onClick={() => {
                    setQuestionCount(n);
                    generateQuiz(n);
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
              onClick={() => generateQuiz(questionCount)}
              title="Restart Quiz with new questions"
              className="p-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white/95 dark:bg-zinc-900/95 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 shadow-[0_8px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] p-6 sm:p-8 backdrop-blur-md text-zinc-900 dark:text-white">
        
        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-zinc-200/70 dark:bg-zinc-800 rounded-full mb-6 overflow-hidden">
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
            <div className="mb-6 text-center">
              <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 mb-2">
                Level {currentQ.word.level}
              </span>
              <h3 className="text-lg font-black leading-snug">
                {currentQ.prompt}
              </h3>
              {currentQ.subPrompt && (
                <div className="mt-3 p-3 bg-zinc-50/90 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700 rounded-2xl text-sm font-medium text-zinc-700 dark:text-zinc-300 italic flex items-center justify-between gap-2">
                  <span>"{currentQ.subPrompt}"</span>
                  <button
                    onClick={() => speechService.speak(currentQ.word.word)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-amber-600 hover:bg-white dark:hover:bg-zinc-700 shrink-0 transition-colors"
                    title="Pronounce word"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Options Grid */}
            <div className="space-y-2.5 mb-6">
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
                    className={`w-full text-left px-5 py-3.5 rounded-2xl border-2 transition-all flex items-center justify-between text-sm ${btnClass}`}
                  >
                    <span className="font-semibold">{opt}</span>
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

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleNextQuestion}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-700 text-white font-bold rounded-2xl shadow-md transition-all text-sm"
                >
                  <span>{currentIndex + 1 < questions.length ? 'Next Question' : 'View Results'}</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

      </div>

    </div>
  );
};
