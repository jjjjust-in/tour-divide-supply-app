import { useCallback, useEffect, useState } from 'react';
import { locateOnRoute, type RoutePosition } from './routeLocation';

// Where the rider is, for the Route map and the Itinerary.

// The prototype build can't use GPS, so the Route map gets a slider to preview positions
export const DEMO_LOCATION = import.meta.env.VITE_DEMO_LOCATION === 'true';

export type LocationState =
  | { status: 'idle' }
  | { status: 'locating' }
  | { status: 'found'; position: RoutePosition }
  | { status: 'error'; message: string };

/** Finds the rider once when the page opens; `locate` refreshes on demand (saves battery). */
export function useRiderLocation(enabled: boolean) {
  const [location, setLocation] = useState<LocationState>({ status: 'idle' });

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
              ? 'Location is blocked. Allow it in your phone’s Settings.'
              : 'No GPS fix. Try again with a clear view of the sky.',
        }),
      // GPS works without cell signal; accept a fix up to a minute old to save battery
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 60000 },
    );
  }, []);

  useEffect(() => {
    if (DEMO_LOCATION) return;
    if (enabled) locate();
    else setLocation({ status: 'idle' });
  }, [locate, enabled]);

  return { location, locate };
}
