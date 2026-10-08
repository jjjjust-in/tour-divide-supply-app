import { get, set } from 'idb-keyval';

// Notes, resupplies and journal entries live in IndexedDB instead of
// localStorage. localStorage caps out around 5 MB, which a handful of
// journal photos would fill. IndexedDB gets a much larger quota and,
// once storage is marked persistent, the browser won't evict it.

export const STORAGE_KEYS = {
  notes: 'tour-divide-notes',
  resupplies: 'tour-divide-resupplies',
  journal: 'tour-divide-journal-entries',
} as const;

export type CollectionKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

/**
 * Load a collection. Order of preference:
 * 1. IndexedDB
 * 2. Legacy localStorage data (migrated into IndexedDB, then removed)
 * 3. The provided fallback (sample data on a true first launch)
 */
export async function loadCollection<T>(key: CollectionKey, fallback: T[]): Promise<T[]> {
  try {
    const stored = await get<T[]>(key);
    if (Array.isArray(stored)) return stored;
  } catch (err) {
    console.error(`Could not read ${key} from IndexedDB`, err);
  }

  let legacy: T[] | null = null;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) legacy = parsed;
    }
  } catch {
    // ignore unreadable legacy data
  }

  const initial = legacy ?? fallback;
  try {
    await set(key, initial);
    if (legacy) localStorage.removeItem(key);
  } catch (err) {
    console.error(`Could not write ${key} to IndexedDB`, err);
  }
  return initial;
}

let warnedAboutSaveFailure = false;

export async function saveCollection<T>(key: CollectionKey, items: T[]): Promise<void> {
  try {
    await set(key, items);
  } catch (err) {
    console.error(`Could not save ${key}`, err);
    if (!warnedAboutSaveFailure) {
      warnedAboutSaveFailure = true;
      alert('Could not save to this device. Storage may be full. Export a backup from the About page.');
    }
  }
}

/** Ask the browser not to evict our data under storage pressure. */
export async function requestPersistentStorage(): Promise<void> {
  try {
    if (navigator.storage?.persist && !(await navigator.storage.persisted())) {
      await navigator.storage.persist();
    }
  } catch {
    // not supported; data still saves, it just isn't guaranteed against eviction
  }
}

/**
 * Downscale a photo before saving it. A full-resolution phone photo is
 * several MB as a data URL; this keeps journal photos to roughly 150-400 KB.
 */
export function resizeImageFile(file: File, maxDimension = 1600, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
      const width = Math.round(img.width * scale);
      const height = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas not supported'));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read image'));
    };
    img.src = url;
  });
}
