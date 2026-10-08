import type { Town } from '../types';

export const towns: Town[] = [
  {
    id: '1',
    name: 'Banff',
    state: 'AB',
    mileage: 0,
    elevation: 4535,
    position: { x: 19, y: 0.5 },
    population: 8305,
    funFacts: [
      'Gateway to the Canadian Rockies and home to Banff National Park, Canada\'s first national park established in 1885',
      'The town sits within a national park, making it one of the few places in the world where wildlife has right-of-way',
      'Banff hosts the prestigious Banff Mountain Film and Book Festival every fall'
    ]
  },
  {
    id: '2',
    name: 'Fernie',
    state: 'BC',
    mileage: 155,
    elevation: 3280,
    position: { x: 20.5, y: 2 },
    population: 5250,
    funFacts: [
      'Known for "Fernie Fix" - legendary deep powder snow that attracts skiers from around the world',
      'The town was rebuilt after the Great Fire of 1908 destroyed most of the downtown core',
      'Home to the Griz Bar, a historic watering hole popular with locals and Tour Divide riders'
    ]
  },
  {
    id: '3',
    name: 'Eureka',
    state: 'MT',
    mileage: 270,
    elevation: 2560,
    position: { x: 22.2, y: 5 },
    population: 1040,
    funFacts: [
      'Just 15 miles from the Canadian border, making it one of Montana\'s northernmost towns',
      'The Tobacco River runs through town, a popular spot for fishing and wildlife viewing',
      'Named after the Greek word meaning "I have found it" by early prospectors'
    ]
  },
  {
    id: '4',
    name: 'Whitefish',
    state: 'MT',
    mileage: 360,
    elevation: 3030,
    position: { x: 24, y: 7 },
    population: 7750,
    funFacts: [
      'Home to Whitefish Mountain Resort with over 3000 acres of skiable terrain',
      'The town maintains its historic downtown with buildings dating back to the early 1900s',
      'Whitefish Lake is a pristine alpine lake perfect for swimming and paddling in summer'
    ]
  },
  {
    id: '5',
    name: 'Ovando',
    state: 'MT',
    mileage: 530,
    elevation: 4130,
    position: { x: 27.5, y: 13 },
    population: 70,
    funFacts: [
      'Famous for its bike-friendly Blackfoot Angler shop and campground popular with Tour Divide riders',
      'The town hosts an annual testicle festival and vintage tractor show',
      'Located in the heart of the Blackfoot Valley with abundant grizzly bear and wolf populations'
    ]
  },
  {
    id: '16',
    name: 'Lincoln',
    state: 'MT',
    mileage: 570,
    elevation: 4660,
    position: { x: 28.5, y: 15 },
    population: 1040,
    funFacts: [
      'Famous as the home where Ted Kaczynski (the Unabomber) lived in a remote cabin',
      'A popular resupply stop with several small shops and the Wheel Inn restaurant',
      'Gateway to the scenic Blackfoot River drainage and Bob Marshall Wilderness'
    ]
  },
  {
    id: '17',
    name: 'Helena',
    state: 'MT',
    mileage: 630,
    elevation: 3875,
    position: { x: 29, y: 17 },
    population: 32655,
    funFacts: [
      'Montana\'s capital city with a stunning cathedral and historic Last Chance Gulch downtown',
      'Once known as the richest city per capita in the world during the gold rush era',
      'Mount Helena city park offers excellent hiking with panoramic views of the valley'
    ]
  },
  {
    id: '18',
    name: 'Butte',
    state: 'MT',
    mileage: 700,
    elevation: 5545,
    position: { x: 30, y: 19 },
    population: 34190,
    funFacts: [
      'Known as "The Richest Hill on Earth" from its massive copper mining history',
      'Home to the Berkeley Pit, a former open-pit copper mine now filled with toxic water',
      'Butte\'s historic uptown district preserves the character of a rough-and-tumble mining town'
    ]
  },
  {
    id: '19',
    name: 'Wise River',
    state: 'MT',
    mileage: 755,
    elevation: 5610,
    position: { x: 30.5, y: 20.5 },
    population: 100,
    funFacts: [
      'Tiny town famous among anglers for world-class trout fishing on the Big Hole River',
      'The Wise River Club is a popular stop for food and drinks among Tour Divide riders',
      'Named after a trapper who worked the river in the early 1800s'
    ]
  },
  {
    id: '6',
    name: 'Lima',
    state: 'MT',
    mileage: 890,
    elevation: 6285,
    position: { x: 31, y: 21.5 },
    population: 220,
    funFacts: [
      'Sits at one of the highest elevations of any incorporated town in Montana',
      'The Mountain View Co-op is a classic old-west mercantile and Tour Divide resupply stop',
      'Named after Lima, Ohio by early settlers who hailed from that region'
    ]
  },
  {
    id: '8',
    name: 'Island Park',
    state: 'ID',
    mileage: 990,
    elevation: 6290,
    position: { x: 36.5, y: 30 },
    population: 285,
    funFacts: [
      'Home to the world\'s largest caliber rifle - a scale model big enough to climb inside',
      'The Island Park Caldera is one of the world\'s largest volcanic calderas',
      'World-class fly fishing on the Henry\'s Fork of the Snake River draws anglers globally'
    ]
  },
  {
    id: '9',
    name: 'Pinedale',
    state: 'WY',
    mileage: 1215,
    elevation: 7175,
    position: { x: 43, y: 43.5 },
    population: 2030,
    funFacts: [
      'Gateway to the Wind River Range, one of the most spectacular mountain ranges in the Lower 48',
      'The Museum of the Mountain Man showcases the region\'s fur trapping history',
      'Pinedale hosts the Green River Rendezvous, reenacting the historic fur traders\' gathering'
    ]
  },
  {
    id: '20',
    name: 'Atlantic City',
    state: 'WY',
    mileage: 1300,
    elevation: 7985,
    position: { x: 46, y: 49 },
    population: 37,
    funFacts: [
      'Historic gold mining town with several preserved buildings from the 1860s boom era',
      'The Atlantic City Mercantile serves as a vital resupply point in this remote area',
      'Despite the name, it\'s about as far from the ocean as you can get in the continental U.S.'
    ]
  },
  {
    id: '21',
    name: 'Wamsutter',
    state: 'WY',
    mileage: 1400,
    elevation: 6690,
    position: { x: 49, y: 54 },
    population: 450,
    funFacts: [
      'A windswept highway town in the Red Desert known for brutal weather conditions',
      'Major natural gas production area with visible drilling operations throughout the basin',
      'One of the most exposed and challenging sections of the entire Tour Divide route'
    ]
  },
  {
    id: '11',
    name: 'Steamboat Springs',
    state: 'CO',
    mileage: 1535,
    elevation: 6730,
    position: { x: 56, y: 66 },
    population: 13050,
    funFacts: [
      'Famous for Champagne Powder snow and has produced more Winter Olympians than any U.S. town',
      'Over 150 natural hot springs bubble throughout the area, including downtown\'s Heart Spring',
      'The historic downtown maintains strict Western architecture codes preserving its frontier character'
    ]
  },
  {
    id: '22',
    name: 'Frisco',
    state: 'CO',
    mileage: 1665,
    elevation: 9075,
    position: { x: 59, y: 71 },
    population: 2990,
    funFacts: [
      'Charming mountain town situated between several major Colorado ski resorts',
      'The Frisco Adventure Park offers year-round activities including a massive tubing hill',
      'Main Street retains its historic mining town character with colorful Victorian buildings'
    ]
  },
  {
    id: '23',
    name: 'Hartsel',
    state: 'CO',
    mileage: 1730,
    elevation: 8940,
    position: { x: 63, y: 76 },
    population: 650,
    funFacts: [
      'Tiny crossroads town in the vast South Park basin surrounded by mountain ranges',
      'The South Park Saloon is a popular gathering spot for locals and passing cyclists',
      'South Park (the basin, not the town) inspired the name of the famous TV show'
    ]
  },
  {
    id: '13',
    name: 'Salida',
    state: 'CO',
    mileage: 1775,
    elevation: 7085,
    position: { x: 67, y: 81 },
    population: 5665,
    funFacts: [
      'Known as the whitewater capital of Colorado with world-class kayaking and rafting',
      'Boasts the largest historic district in Colorado with over 100 preserved buildings',
      'The annual FIBArk whitewater festival is the oldest and one of the largest in America'
    ]
  },
  {
    id: '14',
    name: 'Del Norte',
    state: 'CO',
    mileage: 1930,
    elevation: 7875,
    position: { x: 67, y: 89 },
    population: 1590,
    funFacts: [
      'Gateway to the San Juan Mountains and Wolf Creek Pass, one of Colorado\'s snowiest areas',
      'The town sits in the wide San Luis Valley, the world\'s largest alpine valley',
      'Del Norte means "of the north" - it was the northern settlement in the San Luis Valley'
    ]
  },
  {
    id: '24',
    name: 'Abiquiu',
    state: 'NM',
    mileage: 2100,
    elevation: 6430,
    position: { x: 66, y: 92 },
    population: 230,
    funFacts: [
      'Famous as the home of artist Georgia O\'Keeffe who painted the dramatic landscape',
      'The colorful rock formations and mesas inspired many of O\'Keeffe\'s iconic works',
      'Abiquiu Lake is a popular recreation area with striking red rock surroundings'
    ]
  },
  {
    id: '25',
    name: 'Cuba',
    state: 'NM',
    mileage: 2175,
    elevation: 6920,
    position: { x: 65.5, y: 93 },
    population: 600,
    funFacts: [
      'Small town serving as a gateway to the remote Nacimiento Mountains',
      'The El Bruno\'s restaurant is famous among Tour Divide riders for huge portions',
      'Named by early Spanish settlers, though the origin of why remains debated'
    ]
  },
  {
    id: '26',
    name: 'Grants',
    state: 'NM',
    mileage: 2300,
    elevation: 6465,
    position: { x: 64.5, y: 94 },
    population: 9180,
    funFacts: [
      'Once the "Uranium Capital of the World" with the New Mexico Mining Museum documenting the era',
      'El Malpais National Monument nearby features dramatic lava flows and ancient pueblos',
      'The town sits along historic Route 66 with vintage neon signs still visible'
    ]
  },
  {
    id: '27',
    name: 'Pie Town',
    state: 'NM',
    mileage: 2370,
    elevation: 7850,
    position: { x: 64, y: 95 },
    population: 60,
    funFacts: [
      'Named after a baker who sold pies to passing miners and cowboys in the 1920s',
      'The Pie-O-Neer Café and Pie Town Café continue the tradition with delicious homemade pies',
      'Hosts an annual Pie Festival each September celebrating the town\'s sweet legacy'
    ]
  },
  {
    id: '28',
    name: 'Silver City',
    state: 'NM',
    mileage: 2545,
    elevation: 5895,
    position: { x: 65, y: 96.5 },
    population: 9960,
    funFacts: [
      'Historic mining town where Billy the Kid spent part of his childhood',
      'Western New Mexico University and a thriving arts scene give it a unique cultural vibe',
      'The Gila Cliff Dwellings National Monument is a short drive north of town'
    ]
  },
  {
    id: '29',
    name: 'Hachita',
    state: 'NM',
    mileage: 2630,
    elevation: 4780,
    position: { x: 65.5, y: 97.3 },
    population: 55,
    funFacts: [
      'Tiny desert town near the Mexican border in the remote Hidalgo County',
      'Once a railroad and ranching community, now nearly a ghost town',
      'The surrounding area is known for dramatic desert landscapes and wildlife'
    ]
  },
  {
    id: '15',
    name: 'Antelope Wells',
    state: 'NM',
    mileage: 2700,
    elevation: 4405,
    position: { x: 66, y: 97.5 },
    population: 40,
    funFacts: [
      'The official southern terminus of the Tour Divide and Continental Divide Trail',
      'The remote border crossing is only staffed during limited hours - plan accordingly!',
      'Closest services are 80+ miles away, making this one of the most remote border crossings'
    ]
  },
];
