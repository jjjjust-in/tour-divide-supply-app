import type { Town } from '../types';
import type { MeasurementSystem } from '../utils/measurements';
import { RouteMap } from './RouteMap';

interface MapPageProps {
  towns: Town[];
  measurementSystem: MeasurementSystem;
  onOpenTown: (townId: string) => void;
}

// Map and elevation profile, each with the live location dot
export function MapPage({ towns, measurementSystem, onOpenTown }: MapPageProps) {
  return (
    <div className="relative w-full h-full bg-white overflow-auto">
      <div className="flex flex-col items-center gap-5 px-[20px] md:px-[85px] pt-[40px] pb-[150px] md:pt-[96px] md:pb-[206px]">
        <h1 className="font-display font-bold text-black text-[20px] tracking-[-0.36px] uppercase pb-4">The Route</h1>
        <div className="w-full max-w-[360px]">
          <RouteMap towns={towns} measurementSystem={measurementSystem} onOpenTown={onOpenTown} />
        </div>
      </div>
    </div>
  );
}
