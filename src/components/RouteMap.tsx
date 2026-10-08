import { useCallback, useEffect, useMemo, useState } from 'react';
import { LocateFixed, Loader2 } from 'lucide-react';
import gridSvg from '../assets/map/grid.svg?raw';
import outlineSvg from '../assets/map/states-outline.svg?raw';
import stateLinesSvg from '../assets/map/state-lines.svg?raw';
import routeSvg from '../assets/map/route.svg?raw';
import { MAP_LAYOUT, TOWN_ANCHORS } from '../data/mapGeometry';
import type { Town } from '../types';
import type { MeasurementSystem } from '../utils/measurements';
import { locateOnRoute, mileToRoutePoint, type RoutePosition } from '../utils/routeLocation';

// Strip the outer <svg> so each layer can be placed inside one composed map
const innerSvg = (svg: string) => svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
const LAYERS = {
  grid: innerSvg(gridSvg),
  outline: innerSvg(outlineSvg),
  stateLines: innerSvg(stateLinesSvg),
  route: innerSvg(routeSvg),
};

// The prototype build can't use GPS, so it gets a slider to preview positions
const DEMO_LOCATION = import.meta.env.VITE_DEMO_LOCATION === 'true';

type LocationState =
  | { status: 'idle' }
  | { status: 'locating' }
  | { status: 'found'; position: RoutePosition; accuracyMiles?: number }
  | { status: 'error'; message: string };

interface RouteMapProps {
  towns: Town[];
  measurementSystem: MeasurementSystem;
  onOpenTown: (townId: string) => void;
}

const formatRouteDistance = (miles: number, system: MeasurementSystem) => {
  const value = system === 'metric' ? miles * 1.60934 : miles;
  return `${Math.round(value).toLocaleString('en-US')} ${system === 'metric' ? 'km' : 'mi'}`;
};

