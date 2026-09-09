/**
 * PWA Cache & Service Worker Cleanup Utility
 * Flushes stale browser caches and unregisters old service workers
 * without losing user learning data (favorites or learned words).
 */

export async function clearAppCacheAndReload(): Promise<void> {
  try {
    // 1. Delete all CacheStorage caches
    if (typeof window !== 'undefined' && 'caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));
    }

    // 2. Unregister all active Service Workers so the fresh build is fetched immediately
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));
    }
  } catch (error) {
    console.error('Failed to clear caches and service workers:', error);
  } finally {
    // 3. Force reload page
    window.location.reload();
  }
}
