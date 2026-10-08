import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, LocateFixed, Loader2 } from 'lucide-react';
import gridSvg from '../assets/map/grid.svg?raw';
import navBgPattern from 'figma:asset/53e87b274f9e9eae37a672b63e5feb2e3c44276d.png';
import outlineSvg from '../assets/map/states-outline.svg?raw';
import stateLinesSvg from '../assets/map/state-lines.svg?raw';
import routeSvg from '../assets/map/route.svg?raw';
import elevationSvg from '../assets/map/elevation-profile.svg?raw';
import { ELEVATION_LAYOUT, ELEVATION_LINE, ELEVATION_SCALE_X } from '../data/elevationGeometry';
import { MAP_LAYOUT, TOWN_ANCHORS } from '../data/mapGeometry';
import { MAP_STATES, STATES_OUTLINE, type MapState } from '../data/mapStates';
import { ROUTE_POIS, TOTAL_CLIMBING_FT, type RoutePoi } from '../data/passes';
import { ELEVATION_POLYGON } from '../data/elevationGeometry';
import type { Town } from '../types';
import { formatElevation, type MeasurementSystem } from '../utils/measurements';
import { locateOnRoute, mileToRoutePoint, type RoutePosition } from '../utils/routeLocation';

// Strip the outer <svg> so each layer can be placed inside one composed map
const innerSvg = (svg: string) => svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
const LAYERS = {
  grid: innerSvg(gridSvg),
  outline: innerSvg(outlineSvg),
  stateLines: innerSvg(stateLinesSvg),
  route: innerSvg(routeSvg),
  // Profile shape filled with the app's dot pattern instead of flat white
  elevation: innerSvg(elevationSvg).replace('fill="white"', 'fill="url(#elevation-dots)"'),
};

// The grid is 16 x 27 squares, each one 100 x 100 miles
const GRID = { cols: 16, rows: 27, x0: 0.5, y0: 0.5, cellW: 18.625, cellH: 17.7778 };

// The grid is centered on screen and keeps its true shape. On a phone it
// scales down so the whole 16 x 27 grid fits the width with a 16px gutter;
// on wider screens it stops growing at the Itinerary list's height (27 rows
// of 24px plus its border). Artwork that breaks past the grid can still run
// off the screen edges.
const ITINERARY_LIST_PX = 27 * 24 + 2;
const GRID_UNITS_TALL = 481;
const GRID_UNITS_WIDE = 298;
const GRID_CENTER_X = 149.8;
const SCREEN_GUTTER_PX = 16;
const MAX_MAP_SCALE = ITINERARY_LIST_PX / GRID_UNITS_TALL;

