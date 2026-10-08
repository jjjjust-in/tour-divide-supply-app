import { useEffect, useState } from 'react';
import type { Town } from '../types';
import type { MeasurementSystem } from '../utils/measurements';
import { RouteMap } from './RouteMap';

interface MapPageProps {
  towns: Town[];
  measurementSystem: MeasurementSystem;
  onOpenTown: (townId: string) => void;
}

type RouteView = 'map' | 'elevation';

// The Route page: map or elevation profile, each with the live location dot
export function MapPage({ towns, measurementSystem, onOpenTown }: MapPageProps) {
  const [view, setView] = useState<RouteView>(() => {
    try {
      return localStorage.getItem('tour-divide-route-view') === 'elevation' ? 'elevation' : 'map';
    } catch {
      return 'map';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('tour-divide-route-view', view);
    } catch {
      // not critical
    }
  }, [view]);

  return (
    <div className="relative w-full h-full bg-white overflow-auto">
      <div className="flex flex-col items-center gap-5 px-[20px] md:px-[85px] pt-[40px] pb-[150px] md:pt-[96px] md:pb-[206px]">
        {/* Headline doubles as the Map / Elevation toggle */}
        <div role="tablist" aria-label="Route view" className="flex items-baseline gap-3 pb-4">
          {(['map', 'elevation'] as const).map((v, i) => (
            <span key={v} className="flex items-baseline gap-3">
              {i > 0 && <span aria-hidden="true" className="font-display font-bold text-[20px] text-black/20">/</span>}
              <button
                role="tab"
                aria-selected={view === v}
                onClick={() => setView(v)}
                className={`font-display font-bold text-[20px] tracking-[-0.36px] uppercase transition-colors ${
                  view === v ? 'text-black' : 'text-black/25 hover:text-black/50'
                }`}
              >
                {v === 'map' ? 'Map' : 'Elevation'}
              </button>
            </span>
          ))}
        </div>
        <div className="w-full max-w-[360px]">
          <RouteMap view={view} towns={towns} measurementSystem={measurementSystem} onOpenTown={onOpenTown} />
        </div>
      </div>
    </div>
  );
}
