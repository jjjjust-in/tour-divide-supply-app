import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft } from 'lucide-react';
import type { JournalEntry, Resupply, Town } from '../types';
import { inRideOrder, type RideDirection } from '../utils/direction';
import { loadSavedTimers, recapYears } from '../utils/recap';
import { PageSelect } from './PageLayout';
import navBgPattern from 'figma:asset/53e87b274f9e9eae37a672b63e5feb2e3c44276d.png';
import { JournalNumbers } from './JournalNumbers';
import { RecapPanel } from './RecapPanel';

type RideView = 'numbers' | 'recap';

interface RidePageProps {
  /** Year to open on, e.g. the year picked in the Journal */
  initialYear: number;
  direction: RideDirection;
  journalEntries: JournalEntry[];
  towns: Town[];
  resupplies: Resupply[];
  /** Numbers can send the rider back to the Journal: a town's entries, or the photos */
  onOpenTown: (year: number, townId: string) => void;
  onOpenPhotos: (year: number) => void;
  onClose: () => void;
}

// Your Ride: everything about how a year's ride went, on its own page.
// Numbers (the live By the numbers) and the Race Recap. (The Ride Passport in
// PassportPanel.tsx is set aside for now and not shown.)
// Laid out like Settings & About: patterned header with a back chevron and a
// blue title, a light dotted page, centered blue section titles, white cards.
export function RidePage({ initialYear, direction, journalEntries, towns, resupplies, onOpenTown, onOpenPhotos, onClose }: RidePageProps) {
  const years = useMemo(() => {
    const ys = recapYears(journalEntries, loadSavedTimers());
    return ys.length ? ys : [initialYear];
  }, [journalEntries, initialYear]);
  const [year, setYear] = useState(() => (years.includes(initialYear) ? initialYear : years[0]));
  const [view, setView] = useState<RideView>('numbers');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const sobo = useMemo(() => [...towns].sort((a, b) => a.mileage - b.mileage), [towns]);
  const yearOf = (ts: number) => new Date(ts).getFullYear();
  const views: { key: RideView; label: string }[] = [
    { key: 'numbers', label: 'Numbers' },
    { key: 'recap', label: 'Recap' },
  ];
  const at = views.findIndex((v) => v.key === view);

  const pattern = { backgroundImage: `url(${navBgPattern})`, backgroundSize: '300px 300px', backgroundPosition: 'center' };

  // Portal to <body> so the page transition's layer can't put the nav on top of it
  return createPortal(
    <div role="dialog" aria-modal="true" aria-labelledby="ride-title" className="fixed inset-0 z-[60] bg-[#E6F7FD] flex flex-col">
      {/* Header, as on Settings & About */}
      <div className="shrink-0 z-20 shadow-sm pt-[var(--sat)]" style={pattern}>
        <div className="max-w-5xl mx-auto px-[20px] py-4 flex items-center gap-4 border-b-2 border-[#40C8EF]">
          <button
            onClick={onClose}
            aria-label="Go back"
            className="size-[44px] shrink-0 flex items-center justify-center bg-white border-2 border-[#40C8EF] rounded-full text-[#40C8EF] hover:bg-[#F5FCFF] transition-colors touch-manipulation"
          >
            <ChevronLeft size={22} strokeWidth={2.5} />
          </button>
          <h1 id="ride-title" className="text-[#40C8EF] uppercase font-display font-bold tracking-[-0.36px] text-[20px] flex-1 truncate text-center">
            Your {year} Ride
          </h1>
          {/* Mirrors the back button so the title sits at the true center */}
          <span aria-hidden="true" className="size-[44px] shrink-0" />
        </div>
      </div>

      <div className="relative flex-1 min-h-0 overflow-y-auto">
        {/* Dotted page, as on Settings & About */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none opacity-20" style={pattern} />
        <div className="relative z-[1] max-w-[600px] mx-auto w-full flex flex-col items-center gap-[20px] px-[20px] pt-[28px] pb-[max(40px,env(safe-area-inset-bottom))]">
          {/* Numbers / Recap: the app's sliding switch, and the year once there's more than one */}
          <div className="w-full space-y-2">
            <div role="radiogroup" aria-label="Ride view" className="relative w-full grid grid-cols-2 border-2 border-[#40C8EF] rounded-lg bg-white overflow-hidden">
              <span
                aria-hidden="true"
                className="absolute inset-y-0 left-0 w-1/2 bg-[#40C8EF] motion-safe:transition-transform motion-safe:duration-200 ease-out"
                style={{ transform: `translateX(${at * 100}%)` }}
              />
              {views.map(({ key, label }) => (
                <button
                  key={key}
                  role="radio"
                  aria-checked={view === key}
                  onClick={() => setView(key)}
                  className={`relative z-10 px-2 py-3 transition-colors ${view === key ? 'text-white' : 'text-[#40C8EF] hover:text-[#00B6EB]'}`}
                >
                  <span className="text-sm uppercase font-display font-medium tracking-[-0.36px]">{label}</span>
                </button>
              ))}
            </div>
            {years.length > 1 && (
              <PageSelect id="ride-year" label="Year" value={String(year)} onChange={(v) => setYear(Number(v))}>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </PageSelect>
            )}
          </div>

          {view === 'numbers' && (
            <JournalNumbers
              year={year}
              entries={journalEntries.filter((e) => yearOf(e.timestamp) === year)}
              resupplies={resupplies.filter((r) => yearOf(r.timestamp) === year)}
              routeTowns={inRideOrder(sobo, direction)}
              onOpenTown={(townId) => onOpenTown(year, townId)}
              onOpenPhotos={() => onOpenPhotos(year)}
            />
          )}
          {view === 'recap' && <RecapPanel year={year} direction={direction} journalEntries={journalEntries} towns={towns} resupplies={resupplies} />}
        </div>
      </div>
    </div>,
    document.body,
  );
}
