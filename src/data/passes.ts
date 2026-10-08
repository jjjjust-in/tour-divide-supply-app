// Passes and points of interest on the elevation profile.
// Route miles read from Justin's elevation profile design (0 to 2,700 axis);
// Indiana Pass lands on the profile's high point, which checks the scale.

export interface RoutePoi {
  id: string;
  name: string;
  mile: number;
}

export const ROUTE_POIS: RoutePoi[] = [
  { id: 'koko-claims', name: 'Koko Claims', mile: 106 },
  { id: 'galton-pass', name: 'Galton Pass', mile: 254 },
  { id: 'red-meadow', name: 'Red Meadow', mile: 337 },
  { id: 'richmond-peak', name: 'Richmond Peak', mile: 494 },
  { id: 'lava-mountain', name: 'Lava Mountain', mile: 660 },
  { id: 'fleecer-ridge', name: 'Fleecer Ridge', mile: 752 },
  { id: 'union-pass', name: 'Union Pass', mile: 1150 },
  { id: 'lynx-pass', name: 'Lynx Pass', mile: 1594 },
  { id: 'boreas-pass', name: 'Boreas Pass', mile: 1700 },
  { id: 'marshall-pass', name: 'Marshall Pass', mile: 1813 },
  { id: 'indiana-pass', name: 'Indiana Pass', mile: 1964 },
  { id: 'polvadera', name: 'Polvadera', mile: 2142 },
];
