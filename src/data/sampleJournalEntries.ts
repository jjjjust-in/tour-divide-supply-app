import type { JournalEntry } from '../types';

export const sampleJournalEntries: JournalEntry[] = [
  {
    id: 'je-01',
    townId: 'banff',
    content: 'Day 0 — Banff. Spent the morning checking gear and repacking. Everything fits. Barely. Bear spray secured to the fork. Weather looks good for the next few days. Had a massive bowl of ramen at Nourish Bistro to load up. Tomorrow it begins.',
    timestamp: Date.now() - 86400000 * 40
  },
  {
    id: 'je-02',
    townId: 'banff',
    content: 'The Banff trail system is gorgeous but the climbs start immediately. Passed a herd of elk grazing right next to the trail. A reminder of why we do this.',
    timestamp: Date.now() - 86400000 * 40 + 3600000
  },
  {
    id: 'je-03',
    townId: 'roosville',
    content: 'Day 1. Crossed into Montana at Roosville. The customs officer asked what I was doing and looked genuinely confused when I explained. "You\'re biking to Mexico?" Yes. Yes I am. 73 miles in, legs are good, spirits high.',
    timestamp: Date.now() - 86400000 * 39
  },
  {
    id: 'je-04',
    townId: 'eureka',
    content: 'Eureka is friendly and low-key. A guy at the gas station recognized the GDMBR sticker on my frame and bought me a coffee. Trail magic on day 2.',
    timestamp: Date.now() - 86400000 * 38
  },
  {
    id: 'je-05',
    townId: 'whitefish',
    content: 'Whitefish is the perfect trail town. Got my first real shower in 3 days. The Great Northern Brewing patio was full of other cyclists — at least 6 other GDMBR riders. Swapped beta for hours.',
    timestamp: Date.now() - 86400000 * 37
  },
  {
    id: 'je-06',
    townId: 'whitefish',
    content: 'Glacier Cyclery adjusted my front derailleur for free and wouldn\'t take any money. The bike community on this route is something else.',
    timestamp: Date.now() - 86400000 * 37 + 7200000
  },
  {
    id: 'je-07',
    townId: 'columbia-falls',
    content: 'Stocked up at Town Pump. The Glacier section tomorrow is what I\'ve been most nervous about — technical trail and significant bear activity. Hung all food tonight.',
    timestamp: Date.now() - 86400000 * 36
  },
  {
    id: 'je-08',
    townId: 'lincoln',
    content: 'Days 4-5 through the Bob Marshall Wilderness were indescribable. No people, just mountains and rivers and a staggering sky. Cried a little on the passes. Arrived in Lincoln hungry as a bear. The Wheel Inn burger was possibly the best thing I\'ve ever eaten.',
    timestamp: Date.now() - 86400000 * 35
  },
  {
    id: 'je-09',
    townId: 'helena',
    content: 'Helena is a proper city. Got actual Chinese food. Walked around Last Chance Gulch. The Parrot Confectionery is as good as advertised — had two hot chocolates. Warmshowers host Mary has a basement full of 4-person sleeping capacity, all occupied with GDMBR riders. We stayed up too late sharing stories.',
    timestamp: Date.now() - 86400000 * 34
  },
  {
    id: 'je-10',
    townId: 'butte',
    content: 'Butte is a strange and wonderful city. The Berkeley Pit is genuinely creepy — acid mine lake filling up an open-pit copper mine. But the people are warm and the food is great. Stocked up at Safeway with resupply box items.',
    timestamp: Date.now() - 86400000 * 33
  },
  {
    id: 'je-11',
    townId: 'jackson',
    content: 'Jackson Hot Springs Lodge. The pool. I cannot overstate how good the hot spring pool felt after the Bitterroot crossings. Stayed an extra hour. Worth it. The steak dinner was excellent too. This is the kind of place that makes you fall in love with the route.',
    timestamp: Date.now() - 86400000 * 31
  },
  {
    id: 'je-12',
    townId: 'lima',
    content: 'Tiny Lima. The Metlen Bar is charming in a haunted-old-west kind of way. The bartender is a GDMBR veteran who greets every cyclist like family. Showed me pictures of riders who\'ve passed through for the last decade.',
    timestamp: Date.now() - 86400000 * 30
  },
  {
    id: 'je-13',
    townId: 'macks-inn',
    content: 'Idaho! The Henry\'s Fork is beautiful. Macks Inn feels like it exists out of time — families in RVs, fly fishermen, and dirt-caked cyclists all sharing the same patch of river.',
    timestamp: Date.now() - 86400000 * 29
  },
  {
    id: 'je-14',
    townId: 'pinedale',
    content: 'The Wind River Range on the western horizon is stunning. Pinedale is a real mountain town with real mountain prices. But the Museum of the Mountain Man was worth an hour. Rest day candidate for sure.',
    timestamp: Date.now() - 86400000 * 26
  },
  {
    id: 'je-15',
    townId: 'atlantic-city',
    content: 'The Mercantile is everything they say. Waited 45 minutes for a burger and didn\'t care at all. The owner knows every GDMBR rider who\'s passed through. Signed the logbook — over 10,000 names.',
    timestamp: Date.now() - 86400000 * 24
  },
  {
    id: 'je-16',
    townId: 'rawlins',
    content: 'Great Divide Basin. I understand why people call it a "moonscape." Also: brutal heat and no shade for 80 miles. The wind was either tailwind or crosswind — never a headwind, somehow. Rawlins feels like civilization after that crossing.',
    timestamp: Date.now() - 86400000 * 23
  },
  {
    id: 'je-17',
    townId: 'jeffrey-city',
    content: 'Jeffrey City is a ghost town with one bar. The Split Rock Bar is staffed by a woman who\'s clearly seen it all. Had a cold soda and signed the wall. The uranium boom was real and so was the bust.',
    timestamp: Date.now() - 86400000 * 22
  },
  {
    id: 'je-18',
    townId: 'steamboat-springs',
    content: 'Colorado! Steamboat Springs feels like stepping into a magazine. The Yampa River trail is glorious. Had a legitimate burrito and craft beer on a patio like a civilized person. The legs are holding up.',
    timestamp: Date.now() - 86400000 * 19
  },
  {
    id: 'je-19',
    townId: 'kremmling',
    content: 'Kremmling is underrated. Sat by the Colorado River for an hour just staring at the mountains. The diner serves enormous pancakes. Met a father-son team doing the route together — inspirational.',
    timestamp: Date.now() - 86400000 * 18
  },
  {
    id: 'je-20',
    townId: 'silverthorne',
    content: 'Silverthorne is ski resort country even in summer. The outlet mall had exactly the pair of socks I needed at 30% off. Sometimes the trail provides.',
    timestamp: Date.now() - 86400000 * 17
  },
  {
    id: 'je-21',
    townId: 'salida',
    content: 'Salida might be my favorite town on the route. The Arkansas River, the art galleries, the coffee shops, the Absolute Bikes crew. Moonlight Pizza at 9pm with a group of other riders. Laughed until we cried.',
    timestamp: Date.now() - 86400000 * 15
  },
  {
    id: 'je-22',
    townId: 'del-norte',
    content: 'Indiana Pass is the highest point on the GDMBR at 11,910 feet. Walked part of it, not gonna lie. But the view from the top is worth every push. Del Norte below was a welcome sight.',
    timestamp: Date.now() - 86400000 * 14
  },
  {
    id: 'je-23',
    townId: 'chama',
    content: 'New Mexico! The Cumbres & Toltec Railroad steams past as you descend into Chama — felt like stepping back in time. Green chile on everything. Vera\'s enchiladas may have saved my life.',
    timestamp: Date.now() - 86400000 * 12
  },
  {
    id: 'je-24',
    townId: 'grants',
    content: 'The El Malpais lava fields near Grants are otherworldly. Grants itself is a bit rough around the edges but the people are kind. Stocked up for the long remote stretch ahead.',
    timestamp: Date.now() - 86400000 * 9
  },
  {
    id: 'je-25',
    townId: 'pie-town',
    content: 'Pie Town. PIE TOWN. The Daily Pie Cafe has a green chile apple pie that should win a Nobel Prize. The Toaster House is a gift to the cycling world. Slept on the porch surrounded by 8 other riders. Nobody wanted to leave.',
    timestamp: Date.now() - 86400000 * 8
  },
  {
    id: 'je-26',
    townId: 'pie-town',
    content: 'Stayed an extra few hours in Pie Town to rest and write. Nita at the cafe has been hosting cyclists here for decades. She knows the route better than most cyclists. Invaluable intel for the final push.',
    timestamp: Date.now() - 86400000 * 8 + 7200000
  },
  {
    id: 'je-27',
    townId: 'silver-city',
    content: 'Silver City. Last big city. The Food Co-op had incredible prepared food — ate a mountain of it. Billy the Kid grew up here. Strange to be so close to the finish after 36 days.',
    timestamp: Date.now() - 86400000 * 5
  },
  {
    id: 'je-28',
    townId: 'silver-city',
    content: 'Rest day in Silver City. Visited the Gila Cliff Dwellings. Hot spring at Gila Hot Springs. The body needed this.',
    timestamp: Date.now() - 86400000 * 4
  },
  {
    id: 'je-29',
    townId: 'antelope-wells',
    content: 'Day 40. Antelope Wells. The border. The fence. The sign. I got here.\n\nI\'m not sure what I expected to feel. Mostly I feel quiet. The desert stretches in all directions and I\'m sitting on my bike at the edge of two countries thinking about Banff and the 2,745 miles between there and here.\n\nThank you. All of it.',
    timestamp: Date.now() - 86400000 * 1
  },
  // Extra entries for good measure
  {
    id: 'je-30',
    townId: 'banff',
    content: 'Pre-ride prep note: Water purification tablets in the handlebar bag. Bear canister lashed to the frame. Food for 3 days minimum. The anticipation is almost unbearable.',
    timestamp: Date.now() - 86400000 * 41
  },
  {
    id: 'je-31',
    townId: 'helena',
    content: 'Legs feel strong after the Helena rest. The rhythm of the road is settling in — wake up, eat, ride, eat, ride, eat, sleep. Repeat. There\'s a clarity to it.',
    timestamp: Date.now() - 86400000 * 34 + 3600000
  },
  {
    id: 'je-32',
    townId: 'butte',
    content: 'The giant "M" on the mountain above Butte is unmistakable. Pork Chop John\'s sandwich is a local legend — thin-cut pork on a bun with mustard, onion and pickle. Ate two.',
    timestamp: Date.now() - 86400000 * 33 + 3600000
  },
  {
    id: 'je-33',
    townId: 'pinedale',
    content: 'The Wyoming wind is a force of nature. Today it was a quartering tailwind which sounds good except you\'re constantly fighting drift. Arrived in Pinedale sun-blasted and ready for a proper meal.',
    timestamp: Date.now() - 86400000 * 26 + 3600000
  },
  {
    id: 'je-34',
    townId: 'rawlins',
    content: 'Great Basin crossing complete. My GPS tracked a straight line for 40 miles where the route is literally just a two-track across open sage. Hardest and most beautiful section so far.',
    timestamp: Date.now() - 86400000 * 23 + 3600000
  },
  {
    id: 'je-35',
    townId: 'steamboat-springs',
    content: 'Rest day in Steamboat. Went to the Strawberry Park Hot Springs and soaked for two hours. My body is a completely different thing than it was 22 days ago — harder, leaner, more efficient.',
    timestamp: Date.now() - 86400000 * 19 + 7200000
  },
  {
    id: 'je-36',
    townId: 'salida',
    content: 'The Arkansas River is genuinely beautiful. Kayakers everywhere despite it being early morning. Met a guy on the trail who\'s done the route 4 times. "Gets better every time," he said. I believe him.',
    timestamp: Date.now() - 86400000 * 15 + 3600000
  },
  {
    id: 'je-37',
    townId: 'chama',
    content: 'The Cumbres Pass crossing into New Mexico is spectacular. The steam train runs on the same route as the highway — you can pace it on the descent. The engineer waved.',
    timestamp: Date.now() - 86400000 * 12 + 3600000
  },
  {
    id: 'je-38',
    townId: 'grants',
    content: 'Ate an entire large pizza by myself at the pizza place in Grants. The caloric needs of endurance cycling are something I will never fully comprehend.',
    timestamp: Date.now() - 86400000 * 9 + 3600000
  },
  {
    id: 'je-39',
    townId: 'silver-city',
    content: 'The final countdown. 592 miles to Antelope Wells. The Gila Wilderness section tomorrow is supposed to be stunning. One of the last great wild places.',
    timestamp: Date.now() - 86400000 * 5 + 3600000
  },
  {
    id: 'je-40',
    townId: 'antelope-wells',
    content: 'Postscript: The last 100 miles are flat desert on dirt road. The wind can make it hellish or heavenly. Mine was heaven. Arrived at 4pm with the sun still high. Ate the last of my food sitting against the border fence. Then called home.',
    timestamp: Date.now() - 86400000 * 1 + 3600000
  },
  // Additional entries to reach 50
  {
    id: 'je-41',
    townId: 'columbia-falls',
    content: 'The Hungry Horse Dam is impressive — 564 feet tall. The road along the reservoir is one of the best of the entire trip so far.',
    timestamp: Date.now() - 86400000 * 36 + 3600000
  },
  {
    id: 'je-42',
    townId: 'lincoln',
    content: 'The Scapegoat Wilderness crossing gave me vertigo — in the best way. Nothing but mountains for 60 miles. My GPS felt unnecessary.',
    timestamp: Date.now() - 86400000 * 35 + 3600000
  },
  {
    id: 'je-43',
    townId: 'jackson',
    content: 'The Big Hole Valley at dawn is otherworldly. Fog in the valley, peaks lit gold above. This is the reward for early mornings.',
    timestamp: Date.now() - 86400000 * 31 + 3600000
  },
  {
    id: 'je-44',
    townId: 'lima',
    content: 'The Centennial Mountains form the Idaho/Montana border here. Wild horses in the valley below. This is what the West looked like before everything.',
    timestamp: Date.now() - 86400000 * 30 + 3600000
  },
  {
    id: 'je-45',
    townId: 'macks-inn',
    content: 'The Henry\'s Fork is one of the most famous trout streams in the world. A guide on the river said he\'s watched Tour Divide riders pass every June for fifteen years.',
    timestamp: Date.now() - 86400000 * 29 + 3600000
  },
  {
    id: 'je-46',
    townId: 'atlantic-city',
    content: 'Atlantic City, Wyoming — not to be confused with the other one. Population 37. One of my favorite places on earth now.',
    timestamp: Date.now() - 86400000 * 24 + 3600000
  },
  {
    id: 'je-47',
    townId: 'jeffrey-city',
    content: 'The abandoned storefronts of Jeffrey City are a lesson in how fast things can change. A boomtown to a ghost town in a decade. The open plains around it are beautiful though.',
    timestamp: Date.now() - 86400000 * 22 + 3600000
  },
  {
    id: 'je-48',
    townId: 'kremmling',
    content: 'Gore Canyon from above — the Colorado River cuts a deep violent slot. The railroad runs through it, which must have taken incredible engineering.',
    timestamp: Date.now() - 86400000 * 18 + 3600000
  },
  {
    id: 'je-49',
    townId: 'del-norte',
    content: 'Indiana Pass. The summit marker. Both hands on the sky. This is what I came for.',
    timestamp: Date.now() - 86400000 * 14 + 3600000
  },
  {
    id: 'je-50',
    townId: 'pie-town',
    content: 'A thunderstorm rolled through Pie Town at midnight. We all watched it from the Toaster House porch. Lightning over the Datil Mountains. Wild and perfect.',
    timestamp: Date.now() - 86400000 * 8 + 14400000
  }
];
