import type { Resource } from '../types';

export const resources: Resource[] = [
  {
    id: 'res-01',
    type: 'gpx',
    title: 'GDMBR Full Route - Northbound',
    description: 'Complete GPS track of the Great Divide Mountain Bike Route from Antelope Wells to Banff. Compiled from ACA maps and community corrections.',
    timestamp: Date.now() - 86400000 * 60,
    fileName: 'GDMBR_NB_2024.gpx',
    fileSize: '4.2 MB',
    isPushed: true
  },
  {
    id: 'res-02',
    type: 'gpx',
    title: 'GDMBR Full Route - Southbound',
    description: 'Complete GPS track southbound from Banff to Antelope Wells. The official Tour Divide direction.',
    timestamp: Date.now() - 86400000 * 60,
    fileName: 'GDMBR_SB_2024.gpx',
    fileSize: '4.2 MB',
    isPushed: true
  },
  {
    id: 'res-03',
    type: 'gpx',
    title: 'Section 1: Banff to Whitefish',
    description: 'First section covering the Canadian Rockies and Northern Montana. Includes the Flathead River valley and Glacier corridor.',
    timestamp: Date.now() - 86400000 * 45,
    fileName: 'GDMBR_S1_Banff_Whitefish.gpx',
    fileSize: '512 KB',
    isPushed: false
  },
  {
    id: 'res-04',
    type: 'gpx',
    title: 'Section 2: Whitefish to Helena',
    description: 'Through the Bob Marshall Wilderness corridor and the Scapegoat Wilderness. Some of the most remote riding on the route.',
    timestamp: Date.now() - 86400000 * 45,
    fileName: 'GDMBR_S2_Whitefish_Helena.gpx',
    fileSize: '621 KB',
    isPushed: false
  },
  {
    id: 'res-05',
    type: 'gpx',
    title: 'Section 3: Helena to Pinedale',
    description: 'Through Butte, the Big Hole Valley, Lima, and into Idaho and Wyoming.',
    timestamp: Date.now() - 86400000 * 45,
    fileName: 'GDMBR_S3_Helena_Pinedale.gpx',
    fileSize: '578 KB',
    isPushed: false
  },
  {
    id: 'res-06',
    type: 'gpx',
    title: 'Section 4: Pinedale to Steamboat',
    description: 'The Great Divide Basin crossing and into Colorado. Wind River Range views and high desert riding.',
    timestamp: Date.now() - 86400000 * 45,
    fileName: 'GDMBR_S4_Pinedale_Steamboat.gpx',
    fileSize: '492 KB',
    isPushed: false
  },
  {
    id: 'res-07',
    type: 'gpx',
    title: 'Section 5: Steamboat to Salida',
    description: 'Colorado high country. Includes Silverthorne, Breckenridge area, and the climb to Salida.',
    timestamp: Date.now() - 86400000 * 45,
    fileName: 'GDMBR_S5_Steamboat_Salida.gpx',
    fileSize: '445 KB',
    isPushed: false
  },
  {
    id: 'res-08',
    type: 'gpx',
    title: 'Section 6: Salida to Antelope Wells',
    description: 'The final push. Indiana Pass, San Luis Valley, New Mexico high desert. Ends at the finish.',
    timestamp: Date.now() - 86400000 * 45,
    fileName: 'GDMBR_S6_Salida_AntelopeWells.gpx',
    fileSize: '667 KB',
    isPushed: false
  },
  {
    id: 'res-09',
    type: 'note',
    title: 'Water Sources Master List',
    description: 'Comprehensive list of reliable water sources along the GDMBR. Updated with 2024 conditions. Covers seasonal springs, stock tanks, and municipal sources.',
    timestamp: Date.now() - 86400000 * 30,
    fileName: 'water_sources_2024.pdf',
    fileSize: '1.1 MB',
    isPushed: true
  },
  {
    id: 'res-10',
    type: 'note',
    title: 'Resupply Box Strategy Guide',
    description: 'Complete guide to sending resupply boxes on the GDMBR. Includes post office addresses, hours, and package holding policies for all major towns.',
    timestamp: Date.now() - 86400000 * 25,
    fileName: 'resupply_boxes_guide.pdf',
    fileSize: '2.3 MB',
    isPushed: true
  },
  {
    id: 'res-11',
    type: 'note',
    title: 'Border Crossing Guide',
    description: 'What to know about the Roosville, MT border crossing. Customs requirements, allowable food items, and what to expect at this remote crossing.',
    timestamp: Date.now() - 86400000 * 50,
    fileName: 'border_crossing_guide.pdf',
    fileSize: '345 KB',
    isPushed: false
  },
  {
    id: 'res-12',
    type: 'note',
    title: 'Bear Country Safety Guide',
    description: 'Best practices for traveling through grizzly and black bear country. Camp setup, food storage, encounters, and spray usage. Required reading for the Northern section.',
    timestamp: Date.now() - 86400000 * 55,
    fileName: 'bear_safety_gdmbr.pdf',
    fileSize: '780 KB',
    isPushed: false
  },
  {
    id: 'res-13',
    type: 'gpx',
    title: 'Alternate: Great Basin Bypass',
    description: 'Western alternate route around the Great Divide Basin via Farson. Adds mileage but has more reliable water and shade. Popular in hot years.',
    timestamp: Date.now() - 86400000 * 20,
    fileName: 'alt_great_basin_bypass.gpx',
    fileSize: '215 KB',
    isPushed: false
  },
  {
    id: 'res-14',
    type: 'gpx',
    title: 'Alternate: Great Falls Montana Route',
    description: 'Northern alternate through Great Falls for additional services and flatter terrain. Good option for riders with knee issues.',
    timestamp: Date.now() - 86400000 * 20,
    fileName: 'alt_great_falls.gpx',
    fileSize: '198 KB',
    isPushed: false
  },
  {
    id: 'res-15',
    type: 'note',
    title: 'Gear List & Recommendations 2024',
    description: 'Curated gear list from successful GDMBR finishers. Bike setup, camping, clothing, and electronics. Includes weight breakdown and budget alternatives.',
    timestamp: Date.now() - 86400000 * 90,
    fileName: 'gear_list_2024.pdf',
    fileSize: '1.8 MB',
    isPushed: true
  }
];

export const sampleResources = resources;
