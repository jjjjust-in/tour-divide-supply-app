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
        {/* Map / Elevation: one choice, styled like the main nav buttons */}
        <div role="radiogroup" aria-label="Route view" className="flex gap-2 pb-2">
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
                className={`border-2 px-4 py-2.5 rounded-lg transition-all flex items-center gap-2 ${
                  active
                    ? 'bg-[#40C8EF] text-white border-[#40C8EF] shadow-lg'
                    : 'bg-white text-[#40C8EF] border-[#40C8EF] hover:bg-[#F5FCFF]'
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
