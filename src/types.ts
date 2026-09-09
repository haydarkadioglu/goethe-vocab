export type CEFRLevel = 'ALL' | 'A1' | 'A2' | 'B1';

export type PartOfSpeech = 'all' | 'noun' | 'verb' | 'adjective' | 'adverb' | 'preposition' | 'conjunction' | 'other';

export interface VocabWord {
  id: string;
  level: 'A1' | 'A2' | 'B1';
  word: string;
  meaning_en?: string;
  meaning_tr?: string;
  meaning_es?: string;
  meaning_ar?: string;
  full_entry: string;
  article: 'der' | 'die' | 'das' | null;
  pos: string;
  plural: string | null;
  forms: string;
  examples: string[];
  page: number;
}

export type SupportedLanguage = 
  | 'en' // English (Default)
  | 'tr' // Turkish
  | 'es' // Spanish
  | 'fr' // French
  | 'it' // Italian
  | 'ru' // Russian
  | 'ar' // Arabic
  | 'uk' // Ukrainian
  | 'pl' // Polish
  | 'fa'; // Persian

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
}

export type NavTab = 'home' | 'dictionary' | 'practice' | 'progress';

export type PracticeMode = 'drill' | 'flashcards' | 'quiz' | 'listening' | 'spelling';

export type AppView = 
  | 'home' 
  | 'explorer' 
  | 'dictionary'
  | 'practice'
  | 'progress'
  | 'speed-drill' 
  | 'flashcards' 
  | 'quiz' 
  | 'listening' 
  | 'spelling'
  | 'favorites';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface QuizQuestion {
  id: string;
  word: VocabWord;
  prompt: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}
