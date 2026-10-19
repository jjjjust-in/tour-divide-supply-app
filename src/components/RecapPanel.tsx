import { useEffect, useMemo, useRef, useState } from 'react';
import type { JournalEntry, Resupply, Town } from '../types';
import type { RideDirection } from '../utils/direction';
import { buildRecap, loadSavedTimers } from '../utils/recap';
import { renderRecapSlides, type RecapSlide } from '../utils/recapRender';
import { card, sectionTitle } from './JournalNumbers';

interface RecapPanelProps {
  year: number;
  direction: RideDirection;
  journalEntries: JournalEntry[];
  towns: Town[];
  resupplies: Resupply[];
}

const btnLabel = 'uppercase font-display font-medium tracking-[-0.36px] text-[13px] md:text-sm';
const btnFilled = 'w-full border-2 border-[#40C8EF] bg-[#40C8EF] text-white py-2.5 rounded-lg hover:bg-[#00B6EB] hover:border-[#00B6EB] transition-colors disabled:opacity-40';
const btnOutline = 'w-full border-2 border-[#40C8EF] bg-white text-[#40C8EF] py-2.5 rounded-lg hover:bg-[#F5FCFF] transition-colors disabled:opacity-40';

function download(slide: RecapSlide, name: string) {
  const a = document.createElement('a');
  a.href = slide.url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

// Race Recap: Instagram Story slides drawn from the rider's own data, shown on the Your Ride page.
export function RecapPanel({ year, direction, journalEntries, towns, resupplies }: RecapPanelProps) {
  const timers = useMemo(() => loadSavedTimers(), []);
  const [slides, setSlides] = useState<RecapSlide[]>([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState(0);
  const scroller = useRef<HTMLDivElement>(null);

  const data = useMemo(
    () => buildRecap(year, { entries: journalEntries, towns, resupplies, timers }),
    [year, journalEntries, towns, resupplies, timers],
  );
  const hasData = data.entries.length > 0 || !!data.ride;

  useEffect(() => {
    if (!hasData) {
      setBusy(false);
      setSlides([]);
      return;
    }
    let cancelled = false;
    let made: RecapSlide[] = [];
    setBusy(true);
    setError(null);
    renderRecapSlides(data, direction)
      .then((s) => {
        made = s;
        if (cancelled) s.forEach((x) => URL.revokeObjectURL(x.url));
        else {
          setSlides(s);
          setCurrent(0);
          scroller.current?.scrollTo({ left: 0 });
        }
      })
      .catch(() => !cancelled && setError('Could not make the recap. Try again.'))
      .finally(() => !cancelled && setBusy(false));
    return () => {
      cancelled = true;
      made.forEach((x) => URL.revokeObjectURL(x.url));
    };
  }, [data, direction, hasData]);

  const fileName = (i: number) => `tour-divide-${year}-${String(i + 1).padStart(2, '0')}-${slides[i].id}.png`;
  const files = () => slides.map((s, i) => new File([s.blob], fileName(i), { type: 'image/png' }));
  const canShareFiles = (() => {
    try {
      return slides.length > 0 && !!navigator.canShare && navigator.canShare({ files: files().slice(0, 1) });
    } catch {
      return false;
    }
  })();

  const shareAll = async () => {
    try {
      await navigator.share({ files: files(), title: `Tour Divide ${year}` });
    } catch (e) {
      if ((e as Error).name !== 'AbortError') slides.forEach((s, i) => download(s, fileName(i)));
    }
  };
  const saveAll = () => slides.forEach((s, i) => setTimeout(() => download(s, fileName(i)), i * 250));
  const saveCurrent = () => slides[current] && download(slides[current], fileName(current));

  const onScroll = () => {
    const el = scroller.current;
    if (!el) return;
    setCurrent(Math.round(el.scrollLeft / el.clientWidth));
  };
  const goTo = (i: number) => scroller.current?.scrollTo({ left: i * scroller.current.clientWidth, behavior: 'smooth' });

  return (
    <div className="w-full flex flex-col items-center gap-3">
      <h2 className={sectionTitle}>Race Recap</h2>
      <div className={`${card} flex flex-col items-center gap-4 px-4 pt-4 pb-5`}>
      <p className="text-[13px] text-black/60 text-center">
        {hasData ? `${slides.length || '…'} story slides from your rides and journal` : 'Nothing logged this year yet'}
      </p>

      {!hasData ? (
        <div className="w-full px-2 py-6 text-center">
          <p className="text-[13px] text-black/60">Write journal entries or save a ride with the timer, and your recap builds itself.</p>
        </div>
      ) : (
        <>
          {/* Sized so the slide and both buttons fit on screen together */}
          <div className="relative w-[min(270px,calc((100dvh-470px)*0.5625))] min-w-[160px] aspect-[9/16] border-2 border-[#40C8EF] rounded-lg overflow-hidden bg-[#F5FCFF]">
            {busy && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className={`${btnLabel} text-[#40C8EF]`}>Drawing…</p>
              </div>
            )}
            {error && (
              <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
                <p className="text-[13px] text-[#FF6B35]">{error}</p>
              </div>
            )}
            <div ref={scroller} onScroll={onScroll} className="flex h-full overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {slides.map((s, i) => (
                <img key={s.url} src={s.url} alt={`Slide ${i + 1}: ${s.label}`} className="w-full h-full shrink-0 snap-center object-cover" draggable={false} />
              ))}
            </div>
          </div>

          {slides.length > 1 && (
            <div className="flex justify-center gap-2 -mt-1" role="tablist" aria-label="Slides">
              {slides.map((s, i) => (
                <button key={s.id} role="tab" aria-selected={i === current} aria-label={s.label} onClick={() => goTo(i)} className="p-1">
                  <span className={`block w-2 h-2 rounded-full ${i === current ? 'bg-[#40C8EF]' : 'bg-[#40C8EF]/30'}`} />
                </button>
              ))}
            </div>
          )}

          <div className="w-full space-y-2">
            <button onClick={canShareFiles ? shareAll : saveAll} disabled={busy || !slides.length} className={btnFilled}>
              <span className={btnLabel}>{canShareFiles ? 'Share all slides' : 'Save all slides'}</span>
            </button>
            <button onClick={saveCurrent} disabled={busy || !slides.length} className={btnOutline}>
              <span className={btnLabel}>Save this slide</span>
            </button>
          </div>
        </>
      )}
      </div>
    </div>
  );
}
