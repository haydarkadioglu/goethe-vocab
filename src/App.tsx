import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from './components/common/Header';
import { MobileNav } from './components/common/MobileNav';
import { Footer } from './components/common/Footer';
import { FilterBar } from './components/common/FilterBar';
import { VocabCard } from './components/dictionary/VocabCard';
import { Pagination } from './components/dictionary/Pagination';
import { Flashcards } from './components/flashcards/Flashcards';
import { SpeedDrill } from './components/speed-drill/SpeedDrill';
import { ListeningQuiz } from './components/listening/ListeningQuiz';
import { Quiz } from './components/quiz/Quiz';
import { HomePage } from './components/home/HomePage';
import { PracticeHub } from './components/practice/PracticeHub';
import { SpellingDrill } from './components/spelling/SpellingDrill';
import { ProgressHub } from './components/progress/ProgressHub';
import { VocabWord, CEFRLevel, PartOfSpeech, AppView, SupportedLanguage, ThemeMode } from './types';
import { localDb } from './services/storage';
import { speechService } from './services/speech';
import { Sparkles, ArrowLeft } from 'lucide-react';

const viewToHash: Record<AppView, string> = {
  home: 'home',
  explorer: 'dictionary',
  dictionary: 'dictionary',
  practice: 'practice',
  'speed-drill': 'practice/drill',
  flashcards: 'practice/flashcards',
  quiz: 'practice/quiz',
  listening: 'practice/listening',
  spelling: 'practice/spelling',
  progress: 'progress',
  favorites: 'progress',
};

const hashToView: Record<string, AppView> = {
  '': 'home',
  '#': 'home',
  '#home': 'home',
  '#dictionary': 'explorer',
  '#explorer': 'explorer',
  '#practice': 'practice',
  '#practice/drill': 'speed-drill',
  '#practice/flashcards': 'flashcards',
  '#practice/quiz': 'quiz',
  '#practice/listening': 'listening',
  '#practice/spelling': 'spelling',
  '#speed-drill': 'speed-drill',
  '#flashcards': 'flashcards',
  '#quiz': 'quiz',
  '#listening': 'listening',
  '#spelling': 'spelling',
  '#progress': 'progress',
  '#favorites': 'progress',
};

