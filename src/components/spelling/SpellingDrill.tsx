import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Volume2, CheckCircle2, XCircle, ArrowRight, RefreshCw, PenTool, Sparkles, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { VocabWord, SupportedLanguage } from '../../types';
import { speechService } from '../../services/speech';
import { getWordMeaning } from '../../utils/meaning';

interface SpellingDrillProps {
  words: VocabWord[];
  targetLang: SupportedLanguage;
  onBackToHub?: () => void;
}

export const SpellingDrill: React.FC<SpellingDrillProps> = ({ words, targetLang, onBackToHub }) => {
  const [deck, setDeck] = useState<VocabWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputVal, setInputVal] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [correctWords, setCorrectWords] = useState<VocabWord[]>([]);
  const [mistakes, setMistakes] = useState<{ word: VocabWord; entered: string; expected: string }[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [targetCount, setTargetCount] = useState<number>(20);
  const [isSetup, setIsSetup] = useState(true);

  const inputRef = useRef<HTMLInputElement>(null);

  const specialChars = ['ä', 'ö', 'ü', 'ß', 'Ä', 'Ö', 'Ü'];

  const startDrill = useCallback((poolWords?: VocabWord[]) => {
    const pool = poolWords ?? words;
    if (pool.length === 0) return;
    const count = poolWords ? poolWords.length : Math.min(targetCount, pool.length);
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, count);

    setDeck(shuffled);
    setCurrentIndex(0);
    setInputVal('');
    setIsAnswered(false);
    setIsCorrect(false);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setCorrectWords([]);
    setMistakes([]);
    setIsFinished(false);
    setIsSetup(false);
  }, [words, targetCount]);

  const currentWord = deck[currentIndex];

  // Auto focus input and speak word on new card
  useEffect(() => {
    if (!isSetup && !isFinished && currentWord) {
      setInputVal('');
      setIsAnswered(false);
      setIsCorrect(false);
      const cleanWord = currentWord.word.replace(/^(der|die|das)\s+/i, '');
      speechService.speak(cleanWord);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [currentIndex, isSetup, isFinished, currentWord]);

  const handleInsertChar = (char: string) => {
    setInputVal(prev => prev + char);
    inputRef.current?.focus();
  };

  const handlePlayAudio = () => {
    if (!currentWord) return;
    const cleanWord = currentWord.word.replace(/^(der|die|das)\s+/i, '');
    speechService.speak(cleanWord);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isAnswered || !currentWord) return;

    const cleanInput = inputVal.trim();
    if (!cleanInput) return;

    const cleanTarget = currentWord.word.replace(/^(der|die|das)\s+/i, '').trim();
    
    // Check exact match (or case insensitive fallback)
    const exactMatch = cleanInput === cleanTarget;
    const caseMatch = cleanInput.toLowerCase() === cleanTarget.toLowerCase();
    const correct = exactMatch || caseMatch;

    setIsAnswered(true);
    setIsCorrect(correct);

    if (correct) {
      const multiplier = streak >= 5 ? 2 : 1;
      setScore(s => s + 10 * multiplier);
      setStreak(st => {
        const next = st + 1;
        setBestStreak(b => Math.max(b, next));
        return next;
      });
      setCorrectWords(prev => [...prev, currentWord]);
    } else {
      setStreak(0);
      setMistakes(prev => [
        ...prev,
        { word: currentWord, entered: cleanInput, expected: cleanTarget }
      ]);
    }

    speechService.speak(cleanTarget);
  };

  const handleNextWord = () => {
    if (currentIndex + 1 >= deck.length) {
      setIsFinished(true);
      if (score > 100) {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      }
      return;
    }
    setCurrentIndex(i => i + 1);
  };

  // Keyboard shortcut: Space or Enter when answered to go next
  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (isAnswered && (ev.code === 'Enter' || ev.code === 'ArrowRight')) {
        ev.preventDefault();
        handleNextWord();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isAnswered, handleNextWord]);

  // SETUP SCREEN
  if (isSetup) {
    return (
      <div className="max-w-2xl mx-auto py-8 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20 shadow-sm">
          <PenTool className="w-8 h-8" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
          Schreibtrainer: Almanca Yazma & İmla
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
          Almanca telaffuzunu dinle veya anlamını oku; kelimeyi klavyenden hatasız yazarak Goethe sınavlarındaki yazım hatalarının önüne geç.
        </p>

        <div className="bg-white/95 dark:bg-zinc-900/95 rounded-3xl border border-zinc-200/90 dark:border-zinc-800/90 p-6 shadow-xs max-w-md mx-auto space-y-5">
          <div className="text-left">
            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 block mb-2">
              Soru Sayısı:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[10, 20, 30].map(cnt => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => setTargetCount(cnt)}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all border ${
                    targetCount === cnt
                      ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs'
                      : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                  }`}
                >
                  {cnt} Kelime
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => startDrill()}
            disabled={words.length === 0}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-2"
          >
            <span>Alıştırmaya Başla ({words.length} kelimeden)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // RESULTS SCREEN
  if (isFinished) {
    const accuracy = Math.round((correctWords.length / deck.length) * 100) || 0;

    return (
      <div className="max-w-2xl mx-auto py-8 space-y-6">
        <div className="bg-white/95 dark:bg-zinc-900/95 rounded-3xl border border-zinc-200/90 dark:border-zinc-800/90 p-8 shadow-xs text-center space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
            <Sparkles className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-black text-zinc-900 dark:text-white">
            Alıştırma Tamamlandı!
          </h2>

          <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/80 rounded-2xl border border-zinc-200/80 dark:border-zinc-700">
              <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">{score}</div>
              <div className="text-[10px] font-bold text-zinc-400 uppercase">Puan</div>
            </div>
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/80 rounded-2xl border border-zinc-200/80 dark:border-zinc-700">
              <div className="text-xl font-black text-zinc-800 dark:text-zinc-200">%{accuracy}</div>
              <div className="text-[10px] font-bold text-zinc-400 uppercase">Doğruluk</div>
            </div>
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/80 rounded-2xl border border-zinc-200/80 dark:border-zinc-700">
              <div className="text-xl font-black text-amber-500">🔥 {bestStreak}</div>
              <div className="text-[10px] font-bold text-zinc-400 uppercase">En İyi Seri</div>
            </div>
          </div>

          {mistakes.length > 0 && (
            <div className="text-left pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <h4 className="text-xs font-bold text-rose-500 uppercase tracking-wider mb-2">
                Hatalı Yazılan Kelimeler ({mistakes.length}):
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {mistakes.map((m, idx) => (
                  <div key={idx} className="p-2.5 bg-rose-50/60 dark:bg-rose-950/40 rounded-xl border border-rose-200/60 dark:border-rose-900/40 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-zinc-900 dark:text-white mr-2">{m.expected}</span>
                      <span className="text-zinc-500 dark:text-zinc-400">({getWordMeaning(m.word, targetLang)})</span>
                    </div>
                    <div className="text-rose-600 dark:text-rose-400 font-mono line-through">
                      {m.entered}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-4">
            {mistakes.length > 0 && (
              <button
                onClick={() => startDrill(mistakes.map(m => m.word))}
                className="w-full sm:flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xs"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Hataları Tekrar Et ({mistakes.length})</span>
              </button>
            )}
            <button
              onClick={() => startDrill()}
              className="w-full sm:flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xs"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Yeni Test Başlat</span>
            </button>
            {onBackToHub && (
              <button
                onClick={onBackToHub}
                className="w-full sm:w-auto px-5 py-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold text-xs rounded-2xl transition-all"
              >
                Pratik Merkezine Dön
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ACTIVE DRILL
  const expectedClean = currentWord ? currentWord.word.replace(/^(der|die|das)\s+/i, '').trim() : '';

  return (
    <div className="max-w-2xl mx-auto py-6 space-y-6">
      
      {/* Top Bar: Progress, Score & Streak */}
      <div className="flex items-center justify-between text-xs font-bold text-zinc-600 dark:text-zinc-400">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-xl bg-zinc-200/80 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-mono">
            {currentIndex + 1} / {deck.length}
          </span>
          <span className="px-2 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px]">
            {currentWord?.level}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {streak > 1 && (
            <motion.span
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="text-amber-500 font-extrabold"
            >
              🔥 {streak}x Seri
            </motion.span>
          )}
          <span className="text-zinc-800 dark:text-zinc-200 font-mono">
            Puan: <strong className="text-emerald-600 dark:text-emerald-400">{score}</strong>
          </span>
        </div>
      </div>

      {/* Main Card */}
      <motion.div
        key={currentWord?.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/95 dark:bg-zinc-900/95 rounded-3xl border border-zinc-200/90 dark:border-zinc-800/90 p-6 sm:p-10 shadow-xs text-center space-y-6"
      >
        {/* Audio Button */}
        <div>
          <button
            onClick={handlePlayAudio}
            type="button"
            className="w-16 h-16 rounded-full bg-emerald-500 text-white hover:bg-emerald-600 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/30 hover:scale-105 transition-all"
            title="Kelimeyi Dinle"
          >
            <Volume2 className="w-8 h-8" />
          </button>
          <p className="text-[11px] font-semibold text-zinc-400 mt-2">
            Dinlemek için tıkla (veya otomatik oynatıldı)
          </p>
        </div>

        {/* Clues */}
        <div className="space-y-1">
          <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            {currentWord?.pos ? `Tür: ${currentWord.pos}` : 'Almanca Kelime'}
            {currentWord?.article && ` • (${currentWord.article})`}
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">
            {getWordMeaning(currentWord, targetLang)}
          </h3>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              disabled={isAnswered}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Almanca kelimeyi buraya yaz..."
              autoCapitalize="none"
              autoComplete="off"
              spellCheck="false"
              className={`w-full text-center text-lg sm:text-xl font-bold py-3.5 px-4 rounded-2xl border transition-all focus:outline-none ${
                isAnswered
                  ? isCorrect
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-800 dark:text-emerald-200'
                    : 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-800 dark:text-rose-200'
                  : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
              }`}
            />
          </div>

          {/* German Special Character Toolbar */}
          {!isAnswered && (
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
              {specialChars.map(char => (
                <button
                  key={char}
                  type="button"
                  onClick={() => handleInsertChar(char)}
                  className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-sm border border-zinc-200/80 dark:border-zinc-700 transition-all hover:scale-105 active:scale-95"
                >
                  {char}
                </button>
              ))}
            </div>
          )}

          {/* Action Button */}
          {!isAnswered ? (
            <button
              type="submit"
              disabled={!inputVal.trim()}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm rounded-2xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
            >
              <span>Kontrol Et</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className={`p-4 rounded-2xl flex items-center justify-between text-left ${
                isCorrect ? 'bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800' : 'bg-rose-100 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800'
              }`}>
                <div className="flex items-center gap-3">
                  {isCorrect ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0" />
                  )}
                  <div>
                    <div className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                      {isCorrect ? 'Tebrikler! Doğru Yazdın' : 'Doğru Cevap:'}
                    </div>
                    <div className="text-base font-black text-zinc-900 dark:text-white">
                      {currentWord.article ? `${currentWord.article} ` : ''}{expectedClean}
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleNextWord}
                className="w-full py-3.5 bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-700 text-white font-bold text-sm rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2"
              >
                <span>Sonraki Kelime</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </form>
      </motion.div>

    </div>
  );
};