export function RouteMap({ towns, measurementSystem, onOpenTown }: RouteMapProps) {
  const [location, setLocation] = useState<LocationState>({ status: 'idle' });
  const [selectedTownId, setSelectedTownId] = useState<string | null>(null);
  const [demoMile, setDemoMile] = useState(1215);

  const townMarkers = useMemo(
    () =>
      TOWN_ANCHORS.map((anchor) => {
        const town = towns.find((t) => t.id === anchor.townId);
        const [x, y] = mileToRoutePoint(anchor.mile);
        return town ? { town, mile: anchor.mile, x, y } : null;
      }).filter((m): m is NonNullable<typeof m> => m !== null),
    [towns],
  );

  const locate = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setLocation({ status: 'error', message: 'This device can’t share its location.' });
      return;
    }
    setLocation({ status: 'locating' });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          status: 'found',
          position: locateOnRoute(pos.coords.latitude, pos.coords.longitude),
          accuracyMiles: pos.coords.accuracy / 1609.34,
        });
      },
      (err) => {
        const message =
          err.code === err.PERMISSION_DENIED
            ? 'Location is off for this app. Turn it on in Settings to see yourself on the map.'
            : 'Couldn’t get a GPS fix. Try again with a clear view of the sky.';
        setLocation({ status: 'error', message });
      },
      // GPS works without cell signal; accept a fix up to a minute old to save battery
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 60000 },
    );
  }, []);

  // Find the rider once when the map opens. Refresh is manual to save battery.
  useEffect(() => {
    if (!DEMO_LOCATION) locate();
  }, [locate]);

  // Prototype: position comes from the preview slider
  const position: RoutePosition | null = DEMO_LOCATION
    ? (() => {
        const [x, y] = mileToRoutePoint(demoMile);
        return { actual: [x, y], snapped: [x, y], mile: demoMile, milesFromRoute: 0, onRoute: true };
      })()
    : location.status === 'found'
      ? location.position
      : null;

  const nextTown = position ? townMarkers.find((m) => m.mile > position.mile + 0.5) : null;
  const selected = townMarkers.find((m) => m.town.id === selectedTownId) ?? null;
  const { viewBox, route } = MAP_LAYOUT;
  const dot = position ? (position.onRoute ? position.snapped : position.actual) : null;

  return (
    <div className="w-full max-w-[360px] mx-auto space-y-4">
      {/* Map */}
      <div className="relative w-full">
        <svg
          viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
          fill="none"
          className="w-full h-auto block"
          role="img"
          aria-label="Map of the Tour Divide route from Banff to Antelope Wells"
          onClick={() => setSelectedTownId(null)}
        >
          <g fill="none" transform={`translate(${MAP_LAYOUT.grid.x} ${MAP_LAYOUT.grid.y})`} dangerouslySetInnerHTML={{ __html: LAYERS.grid }} />
          <g fill="none" transform={`translate(${MAP_LAYOUT.statesOutline.x} ${MAP_LAYOUT.statesOutline.y})`} dangerouslySetInnerHTML={{ __html: LAYERS.outline }} />
          <g fill="none" transform={`translate(${MAP_LAYOUT.stateLines.x} ${MAP_LAYOUT.stateLines.y})`} dangerouslySetInnerHTML={{ __html: LAYERS.stateLines }} />
          <g transform={`translate(${route.x} ${route.y}) scale(${route.scaleX} ${route.scaleY})`}>
            <g fill="none" dangerouslySetInnerHTML={{ __html: LAYERS.route }} />

            {/* Towns */}
            {townMarkers.map(({ town, x, y }) => {
              const isSelected = town.id === selectedTownId;
              return (
                <g
                  key={town.id}
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTownId(isSelected ? null : town.id);
                  }}
                >
                  <circle cx={x} cy={y} r={7} fill="transparent" />
                  {isSelected && <circle cx={x} cy={y} r={4.6} fill="none" stroke="#231F20" strokeWidth={1} />}
                  <circle cx={x} cy={y} r={2.4} fill="#231F20" />
                </g>
              );
            })}

            {/* Off route: a dashed line back to the nearest point on the route */}
            {position && !position.onRoute && (
              <line
                x1={position.actual[0]}
                y1={position.actual[1]}
                x2={position.snapped[0]}
                y2={position.snapped[1]}
                stroke="#231F20"
                strokeWidth={0.8}
                strokeDasharray="2 2"
              />
            )}

            {/* You are here */}
            {dot && (
              <g pointerEvents="none">
                <circle cx={dot[0]} cy={dot[1]} r={4} fill="#febc12" opacity={0.35} className="motion-safe:animate-[map-pulse_2s_ease-out_infinite] origin-center [transform-box:fill-box]" />
                <circle cx={dot[0]} cy={dot[1]} r={4} fill="#febc12" stroke="#231F20" strokeWidth={1.2} />
              </g>
            )}
          </g>
        </svg>
      </div>

      {/* Selected town */}
      {selected && (
        <div className="flex items-center justify-between gap-3 bg-white border border-[#40c8ef] px-4 py-3">
          <div className="min-w-0">
            <p className="font-display font-medium text-[13px] uppercase tracking-tight text-black truncate">
              {selected.town.name}, {selected.town.state}
            </p>
            <p className="text-[12px] text-black/60">
              {measurementSystem === 'metric' ? 'Km' : 'Mile'} {Math.round(measurementSystem === 'metric' ? selected.mile * 1.60934 : selected.mile).toLocaleString('en-US')}
            </p>
          </div>
          <button
            onClick={() => onOpenTown(selected.town.id)}
            className="shrink-0 bg-[#40c8ef] text-white px-4 py-2.5 rounded text-[12px] font-display font-medium uppercase tracking-[-0.2px] hover:bg-[#00B6EB] transition-colors"
          >
            View town
          </button>
        </div>
      )}

      {/* Where you are */}
      <div className="flex items-center justify-between gap-3 bg-white border border-[#40c8ef] px-4 py-3">
        <div className="min-w-0" aria-live="polite">
          {position ? (
            position.onRoute ? (
              <>
                <p className="font-display font-bold text-[16px] text-black">
                  {measurementSystem === 'metric' ? 'Km' : 'Mile'} {Math.round(measurementSystem === 'metric' ? position.mile * 1.60934 : position.mile).toLocaleString('en-US')}
                </p>
                <p className="text-[12px] text-black/60">
                  {nextTown
                    ? `${formatRouteDistance(nextTown.mile - position.mile, measurementSystem)} to ${nextTown.town.name}`
                    : 'Antelope Wells. You made it.'}
                </p>
              </>
            ) : (
              <>
                <p className="font-display font-bold text-[16px] text-black">Off route</p>
                <p className="text-[12px] text-black/60">
                  {formatRouteDistance(position.milesFromRoute, measurementSystem)} from the route, nearest {measurementSystem === 'metric' ? 'km' : 'mile'}{' '}
                  {Math.round(measurementSystem === 'metric' ? position.mile * 1.60934 : position.mile).toLocaleString('en-US')}
                </p>
              </>
            )
          ) : location.status === 'locating' ? (
            <p className="text-[13px] text-black/70">Finding you…</p>
          ) : location.status === 'error' ? (
            <p className="text-[13px] text-black/70">{location.message}</p>
          ) : (
            <p className="text-[13px] text-black/70">Tap locate to see where you are on the route.</p>
          )}
        </div>
        {!DEMO_LOCATION && (
          <button
            onClick={locate}
            disabled={location.status === 'locating'}
            aria-label="Find my location"
            className="shrink-0 w-11 h-11 flex items-center justify-center rounded-full bg-[#febc12] text-[#231F20] hover:bg-[#feca3d] transition-colors disabled:opacity-60 touch-manipulation"
          >
            {location.status === 'locating' ? <Loader2 size={20} className="animate-spin" /> : <LocateFixed size={20} />}
          </button>
        )}
      </div>

      {DEMO_LOCATION && (
        <div className="space-y-2 px-1">
          <label htmlFor="demo-mile" className="block text-[12px] text-black/60">
            Prototype only: drag to preview a position. On a phone, this comes from GPS.
          </label>
          <input
            id="demo-mile"
            type="range"
            min={0}
            max={2700}
            step={1}
            value={demoMile}
            onChange={(e) => setDemoMile(Number(e.target.value))}
            className="w-full accent-[#40c8ef]"
          />
        </div>
      )}
    </div>
  );
}
