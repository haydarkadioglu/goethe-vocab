import React, { useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { VocabWord, CEFRLevel, SupportedLanguage } from '../../types';
import { speechService } from '../../services/speech';
import { DrillSetup } from './DrillSetup';
import { DrillActive } from './DrillActive';
import { DrillResults } from './DrillResults';

interface SpeedDrillProps {
  words: VocabWord[];
  targetLang: SupportedLanguage;
}

export const SpeedDrill: React.FC<SpeedDrillProps> = ({ words, targetLang }) => {
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel>('ALL');
  const [targetCount, setTargetCount] = useState<number>(25);

  const nouns = useMemo(() => {
    return words.filter(w => {
      const isNounWithArticle = w.article && (w.article === 'der' || w.article === 'die' || w.article === 'das');
      if (!isNounWithArticle) return false;
      if (selectedLevel !== 'ALL' && w.level !== selectedLevel) return false;
      return true;
    });
  }, [words, selectedLevel]);

  const [drillMode, setDrillMode] = useState<'timer' | 'practice'>('practice');
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [duration, setDuration] = useState<number>(60);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    try {
      const saved = localStorage.getItem('goethe_drill_highscore');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [drillDeck, setDrillDeck] = useState<VocabWord[]>([]);
  
  const [answerState, setAnswerState] = useState<{
    answered: boolean;
    isCorrect: boolean;
    chosenArticle: string | null;
  }>({
    answered: false,
    isCorrect: false,
    chosenArticle: null,
  });

  const [correctWords, setCorrectWords] = useState<VocabWord[]>([]);
  const [mistakes, setMistakes] = useState<{ word: VocabWord; chosenArticle: string; correctArticle: string }[]>([]);
  const [isTimerPaused, setIsTimerPaused] = useState(false);

  const startGame = useCallback((customPool?: VocabWord[]) => {
    const pool = customPool ?? nouns;
    const count = customPool ? customPool.length : Math.min(Math.max(1, targetCount), pool.length || 1);
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, count);
    
    setDrillDeck(shuffled);
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setTimeLeft(duration);
    setCorrectWords([]);
    setMistakes([]);
    setIsTimerPaused(false);
    setAnswerState({ answered: false, isCorrect: false, chosenArticle: null });
    setGameState('playing');
  }, [nouns, targetCount, duration]);

  const finishGame = useCallback(() => {
    setGameState('gameover');
    if (score > highScore) {
      setHighScore(score);
      try {
        localStorage.setItem('goethe_drill_highscore', score.toString());
      } catch {}
      confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
    }
  }, [score, highScore]);

  // Timer countdown
  useEffect(() => {
    if (gameState !== 'playing' || drillMode !== 'timer' || isTimerPaused) return;

    if (timeLeft <= 0) {
      finishGame();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(t => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, drillMode, isTimerPaused, timeLeft, finishGame]);

  const currentWord = drillDeck[currentIndex];

  const handleNextWord = useCallback(() => {
    if (currentIndex + 1 >= drillDeck.length) {
      finishGame();
      return;
    }
    setAnswerState({ answered: false, isCorrect: false, chosenArticle: null });
    setIsTimerPaused(false);
    setCurrentIndex(i => i + 1);
  }, [currentIndex, drillDeck.length, finishGame]);

  const handleAnswer = useCallback((selectedArticle: 'der' | 'die' | 'das') => {
    if (gameState !== 'playing' || !currentWord || answerState.answered) return;

    const isCorrect = selectedArticle === currentWord.article;

    setAnswerState({
      answered: true,
      isCorrect,
      chosenArticle: selectedArticle,
    });

    speechService.speak(`${currentWord.article} ${currentWord.word.replace(/^(der|die|das)\s+/, '')}`);

    if (isCorrect) {
      const multiplier = streak >= 10 ? 3 : streak >= 5 ? 2 : 1;
      const points = 10 * multiplier;
      setScore(s => s + points);
      setStreak(st => {
        const next = st + 1;
        setBestStreak(b => Math.max(b, next));
        return next;
      });
      setCorrectWords(prev => [...prev, currentWord]);

      if (drillMode === 'timer') {
        setTimeout(() => {
          handleNextWord();
        }, 650);
      }
    } else {
      setStreak(0);
      setMistakes(prev => [
        ...prev,
        { word: currentWord, chosenArticle: selectedArticle, correctArticle: currentWord.article! }
      ]);

      if (drillMode === 'timer') {
        setIsTimerPaused(true);
      }
    }
  }, [gameState, currentWord, answerState.answered, streak, drillMode, handleNextWord]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;

      if (answerState.answered) {
        if (e.code === 'Space' || e.code === 'Enter' || e.code === 'ArrowRight') {
          e.preventDefault();
          handleNextWord();
        }
        return;
      }

      if (e.key === '1' || e.key.toLowerCase() === 'd') {
        handleAnswer('der');
      } else if (e.key === '2' || e.key.toLowerCase() === 'i') {
        handleAnswer('die');
      } else if (e.key === '3' || e.key.toLowerCase() === 'a') {
        handleAnswer('das');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, answerState.answered, handleAnswer, handleNextWord]);

  if (gameState === 'idle') {
    return (
      <DrillSetup
        nounsCount={nouns.length}
        targetCount={targetCount}
        setTargetCount={setTargetCount}
        selectedLevel={selectedLevel}
        setSelectedLevel={setSelectedLevel}
        drillMode={drillMode}
        setDrillMode={setDrillMode}
        duration={duration}
        setDuration={setDuration}
        onStart={() => startGame()}
      />
    );
  }

  if (gameState === 'gameover') {
    return (
      <DrillResults
        correctWords={correctWords}
        mistakes={mistakes}
        targetCount={targetCount}
        targetLang={targetLang}
        onRestartFull={() => startGame()}
        onPracticeMissed={(wordsToReview) => startGame(wordsToReview)}
        onChangeSettings={() => setGameState('idle')}
      />
    );
  }

  return (
    <DrillActive
      currentWord={currentWord}
      currentIndex={currentIndex}
      totalWords={drillDeck.length}
      drillMode={drillMode}
      timeLeft={timeLeft}
      isTimerPaused={isTimerPaused}
      score={score}
      streak={streak}
      targetLang={targetLang}
      answerState={answerState}
      onAnswer={handleAnswer}
      onNextWord={handleNextWord}
    />
  );
};
