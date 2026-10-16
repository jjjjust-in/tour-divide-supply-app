import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, LocateFixed, Loader2 } from 'lucide-react';
import gridSvg from '../assets/map/grid.svg?raw';
import navBgPattern from 'figma:asset/53e87b274f9e9eae37a672b63e5feb2e3c44276d.png';
import outlineSvg from '../assets/map/states-outline.svg?raw';
import stateLinesSvg from '../assets/map/state-lines.svg?raw';
import routeSvg from '../assets/map/route.svg?raw';
import elevationSvg from '../assets/map/elevation-profile.svg?raw';
import coloradoLabelSvg from '../assets/map/labels/colorado.svg?raw';
import idahoLabelSvg from '../assets/map/labels/idaho.svg?raw';
import montanaLabelSvg from '../assets/map/labels/montana.svg?raw';
import newMexicoLabelSvg from '../assets/map/labels/new-mexico.svg?raw';
import wyomingLabelSvg from '../assets/map/labels/wyoming.svg?raw';
import { ELEVATION_LAYOUT, ELEVATION_LINE, ELEVATION_SCALE_X } from '../data/elevationGeometry';
import { MAP_LAYOUT, TOWN_ANCHORS } from '../data/mapGeometry';
import { MAP_STATES, STATES_OUTLINE } from '../data/mapStates';
import { ROUTE_POIS, type RoutePoi } from '../data/passes';
import { inRideOrder, rideMile, ROUTE_TOTAL_MILES, type RideDirection } from '../utils/direction';
import { ELEVATION_POLYGON } from '../data/elevationGeometry';
import type { Town } from '../types';
import type { MeasurementSystem } from '../utils/measurements';
import { formatNumber } from '../utils/measurements';
import { mileToRoutePoint, type RoutePosition } from '../utils/routeLocation';
import { DEMO_LOCATION, useRiderLocation } from '../utils/useRiderLocation';

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

// State name artwork, keyed by state abbreviation. Each is drawn at
// STATE_LABEL_HEIGHT map units tall, centred on the state's labelAt point.
const svgWidth = (svg: string) => Number(svg.match(/<svg[^>]*\bwidth="([\d.]+)"/)?.[1]);
const svgHeight = (svg: string) => Number(svg.match(/<svg[^>]*\bheight="([\d.]+)"/)?.[1]);
const STATE_LABEL_HEIGHT = 6;
const STATE_LABELS: Record<string, { svg: string; width: number; height: number }> = Object.fromEntries(
  ([
    ['MT', montanaLabelSvg],
    ['ID', idahoLabelSvg],
    ['WY', wyomingLabelSvg],
    ['CO', coloradoLabelSvg],
    ['NM', newMexicoLabelSvg],
  ] as const).map(([abbr, svg]) => [abbr, { svg: innerSvg(svg), width: svgWidth(svg), height: svgHeight(svg) }])
);

// The grid is 16 x 27 squares, each one 100 x 100 miles
const GRID = { cols: 16, rows: 27, x0: 0.5, y0: 0.5, cellW: 18.625, cellH: 17.7778 };

// The grid is centered on screen and keeps its true shape. On a phone it
// scales down so the whole 16 x 27 grid fits the width with a 32px gutter;
// on wider screens it stops growing at the Itinerary list's height (27 rows
// of 24px plus its border). Artwork that breaks past the grid can still run
// off the screen edges.
const ITINERARY_LIST_PX = 27 * 24 + 2;
const GRID_UNITS_TALL = 481;
const GRID_UNITS_WIDE = 298;
const GRID_CENTER_X = 149.8;
// The grid's outside edges and outer line, in map units (grid.svg strokes the
// border 1.5 units thick, from x 0 to x 299), so the waypoint card can line up with it exactly
const GRID_OUTER_LEFT = 0;
const GRID_OUTER_RIGHT = 299;
const GRID_OUTER_STROKE = 1.5;
const SCREEN_GUTTER_PX = 32;
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

type MapSelection =
  | { kind: 'cell'; col: number; row: number }
  | { kind: 'poi'; poi: RoutePoi }
  | null;

