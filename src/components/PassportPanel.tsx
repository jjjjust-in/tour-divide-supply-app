import { useEffect, useMemo, useState } from 'react';
import type { JournalEntry, Town } from '../types';
import { rideMile, type RideDirection } from '../utils/direction';
import { loadSavedTimers } from '../utils/recap';
import { useRiderLocation } from '../utils/useRiderLocation';
import { card, sectionTitle } from './JournalNumbers';
import {
  buildPassport,
  loadGpsProgress,
  loadHandStamps,
  recordGpsProgress,
  rideTimerRunning,
  saveHandStamps,
  type Stamp,
} from '../utils/passport';

interface PassportPanelProps {
  year: number;
  direction: RideDirection;
  journalEntries: JournalEntry[];
  /** Every town, southbound order */
  towns: Town[];
  locationEnabled: boolean;
}

const label = 'font-display font-medium uppercase tracking-[0.02em]';
const shortDate = (ts: number) => new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
const HOW: Record<string, string> = {
  journal: 'Earned from your journal',
  gps: 'Earned on the ride by GPS',
  timer: 'Earned from your ride timer',
  hand: 'Stamped by hand · tap to remove',
};

// Ride Passport: a page of stamps for towns, climbs and milestones. Most earn
// themselves; tap an empty one to stamp it by hand.
// Set aside for now: not shown anywhere until it gets another design pass.
export function PassportPanel({ year, direction, journalEntries, towns, locationEnabled }: PassportPanelProps) {
  const [hand, setHand] = useState(() => loadHandStamps(year));
  const [gps, setGps] = useState(() => loadGpsProgress(year));
  const [justStamped, setJustStamped] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  // A new year is a new passport
  useEffect(() => {
    setHand(loadHandStamps(year));
    setGps(loadGpsProgress(year));
    setNote(null);
  }, [year]);

  // While the ride timer runs, GPS on the route stamps everything behind the rider
  const timerRunning = useMemo(() => rideTimerRunning(), []);
  const thisYear = year === new Date().getFullYear();
  const { location } = useRiderLocation(locationEnabled && timerRunning && thisYear);
  useEffect(() => {
    if (location.status !== 'found' || !location.position.onRoute) return;
    recordGpsProgress(year, rideMile(location.position.mile, direction));
    setGps(loadGpsProgress(year));
  }, [location, year, direction]);

  const passport = useMemo(
    () =>
      buildPassport({
        year,
        direction,
        entries: journalEntries.filter((e) => new Date(e.timestamp).getFullYear() === year),
        towns: [...towns].sort((a, b) => a.mileage - b.mileage),
        timers: loadSavedTimers().filter((t) => new Date(t.savedAt).getFullYear() === year),
        hand,
        gps,
      }),
    [year, direction, journalEntries, towns, hand, gps],
  );
  const all = [...passport.milestones, ...passport.towns, ...passport.climbs];
  const earned = all.filter((s) => s.earnedAt !== null).length;

  const tap = (s: Stamp) => {
    if (s.source && s.source !== 'hand') {
      setNote(`${s.name} · ${HOW[s.source]} · ${shortDate(s.earnedAt!)}`);
      return;
    }
    const next = { ...hand };
    if (s.source === 'hand') {
      delete next[s.id];
      setNote(`${s.name} · stamp removed`);
    } else {
      next[s.id] = Date.now();
      setJustStamped(s.id);
      setNote(`${s.name} · stamped`);
    }
    setHand(next);
    saveHandStamps(year, next);
  };

  const section = (title: string, stamps: Stamp[]) => {
    const got = stamps.filter((s) => s.earnedAt !== null).length;
    return (
      <section className="w-full flex flex-col gap-3">
        <h2 className={sectionTitle}>{title}</h2>
        <div className={`${card} px-4 pt-4 pb-5 space-y-4`}>
        <div className="flex items-center gap-3">
          <div aria-hidden="true" className="flex-1 h-[6px] bg-[#40C8EF]/15 rounded-full overflow-hidden">
            <div className="h-full bg-[#40C8EF] rounded-full motion-safe:transition-[width] motion-safe:duration-500" style={{ width: `${(got / stamps.length) * 100}%` }} />
          </div>
          <span className={`${label} text-[12px] text-black/50 tabular-nums shrink-0`}>
            {got} of {stamps.length}
          </span>
        </div>
        <ul className="grid grid-cols-4 gap-x-2 gap-y-4">
          {stamps.map((s, i) => {
            const on = s.earnedAt !== null;
            // Each stamp sits at its own slight angle, like it was pressed by hand
            const tilt = ((i * 37) % 11) - 5;
            return (
              <li key={s.id}>
                <button
                  onClick={() => tap(s)}
                  aria-label={`${s.name}: ${on ? `${HOW[s.source!]}, ${shortDate(s.earnedAt!)}` : 'not stamped yet, tap to stamp'}`}
                  className="w-full flex flex-col items-center gap-1.5 touch-manipulation"
                >
                  <span
                    className={`relative w-[60px] h-[60px] rounded-full flex flex-col items-center justify-center ${
                      on ? 'border-2 border-[#40C8EF] text-[#40C8EF]' : 'border-2 border-dashed border-black/15 text-black/25'
                    } ${justStamped === s.id ? 'motion-safe:animate-[stamp-in_260ms_ease-out]' : ''}`}
                    style={on ? { transform: `rotate(${tilt}deg)` } : undefined}
                  >
                    {on && <span aria-hidden="true" className="absolute inset-[4px] rounded-full border border-[#40C8EF]/60" />}
                    <span className={`${label} ${s.badge.length > 6 ? 'text-[9px]' : 'text-[11px]'} leading-none tabular-nums whitespace-nowrap`}>{s.badge}</span>
                    {on && <span className={`${label} text-[9px] leading-none mt-1 tabular-nums`}>{shortDate(s.earnedAt!)}</span>}
                  </span>
                  <span className={`${label} text-[10px] leading-tight text-center line-clamp-2 ${on ? 'text-black' : 'text-black/40'}`}>{s.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
        </div>
      </section>
    );
  };

  return (
    <div className="w-full flex flex-col gap-[20px]">
      <p className="text-[13px] text-black/60 text-center tabular-nums">
        {earned} of {all.length} stamps
      </p>
      {section('Milestones', passport.milestones)}
      {section('Towns', passport.towns)}
      {section('Climbs', passport.climbs)}
      <p className="text-[12px] text-black/50 text-center leading-relaxed">
        Stamps earn themselves from your journal, from GPS while the ride timer runs, and from states you record on the timer. Tap an empty one to stamp it by hand.
      </p>
      {/* How the last tapped stamp was earned; stays in view while scrolling */}
      <p
        className={`${label} sticky bottom-[max(12px,env(safe-area-inset-bottom))] ${card} text-[11px] text-center text-black/70 px-4 py-2.5 min-h-[38px] truncate shadow-[0_6px_24px_rgba(35,31,32,0.12)]`}
        aria-live="polite"
      >
        {note ?? 'Tap a stamp'}
      </p>
    </div>
  );
}
