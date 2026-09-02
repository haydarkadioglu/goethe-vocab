/**
 * Browser Local Database (IndexedDB with LocalStorage fallback)
 * Guarantees zero-backend durable client-side persistence for published static sites.
 */

const DB_NAME = 'GoetheVocabDB';
const DB_VERSION = 1;
const STORE_FAVORITES = 'favorites';
const STORE_LEARNED = 'learned';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not available'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_FAVORITES)) {
        db.createObjectStore(STORE_FAVORITES, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_LEARNED)) {
        db.createObjectStore(STORE_LEARNED, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export const localDb = {
  // --- FAVORITES ---
  async getFavorites(): Promise<string[]> {
    try {
      const db = await openDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_FAVORITES, 'readonly');
        const store = tx.objectStore(STORE_FAVORITES);
        const req = store.getAll();
        req.onsuccess = () => {
          const ids = (req.result || []).map((item: { id: string }) => item.id);
          resolve(ids);
        };
        req.onerror = () => {
          // Fallback to localStorage
          const local = localStorage.getItem('goethe_favorites');
          resolve(local ? JSON.parse(local) : []);
        };
      });
    } catch {
      const local = localStorage.getItem('goethe_favorites');
      return local ? JSON.parse(local) : [];
    }
  },

  async saveFavorites(ids: string[]): Promise<void> {
    try {
      // Sync to LocalStorage for dual redundancy
      localStorage.setItem('goethe_favorites', JSON.stringify(ids));

      const db = await openDB();
      const tx = db.transaction(STORE_FAVORITES, 'readwrite');
      const store = tx.objectStore(STORE_FAVORITES);
      store.clear();
      ids.forEach(id => store.put({ id, addedAt: Date.now() }));
    } catch (e) {
      console.warn('Error saving favorites to IndexedDB:', e);
    }
  },

  // --- LEARNED FLASHCARDS ---
  async getLearnedCards(): Promise<string[]> {
    try {
      const db = await openDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_LEARNED, 'readonly');
        const store = tx.objectStore(STORE_LEARNED);
        const req = store.getAll();
        req.onsuccess = () => {
          const ids = (req.result || []).map((item: { id: string }) => item.id);
          resolve(ids);
        };
        req.onerror = () => {
          const local = localStorage.getItem('goethe_learned');
          resolve(local ? JSON.parse(local) : []);
        };
      });
    } catch {
      const local = localStorage.getItem('goethe_learned');
      return local ? JSON.parse(local) : [];
    }
  },

  async saveLearnedCards(ids: string[]): Promise<void> {
    try {
      localStorage.setItem('goethe_learned', JSON.stringify(ids));
      const db = await openDB();
      const tx = db.transaction(STORE_LEARNED, 'readwrite');
      const store = tx.objectStore(STORE_LEARNED);
      store.clear();
      ids.forEach(id => store.put({ id, learnedAt: Date.now() }));
    } catch (e) {
      console.warn('Error saving learned cards to IndexedDB:', e);
    }
  }
};
