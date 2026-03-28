import type { Note } from '../types';

export const sampleNotes: Note[] = [
  {
    id: 'sample-1',
    townId: '1',
    content: 'Banff is the perfect starting point. Great bike shops and grocery stores. The town can be crowded with tourists, but the energy is amazing. Don\'t skip the hot springs!',
    timestamp: new Date('2024-06-15T10:30:00').getTime(),
  },
  {
    id: 'sample-2',
    townId: '2',
    content: 'Fernie has incredible pizza at the Fernie Pizza Company. The bike shop here is solid - they fixed my derailleur quickly. Great mountain town vibe.',
    timestamp: new Date('2024-06-18T14:20:00').getTime(),
  },
  {
    id: 'sample-3',
    townId: '3',
    content: 'Small border town with friendly people. The gas station has basic resupply items. Get what you need here before heading into Montana\'s backcountry.',
    timestamp: new Date('2024-06-20T09:15:00').getTime(),
  },
  {
    id: 'sample-4',
    townId: '4',
    content: 'Whitefish is beautiful and has everything a bikepacker needs. Took a rest day to swim in the lake and it was perfect. Great breweries and restaurants. Highly recommend spending time here.',
    timestamp: new Date('2024-06-22T16:45:00').getTime(),
  },
  {
    id: 'sample-5',
    townId: '5',
    content: 'Ovando is tiny but the Blackfoot Angler is a lifesaver. They have hot showers, laundry, and are super welcoming to Tour Divide riders. Perfect midway stop.',
    timestamp: new Date('2024-06-25T11:30:00').getTime(),
  },
  {
    id: 'sample-6',
    townId: '16',
    content: 'Lincoln feels remote but has good services. The Wheel Inn serves huge portions - perfect for hungry riders. Stock up on supplies here.',
    timestamp: new Date('2024-06-26T18:00:00').getTime(),
  },
  {
    id: 'sample-7',
    townId: '5',
    content: 'Just got to Ovando and the Blackfoot Angler crew are amazing trail angels. They let me charge my devices and gave me tips for the next section. This place is a gem.',
    timestamp: new Date('2024-06-27T10:00:00').getTime(),
  },
  {
    id: 'sample-8',
    townId: '9',
    content: 'Pinedale is a great town with super friendly locals. The bike shop did excellent work on my drivetrain. Views of the Wind River Range are stunning from here.',
    timestamp: new Date('2024-07-08T12:30:00').getTime(),
  },
  {
    id: 'sample-9',
    townId: '11',
    content: 'Steamboat Springs exceeded expectations! The hot springs were perfect for recovery. Great bike shop, breweries, and restaurants. Could easily stay here for days.',
    timestamp: new Date('2024-07-15T11:00:00').getTime(),
  },
  {
    id: 'sample-10',
    townId: '13',
    content: 'Salida is hands down one of the best trail towns on the route. Beautiful downtown with amazing coffee shops. The river runs right through town. Perfect place to rest and recharge.',
    timestamp: new Date('2024-07-20T13:45:00').getTime(),
  },
];