function useMapScale() {
  const fit = () =>
    typeof window === 'undefined'
      ? MAX_MAP_SCALE
      : Math.min(MAX_MAP_SCALE, (window.innerWidth - SCREEN_GUTTER_PX * 2) / GRID_UNITS_WIDE);
  const [scale, setScale] = useState(fit);
  useEffect(() => {
    const onResize = () => setScale(fit());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return scale;
}

// The prototype build can't use GPS, so it gets a slider to preview positions
const DEMO_LOCATION = import.meta.env.VITE_DEMO_LOCATION === 'true';

type LocationState =
  | { status: 'idle' }
  | { status: 'locating' }
  | { status: 'found'; position: RoutePosition }
  | { status: 'error'; message: string };

type MapSelection =
  | { kind: 'cell'; col: number; row: number }
  | { kind: 'state'; state: MapState }
  | { kind: 'poi'; poi: RoutePoi }
  | { kind: 'climb'; at: [number, number] }
  | null;

interface RouteMapProps {
  /** Which picture to show above the waypoint card */
  view?: 'map' | 'elevation';
  towns: Town[];
  measurementSystem: MeasurementSystem;
  onOpenTown: (townId: string) => void;
}

const toUnits = (miles: number, system: MeasurementSystem) => (system === 'metric' ? miles * 1.60934 : miles);
const unit = (system: MeasurementSystem) => (system === 'metric' ? 'km' : 'mi');
const formatDistance = (miles: number, system: MeasurementSystem) =>
  `${Math.round(toUnits(miles, system)).toLocaleString('en-US')} ${unit(system)}`;
const formatMilepost = (miles: number, system: MeasurementSystem) =>
  `${system === 'metric' ? 'Km' : 'Mile'} ${Math.round(toUnits(miles, system)).toLocaleString('en-US')}`;

function pointInPolygon([x, y]: [number, number], poly: [number, number][]) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/** Route mile to a point on the elevation profile line. */
function mileToElevationPoint(mile: number): [number, number] {
  const { top, bottom, totalMiles } = ELEVATION_LAYOUT;
  const y = top + ((bottom - top) * Math.max(0, Math.min(totalMiles, mile))) / totalMiles;
  const line = ELEVATION_LINE;
  const fit = (x: number) => ELEVATION_LAYOUT.artLeft + (x - ELEVATION_LAYOUT.artLeft) * ELEVATION_SCALE_X;
  if (y <= line[0][1]) return [fit(line[0][0]), y];
  for (let i = 1; i < line.length; i++) {
    if (y <= line[i][1]) {
      const [x0, y0] = line[i - 1];
      const [x1, y1] = line[i];
      const t = y1 === y0 ? 0 : (y - y0) / (y1 - y0);
      return [fit(x0 + t * (x1 - x0)), y];
    }
  }
  return [fit(line[line.length - 1][0]), y];
}

const toPoints = (poly: [number, number][]) => poly.map(([x, y]) => `${x},${y}`).join(' ');

export function RouteMap({ view = 'map', towns, measurementSystem, onOpenTown }: RouteMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const mapScale = useMapScale();
  const MAP_PX_WIDTH = MAP_LAYOUT.viewBox.width * mapScale;
  const MAP_PX_HEIGHT = MAP_LAYOUT.viewBox.height * mapScale;
  // Offset that puts the grid's center at the center of the screen
  const MAP_PX_LEFT_OF_CENTER = (GRID_CENTER_X - MAP_LAYOUT.viewBox.x) * mapScale;
  const [location, setLocation] = useState<LocationState>({ status: 'idle' });
  const [demoMile, setDemoMile] = useState(1215);
  const [selection, setSelection] = useState<MapSelection>(null);
  const [hoverCell, setHoverCell] = useState<{ col: number; row: number } | null>(null);
  const [waypointIndex, setWaypointIndex] = useState<number | null>(null);
  const [passIndex, setPassIndex] = useState<number | null>(null);

  const waypoints = useMemo(
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
      (pos) => setLocation({ status: 'found', position: locateOnRoute(pos.coords.latitude, pos.coords.longitude) }),
      (err) =>
        setLocation({
          status: 'error',
          message:
            err.code === err.PERMISSION_DENIED
              ? 'Location is off for this app. Turn it on in Settings to see yourself on the map.'
              : 'Couldn’t get a GPS fix. Try again with a clear view of the sky.',
        }),
      // GPS works without cell signal; accept a fix up to a minute old to save battery
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 60000 },
    );
  }, []);

  // Find the rider once when the map opens. Refresh is manual to save battery.
  useEffect(() => {
    if (!DEMO_LOCATION) locate();
  }, [locate]);

  const position: RoutePosition | null = DEMO_LOCATION
    ? (() => {
        const [x, y] = mileToRoutePoint(demoMile);
        return { actual: [x, y], snapped: [x, y], mile: demoMile, milesFromRoute: 0, onRoute: true };
      })()
    : location.status === 'found'
      ? location.position
      : null;

  // Until the rider picks a waypoint, show the next town ahead of them
  const nextIndex = position ? waypoints.findIndex((w) => w.mile > position.mile + 0.5) : -1;
  const activeIndex = waypointIndex ?? (nextIndex >= 0 ? nextIndex : position ? waypoints.length - 1 : 0);
  const waypoint = waypoints[activeIndex];
  const following = waypoints[activeIndex + 1];

  // Elevation view steps through passes and climbs instead of towns
  const nextPassIndex = position ? ROUTE_POIS.findIndex((p) => p.mile > position.mile + 0.5) : -1;
  const activePassIndex = passIndex ?? (nextPassIndex >= 0 ? nextPassIndex : position ? ROUTE_POIS.length - 1 : 0);
  const pass = ROUTE_POIS[activePassIndex];
  const followingPass = ROUTE_POIS[activePassIndex + 1];

  // Map coordinates of a pointer event
  const toMapPoint = (clientX: number, clientY: number): [number, number] | null => {
    const svg = svgRef.current;
    const ctm = svg?.getScreenCTM();
    if (!svg || !ctm) return null;
    const pt = new DOMPoint(clientX, clientY).matrixTransform(ctm.inverse());
    return [pt.x, pt.y];
  };

  // What's under a map point: a state, or a grid square outside the states
  const hitTest = (p: [number, number]): MapSelection => {
    const sl: [number, number] = [p[0] - MAP_LAYOUT.stateLines.x, p[1] - MAP_LAYOUT.stateLines.y];
    if (pointInPolygon(sl, STATES_OUTLINE)) {
      const state = MAP_STATES.find((s) => pointInPolygon(sl, s.polygon));
      return state ? { kind: 'state', state } : null;
    }
    const col = Math.floor((p[0] - GRID.x0) / GRID.cellW);
    const row = Math.floor((p[1] - GRID.y0) / GRID.cellH);
    if (col >= 0 && col < GRID.cols && row >= 0 && row < GRID.rows) return { kind: 'cell', col, row };
    return null;
  };

  // Elevation view: squares carry an elevation band and mile range; the profile shape shows total climbing
  const hitTestElevation = (p: [number, number]): MapSelection => {
    const artX = ELEVATION_LAYOUT.artLeft + (p[0] - ELEVATION_LAYOUT.artLeft) / ELEVATION_SCALE_X;
    if (pointInPolygon([artX, p[1]], ELEVATION_POLYGON)) return { kind: 'climb', at: p };
    const col = Math.floor((p[0] - GRID.x0) / GRID.cellW);
    const row = Math.floor((p[1] - GRID.y0) / GRID.cellH);
    if (col >= 0 && col < GRID.cols && row >= 0 && row < GRID.rows) return { kind: 'cell', col, row };
    return null;
  };
  const hitFor = (p: [number, number]) => (view === 'elevation' ? hitTestElevation(p) : hitTest(p));

  // A fresh view starts with nothing selected
  useEffect(() => {
    setSelection(null);
    setHoverCell(null);
  }, [view]);

  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const p = toMapPoint(e.clientX, e.clientY);
    const hit = p ? hitFor(p) : null;
    // Tapping the same square, state or profile again clears it
    const same =
      (hit?.kind === 'climb' && selection?.kind === 'climb') ||
      (hit?.kind === 'state' && selection?.kind === 'state' && selection.state.name === hit.state.name) ||
      (hit?.kind === 'cell' && selection?.kind === 'cell' && selection.col === hit.col && selection.row === hit.row);
    setSelection(same ? null : hit);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.pointerType !== 'mouse') return;
    const p = toMapPoint(e.clientX, e.clientY);
    const hit = p ? hitFor(p) : null;
    setHoverCell(hit?.kind === 'cell' ? { col: hit.col, row: hit.row } : null);
  };

  const shownCell = selection?.kind === 'cell' ? selection : hoverCell;
  const cellRect = shownCell && {
    x: GRID.x0 + shownCell.col * GRID.cellW,
    y: GRID.y0 + shownCell.row * GRID.cellH,
  };

  // Label pinned above the selected square or state, in % of the map box
  const { route } = MAP_LAYOUT;
  // Both views share one frame so the grid stays put; artwork may break past it
  const viewBox = MAP_LAYOUT.viewBox;
  const label = (() => {
    const pct = (x: number, y: number) => ({
      left: Math.min(98, Math.max(2, ((x - viewBox.x) / viewBox.width) * 100)),
      top: ((y - viewBox.y) / viewBox.height) * 100,
    });
    if (cellRect && shownCell && view === 'elevation') {
      // Columns are slices of 1,500' to 12,000'; rows are 100 route miles
      const feetPerCol = (ELEVATION_LAYOUT.maxFeet - ELEVATION_LAYOUT.minFeet) / GRID.cols;
      const lowFt = ELEVATION_LAYOUT.minFeet + shownCell.col * feetPerCol;
      const band =
        measurementSystem === 'metric'
          ? `${(Math.round((lowFt * 0.3048) / 10) * 10).toLocaleString('en-US')}–${(Math.round(((lowFt + feetPerCol) * 0.3048) / 10) * 10).toLocaleString('en-US')} m`
          : `${(Math.round(lowFt / 50) * 50).toLocaleString('en-US')}–${(Math.round((lowFt + feetPerCol) / 50) * 50).toLocaleString('en-US')}'`;
      const from = Math.round(toUnits(shownCell.row * 100, measurementSystem)).toLocaleString('en-US');
      const to = Math.round(toUnits((shownCell.row + 1) * 100, measurementSystem)).toLocaleString('en-US');
      return {
        ...pct(cellRect.x + GRID.cellW / 2, cellRect.y),
        text: band,
        detail: `${measurementSystem === 'metric' ? 'Km' : 'Miles'} ${from}–${to}`,
      };
    }
    if (cellRect) {
      const side = Math.round(toUnits(100, measurementSystem));
      return { ...pct(cellRect.x + GRID.cellW / 2, cellRect.y), text: `${side} × ${side} ${unit(measurementSystem)}` };
    }
    if (selection?.kind === 'climb') {
      const climb =
        measurementSystem === 'metric'
          ? `${(Math.round((TOTAL_CLIMBING_FT * 0.3048) / 1000) * 1000).toLocaleString('en-US')} m`
          : `${TOTAL_CLIMBING_FT.toLocaleString('en-US')}'`;
      return { ...pct(selection.at[0], selection.at[1]), text: `Total climbing · about ${climb}` };
    }
    if (selection?.kind === 'state') {
      const [lx, ly] = selection.state.labelAt;
      return {
        ...pct(lx + MAP_LAYOUT.stateLines.x, ly + MAP_LAYOUT.stateLines.y),
        text: selection.state.name,
        detail: `${formatDistance(selection.state.routeMiles, measurementSystem)} of route`,
      };
    }
    return null;
  })();

  const dot = position ? (position.onRoute ? position.snapped : position.actual) : null;
  const isElevation = view === 'elevation';
  const cardCount = isElevation ? ROUTE_POIS.length : waypoints.length;
  const cardIndex = isElevation ? activePassIndex : activeIndex;
  const stepTo = (i: number) => {
    const next = Math.max(0, Math.min(cardCount - 1, i));
    if (isElevation) setPassIndex(next);
    else setWaypointIndex(next);
  };
  const passElevation = (ft: number) =>
    measurementSystem === 'metric' ? `${Math.round(ft * 0.3048).toLocaleString('en-US')} m` : `${ft.toLocaleString('en-US')}'`;

  return (
    <div className="w-full space-y-4">
      {/* Map */}
      {/* Full-width strip; the grid is centered and the rest falls off the sides */}
      <div className="relative w-screen max-w-[100vw] left-1/2 -translate-x-1/2 overflow-clip" style={{ height: MAP_PX_HEIGHT }}>
      <div className="absolute top-0 select-none" style={{ width: MAP_PX_WIDTH, left: `calc(50% - ${MAP_PX_LEFT_OF_CENTER}px)` }}>
        {view === 'elevation' ? (
          <svg
            ref={svgRef}
            viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
            fill="none"
            className="w-full h-auto block cursor-pointer overflow-visible"
            role="img"
            aria-label="Elevation profile from Banff (top) to Antelope Wells (bottom). Each grid row is 100 route miles."
            onClick={handleMapClick}
            onPointerMove={handlePointerMove}
            onPointerLeave={() => setHoverCell(null)}
          >
            <defs>
              <pattern id="elevation-dots" patternUnits="userSpaceOnUse" width={222} height={222}>
                <rect width={222} height={222} fill="#ffffff" />
                <image href={navBgPattern} width={222} height={222} preserveAspectRatio="none" />
              </pattern>
            </defs>
            <g fill="none" dangerouslySetInnerHTML={{ __html: LAYERS.grid }} />
            {cellRect && (
              <rect x={cellRect.x} y={cellRect.y} width={GRID.cellW} height={GRID.cellH} fill="#40C8EF" opacity={0.45} pointerEvents="none" />
            )}
            <g
              fill="none"
              pointerEvents="none"
              transform={`translate(${ELEVATION_LAYOUT.artLeft} 0) scale(${ELEVATION_SCALE_X} 1) translate(${-ELEVATION_LAYOUT.artLeft} 0)`}
              dangerouslySetInnerHTML={{ __html: LAYERS.elevation }}
            />


            {/* Passes and climbs: dots like the towns on the map; tap to show one in the card */}
            {ROUTE_POIS.map((poi, i) => {
              const [x, y] = mileToElevationPoint(poi.mile);
              return (
                <g
                  key={poi.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelection(null);
                    setPassIndex(i);
                  }}
                >
                  <circle cx={x} cy={y} r={7} fill="transparent" />
                  {i === activePassIndex && <circle cx={x} cy={y} r={4.6} fill="none" stroke="#231F20" strokeWidth={1} />}
                  <circle cx={x} cy={y} r={2.4} fill="#231F20" />
                </g>
              );
            })}

            {/* You are here: nearest route mile, even when off route */}
            {position && (() => {
              const [x, y] = mileToElevationPoint(position.mile);
              return (
                <g pointerEvents="none" opacity={position.onRoute ? 1 : 0.5}>
                  <circle cx={x} cy={y} r={4} fill="#febc12" opacity={0.35} className="motion-safe:animate-[map-pulse_2s_ease-out_infinite] origin-center [transform-box:fill-box]" />
                  <circle cx={x} cy={y} r={4} fill="#febc12" stroke="#231F20" strokeWidth={1.2} />
                </g>
              );
            })()}
          </svg>
        ) : (
        <svg
          ref={svgRef}
          viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
          fill="none"
          className="w-full h-auto block cursor-pointer overflow-visible"
          role="img"
          aria-label="Map of the Tour Divide route from Banff to Antelope Wells. Tap a state or a grid square for details."
          onClick={handleMapClick}
          onPointerMove={handlePointerMove}
          onPointerLeave={() => setHoverCell(null)}
        >
          <defs>
            <pattern id="map-dots" patternUnits="userSpaceOnUse" width={222} height={222}>
              <rect width={222} height={222} fill="#ffffff" />
              <image href={navBgPattern} width={222} height={222} preserveAspectRatio="none" />
            </pattern>
            <clipPath id="states-clip">
              <polygon points={toPoints(STATES_OUTLINE)} />
            </clipPath>
          </defs>

          <g fill="none" transform={`translate(${MAP_LAYOUT.grid.x} ${MAP_LAYOUT.grid.y})`} dangerouslySetInnerHTML={{ __html: LAYERS.grid }} />

          {/* Highlighted 100-mile square */}
          {cellRect && (
            <rect x={cellRect.x} y={cellRect.y} width={GRID.cellW} height={GRID.cellH} fill="#40C8EF" opacity={0.45} pointerEvents="none" />
          )}

          <g fill="none" transform={`translate(${MAP_LAYOUT.statesOutline.x} ${MAP_LAYOUT.statesOutline.y})`} dangerouslySetInnerHTML={{ __html: LAYERS.outline }} />

          {/* Highlighted state */}
          {selection?.kind === 'state' && (
            <g transform={`translate(${MAP_LAYOUT.stateLines.x} ${MAP_LAYOUT.stateLines.y})`} pointerEvents="none">
              <polygon points={toPoints(selection.state.polygon)} fill="url(#map-dots)" clipPath="url(#states-clip)" />
            </g>
          )}

          <g fill="none" transform={`translate(${MAP_LAYOUT.stateLines.x} ${MAP_LAYOUT.stateLines.y})`} dangerouslySetInnerHTML={{ __html: LAYERS.stateLines }} />

          <g transform={`translate(${route.x} ${route.y}) scale(${route.scaleX} ${route.scaleY})`}>
            <g fill="none" pointerEvents="none" dangerouslySetInnerHTML={{ __html: LAYERS.route }} />

            {/* Towns */}
            {waypoints.map(({ town, x, y }, i) => (
              <g
                key={town.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelection(null);
                  setWaypointIndex(i);
                }}
              >
                <circle cx={x} cy={y} r={7} fill="transparent" />
                {i === activeIndex && <circle cx={x} cy={y} r={4.6} fill="none" stroke="#231F20" strokeWidth={1} />}
                <circle cx={x} cy={y} r={2.4} fill="#231F20" />
              </g>
            ))}

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
                pointerEvents="none"
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
        )}


        {/* Label for the selected square or state */}
        {label && (
          <div
            className={`absolute pointer-events-none -translate-y-[calc(100%+6px)] whitespace-nowrap ${
              // keep the label on screen: anchor it inward near the edges
              label.left > 65 ? '-translate-x-[calc(100%-10px)]' : label.left < 35 ? '-translate-x-[10px]' : '-translate-x-1/2'
            } bg-[#231F20] text-white text-center text-[11px] font-display font-medium uppercase tracking-[0.02em] px-2.5 py-1.5 rounded`}
            style={{ left: `${label.left}%`, top: `${label.top}%` }}
            role="status"
          >
            <span className="block">{label.text}</span>
            {'detail' in label && label.detail && (
              <span className="block font-normal normal-case tracking-normal text-white/80 mt-0.5">{label.detail}</span>
            )}
          </div>
        )}
      </div>
        {!DEMO_LOCATION && (
          <button
            onClick={locate}
            disabled={location.status === 'locating'}
            aria-label="Find my location"
            className="absolute right-4 bottom-2 z-10 w-11 h-11 flex items-center justify-center rounded-full bg-[#febc12] text-[#231F20] shadow-lg hover:bg-[#feca3d] transition-colors disabled:opacity-60 touch-manipulation"
          >
            {location.status === 'locating' ? <Loader2 size={20} className="animate-spin" /> : <LocateFixed size={20} />}
          </button>
        )}
      </div>

      {/* Waypoint card: towns on the map, passes and climbs on the elevation profile */}
      {(isElevation ? pass : waypoint) && (
        // Pinned just above the bottom nav so it's always there for stepping through waypoints
        <div className="sticky bottom-[127px] md:bottom-[144px] z-20 bg-white border border-[#40c8ef] max-w-[360px] mx-auto shadow-[0_6px_24px_rgba(35,31,32,0.12)]">
          <div className="flex items-stretch">
            <button
              onClick={() => stepTo(cardIndex - 1)}
              disabled={cardIndex === 0}
              aria-label={isElevation ? 'Previous pass' : 'Previous waypoint'}
              className="w-12 shrink-0 flex items-center justify-center text-black hover:bg-[#F5FCFF] disabled:opacity-25 transition-colors touch-manipulation"
            >
              <ChevronLeft size={22} />
            </button>
            <div className="flex-1 min-w-0 px-2 py-4 text-center" aria-live="polite">
              {isElevation ? (
                <>
                  <p className="text-[12px] text-black/60 uppercase tracking-[0.04em] tabular-nums">
                    {formatMilepost(pass.mile, measurementSystem)} · {passElevation(pass.elevationFt)}
                  </p>
                  <p className="font-display font-bold text-[18px] uppercase tracking-tight text-black truncate mt-1">{pass.name}</p>
                  <p className="text-[13px] text-black/70 tabular-nums mt-1">
                    {followingPass
                      ? `${formatDistance(followingPass.mile - pass.mile, measurementSystem)} to ${followingPass.name}`
                      : 'Last big climb'}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-[12px] text-black/60 uppercase tracking-[0.04em] tabular-nums">
                    {formatMilepost(waypoint.mile, measurementSystem)} · {formatElevation(waypoint.town.elevation, measurementSystem)}
                  </p>
                  <button
                    onClick={() => onOpenTown(waypoint.town.id)}
                    aria-label={`Open ${waypoint.town.name} in the itinerary`}
                    className="max-w-full font-display font-bold text-[18px] uppercase tracking-tight text-black truncate mt-1 underline decoration-[#40c8ef] decoration-2 underline-offset-[5px] hover:text-[#00B6EB] transition-colors"
                  >
                    {waypoint.town.name}, {waypoint.town.state}
                  </button>
                  <p className="text-[13px] text-black/70 tabular-nums mt-1">
                    {following ? `${formatDistance(following.mile - waypoint.mile, measurementSystem)} to ${following.town.name}` : 'Finish line'}
                  </p>
                </>
              )}
            </div>
            <button
              onClick={() => stepTo(cardIndex + 1)}
              disabled={cardIndex === cardCount - 1}
              aria-label={isElevation ? 'Next pass' : 'Next waypoint'}
              className="w-12 shrink-0 flex items-center justify-center text-black hover:bg-[#F5FCFF] disabled:opacity-25 transition-colors touch-manipulation"
            >
              <ChevronRight size={22} />
            </button>
          </div>
        </div>
      )}

      {/* Only speak up when something needs attention */}
      {position && !position.onRoute ? (
        <p className="text-[13px] text-black/70 text-center px-2" aria-live="polite">
          Off route: {formatDistance(position.milesFromRoute, measurementSystem)} from the nearest point, {formatMilepost(position.mile, measurementSystem).toLowerCase()}.
        </p>
      ) : location.status === 'error' ? (
        <p className="text-[13px] text-black/70 text-center px-2" aria-live="polite">{location.message}</p>
      ) : null}

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
            onChange={(e) => {
              setDemoMile(Number(e.target.value));
              setWaypointIndex(null);
              setPassIndex(null);
            }}
            className="w-full accent-[#40c8ef]"
          />
        </div>
      )}
    </div>
  );
}
