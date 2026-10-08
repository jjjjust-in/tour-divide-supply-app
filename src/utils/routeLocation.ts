import { ROUTE_POINTS, ROUTE_PROJECTION, TOWN_ANCHORS } from '../data/mapGeometry';

// Places a GPS position on the drawn route.
// Everything works offline: it's plain math on the bundled route geometry.

const toRad = (deg: number) => (deg * Math.PI) / 180;
const toDeg = (rad: number) => (rad * 180) / Math.PI;
const mercY = (lat: number) => Math.log(Math.tan(Math.PI / 4 + toRad(lat) / 2));

const { x0, y0, sx, sy, lat0, lon0 } = ROUTE_PROJECTION;
const MERC0 = mercY(lat0);

/** Latitude/longitude to route.svg coordinates. */
export function projectToRoute(lat: number, lon: number): [number, number] {
  return [x0 + sx * toRad(lon - lon0), y0 + sy * (MERC0 - mercY(lat))];
}

/** Route.svg coordinates back to latitude/longitude. */
export function unprojectFromRoute(x: number, y: number): [number, number] {
  const lon = lon0 + toDeg((x - x0) / sx);
  const lat = toDeg(2 * Math.atan(Math.exp(MERC0 - (y - y0) / sy)) - Math.PI / 2);
  return [lat, lon];
}

/** Great-circle distance in miles. */
export function haversineMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// Cumulative length along the drawn route, in px
const CUMULATIVE: number[] = ROUTE_POINTS.reduce<number[]>((acc, [x, y], i) => {
  if (i === 0) return [0];
  const [px, py] = ROUTE_POINTS[i - 1];
  acc.push(acc[i - 1] + Math.hypot(x - px, y - py));
  return acc;
}, []);

/** Distance along the drawn route (px) to route miles, anchored on the towns. */
export function pathPxToMile(pathPx: number): number {
  const a = TOWN_ANCHORS;
  if (pathPx <= a[0].pathPx) return a[0].mile;
  for (let i = 1; i < a.length; i++) {
    if (pathPx <= a[i].pathPx) {
      const t = (pathPx - a[i - 1].pathPx) / (a[i].pathPx - a[i - 1].pathPx);
      return a[i - 1].mile + t * (a[i].mile - a[i - 1].mile);
    }
  }
  return a[a.length - 1].mile;
}

/** Route miles to a point on the drawn route. */
export function mileToRoutePoint(mile: number): [number, number] {
  const a = TOWN_ANCHORS;
  let pathPx = a[a.length - 1].pathPx;
  if (mile <= a[0].mile) pathPx = a[0].pathPx;
  else {
    for (let i = 1; i < a.length; i++) {
      if (mile <= a[i].mile) {
        const t = (mile - a[i - 1].mile) / (a[i].mile - a[i - 1].mile);
        pathPx = a[i - 1].pathPx + t * (a[i].pathPx - a[i - 1].pathPx);
        break;
      }
    }
  }
  for (let i = 1; i < ROUTE_POINTS.length; i++) {
    if (pathPx <= CUMULATIVE[i]) {
      const seg = CUMULATIVE[i] - CUMULATIVE[i - 1] || 1;
      const t = (pathPx - CUMULATIVE[i - 1]) / seg;
      const [ax, ay] = ROUTE_POINTS[i - 1];
      const [bx, by] = ROUTE_POINTS[i];
      return [ax + t * (bx - ax), ay + t * (by - ay)];
    }
  }
  return ROUTE_POINTS[ROUTE_POINTS.length - 1];
}

/** Riders farther than this from the route are shown as off route. */
export const OFF_ROUTE_MILES = 5;

export interface RoutePosition {
  /** Where the rider actually is, in route.svg coordinates */
  actual: [number, number];
  /** Nearest point on the route, in route.svg coordinates */
  snapped: [number, number];
  /** Route mile of the nearest point */
  mile: number;
  /** Straight-line distance from the route, in miles */
  milesFromRoute: number;
  onRoute: boolean;
}

/** Place a GPS position on the route. */
export function locateOnRoute(lat: number, lon: number): RoutePosition {
  const [x, y] = projectToRoute(lat, lon);
  let best = { dist: Infinity, px: 0, py: 0, along: 0 };
  for (let i = 1; i < ROUTE_POINTS.length; i++) {
    const [ax, ay] = ROUTE_POINTS[i - 1];
    const [bx, by] = ROUTE_POINTS[i];
    const dx = bx - ax;
    const dy = by - ay;
    const len2 = dx * dx + dy * dy;
    const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / len2));
    const px = ax + t * dx;
    const py = ay + t * dy;
    const dist = Math.hypot(x - px, y - py);
    if (dist < best.dist) best = { dist, px, py, along: CUMULATIVE[i - 1] + t * Math.sqrt(len2) };
  }
  const [slat, slon] = unprojectFromRoute(best.px, best.py);
  const milesFromRoute = haversineMiles(lat, lon, slat, slon);
  return {
    actual: [x, y],
    snapped: [best.px, best.py],
    mile: pathPxToMile(best.along),
    milesFromRoute,
    onRoute: milesFromRoute <= OFF_ROUTE_MILES,
  };
}
