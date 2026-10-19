import { useMemo, useState, type ReactNode } from 'react';
import type { JournalEntry, Resupply, Town } from '../types';
import { formatNumber } from '../utils/measurements';

// The Race Recap's "By the numbers" slide, live in the Journal: one card per
// stat, each with a small chart you can touch. Slide across the day charts to
// read any day; tap a town to read its entries; tap the photos ring for the gallery.

interface JournalNumbersProps {
  year: number;
  /** This year's entries */
  entries: JournalEntry[];
  /** This year's resupplies */
  resupplies: Resupply[];
  /** Every town, in riding order */
  routeTowns: Town[];
  onOpenTown: (townId: string) => void;
  onOpenPhotos: () => void;
}

const DAY = 86400000;
const dayStart = (ts: number) => {
  const d = new Date(ts);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
};
const shortDate = (ts: number) => new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
const words = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;
const plural = (n: number, one: string, many: string) => `${formatNumber(n)} ${n === 1 ? one : many}`;

const label = 'font-display font-medium text-[11px] uppercase tracking-[0.02em]';
/** Section title, as on Settings & About */
export const sectionTitle = 'font-display font-bold text-[#40c8ef] text-[18px] tracking-[-0.36px] uppercase text-center';
/** White card with a thin blue border, as on Settings & About */
export const card = 'w-full bg-white border border-[#40c8ef]';

function Card({ title, value, note, children }: { title: string; value: string; note: ReactNode; children: ReactNode }) {
  return (
    <section className={`${card} px-4 pt-3.5 pb-3`}>
      <div className="flex items-baseline justify-between gap-3">
        <h3 className={`${label} text-black/60`}>{title}</h3>
        <p className="font-display font-bold text-[28px] leading-none tracking-[-0.5px] text-black tabular-nums">{value}</p>
      </div>
      <div className="mt-3">{children}</div>
      {/* What's under your finger, or a summary when nothing is */}
      <p className={`${label} text-black/60 mt-2 min-h-[14px] tabular-nums truncate`} aria-live="polite">
        {note}
      </p>
    </section>
  );
}

/** Slide a finger (or drag a mouse) across a row of equal slots to pick one. */
function useScrub(count: number) {
  const [index, setIndex] = useState<number | null>(null);
  const pick = (el: HTMLElement, clientX: number) => {
    const r = el.getBoundingClientRect();
    setIndex(Math.max(0, Math.min(count - 1, Math.floor(((clientX - r.left) / r.width) * count))));
  };
  const handlers = {
    onPointerDown: (e: React.PointerEvent<HTMLElement>) => {
      pick(e.currentTarget, e.clientX);
      try {
        // Keep following the finger even if it slides off the chart
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // not critical
      }
    },
    onPointerMove: (e: React.PointerEvent<HTMLElement>) => {
      if (e.buttons || e.pointerType !== 'mouse') pick(e.currentTarget, e.clientX);
    },
  };
  return { index, setIndex, handlers };
}