interface RouteMapProps {
  /** Which picture to show above the waypoint card */
  view?: 'map' | 'elevation';
  /** Mileposts and waypoint order follow the rider's direction */
  direction?: RideDirection;
  towns: Town[];
  measurementSystem: MeasurementSystem;
  /** Off in Settings: never ask for GPS and hide the locate button */
  locationEnabled?: boolean;
  onOpenTown: (townId: string) => void;
}

const toUnits = (miles: number, system: MeasurementSystem) => (system === 'metric' ? miles * 1.60934 : miles);
const unit = (system: MeasurementSystem) => (system === 'metric' ? 'km' : 'mi');
const formatDistance = (miles: number, system: MeasurementSystem) =>
  `${formatNumber(Math.round(toUnits(miles, system)))} ${unit(system)}`;
const formatMilepost = (miles: number, system: MeasurementSystem) =>
  `${system === 'metric' ? 'Km' : 'Mile'} ${formatNumber(Math.round(toUnits(miles, system)))}`;

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

export function RouteMap({ view = 'map', direction = 'sobo', towns, measurementSystem, locationEnabled = true, onOpenTown }: RouteMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const mapScale = useMapScale();
  const MAP_PX_WIDTH = MAP_LAYOUT.viewBox.width * mapScale;
  const MAP_PX_HEIGHT = MAP_LAYOUT.viewBox.height * mapScale;
  // Headroom above the map so Banff's dot and selection ring aren't clipped at the top edge
  const MAP_TOP_ROOM = 8;
  // Offset that puts the grid's center at the center of the screen
  const MAP_PX_LEFT_OF_CENTER = (GRID_CENTER_X - MAP_LAYOUT.viewBox.x) * mapScale;
  // The grid itself (not the artwork around it), for sizing the waypoint card
  const GRID_PX_WIDTH = (GRID_OUTER_RIGHT - GRID_OUTER_LEFT) * mapScale;
  const GRID_PX_LEFT_OF_CENTER = (GRID_CENTER_X - GRID_OUTER_LEFT) * mapScale;
  const GRID_STROKE_PX = GRID_OUTER_STROKE * mapScale;
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
        return town ? { town, mile: anchor.mile, ride: rideMile(anchor.mile, direction), x, y } : null;
      }).filter((m): m is NonNullable<typeof m> => m !== null),
    [towns, direction],
  );
  const rideWaypoints = useMemo(() => inRideOrder(waypoints, direction), [waypoints, direction]);
  const passes = useMemo(
    () => inRideOrder(ROUTE_POIS, direction).map((p) => ({ ...p, ride: rideMile(p.mile, direction) })),
    [direction],
  );

  // Found once when the map opens; the locate button refreshes it
  const { location, locate } = useRiderLocation(locationEnabled);

  const position: RoutePosition | null = DEMO_LOCATION
    ? (() => {
        const [x, y] = mileToRoutePoint(demoMile);
        return { actual: [x, y], snapped: [x, y], mile: demoMile, milesFromRoute: 0, onRoute: true };
      })()
    : location.status === 'found'
      ? location.position
      : null;

  // Until the rider picks a waypoint, show the next town ahead of them
  // Rider's own milepost (counts from Antelope Wells when northbound)
  const positionRide = position ? rideMile(position.mile, direction) : null;
  const nextIndex = positionRide !== null ? rideWaypoints.findIndex((w) => w.ride > positionRide + 0.5) : -1;
  const activeIndex = waypointIndex ?? (nextIndex >= 0 ? nextIndex : position ? rideWaypoints.length - 1 : 0);
  const waypoint = rideWaypoints[activeIndex];
  const following = rideWaypoints[activeIndex + 1];

  // Elevation view steps through passes and climbs instead of towns
  const nextPassIndex = positionRide !== null ? passes.findIndex((p) => p.ride > positionRide + 0.5) : -1;
  const activePassIndex = passIndex ?? (nextPassIndex >= 0 ? nextPassIndex : position ? passes.length - 1 : 0);
  const pass = passes[activePassIndex];
  const followingPass = passes[activePassIndex + 1];

  // Map coordinates of a pointer event
  const toMapPoint = (clientX: number, clientY: number): [number, number] | null => {
    const svg = svgRef.current;
    const ctm = svg?.getScreenCTM();
    if (!svg || !ctm) return null;
    const pt = new DOMPoint(clientX, clientY).matrixTransform(ctm.inverse());
    return [pt.x, pt.y];
  };

  // What's under a map point: a grid square outside the states (states aren't tappable)
  const hitTest = (p: [number, number]): MapSelection => {
    const sl: [number, number] = [p[0] - MAP_LAYOUT.stateLines.x, p[1] - MAP_LAYOUT.stateLines.y];
    if (pointInPolygon(sl, STATES_OUTLINE)) return null;
    const col = Math.floor((p[0] - GRID.x0) / GRID.cellW);
    const row = Math.floor((p[1] - GRID.y0) / GRID.cellH);
    if (col >= 0 && col < GRID.cols && row >= 0 && row < GRID.rows) return { kind: 'cell', col, row };
    return null;
  };

  // Elevation view: squares carry an elevation band and mile range; the profile shape itself isn't tappable
  const hitTestElevation = (p: [number, number]): MapSelection => {
    const artX = ELEVATION_LAYOUT.artLeft + (p[0] - ELEVATION_LAYOUT.artLeft) / ELEVATION_SCALE_X;
    if (pointInPolygon([artX, p[1]], ELEVATION_POLYGON)) return null;
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
    // Tapping the same square again clears it
    const same = hit?.kind === 'cell' && selection?.kind === 'cell' && selection.col === hit.col && selection.row === hit.row;
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

  // Label pinned above the selected square, in % of the map box
  const { route } = MAP_LAYOUT;
  // Both views share one frame so the grid stays put; artwork may break past it
  const viewBox = MAP_LAYOUT.viewBox;
  const label = (() => {
    const pct = (x: number, y: number) => ({
      left: Math.min(98, Math.max(2, ((x - viewBox.x) / viewBox.width) * 100)),
      top: ((y - viewBox.y) / viewBox.height) * 100,
    });
    if (cellRect && shownCell && view === 'elevation') {
      // Columns are slices of 1500' to 12,000'; rows are equal slices of the route (about 102 miles)
      const feetPerCol = (ELEVATION_LAYOUT.maxFeet - ELEVATION_LAYOUT.minFeet) / GRID.cols;
      const lowFt = ELEVATION_LAYOUT.minFeet + shownCell.col * feetPerCol;
      const band =
        measurementSystem === 'metric'
          ? `${formatNumber((Math.round((lowFt * 0.3048) / 10) * 10))}–${formatNumber((Math.round(((lowFt + feetPerCol) * 0.3048) / 10) * 10))} m`
          : `${formatNumber((Math.round(lowFt / 50) * 50))}–${formatNumber((Math.round((lowFt + feetPerCol) / 50) * 50))}'`;
      const milesPerRow = ROUTE_TOTAL_MILES / GRID.rows;
      const sStart = Math.round(shownCell.row * milesPerRow);
      const sEnd = Math.min(ROUTE_TOTAL_MILES, Math.round((shownCell.row + 1) * milesPerRow));
      const [rStart, rEnd] = direction === 'nobo' ? [rideMile(sEnd, direction), rideMile(sStart, direction)] : [sStart, sEnd];
      const from = formatNumber(Math.round(toUnits(rStart, measurementSystem)));
      const to = formatNumber(Math.round(toUnits(rEnd, measurementSystem)));
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
    return null;
  })();

  const dot = position ? (position.onRoute ? position.snapped : position.actual) : null;
  const isElevation = view === 'elevation';
  const cardCount = isElevation ? passes.length : rideWaypoints.length;
  const cardIndex = isElevation ? activePassIndex : activeIndex;
  const stepTo = (i: number) => {
    const next = Math.max(0, Math.min(cardCount - 1, i));
    if (isElevation) setPassIndex(next);
    else setWaypointIndex(next);
  };
  // On route, the card leads with how far the shown waypoint is from the rider.
  // That matters more than the gap to the waypoint after it, so it replaces it.
  const tracking = !!position && position.onRoute && positionRide !== null;
  const distanceFromRider = (ride: number) => {
    if (positionRide === null) return null;
    const gap = ride - positionRide;
    if (Math.abs(gap) < 0.5) return "You're here";
    // Whole miles (or km), not the rounded-to-5 used for route stats
    const d = unitWords(Math.abs(gap));
    return gap > 0 ? `${d} ahead` : `${d} behind you`;
  };
  const unitWords = (miles: number) => {
    const n = Math.max(1, Math.round(toUnits(miles, measurementSystem)));
    const word = measurementSystem === 'metric' ? (n === 1 ? 'kilometer' : 'kilometers') : n === 1 ? 'mile' : 'miles';
    return `${formatNumber(n)} ${word}`;
  };
  // Where the rider stands, when it needs saying: shown along the bottom of the card
  const locationStatus = DEMO_LOCATION
    ? null
    : !locationEnabled
      ? 'Location is off. Turn it on in Settings.'
      : position && !position.onRoute
        ? `Off route: ${formatDistance(position.milesFromRoute, measurementSystem)} from the route, nearest ${formatMilepost(rideMile(position.mile, direction), measurementSystem).toLowerCase()}`
        : location.status === 'locating'
          ? 'Finding you…'
          : location.status === 'error'
            ? location.message
            : null;
  const passElevation = (ft: number) =>
    measurementSystem === 'metric' ? `${formatNumber(Math.round(ft * 0.3048))} m` : `${formatNumber(ft)}'`;

  return (
    <div className="w-full space-y-4">
      {/* Map */}
      {/* Full-width strip; the grid is centered and the rest falls off the sides */}
      <div className="relative w-screen max-w-[100vw] left-1/2 -translate-x-1/2 overflow-clip" style={{ height: MAP_PX_HEIGHT + MAP_TOP_ROOM }}>
      <div className="absolute select-none" style={{ top: MAP_TOP_ROOM, width: MAP_PX_WIDTH, left: `calc(50% - ${MAP_PX_LEFT_OF_CENTER}px)` }}>
        {view === 'elevation' ? (
          <svg
            ref={svgRef}
            viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
            fill="none"
            className="w-full h-auto block cursor-pointer overflow-visible"
            role="img"
            aria-label="Elevation profile from Banff (top) to Antelope Wells (bottom). Each grid row is about 100 route miles."
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
            {passes.map((poi, i) => {
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
          aria-label="Map of the Tour Divide route from Banff to Antelope Wells. Tap a grid square for details."
          onClick={handleMapClick}
          onPointerMove={handlePointerMove}
          onPointerLeave={() => setHoverCell(null)}
        >
          <g fill="none" transform={`translate(${MAP_LAYOUT.grid.x} ${MAP_LAYOUT.grid.y})`} dangerouslySetInnerHTML={{ __html: LAYERS.grid }} />

          {/* Highlighted 100-mile square */}
          {cellRect && (
            <rect x={cellRect.x} y={cellRect.y} width={GRID.cellW} height={GRID.cellH} fill="#40C8EF" opacity={0.45} pointerEvents="none" />
          )}

          <g fill="none" transform={`translate(${MAP_LAYOUT.statesOutline.x} ${MAP_LAYOUT.statesOutline.y})`} dangerouslySetInnerHTML={{ __html: LAYERS.outline }} />

          <g fill="none" transform={`translate(${MAP_LAYOUT.stateLines.x} ${MAP_LAYOUT.stateLines.y})`} dangerouslySetInnerHTML={{ __html: LAYERS.stateLines }} />

          {/* State names */}
          <g transform={`translate(${MAP_LAYOUT.stateLines.x} ${MAP_LAYOUT.stateLines.y})`} pointerEvents="none" aria-hidden="true">
            {MAP_STATES.map((state) => {
              const label = STATE_LABELS[state.abbr];
              if (!label) return null;
              const k = STATE_LABEL_HEIGHT / label.height;
              const [lx, ly] = state.labelAt;
              return (
                <g
                  key={state.abbr}
                  transform={`translate(${lx - (label.width * k) / 2} ${ly - STATE_LABEL_HEIGHT / 2}) scale(${k})`}
                  dangerouslySetInnerHTML={{ __html: label.svg }}
                />
              );
            })}
          </g>

          <g transform={`translate(${route.x} ${route.y}) scale(${route.scaleX} ${route.scaleY})`}>
            <g fill="none" pointerEvents="none" dangerouslySetInnerHTML={{ __html: LAYERS.route }} />

            {/* Towns */}
            {rideWaypoints.map(({ town, x, y }, i) => (
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


        {/* Label for the selected square */}
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
        {!DEMO_LOCATION && locationEnabled && (
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

      {/* Waypoint card: towns on the map, passes and climbs on the elevation profile.
          Compact, the same width as the grid, and pinned just above the bottom nav. */}
      {(isElevation ? pass : waypoint) && (
        <div
          className="sticky bottom-[127px] md:bottom-[144px] z-20 bg-white border-solid border-[#40C8EF] shadow-[0_6px_24px_rgba(35,31,32,0.12)]"
          style={{ width: GRID_PX_WIDTH, marginLeft: `calc(50% - ${GRID_PX_LEFT_OF_CENTER}px)`, borderWidth: GRID_STROKE_PX }}
        >
          <div className="flex items-stretch">
            <button
              onClick={() => stepTo(cardIndex - 1)}
              disabled={cardIndex === 0}
              aria-label={isElevation ? 'Previous pass' : 'Previous waypoint'}
              className="w-11 shrink-0 flex items-center justify-center text-black hover:bg-[#F5FCFF] disabled:opacity-25 transition-colors touch-manipulation"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex-1 min-w-0 py-2.5 text-center" aria-live="polite">
              {isElevation ? (
                <>
                  {/* Name and elevation together; a long name wraps rather than hiding the elevation */}
                  <p className="font-display font-bold text-[15px] leading-tight uppercase tracking-tight text-black [text-wrap:balance]">
                    {pass.name} <span className="whitespace-nowrap tabular-nums">· {passElevation(pass.elevationFt)}</span>
                  </p>
                  <p className={tracking ? 'font-display font-semibold text-[13px] uppercase text-black tabular-nums truncate mt-0.5' : 'text-[11px] uppercase text-black/60 tabular-nums truncate mt-0.5'}>
                    {tracking ? distanceFromRider(pass.ride) : followingPass ? `${unitWords(followingPass.ride - pass.ride)} to ${followingPass.name}` : 'Last big climb'}
                  </p>
                </>
              ) : (
                <>
                  <button
                    onClick={() => onOpenTown(waypoint.town.id)}
                    aria-label={`Open ${waypoint.town.name} in the itinerary`}
                    className="max-w-full font-display font-bold text-[15px] uppercase tracking-tight text-black truncate hover:text-[#00B6EB] transition-colors"
                  >
                    {waypoint.town.name}, {waypoint.town.state}
                  </button>
                  <p className={tracking ? 'font-display font-semibold text-[13px] uppercase text-black tabular-nums truncate mt-0.5' : 'text-[11px] uppercase text-black/60 tabular-nums truncate mt-0.5'}>
                    {tracking ? distanceFromRider(waypoint.ride) : following ? `${unitWords(following.ride - waypoint.ride)} to ${following.town.name}` : 'Finish line'}
                  </p>
                </>
              )}
            </div>
            <button
              onClick={() => stepTo(cardIndex + 1)}
              disabled={cardIndex === cardCount - 1}
              aria-label={isElevation ? 'Next pass' : 'Next waypoint'}
              className="w-11 shrink-0 flex items-center justify-center text-black hover:bg-[#F5FCFF] disabled:opacity-25 transition-colors touch-manipulation"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          {locationStatus && (
            <p
              className="border-t border-solid border-[#40C8EF] bg-[#F5FCFF] px-3 py-1.5 text-center text-[11px] leading-snug text-black/70"
              style={{ borderTopWidth: GRID_STROKE_PX }}
              aria-live="polite"
            >
              {locationStatus}
            </p>
          )}
        </div>
      )}

      {DEMO_LOCATION && (
        <div className="space-y-2 px-1">
          <label htmlFor="demo-mile" className="block text-[12px] text-black/60">
            Prototype only: drag to preview a position. On a phone, this comes from GPS.
          </label>
          <input
            id="demo-mile"
            type="range"
            min={0}
            max={ROUTE_TOTAL_MILES}
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