export const App: React.FC = () => {
  const [allWords, setAllWords] = useState<VocabWord[]>([]);
  const [loading, setLoading] = useState(true);
  
  // URL Hash Sync for initial view
  const [currentView, setCurrentView] = useState<AppView>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      if (hashToView[hash]) return hashToView[hash];
    }
    return 'home';
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel>('ALL');
  const [selectedPos, setSelectedPos] = useState<PartOfSpeech>('all');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [targetLang, setTargetLang] = useState<SupportedLanguage>('en');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;

  // Theme Management
  const [theme, setTheme] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('goethe_theme') as ThemeMode;
      if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
    } catch {}
    return 'system';
  });

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      const isDark = theme === 'dark' || (theme === 'system' && mediaQuery.matches);
      if (isDark) root.classList.add('dark');
      else root.classList.remove('dark');
    };

    applyTheme();
    const handler = () => {
      if (theme === 'system') applyTheme();
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prev => {
      let next: ThemeMode = 'system';
      if (prev === 'system') next = 'light';
      else if (prev === 'light') next = 'dark';
      else next = 'system';

      try {
        localStorage.setItem('goethe_theme', next);
      } catch {}
      return next;
    });
  };

  // Favorites & Learned Cards from local storage / IndexedDB
  const [favorites, setFavorites] = useState<string[]>([]);
  const [learnedCards, setLearnedCards] = useState<string[]>([]);

  useEffect(() => {
    localDb.getFavorites().then(ids => {
      setFavorites(ids);
    });
    localDb.getLearnedCards().then(ids => {
      setLearnedCards(ids);
    });
  }, []);

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('goethe_target_lang') as SupportedLanguage;
      if (savedLang) setTargetLang(savedLang);
    } catch {}
  }, []);

  const handleChangeLang = (lang: SupportedLanguage) => {
    setTargetLang(lang);
    try {
      localStorage.setItem('goethe_target_lang', lang);
    } catch {}
  };

  const handleToggleFavorite = (id: string) => {
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localDb.saveFavorites(next);
      return next;
    });
  };

  // Browser back/forward navigation support
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      const matched = hashToView[hash];
      if (matched && matched !== currentView) {
        setCurrentView(matched);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentView]);

  const handleSelectView = (view: AppView) => {
    speechService.stop();
    setCurrentView(view);
    const targetHash = '#' + (viewToHash[view] || 'home');
    if (window.location.hash !== targetHash) {
      window.location.hash = targetHash;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('./data/goethe_vocab.json');
        if (res.ok) {
          const data: VocabWord[] = await res.json();
          setAllWords(data);
        } else {
          console.error('Failed to load goethe_vocab.json');
        }
      } catch (err) {
        console.error('Error fetching vocabulary data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const counts = useMemo(() => {
    return {
      all: allWords.length,
      a1: allWords.filter(w => w.level === 'A1').length,
      a2: allWords.filter(w => w.level === 'A2').length,
      b1: allWords.filter(w => w.level === 'B1').length,
    };
  }, [allWords]);

  const dictionaryFilteredWords = useMemo(() => {
    return allWords.filter(w => {
      if (showOnlyFavorites && !favorites.includes(w.id)) return false;
      if (selectedLevel !== 'ALL' && w.level !== selectedLevel) return false;
      if (selectedPos !== 'all' && w.pos !== selectedPos) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchWord = w.word.toLowerCase().includes(q);
        const matchEn = w.meaning_en && w.meaning_en.toLowerCase().includes(q);
        const matchTr = w.meaning_tr && w.meaning_tr.toLowerCase().includes(q);
        const matchEs = w.meaning_es && w.meaning_es.toLowerCase().includes(q);
        const matchAr = w.meaning_ar && w.meaning_ar.toLowerCase().includes(q);
        const matchForms = w.forms && w.forms.toLowerCase().includes(q);
        const matchPlural = w.plural && w.plural.toLowerCase().includes(q);
        const matchExamples = w.examples && w.examples.some(ex => ex.toLowerCase().includes(q));
        return matchWord || matchEn || matchTr || matchEs || matchAr || matchForms || matchPlural || matchExamples;
      }
      return true;
    });
  }, [allWords, showOnlyFavorites, favorites, selectedLevel, selectedPos, searchQuery]);

  const studyPoolWords = useMemo(() => {
    return allWords.filter(w => {
      if (showOnlyFavorites && !favorites.includes(w.id)) return false;
      if (selectedLevel !== 'ALL' && w.level !== selectedLevel) return false;
      if (selectedPos !== 'all' && w.pos !== selectedPos) return false;
      return true;
    });
  }, [allWords, showOnlyFavorites, favorites, selectedLevel, selectedPos]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedLevel, selectedPos, searchQuery, showOnlyFavorites, currentView]);

  const totalPages = Math.ceil(dictionaryFilteredWords.length / itemsPerPage) || 1;
  const paginatedWords = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return dictionaryFilteredWords.slice(start, start + itemsPerPage);
  }, [dictionaryFilteredWords, currentPage]);

  const handleRandomWord = () => {
    if (dictionaryFilteredWords.length === 0) return;
    const randomIdx = Math.floor(Math.random() * dictionaryFilteredWords.length);
    const word = dictionaryFilteredWords[randomIdx];
    setSearchQuery(word.word);
    handleSelectView('explorer');
  };

  const handleNavigateFromHome = (view: AppView, level?: CEFRLevel) => {
    if (level) setSelectedLevel(level);
    handleSelectView(view);
  };

  const handleDownloadCSV = () => {
    const headers = ['id', 'level', 'word', 'meaning_en', 'meaning_tr', 'meaning_es', 'meaning_ar', 'full_entry', 'article', 'pos', 'plural', 'forms', 'examples', 'page'];
    const rows = dictionaryFilteredWords.map(w => [
      `"${w.id}"`,
      `"${w.level}"`,
      `"${w.word.replace(/"/g, '""')}"`,
      `"${(w.meaning_en || '').replace(/"/g, '""')}"`,
      `"${(w.meaning_tr || '').replace(/"/g, '""')}"`,
      `"${(w.meaning_es || '').replace(/"/g, '""')}"`,
      `"${(w.meaning_ar || '').replace(/"/g, '""')}"`,
      `"${(w.full_entry || '').replace(/"/g, '""')}"`,
      `"${w.article || ''}"`,
      `"${w.pos || ''}"`,
      `"${w.plural || ''}"`,
      `"${(w.forms || '').replace(/"/g, '""')}"`,
      `"${(w.examples || []).join(' || ').replace(/"/g, '""')}"`,
      `"${w.page}"`,
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `goethe_vocab_${selectedLevel.toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadJSON = () => {
    const jsonStr = JSON.stringify(dictionaryFilteredWords, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `goethe_vocab_${selectedLevel.toLowerCase()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const highScore = useMemo(() => {
    try {
      const saved = localStorage.getItem('goethe_drill_highscore');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  }, []);

  const isPracticeSubMode = ['speed-drill', 'flashcards', 'quiz', 'listening', 'spelling'].includes(currentView);
  const isDictActive = currentView === 'explorer' || currentView === 'dictionary';

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 flex flex-col items-center justify-center p-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-2xl shadow-lg shadow-amber-500/25 mb-4 animate-bounce border border-white/40">
          🇩🇪
        </div>
        <h2 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">Goethe Almanca Yükleniyor...</h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-medium">Yerel veri tabanına bağlanılıyor</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100/90 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col bg-grid-pattern selection:bg-amber-200 selection:text-amber-900 dark:selection:bg-amber-900 dark:selection:text-amber-100 transition-colors">
      
      {/* Header */}
      <Header
        currentView={currentView}
        onSelectView={handleSelectView}
        targetLang={targetLang}
        onChangeLang={handleChangeLang}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        favoritesCount={favorites.length}
        totalWords={allWords.length}
        filteredCount={dictionaryFilteredWords.length}
        onDownloadCSV={handleDownloadCSV}
        onDownloadJSON={handleDownloadJSON}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 pb-28 lg:pb-10">
        
        {/* Practice Breadcrumb / Return to Practice Hub button */}
        {isPracticeSubMode && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 flex items-center justify-between"
          >
            <button
              onClick={() => handleSelectView('practice')}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/90 dark:bg-zinc-900/90 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300 border border-zinc-200/90 dark:border-zinc-800 shadow-xs transition-all hover:scale-102"
            >
              <ArrowLeft className="w-4 h-4 text-amber-500" />
              <span>← Pratik Merkezine Dön</span>
            </button>
            <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 hidden sm:inline">
              Seviye: <strong className="text-amber-600 dark:text-amber-400">{selectedLevel}</strong>
            </span>
          </motion.div>
        )}

        {/* Filter Controls (Dictionary Explorer) */}
        {isDictActive && (
          <FilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedLevel={selectedLevel}
            onSelectLevel={setSelectedLevel}
            selectedPos={selectedPos}
            onSelectPos={setSelectedPos}
            counts={counts}
            onRandomWord={handleRandomWord}
            showOnlyFavorites={showOnlyFavorites}
            onToggleOnlyFavorites={() => setShowOnlyFavorites(p => !p)}
            favoritesCount={favorites.length}
            onPracticeFiltered={() => handleSelectView('flashcards')}
            filteredCount={dictionaryFilteredWords.length}
          />
        )}

        {/* Animated View Container */}
        <AnimatePresence mode="wait">
          
          {/* 1. HOME VIEW */}
          {currentView === 'home' && (
            <motion.div
              key="home-view"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <HomePage
                onNavigate={handleNavigateFromHome}
                counts={counts}
              />
            </motion.div>
          )}

          {/* 2. VOCABULARY DICTIONARY (EXPLORER) */}
          {isDictActive && (
            <motion.div
              key="explorer-view"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              {dictionaryFilteredWords.length === 0 ? (
                <div className="text-center py-20 bg-white/95 dark:bg-zinc-900/95 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 shadow-[0_4px_24px_-6px_rgba(0,0,0,0.04)] max-w-xl mx-auto p-6">
                  <Sparkles className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">Filtrelere uygun kelime bulunamadı</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Arama metnini temizlemeyi veya "Tüm Seviyeler"i seçmeyi deneyin.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedLevel('ALL');
                      setSelectedPos('all');
                      setShowOnlyFavorites(false);
                    }}
                    className="mt-4 px-4 py-2 bg-zinc-900 dark:bg-zinc-800 text-white rounded-xl text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors shadow-xs"
                  >
                    Tüm Filtreleri Sıfırla
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {paginatedWords.map((word, idx) => (
                      <VocabCard
                        key={word.id}
                        word={word}
                        targetLang={targetLang}
                        isFavorite={favorites.includes(word.id)}
                        onToggleFavorite={handleToggleFavorite}
                        index={idx}
                      />
                    ))}
                  </div>

                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={dictionaryFilteredWords.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                  />
                </>
              )}
            </motion.div>
          )}

          {/* 3. PRACTICE HUB (PRATİK MERKEZİ) */}
          {currentView === 'practice' && (
            <motion.div
              key="practice-hub-view"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <PracticeHub
                onSelectMode={handleSelectView}
                selectedLevel={selectedLevel}
                onSelectLevel={setSelectedLevel}
                counts={counts}
                learnedCount={learnedCards.length}
                favoritesCount={favorites.length}
                highScore={highScore}
              />
            </motion.div>
          )}

          {/* 3.1 SPEED DRILL ("Der, Die, Das" Refleks) */}
          {currentView === 'speed-drill' && (
            <motion.div
              key="speed-drill-view"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <SpeedDrill words={allWords} targetLang={targetLang} />
            </motion.div>
          )}

          {/* 3.2 FLASHCARDS (3D Kartlar) */}
          {currentView === 'flashcards' && (
            <motion.div
              key="flashcards-view"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <Flashcards
                words={studyPoolWords}
                targetLang={targetLang}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
              />
            </motion.div>
          )}

          {/* 3.3 QUIZ */}
          {currentView === 'quiz' && (
            <motion.div
              key="quiz-view"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <Quiz
                words={studyPoolWords}
                targetLang={targetLang}
              />
            </motion.div>
          )}

          {/* 3.4 LISTENING (Hörverstehen) */}
          {currentView === 'listening' && (
            <motion.div
              key="listening-view"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <ListeningQuiz
                words={studyPoolWords}
                targetLang={targetLang}
              />
            </motion.div>
          )}

          {/* 3.5 SCHREIBTRAINER (Yazma & İmla Modu) */}
          {currentView === 'spelling' && (
            <motion.div
              key="spelling-view"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <SpellingDrill
                words={studyPoolWords}
                targetLang={targetLang}
                onBackToHub={() => handleSelectView('practice')}
              />
            </motion.div>
          )}

          {/* 4. PROGRESS & SAVED (İLERLEMEM & KAYITLAR) */}
          {(currentView === 'progress' || currentView === 'favorites') && (
            <motion.div
              key="progress-view"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <ProgressHub
                allWords={allWords}
                favorites={favorites}
                learnedCards={learnedCards}
                onToggleFavorite={handleToggleFavorite}
                targetLang={targetLang}
                onNavigateToPractice={handleSelectView}
                onNavigateToDictionary={(lvl) => {
                  if (lvl) setSelectedLevel(lvl);
                  handleSelectView('explorer');
                }}
              />
            </motion.div>
          )}

        </AnimatePresence>

      </main>

      {/* Modern Footer */}
      <Footer />

      {/* Mobile Fixed Bottom Navigation Bar (4 Ergonomic Pillars) */}
      <MobileNav
        currentView={currentView}
        onSelectView={handleSelectView}
        favoritesCount={favorites.length}
      />

    </div>
  );
};
