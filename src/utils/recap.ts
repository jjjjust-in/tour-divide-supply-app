import type { JournalEntry, Resupply, Town } from '../types';

// Year-end recap: everything is computed from data already on the phone.

export interface RecapLap {
  title: string;
  time: number;
  recordedAt: number;
}

export interface RecapTimer {
  id: string;
  title: string;
  time: number;
  savedAt: number;
  type: 'finish' | 'scratch';
  laps: RecapLap[];
}

export interface RecapData {
  year: number;
  /** The ride this recap is built around: the year's finish, else its latest scratch */
  ride: RecapTimer | null;
  entries: JournalEntry[];
  /** Towns written about, in route order (southbound) */
  townsWritten: Town[];
  photos: string[];
  words: number;
  resupplies: number;
  firstDate: number | null;
  lastDate: number | null;
  /** A short excerpt worth putting on its own slide */
  highlight: { text: string; town: Town | null; timestamp: number } | null;
}

const yearOf = (ts: number) => new Date(ts).getFullYear();

export function loadSavedTimers(): RecapTimer[] {
  try {
    const raw = localStorage.getItem('saved-timers');
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Years that have anything to recap, newest first. */
export function recapYears(entries: JournalEntry[], timers: RecapTimer[]): number[] {
  const years = new Set<number>();
  entries.forEach((e) => years.add(yearOf(e.timestamp)));
  timers.forEach((t) => years.add(yearOf(t.savedAt)));
  return [...years].sort((a, b) => b - a);
}

const wordCount = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

/** Trim to whole words, ending with an ellipsis if shortened. */
export function excerpt(text: string, maxChars: number): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= maxChars) return clean;
  const cut = clean.slice(0, maxChars);
  return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:.\s]+$/, '')}…`;
}

export function buildRecap(
  year: number,
  data: { entries: JournalEntry[]; towns: Town[]; resupplies: Resupply[]; timers: RecapTimer[] },
): RecapData {
  const entries = data.entries.filter((e) => yearOf(e.timestamp) === year).sort((a, b) => a.timestamp - b.timestamp);

  const yearTimers = data.timers.filter((t) => yearOf(t.savedAt) === year).sort((a, b) => b.savedAt - a.savedAt);
  const ride = yearTimers.find((t) => t.type === 'finish') ?? yearTimers[0] ?? null;

  const writtenIds = new Set(entries.map((e) => e.townId).filter(Boolean));
  const townsWritten = data.towns.filter((t) => writtenIds.has(t.id)).sort((a, b) => a.mileage - b.mileage);

  const photos = entries.map((e) => e.imageUrl).filter((u): u is string => !!u);

  // Highlight: the longest entry, which is usually the one with the most to say
  const longest = [...entries].sort((a, b) => wordCount(b.content) - wordCount(a.content))[0];

  return {
    year,
    ride,
    entries,
    townsWritten,
    photos,
    words: entries.reduce((sum, e) => sum + wordCount(e.content), 0),
    resupplies: data.resupplies.filter((r) => yearOf(r.timestamp) === year).length,
    firstDate: entries[0]?.timestamp ?? null,
    lastDate: entries[entries.length - 1]?.timestamp ?? null,
    highlight: longest
      ? {
          text: longest.content,
          town: data.towns.find((t) => t.id === longest.townId) ?? null,
          timestamp: longest.timestamp,
        }
      : null,
  };
}

/** Whole days and hours, e.g. { days: 18, hours: 6, minutes: 41 } */
export function splitDuration(ms: number) {
  const totalMinutes = Math.floor(Math.max(0, ms) / 60000);
  return { days: Math.floor(totalMinutes / 1440), hours: Math.floor((totalMinutes % 1440) / 60), minutes: totalMinutes % 60 };
}
