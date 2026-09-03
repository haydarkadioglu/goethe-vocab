import { VocabWord, SupportedLanguage } from '../types';

export const getWordMeaning = (w?: VocabWord | null, targetLang: SupportedLanguage = 'en'): string => {
  if (!w) return '';
  if (targetLang === 'tr') return w.meaning_tr || w.meaning_en || '';
  if (targetLang === 'es') return w.meaning_es || w.meaning_en || '';
  if (targetLang === 'ar') return w.meaning_ar || w.meaning_en || '';
  return w.meaning_en || w.meaning_tr || '';
};