export function JournalNumbers({ year, entries, resupplies, routeTowns, onOpenTown, onOpenPhotos }: JournalNumbersProps) {
  // Entries and words per day across the ride (per week if it ran past two months)
  const days = useMemo(() => {
    if (!entries.length) return { slots: [] as { start: number; entries: number; words: number }[], weekly: false };
    const first = dayStart(Math.min(...entries.map((e) => e.timestamp)));
    const last = dayStart(Math.max(...entries.map((e) => e.timestamp)));
    const span = Math.round((last - first) / DAY) + 1;
    const weekly = span > 60;
    const size = weekly ? 7 : 1;
    const slots = Array.from({ length: Math.ceil(span / size) }, (_, i) => ({ start: first + i * size * DAY, entries: 0, words: 0 }));
    for (const e of entries) {
      const slot = slots[Math.floor(Math.round((dayStart(e.timestamp) - first) / DAY) / size)];
      slot.entries += 1;
      slot.words += words(e.content);
    }
    return { slots, weekly };
  }, [entries]);
  const period = days.weekly ? 'week' : 'day';
  const slotName = (start: number) => (days.weekly ? `Week of ${shortDate(start)}` : new Date(start).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));

  const totalWords = entries.reduce((n, e) => n + words(e.content), 0);
  const photoCount = entries.filter((e) => e.imageUrl).length;
  const entriesByTown = new Map<string, number>();
  for (const e of entries) if (e.townId) entriesByTown.set(e.townId, (entriesByTown.get(e.townId) ?? 0) + 1);
  const states = [...new Set(routeTowns.map((t) => t.state))].map((st) => ({
    st,
    entries: entries.filter((e) => routeTowns.find((t) => t.id === e.townId)?.state === st).length,
    towns: routeTowns.filter((t) => t.state === st && entriesByTown.has(t.id)).length,
  }));
  const maxStateEntries = Math.max(1, ...states.map((s) => s.entries));

  const entriesScrub = useScrub(days.slots.length);
  const wordsScrub = useScrub(days.slots.length);
  const [stateIndex, setStateIndex] = useState<number | null>(null);
  const [resupplyIndex, setResupplyIndex] = useState<number | null>(null);
  const [townHover, setTownHover] = useState<string | null>(null);

  const maxEntries = Math.max(1, ...days.slots.map((s) => s.entries));
  const maxWords = Math.max(1, ...days.slots.map((s) => s.words));
  const busiest = days.slots.reduce((best, s) => (s.words > (best?.words ?? -1) ? s : best), days.slots[0]);

  if (!entries.length) {
    return (
      <div className="w-full flex flex-col items-center gap-3">
        <h2 className={sectionTitle}>By the Numbers</h2>
        <div className={`${card} px-6 py-10 text-center`}>
          <p className="font-display font-medium text-[13px] uppercase text-black">No numbers yet</p>
          <p className="text-[13px] text-black/60 mt-2">Write a journal entry and your {year} numbers start adding up here.</p>
        </div>
      </div>
    );
  }

  const first = days.slots[0]?.start;
  const last = days.slots[days.slots.length - 1]?.start;
  const range = first !== undefined && last !== undefined ? `${shortDate(first)} – ${shortDate(last)}` : '';
  const townsWritten = routeTowns.filter((t) => entriesByTown.has(t.id));
  const shownTown = routeTowns.find((t) => t.id === townHover);
  const share = entries.length ? Math.round((photoCount / entries.length) * 100) : 0;
  const ring = 2 * Math.PI * 34;

  return (
    <div className="w-full flex flex-col items-center gap-3">
      <h2 className={sectionTitle}>By the Numbers</h2>
      {/* Entries: a column per day */}
      <Card
        title={`Entries · per ${period}`}
        value={formatNumber(entries.length)}
        note={entriesScrub.index !== null ? `${slotName(days.slots[entriesScrub.index].start)} · ${plural(days.slots[entriesScrub.index].entries, 'entry', 'entries')}` : range}
      >
        <div {...entriesScrub.handlers} onPointerLeave={() => entriesScrub.setIndex(null)} className="flex items-end gap-[2px] h-16 touch-pan-y cursor-pointer select-none" role="img" aria-label={`Entries per ${period}, ${range}`}>
          {days.slots.map((s, i) => (
            <div key={s.start} className="flex-1 h-full flex items-end bg-[#40C8EF]/15">
              <div
                className={`w-full ${i === entriesScrub.index ? 'bg-[#231F20]' : 'bg-[#40C8EF]'}`}
                style={{ height: s.entries ? `${Math.max(8, (s.entries / maxEntries) * 100)}%` : 0 }}
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Words: a line through the ride */}
      <Card
        title="Words written"
        value={formatNumber(totalWords)}
        note={
          wordsScrub.index !== null
            ? `${slotName(days.slots[wordsScrub.index].start)} · ${plural(days.slots[wordsScrub.index].words, 'word', 'words')}`
            : busiest
              ? `Most in a ${period}: ${formatNumber(busiest.words)} · ${shortDate(busiest.start)}`
              : ''
        }
      >
        <div {...wordsScrub.handlers} onPointerLeave={() => wordsScrub.setIndex(null)} className="relative h-16 touch-pan-y cursor-pointer select-none" role="img" aria-label="Words written over the ride">
          <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="absolute inset-0 w-full h-full overflow-visible">
            {(() => {
              const n = days.slots.length;
              const xy = days.slots.map((s, i) => [n === 1 ? 50 : ((i + 0.5) / n) * 100, 40 - (s.words / maxWords) * 38] as const);
              const line = xy.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join('');
              return (
                <>
                  <path d={`${line}L${xy[xy.length - 1][0]} 40L${xy[0][0]} 40Z`} fill="#40C8EF" opacity={0.15} />
                  <path d={line} fill="none" stroke="#40C8EF" strokeWidth={2} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
                  {wordsScrub.index !== null && (
                    <line x1={xy[wordsScrub.index][0]} x2={xy[wordsScrub.index][0]} y1={0} y2={40} stroke="#231F20" strokeWidth={1} vectorEffect="non-scaling-stroke" />
                  )}
                </>
              );
            })()}
          </svg>
          {wordsScrub.index !== null && (() => {
            const n = days.slots.length;
            const s = days.slots[wordsScrub.index];
            return (
              <span
                className="absolute w-2.5 h-2.5 -ml-[5px] -mt-[5px] rounded-full bg-[#231F20] pointer-events-none"
                style={{ left: `${n === 1 ? 50 : ((wordsScrub.index + 0.5) / n) * 100}%`, top: `${((40 - (s.words / maxWords) * 38) / 40) * 100}%` }}
              />
            );
          })()}
        </div>
      </Card>

      {/* Photos: share of entries with one; tap for the gallery */}
      <Card title="Photos" value={formatNumber(photoCount)} note={photoCount ? 'Tap to see them all' : 'Add a photo to an entry with +'}>
        <button onClick={onOpenPhotos} disabled={!photoCount} className="flex items-center gap-4 w-full text-left disabled:cursor-default" aria-label="Open the photo gallery">
          <svg viewBox="0 0 80 80" className="w-16 h-16 shrink-0 -rotate-90">
            <circle cx={40} cy={40} r={34} fill="none" stroke="#40C8EF" strokeOpacity={0.15} strokeWidth={10} />
            <circle cx={40} cy={40} r={34} fill="none" stroke="#40C8EF" strokeWidth={10} strokeDasharray={`${(ring * share) / 100} ${ring}`} />
          </svg>
          <span className="text-[13px] text-black/70 leading-snug">
            <span className="font-display font-bold text-[20px] text-black tabular-nums">{share}%</span>
            <br />
            of your entries have a photo
          </span>
        </button>
      </Card>

      {/* Towns: the route as a line; filled where you wrote. Tap one to read it. */}
      <Card
        title="Towns"
        value={`${townsWritten.length} of ${routeTowns.length}`}
        note={
          shownTown
            ? `${shownTown.name}, ${shownTown.state} · ${entriesByTown.has(shownTown.id) ? plural(entriesByTown.get(shownTown.id)!, 'entry', 'entries') : 'Nothing written yet'}`
            : `${routeTowns[0]?.name} to ${routeTowns[routeTowns.length - 1]?.name}`
        }
      >
        <div className="relative h-8 select-none" onPointerLeave={() => setTownHover(null)}>
          <div aria-hidden="true" className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[3px] bg-[#40C8EF]" />
          {routeTowns.map((t, i) => {
            const written = entriesByTown.has(t.id);
            const left = routeTowns.length === 1 ? 50 : (i / (routeTowns.length - 1)) * 100;
            return (
              <button
                key={t.id}
                onPointerEnter={() => setTownHover(t.id)}
                onFocus={() => setTownHover(t.id)}
                onClick={() => (written ? onOpenTown(t.id) : setTownHover(t.id))}
                aria-label={`${t.name}, ${written ? `${entriesByTown.get(t.id)} entries, open them` : 'nothing written yet'}`}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-[11px] h-8 flex items-center justify-center"
                style={{ left: `${left}%` }}
              >
                <span
                  className={`block rounded-full ${written ? 'w-[9px] h-[9px] bg-[#231F20]' : 'w-[7px] h-[7px] bg-white border-2 border-[#40C8EF]'} ${
                    townHover === t.id ? 'ring-2 ring-offset-1 ring-[#231F20]' : ''
                  }`}
                />
              </button>
            );
          })}
        </div>
      </Card>

      {/* States: entries per state, in riding order */}
      <Card
        title="States"
        value={String(states.filter((s) => s.entries > 0).length)}
        note={
          stateIndex !== null
            ? `${states[stateIndex].st} · ${plural(states[stateIndex].entries, 'entry', 'entries')} · ${plural(states[stateIndex].towns, 'town', 'towns')}`
            : 'Tap a state'
        }
      >
        <div className="flex items-end gap-1.5 h-16">
          {states.map((s, i) => (
            <button
              key={s.st}
              onClick={() => setStateIndex(i === stateIndex ? null : i)}
              aria-label={`${s.st}: ${s.entries} entries`}
              aria-pressed={i === stateIndex}
              className="flex-1 h-full flex flex-col justify-end items-center gap-1"
            >
              <span className="w-full flex-1 flex items-end bg-[#40C8EF]/15">
                <span
                  className={`block w-full ${i === stateIndex ? 'bg-[#231F20]' : 'bg-[#40C8EF]'}`}
                  style={{ height: s.entries ? `${Math.max(8, (s.entries / maxStateEntries) * 100)}%` : 0 }}
                />
              </span>
              <span className={`${label} text-black/60`}>{s.st}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Resupplies: one square per stop; tap one to see where */}
      {resupplies.length > 0 && (
        <Card
          title="Resupplies"
          value={formatNumber(resupplies.length)}
          note={
            resupplyIndex !== null
              ? `${resupplies[resupplyIndex].name} · ${routeTowns.find((t) => t.id === resupplies[resupplyIndex].townId)?.name ?? ''}`
              : 'Tap a square'
          }
        >
          <div className="flex flex-wrap gap-1.5">
            {resupplies.map((r, i) => (
              <button
                key={r.id}
                onClick={() => setResupplyIndex(i === resupplyIndex ? null : i)}
                aria-label={r.name}
                aria-pressed={i === resupplyIndex}
                className={`w-[22px] h-[22px] rounded ${i === resupplyIndex ? 'bg-[#231F20]' : 'bg-[#40C8EF]'}`}
              />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
