import { useEffect, useState } from 'react';
import type { Town } from '../types';
import type { MeasurementSystem } from '../utils/measurements';
import { MapIcon, Mountain } from 'lucide-react';
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
        {/* Map / Elevation: one switch with a sliding highlight, styled like the main nav */}
        <div
          role="radiogroup"
          aria-label="Route view"
          className="relative grid grid-cols-2 p-1 border-2 border-[#40C8EF] rounded-lg bg-white shadow-lg mb-2"
        >
          <span
            aria-hidden="true"
            className={`absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-md bg-[#40C8EF] motion-safe:transition-transform motion-safe:duration-200 ease-out ${
              view === 'elevation' ? 'translate-x-full' : 'translate-x-0'
            }`}
          />
          {([
            { key: 'map', label: 'Map', Icon: MapIcon },
            { key: 'elevation', label: 'Elevation', Icon: Mountain },
          ] as const).map(({ key, label, Icon }) => {
            const active = view === key;
            return (
              <button
                key={key}
                role="radio"
                aria-checked={active}
                onClick={() => setView(key)}
                className={`relative z-10 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  active ? 'text-white' : 'text-[#40C8EF] hover:text-[#00B6EB]'
                }`}
              >
                <Icon size={16} />
                <span className="uppercase font-display font-medium tracking-[-0.36px] text-[13px] md:text-sm">{label}</span>
              </button>
            );
          })}
        </div>
        <div className="w-full max-w-[360px]">
          <RouteMap view={view} towns={towns} measurementSystem={measurementSystem} onOpenTown={onOpenTown} />
        </div>
      </div>
    </div>
  );
}
