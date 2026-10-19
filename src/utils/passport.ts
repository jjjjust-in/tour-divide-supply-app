import type { JournalEntry, Town } from '../types';
import { ROUTE_POIS } from '../data/passes';
import { rideMile, ROUTE_TOTAL_MILES, type RideDirection } from './direction';
import type { RecapTimer } from './recap';

// The Ride Passport: a stamp for every town, every climb and ten milestones.
// Stamps earn themselves from how far along the route the rider has got
// (journal entries, GPS while the ride timer runs, states recorded on the
// timer) and the rider can stamp anything by hand.

export type StampKind = 'town' | 'climb' | 'milestone';
export type StampSource = 'journal' | 'gps' | 'timer' | 'hand';

export interface Stamp {
  id: string;
  kind: StampKind;
  name: string;
  /** Short line inside the stamp, e.g. "MT" or "11,958'" */
  badge: string;
  /** Miles from the rider's start */
  ride: number;
  earnedAt: number | null;
  source: StampSource | null;
}

const STATE_NAMES: Record<string, string> = { MT: 'Montana', ID: 'Idaho', WY: 'Wyoming', CO: 'Colorado', NM: 'New Mexico' };
const BORDER_MILE = 255; // southbound route mile of the US / Canada border

// ---------- what the rider has stamped by hand, and how far GPS has seen them ----------

const HAND_KEY = 'tour-divide-passport';
const GPS_KEY = 'tour-divide-passport-gps';

type ByYear<T> = Record<string, T>;
function read<T>(key: string): ByYear<T> {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}
function write<T>(key: string, value: ByYear<T>) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // not critical
  }
}

export function loadHandStamps(year: number): Record<string, number> {
  return read<Record<string, number>>(HAND_KEY)[year] ?? {};
}
export function saveHandStamps(year: number, stamps: Record<string, number>) {
  write(HAND_KEY, { ...read<Record<string, number>>(HAND_KEY), [year]: stamps });
}

/** Furthest ride mile GPS has placed the rider on route this year, while the ride timer ran. */
export function loadGpsProgress(year: number): { ride: number; at: number } | null {
  return read<{ ride: number; at: number }>(GPS_KEY)[year] ?? null;
}
export function recordGpsProgress(year: number, ride: number) {
  const all = read<{ ride: number; at: number }>(GPS_KEY);
  const prev = all[year];
  if (prev && prev.ride >= ride) return;
  write(GPS_KEY, { ...all, [year]: { ride, at: prev?.at && prev.ride > 0 ? prev.at : Date.now() } });
}

/** True while the stopwatch (not the countdown) is running. */
export function rideTimerRunning(): boolean {
  try {
    const saved = JSON.parse(localStorage.getItem('stopwatch') ?? 'null');
    return !!saved?.isRunning && saved.mode === 'stopwatch';
  } catch {
    return false;
  }
}

// ---------- building the passport ----------

interface PassportInput {
  year: number;
  direction: RideDirection;
  /** This year's journal entries */
  entries: JournalEntry[];
  /** Every town, southbound order */
  towns: Town[];
  /** This year's saved rides */
  timers: RecapTimer[];
  hand: Record<string, number>;
  gps: { ride: number; at: number } | null;
}

