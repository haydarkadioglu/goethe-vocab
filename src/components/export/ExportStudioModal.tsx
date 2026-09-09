import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Printer, Download, Copy, Check, Star, Layers, FileText, 
  Scissors, Columns, BookOpen, Sparkles, FileSpreadsheet, Eye
} from 'lucide-react';
import { VocabWord, SupportedLanguage, CEFRLevel } from '../../types';
import { getWordMeaning } from '../../utils/meaning';

interface ExportStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  allWords: VocabWord[];
  favorites: string[];
  targetLang: SupportedLanguage;
  initialPool?: 'favorites' | 'filtered' | 'A1' | 'A2' | 'B1' | 'ALL';
  filteredWords?: VocabWord[];
}

export type ExportFormat = 'foldable' | 'duplex' | 'cheat-sheet' | 'notes-md' | 'notes-txt';

export const ExportStudioModal: React.FC<ExportStudioModalProps> = ({
  isOpen,
  onClose,
  allWords,
  favorites,
  targetLang,
  initialPool = 'favorites',
  filteredWords = [],
}) => {
  const [selectedPool, setSelectedPool] = useState<'favorites' | 'filtered' | 'A1' | 'A2' | 'B1' | 'ALL'>(initialPool);
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('foldable');
  const [itemLimit, setItemLimit] = useState<number | 'all'>(40);
  const [copied, setCopied] = useState(false);

  // Compute word pool based on selection
  const poolWords = useMemo(() => {
    let list: VocabWord[] = [];
    if (selectedPool === 'favorites') {
      list = allWords.filter(w => favorites.includes(w.id));
    } else if (selectedPool === 'filtered') {
      list = filteredWords.length > 0 ? filteredWords : allWords;
    } else if (selectedPool === 'ALL') {
      list = allWords;
    } else {
      list = allWords.filter(w => w.level === selectedPool);
    }

    if (itemLimit === 'all') return list;
    return list.slice(0, itemLimit);
  }, [allWords, favorites, filteredWords, selectedPool, itemLimit]);

  const poolCounts = useMemo(() => {
    return {
      favorites: favorites.length,
      filtered: filteredWords.length,
      a1: allWords.filter(w => w.level === 'A1').length,
      a2: allWords.filter(w => w.level === 'A2').length,
      b1: allWords.filter(w => w.level === 'B1').length,
      all: allWords.length,
    };
  }, [allWords, favorites, filteredWords]);

  // Generate Markdown text
  const markdownContent = useMemo(() => {
    const title = `# Goethe German Vocabulary (${selectedPool.toUpperCase()})\n\n`;
    const summary = `Generated from GoetheVocab • Total words: ${poolWords.length} • Target Language: ${targetLang.toUpperCase()}\n\n`;
    const tableHeader = `| Level | Article | Word | Plural | Meaning (${targetLang.toUpperCase()}) | Example Sentence |\n|:---:|:---:|:---|:---|:---|:---|\n`;
    
    const rows = poolWords.map(w => {
      const art = w.article || '-';
      const pl = w.plural || '-';
      const meaning = getWordMeaning(w, targetLang).replace(/\|/g, '/');
      const ex = (w.examples?.[0] || '-').replace(/\|/g, '/');
      return `| ${w.level} | ${art} | **${w.word}** | ${pl} | ${meaning} | ${ex} |`;
    }).join('\n');

    return title + summary + tableHeader + rows;
  }, [poolWords, selectedPool, targetLang]);

  // Generate Plain Text for Notes Apps
  const plainTextContent = useMemo(() => {
    const header = `=== GOETHE GERMAN VOCABULARY (${selectedPool.toUpperCase()}) ===\nTotal Words: ${poolWords.length}\n\n`;
    const items = poolWords.map((w, idx) => {
      const art = w.article ? `${w.article} ` : '';
      const pl = w.plural ? ` (${w.plural})` : '';
      const meaning = getWordMeaning(w, targetLang);
      const ex = w.examples?.[0] ? `\n   Beispiel: "${w.examples[0]}"` : '';
      return `${idx + 1}. [${w.level}] ${art}${w.word}${pl} - ${meaning}${ex}`;
    }).join('\n\n');

    return header + items;
  }, [poolWords, selectedPool, targetLang]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: `${mime};charset=utf-8;` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      
      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-5xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
      >
        
        {/* Modal Header (No Print) */}
        <div className="no-print p-4 sm:p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-white tracking-tight">
                Print & Export Studio
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Create cuttable flashcards, A4 cheat sheets, or export to Notion / Apple Notes.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Controls Bar (No Print) */}
        <div className="no-print p-4 bg-white/60 dark:bg-zinc-950/40 border-b border-zinc-200/80 dark:border-zinc-800/80 space-y-3 shrink-0">
          
          {/* Top Selection Row: Pool & Limits */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            
            {/* Word Pool Selector */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mr-1">
                Source Pool:
              </span>
              
              <button
                onClick={() => setSelectedPool('favorites')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                  selectedPool === 'favorites'
                    ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                    : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-amber-400'
                }`}
              >
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>Starred ({poolCounts.favorites})</span>
              </button>

              {filteredWords.length > 0 && (
                <button
                  onClick={() => setSelectedPool('filtered')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    selectedPool === 'filtered'
                      ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                      : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                  }`}
                >
                  <span>Current Filter ({poolCounts.filtered})</span>
                </button>
              )}

              {(['A1', 'A2', 'B1', 'ALL'] as const).map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setSelectedPool(lvl)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    selectedPool === lvl
                      ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 shadow-xs'
                      : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                  }`}
                >
                  <span>{lvl}</span>
                </button>
              ))}
            </div>

            {/* Word Quantity Limit */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
                Limit:
              </span>
              {[20, 40, 80, 160, 'all' as const].map(lim => (
                <button
                  key={lim}
                  onClick={() => setItemLimit(lim)}
                  className={`px-2 py-1 rounded-lg text-xs font-mono font-bold transition-all border ${
                    itemLimit === lim
                      ? 'bg-zinc-800 dark:bg-zinc-200 text-white dark:text-zinc-900 border-zinc-800 dark:border-zinc-200'
                      : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
                  }`}
                >
                  {lim === 'all' ? 'All' : lim}
                </button>
              ))}
            </div>

          </div>

          {/* Bottom Selection Row: Output Formats & Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60">
            
            {/* Format Pills */}
            <div className="flex items-center gap-1 flex-wrap">
              <button
                onClick={() => setSelectedFormat('foldable')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  selectedFormat === 'foldable'
                    ? 'bg-rose-500 text-white border-rose-600 shadow-xs'
                    : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                }`}
              >
                <Scissors className="w-3.5 h-3.5" />
                <span>Foldable Cards (Side-by-Side)</span>
              </button>

              <button
                onClick={() => setSelectedFormat('duplex')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  selectedFormat === 'duplex'
                    ? 'bg-rose-500 text-white border-rose-600 shadow-xs'
                    : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                <span>Duplex Cards (Front/Back)</span>
              </button>

              <button
                onClick={() => setSelectedFormat('cheat-sheet')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  selectedFormat === 'cheat-sheet'
                    ? 'bg-rose-500 text-white border-rose-600 shadow-xs'
                    : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>A4 Cheat Sheet (Table)</span>
              </button>

              <button
                onClick={() => setSelectedFormat('notes-md')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  selectedFormat === 'notes-md'
                    ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                    : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Notion / Markdown (.md)</span>
              </button>

              <button
                onClick={() => setSelectedFormat('notes-txt')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  selectedFormat === 'notes-txt'
                    ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                    : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Apple Notes (.txt)</span>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {['foldable', 'duplex', 'cheat-sheet'].includes(selectedFormat) ? (
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-md shadow-amber-500/25 transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print / Save as PDF</span>
                </button>
              ) : selectedFormat === 'notes-md' ? (
                <>
                  <button
                    onClick={() => handleCopy(markdownContent)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-xs rounded-xl transition-all"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Copied!' : 'Copy Markdown'}</span>
                  </button>
                  <button
                    onClick={() => handleDownload(markdownContent, `goethe_vocab_${selectedPool.toLowerCase()}.md`, 'text/markdown')}
                    className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download .md</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleCopy(plainTextContent)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-xs rounded-xl transition-all"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Copied!' : 'Copy Text'}</span>
                  </button>
                  <button
                    onClick={() => handleDownload(plainTextContent, `goethe_vocab_${selectedPool.toLowerCase()}.txt`, 'text/plain')}
                    className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download .txt</span>
                  </button>
                </>
              )}
            </div>

          </div>

        </div>

        {/* Modal Body / Live Preview Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-zinc-200/70 dark:bg-zinc-950/70">
          
          {poolWords.length === 0 ? (
            <div className="no-print text-center py-20 bg-white dark:bg-zinc-900 rounded-3xl p-8 max-w-md mx-auto">
              <Star className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">
                No words in this selection
              </h3>
              <p className="text-xs text-zinc-500 mt-1">
                Please choose another pool (e.g. A1, A2, B1, or All Words).
              </p>
            </div>
          ) : (
            <div className="printable-area max-w-[210mm] mx-auto bg-white text-black shadow-lg rounded-2xl p-6 sm:p-8 min-h-[297mm]">
              
              {/* PRINT FORMAT 1: FOLDABLE CARDS (SIDE-BY-SIDE) */}
              {selectedFormat === 'foldable' && (
                <div className="space-y-4">
                  <div className="no-print mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                    💡 <strong>Instructions:</strong> Cut along the outer solid border, then fold along the middle dashed line ✂️ to get instant double-sided study flashcards!
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {poolWords.map((word) => (
                      <div
                        key={word.id}
                        className="avoid-break border-2 border-dashed border-zinc-400 rounded-2xl overflow-hidden bg-white text-black flex flex-row min-h-[140px]"
                      >
                        {/* Front Half (German Headword) */}
                        <div className="flex-1 p-3.5 flex flex-col justify-between border-r-2 border-dashed border-zinc-300 bg-zinc-50/50">
                          <div>
                            <div className="flex items-center justify-between gap-1 mb-1.5">
                              {word.article ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-zinc-200 text-zinc-800 font-mono">
                                  {word.article}
                                </span>
                              ) : (
                                <span className="text-[10px] uppercase font-bold text-zinc-400">
                                  {word.pos}
                                </span>
                              )}
                              <span className="text-[10px] font-bold text-zinc-500">
                                {word.level}
                              </span>
                            </div>
                            <h4 className="text-lg font-black text-black leading-tight">
                              {word.word}
                            </h4>
                            {word.plural && (
                              <p className="text-xs text-zinc-600 mt-0.5 font-medium">
                                Plural: <strong className="text-black">{word.plural}</strong>
                              </p>
                            )}
                          </div>

                          {word.forms && (
                            <p className="text-[10px] text-zinc-500 italic mt-2">
                              {word.forms}
                            </p>
                          )}
                        </div>

                        {/* Middle Fold Indicator */}
                        <div className="relative flex flex-col items-center justify-center w-0">
                          <span className="absolute text-[8px] bg-white text-zinc-400 font-mono -rotate-90 select-none">
                            ✂️ fold
                          </span>
                        </div>

                        {/* Back Half (Meaning & Example) */}
                        <div className="flex-1 p-3.5 flex flex-col justify-between bg-white">
                          <div>
                            <span className="text-[9px] font-bold uppercase text-zinc-400 block mb-1">
                              Meaning ({targetLang.toUpperCase()}):
                            </span>
                            <p className="text-sm font-bold text-black leading-tight mb-2">
                              {getWordMeaning(word, targetLang)}
                            </p>
                            {word.examples?.[0] && (
                              <p className="text-[11px] text-zinc-700 italic leading-snug border-l-2 border-amber-300 pl-2 mt-2">
                                "{word.examples[0]}"
                              </p>
                            )}
                          </div>

                          <div className="text-[9px] text-zinc-400 text-right mt-2 font-mono">
                            GoetheVocab
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PRINT FORMAT 2: DUPLEX CARDS (FRONT/BACK PAGES) */}
              {selectedFormat === 'duplex' && (
                <div className="space-y-8">
                  <div className="no-print mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900">
                    💡 <strong>Duplex Instructions:</strong> Page 1 contains the German front cards. Page 2 contains mirrored back cards. Set your printer to double-sided printing (flip on short edge).
                  </div>

                  {/* Page 1: Fronts */}
                  <div className="space-y-4">
                    <div className="text-xs font-black uppercase tracking-wider text-zinc-400 border-b pb-1">
                      Page 1: Front Sides (German Headwords)
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {poolWords.map((word) => (
                        <div
                          key={`front-${word.id}`}
                          className="avoid-break border-2 border-dashed border-zinc-400 rounded-xl p-4 min-h-[115px] flex flex-col justify-between bg-white"
                        >
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-zinc-200 text-zinc-900 font-mono">
                              {word.article || word.pos}
                            </span>
                            <span className="text-[10px] font-bold text-zinc-500">{word.level}</span>
                          </div>
                          <div className="my-2">
                            <h4 className="text-xl font-black text-black">{word.word}</h4>
                            {word.plural && (
                              <p className="text-xs text-zinc-600 font-medium">
                                Pl: <strong>{word.plural}</strong>
                              </p>
                            )}
                          </div>
                          <div className="text-[9px] text-zinc-400 font-mono">Goethe-Institut</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Page 2: Mirrored Backs */}
                  <div className="page-break-before space-y-4 pt-6">
                    <div className="text-xs font-black uppercase tracking-wider text-zinc-400 border-b pb-1">
                      Page 2: Back Sides (Translations & Examples)
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {poolWords.map((word) => (
                        <div
                          key={`back-${word.id}`}
                          className="avoid-break border-2 border-dashed border-zinc-400 rounded-xl p-4 min-h-[115px] flex flex-col justify-between bg-zinc-50"
                        >
                          <div>
                            <span className="text-[9px] font-bold text-zinc-400 uppercase block mb-1">
                              Meaning ({targetLang.toUpperCase()}):
                            </span>
                            <h4 className="text-sm font-bold text-black mb-1.5">
                              {getWordMeaning(word, targetLang)}
                            </h4>
                            {word.examples?.[0] && (
                              <p className="text-[10px] text-zinc-600 italic leading-snug">
                                "{word.examples[0]}"
                              </p>
                            )}
                          </div>
                          <div className="text-[9px] text-zinc-400 text-right font-mono">GoetheVocab</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* PRINT FORMAT 3: A4 CHEAT SHEET (TABLE) */}
              {selectedFormat === 'cheat-sheet' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-4">
                    <div>
                      <h3 className="text-xl font-black tracking-tight text-black">
                        🇩🇪 Goethe German Vocabulary Sheet
                      </h3>
                      <p className="text-xs text-zinc-600">
                        Pool: {selectedPool} • Total Words: {poolWords.length} • Translation: {targetLang.toUpperCase()}
                      </p>
                    </div>
                    <div className="text-right text-[10px] text-zinc-500 font-mono">
                      Generated via GoetheVocab
                    </div>
                  </div>

                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b-2 border-zinc-800 bg-zinc-100 text-zinc-900 font-black">
                        <th className="py-2 px-2 w-12 text-center">Level</th>
                        <th className="py-2 px-2 w-14">Article</th>
                        <th className="py-2 px-2 w-36">Word</th>
                        <th className="py-2 px-2 w-28">Plural / Forms</th>
                        <th className="py-2 px-2 w-44">Meaning ({targetLang.toUpperCase()})</th>
                        <th className="py-2 px-2">Example Sentence</th>
                      </tr>
                    </thead>
                    <tbody>
                      {poolWords.map((word, idx) => (
                        <tr
                          key={word.id}
                          className={`avoid-break border-b border-zinc-200 ${
                            idx % 2 === 0 ? 'bg-white' : 'bg-zinc-50'
                          }`}
                        >
                          <td className="py-2 px-2 text-center font-bold text-[10px] text-zinc-600">
                            {word.level}
                          </td>
                          <td className="py-2 px-2 font-mono font-bold text-zinc-800">
                            {word.article || '-'}
                          </td>
                          <td className="py-2 px-2 font-bold text-black text-sm">
                            {word.word}
                          </td>
                          <td className="py-2 px-2 text-[11px] text-zinc-700">
                            {word.plural || word.forms || '-'}
                          </td>
                          <td className="py-2 px-2 font-semibold text-zinc-900">
                            {getWordMeaning(word, targetLang)}
                          </td>
                          <td className="py-2 px-2 text-[11px] text-zinc-600 italic">
                            {word.examples?.[0] || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* FORMAT 4: NOTION / MARKDOWN (.MD) PREVIEW */}
              {selectedFormat === 'notes-md' && (
                <div className="space-y-4">
                  <div className="no-print p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-900 flex items-center justify-between">
                    <span>
                      📋 Ready to paste directly into <strong>Notion</strong>, <strong>Obsidian</strong>, or <strong>Logseq</strong>.
                    </span>
                    <button
                      onClick={() => handleCopy(markdownContent)}
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-all text-xs flex items-center gap-1"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <pre className="p-4 bg-zinc-900 text-zinc-100 rounded-2xl text-xs font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[500px]">
                    {markdownContent}
                  </pre>
                </div>
              )}

              {/* FORMAT 5: APPLE NOTES / PLAIN TEXT (.TXT) PREVIEW */}
              {selectedFormat === 'notes-txt' && (
                <div className="space-y-4">
                  <div className="no-print p-3 bg-zinc-100 border border-zinc-300 rounded-xl text-xs text-zinc-800 flex items-center justify-between">
                    <span>
                      📋 Ready for <strong>Apple Notes</strong>, <strong>Google Keep</strong>, or standard text files.
                    </span>
                    <button
                      onClick={() => handleCopy(plainTextContent)}
                      className="px-3 py-1 bg-zinc-800 hover:bg-zinc-900 text-white font-bold rounded-lg transition-all text-xs flex items-center gap-1"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <pre className="p-4 bg-zinc-100 text-zinc-900 border border-zinc-300 rounded-2xl text-xs font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[500px]">
                    {plainTextContent}
                  </pre>
                </div>
              )}

            </div>
          )}

        </div>

      </motion.div>

    </div>
  );
};
