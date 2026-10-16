// Where the rider left off: the open page and, on the Itinerary, the open
// town. Reopening the app picks up here instead of at the splash screen.

export type ActivePage = 'route' | 'map' | 'journal' | 'towns' | 'notes';

export interface SessionState {
  page: ActivePage;
  /** Town expanded on the Itinerary, if any */
  townId: string | null;
}

const STORAGE_KEY = 'tour-divide-session';
const PAGES: ActivePage[] = ['route', 'map', 'journal', 'towns', 'notes'];

/** The saved session, or null on a first launch. */
export function loadSession(): SessionState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const page = PAGES.includes(parsed?.page) ? parsed.page : 'route';
    const townId = typeof parsed?.townId === 'string' ? parsed.townId : null;
    return { page, townId };
  } catch {
    return null;
  }
}

export function saveSession(session: SessionState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // not critical
  }
}
