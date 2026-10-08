// Passes and points of interest on the elevation profile.
//
// Route miles come from Justin's elevation profile design, snapped to the
// profile's local high point. Elevations come from the source listed on each
// pass; 'profile' means no reliable published figure was found and the value
// is read off the elevation artwork (about +/-150 ft). Checked October 2026.

export interface RoutePoi {
  id: string;
  name: string;
  mile: number;
  elevationFt: number;
  /** Where the elevation comes from. 'profile' means read off the elevation artwork (about +/-150 ft). */
  source: string;
}

export const ROUTE_POIS: RoutePoi[] = [
  { id: 'koko-claims', name: 'Koko Claims', mile: 105, elevationFt: 6730, source: 'profile' },
  { id: 'cabin-pass', name: 'Cabin Pass', mile: 218, elevationFt: 5600, source: 'profile' },
  { id: 'galton-pass', name: 'Galton Pass', mile: 254, elevationFt: 6070, source: 'komoot: 1,850 m' },
  { id: 'red-meadow', name: 'Red Meadow', mile: 337, elevationFt: 5630, source: 'bikepacking.com Red Meadow Pass route' },
  { id: 'bug-creek', name: 'Bug Creek', mile: 418, elevationFt: 4940, source: 'profile' },
  { id: 'richmond-peak', name: 'Richmond Peak', mile: 494, elevationFt: 6700, source: 'profile' },
  { id: 'huckleberry-pass', name: 'Huckleberry Pass', mile: 557, elevationFt: 5960, source: 'profile' },
  { id: 'lava-mountain', name: 'Lava Mountain', mile: 659, elevationFt: 7470, source: 'profile' },
  { id: 'fleecer-ridge', name: 'Fleecer Ridge', mile: 752, elevationFt: 7840, source: 'profile' },
  { id: 'old-bannack-road', name: 'Old Bannack Road Pass', mile: 861, elevationFt: 7880, source: 'profile' },
  { id: 'union-pass', name: 'Union Pass', mile: 1152, elevationFt: 9212, source: 'TopoQuest (USGS)' },
  { id: 'lynx-pass', name: 'Lynx Pass', mile: 1594, elevationFt: 8953, source: 'TopoQuest (USGS)' },
  { id: 'boreas-pass', name: 'Boreas Pass', mile: 1699, elevationFt: 11481, source: 'Wikipedia (NAVD 88)' },
  { id: 'marshall-pass', name: 'Marshall Pass', mile: 1814, elevationFt: 10846, source: 'cyclepass.com' },
  { id: 'carnero-pass', name: 'Carnero Pass', mile: 1905, elevationFt: 10166, source: 'passbagger.org (USGS BGN: 10,170)' },
  { id: 'indiana-pass', name: 'Indiana Pass', mile: 1964, elevationFt: 11958, source: 'passbagger.org road crest (often quoted as 11,910)' },
  { id: 'polvadera', name: 'Polvadera', mile: 2143, elevationFt: 10328, source: 'MTB Project Polvadera Mesa high point' },
];

/**
 * Total climbing for the whole route, shown when the elevation profile is
 * tapped. Commonly cited as over 200,000 ft; individual riders' GPS records
 * vary (one 2024 race file logged about 174,600 ft). Edit to taste.
 */
export const TOTAL_CLIMBING_FT = 200000;
