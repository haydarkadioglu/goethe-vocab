import { SupportedLanguage } from '../types';

const CACHE_PREFIX = 'gt_trans_v1_';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', flag: '🇺🇦' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی', flag: '🇮🇷' },
] as const;

function decodeHtml(html: string): string {
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
}

function getCacheKey(text: string, targetLang: string): string {
  return `${CACHE_PREFIX}${targetLang}_${text.trim().toLowerCase()}`;
}

export async function translateText(text: string, targetLang: SupportedLanguage = 'en'): Promise<string> {
  const clean = text.trim();
  if (!clean) return '';
  
  // If target is German, return as is
  if (targetLang as string === 'de') return clean;

  // Check LocalStorage cache
  const cacheKey = getCacheKey(clean, targetLang);
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    // 1. Primary: MyMemory Free Translation API (CORS friendly)
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(clean)}&langpair=de|${targetLang}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data && data.responseData && data.responseData.translatedText) {
        let translation = decodeHtml(data.responseData.translatedText);
        // MyMemory sometimes returns warning messages like 'MYMEMORY WARNING:'
        if (!translation.toUpperCase().includes('MYMEMORY WARNING')) {
          localStorage.setItem(cacheKey, translation);
          return translation;
        }
      }
    }
  } catch (e) {
    console.warn('MyMemory API error, trying fallback...', e);
  }

  try {
    // 2. Fallback: Lingva Translate public proxy
    const fallbackUrl = `https://lingva.ml/api/v1/de/${targetLang}/${encodeURIComponent(clean)}`;
    const res = await fetch(fallbackUrl);
    if (res.ok) {
      const data = await res.json();
      if (data && data.translation) {
        const translation = decodeHtml(data.translation);
        localStorage.setItem(cacheKey, translation);
        return translation;
      }
    }
  } catch (e) {
    console.warn('Lingva fallback error...', e);
  }

  // If failed, return original with note
  return clean;
}

/**
 * Bulk translates a small list of strings with concurrency limit
 */
export async function batchTranslate(
  texts: string[],
  targetLang: SupportedLanguage,
  concurrency = 3
): Promise<Map<string, string>> {
  const results = new Map<string, string>();
  const toFetch: string[] = [];

  for (const t of texts) {
    const key = getCacheKey(t, targetLang);
    const cached = localStorage.getItem(key);
    if (cached) {
      results.set(t, cached);
    } else {
      toFetch.push(t);
    }
  }

  for (let i = 0; i < toFetch.length; i += concurrency) {
    const chunk = toFetch.slice(i, i + concurrency);
    await Promise.all(
      chunk.map(async (text) => {
        const trans = await translateText(text, targetLang);
        results.set(text, trans);
      })
    );
  }

  return results;
}
