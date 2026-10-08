import { useEffect, useState } from 'react';
import type { Town } from '../types';
import type { MeasurementSystem } from '../utils/measurements';
import { formatNumber } from '../utils/measurements';
import { RouteMap } from './RouteMap';
import { PageLayout } from './PageLayout';
import type { RideDirection } from '../utils/direction';
import { TOTAL_CLIMBING_FT } from '../data/passes';

interface MapPageProps {
  direction: RideDirection;
  towns: Town[];
  measurementSystem: MeasurementSystem;
  onOpenTown: (townId: string) => void;
}

type RouteView = 'map' | 'elevation';

// The Route page: map or elevation profile, each with the live location dot
export function MapPage({ direction, towns, measurementSystem, onOpenTown }: MapPageProps) {
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

  // Map / Elevation: one switch with a sliding highlight, styled like the main nav
  const viewSwitch = (
    <div
      role="radiogroup"
      aria-label="Route view"
      className="relative grid grid-cols-2 border-2 border-[#40C8EF] rounded-lg bg-white overflow-hidden"
    >
      <span
        aria-hidden="true"
        className={`absolute inset-y-0 left-0 w-1/2 bg-[#40C8EF] motion-safe:transition-transform motion-safe:duration-200 ease-out ${
          view === 'elevation' ? 'translate-x-full' : 'translate-x-0'
        }`}
      />
      {([
        { key: 'map', label: 'Map' },
        { key: 'elevation', label: 'Elevation' },
      ] as const).map(({ key, label }) => {
        const active = view === key;
        return (
          <button
            key={key}
            role="radio"
            aria-checked={active}
            onClick={() => setView(key)}
            className={`relative z-10 flex items-center justify-center gap-2 px-4 py-2.5 transition-colors ${
              active ? 'text-white' : 'text-[#40C8EF] hover:text-[#00B6EB]'
            }`}
          >
            <span className="uppercase font-display font-medium tracking-[-0.36px] text-[13px] md:text-sm">{label}</span>
          </button>
        );
      })}
    </div>
  );

  return (
    <PageLayout
      title="Route"
      meta={
        measurementSystem === 'metric'
          ? `${formatNumber(4345)} km · ${formatNumber((Math.round((TOTAL_CLIMBING_FT * 0.3048) / 1000) * 1000))} m elevation`
          : `${formatNumber(2700)} miles · ${formatNumber(TOTAL_CLIMBING_FT)} feet elevation`
      }
      control={viewSwitch}
    >
      <div className="w-full">
        <RouteMap view={view} direction={direction} towns={towns} measurementSystem={measurementSystem} onOpenTown={onOpenTown} />
      </div>
    </PageLayout>
  );
}
