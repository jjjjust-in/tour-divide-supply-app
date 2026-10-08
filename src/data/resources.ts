import type { Resource } from '../types';

// Resources on the Settings & About page.
// - gpx: the current download for each route. Keep exactly one per route and
//   replace it when a new version is published.
// - reroute: active reroutes, always shown highlighted in red.
// File names, sizes and reroute details below are placeholders until the real
// files are hosted.

export const resources: Resource[] = [
  {
    id: 'gpx-tour-divide',
    type: 'gpx',
    title: 'Tour Divide',
    description: 'Current official race route from Topofusion.',
    timestamp: Date.now() - 86400000 * 12,
    fileName: 'TourDivide_2026.gpx',
    fileSize: '4.4 MB',
  },
  {
    id: 'gpx-gdmbr',
    type: 'gpx',
    title: 'Great Divide Mountain Bike Route',
    description: 'Current route from Adventure Cycling Association.',
    timestamp: Date.now() - 86400000 * 30,
    fileName: 'GDMBR_2026.gpx',
    fileSize: '4.2 MB',
  },
  {
    id: 'reroute-example-1',
    type: 'reroute',
    title: 'Example reroute: forest road closure',
    description: 'Placeholder. Describe the closed segment, the detour, and the mile markers where it leaves and rejoins the route.',
    timestamp: Date.now() - 86400000 * 5,
  },
  {
    id: 'reroute-example-2',
    type: 'reroute',
    title: 'Example reroute: fire closure',
    description: 'Placeholder. Note the dates the closure is in effect and link the updated GPX above once it includes the detour.',
    timestamp: Date.now() - 86400000 * 18,
  },
];

export const sampleResources = resources;
