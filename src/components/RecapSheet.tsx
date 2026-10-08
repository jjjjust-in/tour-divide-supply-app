import { useEffect, useMemo, useRef, useState } from 'react';
import { X } from 'lucide-react';
import type { JournalEntry, Resupply, Town } from '../types';
import type { RideDirection } from '../utils/direction';
import { buildRecap, loadSavedTimers, recapYears } from '../utils/recap';
import { renderRecapSlides, type RecapSlide } from '../utils/recapRender';

interface RecapSheetProps {
  direction: RideDirection;
  journalEntries: JournalEntry[];
  towns: Town[];
  resupplies: Resupply[];
  onClose: () => void;
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

// Year-end recap: Instagram Story slides drawn from the rider's own data.
export function RecapSheet({ direction, journalEntries, towns, resupplies, onClose }: RecapSheetProps) {
  const timers = useMemo(() => loadSavedTimers(), []);
  const years = useMemo(() => recapYears(journalEntries, timers), [journalEntries, timers]);
  const [year, setYear] = useState<number>(() => years[0] ?? new Date().getFullYear());
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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="recap-title"
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-2 top-2 w-11 h-11 flex items-center justify-center text-black/60 hover:text-black transition-colors touch-manipulation"
        >
          <X size={22} />
        </button>

        <div className="flex flex-col items-center gap-1 text-center px-12 pt-6">
          <h2 id="recap-title" className="font-display font-bold text-black text-[20px] tracking-[-0.36px] uppercase">
            {year} Recap
          </h2>
          <p className="text-[13px] text-black/60">
            {hasData ? `${slides.length || '…'} story slides from your rides and journal` : 'Nothing logged this year yet'}
          </p>
        </div>

        {years.length > 1 && (
          <div className="px-5 pt-4 flex justify-center gap-2 flex-wrap">
            {years.map((y) => (
              <button
                key={y}
                onClick={() => setYear(y)}
                aria-pressed={y === year}
                className={`px-4 py-1.5 rounded-lg border-2 border-[#40C8EF] transition-colors ${y === year ? 'bg-[#40C8EF] text-white' : 'bg-white text-[#40C8EF]'}`}
              >
                <span className={btnLabel}>{y}</span>
              </button>
            ))}
          </div>
        )}

        <div className="px-5 pt-5">
          {!hasData ? (
            <div className="border-2 border-[#40C8EF] rounded-lg px-6 py-10 text-center">
              <p className="text-[13px] text-black/60">
                Write journal entries or save a ride with the timer, and your recap builds itself.
              </p>
            </div>
          ) : (
            <div className="relative mx-auto w-full max-w-[270px] aspect-[9/16] border-2 border-[#40C8EF] rounded-lg overflow-hidden bg-[#F5FCFF]">
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
              <div
                ref={scroller}
                onScroll={onScroll}
                className="flex h-full overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {slides.map((s, i) => (
                  <img
                    key={s.url}
                    src={s.url}
                    alt={`Slide ${i + 1}: ${s.label}`}
                    className="w-full h-full shrink-0 snap-center object-cover"
                    draggable={false}
                  />
                ))}
              </div>
            </div>
          )}

          {slides.length > 1 && (
            <div className="flex justify-center gap-2 pt-3" role="tablist" aria-label="Slides">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  role="tab"
                  aria-selected={i === current}
                  aria-label={s.label}
                  onClick={() => goTo(i)}
                  className="p-1"
                >
                  <span className={`block w-2 h-2 rounded-full ${i === current ? 'bg-[#40C8EF]' : 'bg-[#40C8EF]/30'}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {hasData && (
          <div className="px-5 pt-4 pb-5 space-y-2">
            {canShareFiles ? (
              <>
                <button onClick={shareAll} disabled={busy || !slides.length} className={btnFilled}>
                  <span className={btnLabel}>Share all slides</span>
                </button>
                <button onClick={saveCurrent} disabled={busy || !slides.length} className={btnOutline}>
                  <span className={btnLabel}>Save this slide</span>
                </button>
              </>
            ) : (
              <>
                <button onClick={saveAll} disabled={busy || !slides.length} className={btnFilled}>
                  <span className={btnLabel}>Save all slides</span>
                </button>
                <button onClick={saveCurrent} disabled={busy || !slides.length} className={btnOutline}>
                  <span className={btnLabel}>Save this slide</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
