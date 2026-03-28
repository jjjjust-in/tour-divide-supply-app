import type { Note } from '../types';

export const sharedNotes: Note[] = [
  {
    id: 'sn-01',
    townId: 'banff',
    content: 'Bear activity on the trail between Banff and Elk Pass. Multiple sightings reported this week. Make noise, have spray accessible. Park rangers advising riding in groups through this section.',
    timestamp: Date.now() - 86400000 * 2,
    isShared: true,
    author: 'TrailAngel_Maria'
  },
  {
    id: 'sn-02',
    townId: 'eureka',
    content: 'The Eureka IGA is CLOSED for renovations through mid-July. The Dollar Store has limited food supplies. Drive 15 miles north to Tobacco Plains for the next grocery store.',
    timestamp: Date.now() - 86400000 * 3,
    isShared: true,
    author: 'GDMBRwatcher'
  },
  {
    id: 'sn-03',
    townId: 'whitefish',
    content: 'Glacier Cyclery is backed up 3 days for repairs due to a trail race this weekend. Flathead Bikes (new shop) is taking walk-ins. Warmshowers hosts have been incredible this week — 3 different hosts available.',
    timestamp: Date.now() - 86400000 * 1,
    isShared: true,
    author: 'WarmshowersHost_Steve'
  },
  {
    id: 'sn-04',
    townId: 'lincoln',
    content: 'Big blowdown between Lincoln and Helena near the Rogers Pass area. Trail crew working on it but passage requires bike-lifting over several logs. Add 45 min. The Wheel Inn in Lincoln has the BEST pie — stop no matter what.',
    timestamp: Date.now() - 86400000 * 4,
    isShared: true,
    author: 'MTTrailCrew'
  },
  {
    id: 'sn-05',
    townId: 'jackson',
    content: 'Jackson Hot Springs Lodge is fully booked June 15-25. Call ahead! The hot spring pool is open to non-guests for $10. Still worth stopping for the pool and a meal. Big Hole National Battlefield 13 miles east is free.',
    timestamp: Date.now() - 86400000 * 5,
    isShared: true,
    author: 'BigHoleRider'
  },
  {
    id: 'sn-06',
    townId: 'atlantic-city',
    content: 'The Mercantile is only open Thu-Sun this season (owner health issues). Timing your arrival matters! When open, the burgers are still life-changing. Call ahead: (307) 332-5143',
    timestamp: Date.now() - 86400000 * 6,
    isShared: true,
    author: 'WyomingRider2024'
  },
  {
    id: 'sn-07',
    townId: 'rawlins',
    content: 'Water sources in the Great Divide Basin are lower than usual this year due to drought. The one stock pond at mile marker 47 on the basin crossing is RELIABLE. All others questionable. Carry extra.',
    timestamp: Date.now() - 86400000 * 2,
    isShared: true,
    author: 'BasinWatcher'
  },
  {
    id: 'sn-08',
    townId: 'steamboat-springs',
    content: 'Construction on CO-40 near Steamboat. The detour adds 4 miles but is scenic — totally worth it. Steamboat has TWO excellent bike shops this year, with the new one opening on Yampa St offering major discounts to TDMBR riders.',
    timestamp: Date.now() - 86400000 * 1,
    isShared: true,
    author: 'ColoradoLocal'
  },
  {
    id: 'sn-09',
    townId: 'salida',
    content: 'Water report: All creeks on the approach to Indiana Pass are running. The spring at mile 1478 is reliable. Salida has a new bike co-op offering free repairs — check Warmshowers for address. Town is doing a free breakfast for GDMBR riders on Saturday mornings.',
    timestamp: Date.now() - 86400000 * 3,
    isShared: true,
    author: 'SalidaLocals'
  },
  {
    id: 'sn-10',
    townId: 'pie-town',
    content: 'TOASTER HOUSE IS OPEN! Nita confirmed with me she\'ll be there all season. Bring a donation, sign the guest book, eat all the pie. The Pie-O-Neer is only open weekends this year. Daily Pie Cafe is the go-to on weekdays.',
    timestamp: Date.now() - 86400000 * 1,
    isShared: true,
    author: 'PieTownFan'
  },
  {
    id: 'sn-11',
    townId: 'silver-city',
    content: 'The final dirt road section from Silver City to Antelope Wells: excellent conditions, no significant sand drifts this year. Wind forecast for next week shows south-to-north. Aim for early morning starts to avoid afternoon winds.',
    timestamp: Date.now() - 86400000 * 2,
    isShared: true,
    author: 'FinishLineWatcher'
  },
  {
    id: 'sn-12',
    townId: 'chama',
    content: 'The Cumbres Pass is snow-free and dry. Excellent conditions. The route past Ghost Ranch is one of the most scenic sections in New Mexico — take your time. Red Rocks Grill in Abiquiu (slight detour) has incredible food.',
    timestamp: Date.now() - 86400000 * 4,
    isShared: true,
    author: 'NewMexicoGuide'
  },
  {
    id: 'sn-13',
    townId: 'grants',
    content: 'El Malpais trail section is rough this year — volcanic rock is uneven and several riders have had flats. Consider tire sealant top-up before this section. The Pizza Hut in Grants is open 24 hours and judgement-free for hungry cyclists.',
    timestamp: Date.now() - 86400000 * 5,
    isShared: true,
    author: 'GrantsLocal'
  },
  {
    id: 'sn-14',
    townId: 'del-norte',
    content: 'Road closure near mile 1595: the bridge over Embargo Creek is out. The bypass is signed and adds 2 miles. Perfectly rideable. Del Norte has a new bakery on Grand Ave — opens 6am.',
    timestamp: Date.now() - 86400000 * 7,
    isShared: true,
    author: 'SJVRider'
  },
  {
    id: 'sn-15',
    townId: 'pinedale',
    content: 'The Wyoming range section before Pinedale is in excellent condition. Fremont Lake is gorgeous for a swim. The One Shot Steakhouse has a "cyclist special" if you mention the GDMBR — 25% off. Not advertised, just ask.',
    timestamp: Date.now() - 86400000 * 3,
    isShared: true,
    author: 'PinedaleResident'
  }
];
