/**
 * Progress Synchronization Service
 * Provides backend database persistence for user progress, enabling:
 * - Reliable cross-device continuity (e.g. tablet, laptop, phone)
 * - Safe protection against browser localStorage clearing
 * - Offline-first fallback: seamlessly updates localStorage immediately and syncs with backend in background
 */

export interface PersistedUserProgress {
  curriculum?: any;
  starsCount?: number;
  streakDays?: number;
  pointsState?: {
    pointsToday: number;
    pointsWeek: number;
    cumulativePoints: number;
    lastDate: string;
  };
  skippedExercises?: any[];
  pausedSession?: any;
  miniExamHistory?: any[];
  mistakes?: any[];
  claimedRewards?: number[];
  storyData?: Record<string, string>;
  lastSavedAt?: number;
}

export type SyncState = 'idle' | 'syncing' | 'synced' | 'offline' | 'error';

let syncTimeout: NodeJS.Timeout | null = null;
let lastSyncState: SyncState = 'idle';
const listeners: Array<(state: SyncState) => void> = [];

export function subscribeSyncStatus(listener: (state: SyncState) => void) {
  listeners.push(listener);
  listener(lastSyncState);
  return () => {
    const idx = listeners.indexOf(listener);
    if (idx !== -1) listeners.splice(idx, 1);
  };
}

function updateSyncStatus(newState: SyncState) {
  lastSyncState = newState;
  listeners.forEach((l) => {
    try {
      l(newState);
    } catch (err) {
      console.warn('Listener error in updateSyncStatus:', err);
    }
  });
}

/**
 * Loads user progress from the backend.
 * Returns null if backend has no data or is unreachable.
 */
export async function fetchRemoteProgress(userId: string = 'jedidiah'): Promise<PersistedUserProgress | null> {
  try {
    updateSyncStatus('syncing');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(`/api/progress/${encodeURIComponent(userId)}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json();
      updateSyncStatus('synced');
      return json.data || null;
    } else {
      updateSyncStatus('offline');
      return null;
    }
  } catch (e) {
    console.warn('Backend progress fetch failed (using local cache):', e);
    updateSyncStatus('offline');
    return null;
  }
}

/**
 * Debounced backend save: writes to backend API without blocking the UI.
 */
export function queueProgressSync(payload: PersistedUserProgress, userId: string = 'jedidiah') {
  if (syncTimeout) {
    clearTimeout(syncTimeout);
  }

  updateSyncStatus('syncing');

  syncTimeout = setTimeout(async () => {
    try {
      const res = await fetch(`/api/progress/${encodeURIComponent(userId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        updateSyncStatus('synced');
      } else {
        updateSyncStatus('offline');
      }
    } catch (err) {
      console.warn('Background sync to backend failed:', err);
      updateSyncStatus('offline');
    }
  }, 1200);
}
