// Ride direction. The route data is stored southbound (Banff = mile 0,
// Antelope Wells = mile 2700). Northbound riders see everything from their
// own start: the itinerary runs Antelope Wells to Banff and mileposts count
// up from the border.

export type RideDirection = 'sobo' | 'nobo';

export const ROUTE_TOTAL_MILES = 2700;

const STORAGE_KEY = 'tour-divide-direction';

/** Miles from the rider's start, given a southbound route mile. */
export function rideMile(southboundMile: number, direction: RideDirection): number {
  return direction === 'nobo' ? ROUTE_TOTAL_MILES - southboundMile : southboundMile;
}

/** Put a southbound-ordered list in riding order. */
export function inRideOrder<T>(southboundOrdered: T[], direction: RideDirection): T[] {
  return direction === 'nobo' ? [...southboundOrdered].reverse() : southboundOrdered;
}

export function routeLabel(direction: RideDirection): string {
  return direction === 'nobo' ? 'Antelope Wells → Banff' : 'Banff → Antelope Wells';
}

export function loadDirection(): RideDirection {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'nobo' ? 'nobo' : 'sobo';
  } catch {
    return 'sobo';
  }
}

export function saveDirection(direction: RideDirection): void {
  try {
    localStorage.setItem(STORAGE_KEY, direction);
  } catch {
    // not critical
  }
}
