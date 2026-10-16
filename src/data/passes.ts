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
  { id: 'koko-claims', name: 'Koko Claims', mile: 107, elevationFt: 6730, source: 'profile' },
  { id: 'cabin-pass', name: 'Cabin Pass', mile: 222, elevationFt: 5600, source: 'profile' },
  { id: 'galton-pass', name: 'Galton Pass', mile: 258, elevationFt: 6070, source: 'komoot: 1850 m' },
  { id: 'red-meadow', name: 'Red Meadow', mile: 343, elevationFt: 5630, source: 'bikepacking.com Red Meadow Pass route' },
  { id: 'bug-creek', name: 'Bug Creek', mile: 425, elevationFt: 4940, source: 'profile' },
  { id: 'richmond-peak', name: 'Richmond Peak', mile: 502, elevationFt: 6700, source: 'profile' },
  { id: 'huckleberry-pass', name: 'Huckleberry Pass', mile: 566, elevationFt: 5960, source: 'profile' },
  { id: 'lava-mountain', name: 'Lava Mountain', mile: 670, elevationFt: 7470, source: 'profile' },
  { id: 'fleecer-ridge', name: 'Fleecer Ridge', mile: 765, elevationFt: 7840, source: 'profile' },
  { id: 'old-bannack-road', name: 'Old Bannack Road', mile: 875, elevationFt: 7880, source: 'profile' },
  { id: 'red-rock-pass', name: 'Red Rock Pass', mile: 984, elevationFt: 7152, source: 'Wikipedia: 7,152 ft (2,180 m)' },
  { id: 'union-pass', name: 'Union Pass', mile: 1171, elevationFt: 9212, source: 'TopoQuest (USGS)' },
  { id: 'lander-cutoff', name: 'Lander Cutoff', mile: 1295, elevationFt: 8240, source: 'profile (one rider log from Boulder to Atlantic City: 2480 m high point)' },
  { id: 'sand-mountain', name: 'Sand Mountain', mile: 1533, elevationFt: 9840, source: 'two CycleBlaze rider logs from Brush Mountain Lodge: 3000 m and 3002 m high point' },
  { id: 'lynx-pass', name: 'Lynx Pass', mile: 1621, elevationFt: 8953, source: 'TopoQuest (USGS)' },
  { id: 'boreas-pass', name: 'Boreas Pass', mile: 1727, elevationFt: 11481, source: 'Wikipedia (NAVD 88)' },
  { id: 'marshall-pass', name: 'Marshall Pass', mile: 1844, elevationFt: 10846, source: 'cyclepass.com' },
  { id: 'carnero-pass', name: 'Carnero Pass', mile: 1937, elevationFt: 10166, source: 'passbagger.org (USGS BGN: 10,170)' },
  { id: 'indiana-pass', name: 'Indiana Pass', mile: 1997, elevationFt: 11958, source: 'passbagger.org road crest (often quoted as 11,910)' },
  { id: 'polvadera', name: 'Polvadera', mile: 2179, elevationFt: 10328, source: 'MTB Project Polvadera Mesa high point' },
  { id: 'mangas-road-climb', name: 'Mangas Road Climb', mile: 2454, elevationFt: 8340, source: 'profile' },
  { id: 'star-mesa', name: 'Star Mesa High Point', mile: 2555, elevationFt: 8030, source: 'profile' },
  { id: 'hachita-peak', name: 'Hachita Peak', mile: 2704, elevationFt: 5140, source: 'profile' },
];

/**
 * Total climbing for the whole route, shown when the elevation profile is
 * tapped. Commonly cited as over 200,000 ft; individual riders' GPS records
 * vary (one 2024 race file logged about 174,600 ft). Edit to taste.
 */
export const TOTAL_CLIMBING_FT = 200000;
