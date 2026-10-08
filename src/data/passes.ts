// Passes and points of interest on the elevation profile.
//
// Route miles come from Justin's elevation profile design, snapped to the
// profile's local high point. Elevations: the five marked `published` use
// the passes' published summit elevations; the rest are read from the
// profile artwork (corrected for its ~85 ft high bias against the published
// passes), so treat them as within about 100 ft. Edit freely.

export interface RoutePoi {
  id: string;
  name: string;
  mile: number;
  elevationFt: number;
  published?: boolean;
}

export const ROUTE_POIS: RoutePoi[] = [
  { id: 'koko-claims', name: 'Koko Claims', mile: 105, elevationFt: 6730 },
  { id: 'cabin-pass', name: 'Cabin Pass', mile: 218, elevationFt: 5600 },
  { id: 'galton-pass', name: 'Galton Pass', mile: 254, elevationFt: 6250 },
  { id: 'red-meadow', name: 'Red Meadow', mile: 337, elevationFt: 5630 },
  { id: 'bug-creek', name: 'Bug Creek', mile: 418, elevationFt: 4940 },
  { id: 'richmond-peak', name: 'Richmond Peak', mile: 494, elevationFt: 6700 },
  { id: 'huckleberry-pass', name: 'Huckleberry Pass', mile: 557, elevationFt: 5960 },
  { id: 'lava-mountain', name: 'Lava Mountain', mile: 659, elevationFt: 7470 },
  { id: 'fleecer-ridge', name: 'Fleecer Ridge', mile: 752, elevationFt: 7840 },
  { id: 'old-bannack-road', name: 'Old Bannack Road Pass', mile: 861, elevationFt: 7880 },
  { id: 'union-pass', name: 'Union Pass', mile: 1152, elevationFt: 9210, published: true },
  { id: 'lynx-pass', name: 'Lynx Pass', mile: 1594, elevationFt: 8937, published: true },
  { id: 'boreas-pass', name: 'Boreas Pass', mile: 1699, elevationFt: 11482, published: true },
  { id: 'marshall-pass', name: 'Marshall Pass', mile: 1814, elevationFt: 10842, published: true },
  { id: 'indiana-pass', name: 'Indiana Pass', mile: 1964, elevationFt: 11910, published: true },
  { id: 'polvadera', name: 'Polvadera', mile: 2143, elevationFt: 10290 },
];

/**
 * Total climbing for the whole route, shown when the elevation profile is
 * tapped. Commonly cited as over 200,000 ft; individual riders' GPS records
 * vary (one 2024 race file logged about 174,600 ft). Edit to taste.
 */
export const TOTAL_CLIMBING_FT = 200000;
