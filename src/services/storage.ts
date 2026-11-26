/**
 * Backend-swappable persistence adapter.
 * SWAP POINT: Replace localStorage calls with Firebase Firestore / Supabase client queries
 * while keeping the exact same service signatures across /src/services/*.ts.
 */
const STORAGE_PREFIX = 'edupick_v3_';

export function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
  } catch {
    // Ignore storage quota issues cleanly
  }
}