export function buildPassport({ direction, entries, towns, timers, hand, gps }: PassportInput) {
  const ride = (sobo: number) => rideMile(sobo, direction);
  const townById = new Map(towns.map((t) => [t.id, t]));

  // Journal: each entry proves the rider got at least as far as its town
  const proofs = entries
    .map((e) => {
      const t = e.townId ? townById.get(e.townId) : undefined;
      return t ? { ride: ride(t.mileage), at: e.timestamp } : null;
    })
    .filter((p): p is { ride: number; at: number } => p !== null)
    .sort((a, b) => a.at - b.at);

  // Timer: recorded states (lap titles naming a state) and finishes
  const lapStates = new Map<string, number>();
  let finishedAt: number | null = null;
  for (const t of timers) {
    if (t.type === 'finish') finishedAt = finishedAt === null ? t.savedAt : Math.min(finishedAt, t.savedAt);
    for (const lap of t.laps) {
      const title = lap.title.trim().toLowerCase();
      for (const [abbr, name] of Object.entries(STATE_NAMES)) {
        if (title === abbr.toLowerCase() || title.includes(name.toLowerCase())) {
          lapStates.set(abbr, Math.min(lapStates.get(abbr) ?? Infinity, lap.recordedAt));
        }
      }
    }
  }

  // The earliest evidence that the rider reached a ride mile
  const reached = (mile: number): { at: number; source: StampSource } | null => {
    const fromJournal = proofs.find((p) => p.ride >= mile - 0.5);
    if (fromJournal) return { at: fromJournal.at, source: 'journal' };
    if (gps && gps.ride >= mile - 0.5) return { at: gps.at, source: 'gps' };
    if (finishedAt !== null) return { at: finishedAt, source: 'timer' };
    return null;
  };

  const stamp = (s: Omit<Stamp, 'earnedAt' | 'source'>, auto: { at: number; source: StampSource } | null): Stamp => {
    if (auto) return { ...s, earnedAt: auto.at, source: auto.source };
    if (hand[s.id]) return { ...s, earnedAt: hand[s.id], source: 'hand' };
    return { ...s, earnedAt: null, source: null };
  };
  const byRide = (a: Stamp, b: Stamp) => a.ride - b.ride;

  const townStamps = towns
    .map((t) => stamp({ id: `town-${t.id}`, kind: 'town', name: t.name, badge: t.state, ride: ride(t.mileage) }, reached(ride(t.mileage))))
    .sort(byRide);

  const climbStamps = ROUTE_POIS.map((p) =>
    stamp({ id: `climb-${p.id}`, kind: 'climb', name: p.name, badge: `${p.elevationFt.toLocaleString('en-US')}'`, ride: ride(p.mile) }, reached(ride(p.mile))),
  ).sort(byRide);

  // Milestones, in riding order
  const startTown = direction === 'nobo' ? towns[towns.length - 1] : towns[0];
  const endTown = direction === 'nobo' ? towns[0] : towns[towns.length - 1];
  const highest = ROUTE_POIS.reduce((a, b) => (b.elevationFt > a.elevationFt ? b : a));
  const stateEntry = (abbr: string) => {
    const miles = towns.filter((t) => t.state === abbr).map((t) => ride(t.mileage));
    return Math.min(...miles);
  };
  const anyProgress = proofs.length > 0 || !!gps || finishedAt !== null || lapStates.size > 0;
  const firstEvidence = proofs[0]?.at ?? gps?.at ?? finishedAt ?? Math.min(...lapStates.values());
  const milestoneStamps = [
    stamp(
      { id: 'milestone-start', kind: 'milestone', name: `Grand Départ`, badge: startTown?.state ?? '', ride: 0 },
      anyProgress ? { at: firstEvidence, source: proofs.length ? 'journal' : gps ? 'gps' : 'timer' } : null,
    ),
    stamp({ id: 'milestone-border', kind: 'milestone', name: 'Border Crossing', badge: 'US · CA', ride: ride(BORDER_MILE) }, reached(ride(BORDER_MILE))),
    ...Object.entries(STATE_NAMES).map(([abbr, name]) => {
      const mile = stateEntry(abbr);
      const viaTimer = lapStates.get(abbr);
      return stamp(
        { id: `milestone-state-${abbr}`, kind: 'milestone', name: `Into ${name}`, badge: abbr, ride: mile },
        reached(mile) ?? (viaTimer !== undefined ? { at: viaTimer, source: 'timer' } : null),
      );
    }),
    stamp({ id: 'milestone-halfway', kind: 'milestone', name: 'Halfway', badge: `Mi ${Math.round(ROUTE_TOTAL_MILES / 2).toLocaleString('en-US')}`, ride: ROUTE_TOTAL_MILES / 2 }, reached(ROUTE_TOTAL_MILES / 2)),
    stamp({ id: 'milestone-highest', kind: 'milestone', name: 'Roof of the Route', badge: `${highest.elevationFt.toLocaleString('en-US')}'`, ride: ride(highest.mile) }, reached(ride(highest.mile))),
    stamp(
      { id: 'milestone-finish', kind: 'milestone', name: `Finish: ${endTown?.name ?? ''}`, badge: endTown?.state ?? '', ride: ROUTE_TOTAL_MILES },
      finishedAt !== null ? { at: finishedAt, source: 'timer' } : reached(ROUTE_TOTAL_MILES),
    ),
  ].sort(byRide);

  return { towns: townStamps, climbs: climbStamps, milestones: milestoneStamps };
}
