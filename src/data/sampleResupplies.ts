import type { Resupply } from '../types';

export const sampleResupplies: Resupply[] = [
  // Banff, AB (id: '1')
  { id: 'resupply-1',  townId: '1',  name: 'Safeway Banff',                    hours: '7:00 AM - 11:00 PM Daily',          phone: '(403) 762-5329', address: '318 Marten St, Banff, AB T1L 1B2',               timestamp: Date.now() },
  { id: 'resupply-2',  townId: '1',  name: 'IGA Banff',                         hours: '8:00 AM - 10:00 PM Daily',          phone: '(403) 762-3663', address: '201 Bear St, Banff, AB T1L 1A8',                 timestamp: Date.now() },
  // Fernie, BC (id: '2')
  { id: 'resupply-3',  townId: '2',  name: 'Fernie Mountain Market',            hours: '7:00 AM - 9:00 PM Daily',           phone: '(250) 423-4844', address: '491 3rd Ave, Fernie, BC V0B 1M0',                timestamp: Date.now() },
  { id: 'resupply-4',  townId: '2',  name: 'Safeway Fernie',                    hours: '7:00 AM - 10:00 PM Daily',          phone: '(250) 423-3626', address: '1191 7th Ave, Fernie, BC V0B 1M5',               timestamp: Date.now() },
  // Eureka, MT (id: '3')
  { id: 'resupply-5',  townId: '3',  name: 'Tobacco Valley Market',             hours: '7:00 AM - 9:00 PM Daily',           phone: '(406) 297-7121', address: '238 Dewey Ave, Eureka, MT 59917',                timestamp: Date.now() },
  // Whitefish, MT (id: '4')
  { id: 'resupply-6',  townId: '4',  name: 'Super 1 Foods',                     hours: '6:00 AM - 11:00 PM Daily',          phone: '(406) 862-9350', address: '1700 Baker Ave, Whitefish, MT 59937',            timestamp: Date.now() },
  { id: 'resupply-7',  townId: '4',  name: 'Third Street Market',               hours: '8:00 AM - 9:00 PM Daily',           phone: '(406) 862-5054', address: '244 Spokane Ave, Whitefish, MT 59937',           timestamp: Date.now() },
  { id: 'resupply-8',  townId: '4',  name: 'Natural Foods Market',              hours: '8:00 AM - 7:00 PM Daily',           phone: '(406) 862-3663', address: '1120 Baker Ave, Whitefish, MT 59937',            timestamp: Date.now() },
  // Ovando, MT (id: '5')
  { id: 'resupply-9',  townId: '5',  name: 'Blackfoot Angler',                  hours: '7:00 AM - 9:00 PM Daily (Summer)', phone: '(406) 793-5666', address: '304 Main St, Ovando, MT 59854',                  timestamp: Date.now() },
  // Lincoln, MT (id: '16')
  { id: 'resupply-10', townId: '16', name: 'Lincoln Mini Mart',                 hours: '6:00 AM - 10:00 PM Daily',          phone: '(406) 362-4333', address: '116 Main St, Lincoln, MT 59639',                 timestamp: Date.now() },
  { id: 'resupply-11', townId: '16', name: 'Blackfoot Commercial Company',      hours: '8:00 AM - 7:00 PM Mon-Sat',         phone: '(406) 362-4231', address: '145 Main St, Lincoln, MT 59639',                 timestamp: Date.now() },
  // Helena, MT (id: '17')
  { id: 'resupply-12', townId: '17', name: 'Safeway Helena',                    hours: '6:00 AM - 11:00 PM Daily',          phone: '(406) 443-3020', address: '2100 Cedar St, Helena, MT 59601',                timestamp: Date.now() },
  { id: 'resupply-13', townId: '17', name: 'Natural Foods Market',              hours: '8:00 AM - 8:00 PM Daily',           phone: '(406) 443-5150', address: '1505 Euclid Ave, Helena, MT 59601',              timestamp: Date.now() },
  // Butte, MT (id: '18')
  { id: 'resupply-14', townId: '18', name: 'Walmart Supercenter',               hours: '6:00 AM - 11:00 PM Daily',          phone: '(406) 494-6666', address: '3901 Harrison Ave, Butte, MT 59701',             timestamp: Date.now() },
  { id: 'resupply-15', townId: '18', name: 'Town Pump',                         hours: '24 Hours',                          phone: '(406) 723-5107', address: '1019 S Montana St, Butte, MT 59701',             timestamp: Date.now() },
  // Wise River, MT (id: '19')
  { id: 'resupply-16', townId: '19', name: 'Wise River Club',                   hours: '11:00 AM - 9:00 PM Daily',          phone: '(406) 832-3258', address: '39 Main St, Wise River, MT 59762',               timestamp: Date.now() },
  // Lima, MT (id: '6')
  { id: 'resupply-17', townId: '6',  name: 'Mountain View Co-op',               hours: '8:00 AM - 6:00 PM Mon-Sat',         phone: '(406) 276-3511', address: '30 N Main St, Lima, MT 59739',                   timestamp: Date.now() },
  // Island Park, ID (id: '8')
  { id: 'resupply-18', townId: '8',  name: 'Wild West Market',                  hours: '7:00 AM - 9:00 PM Daily',           phone: '(208) 558-7443', address: '3769 US-20, Island Park, ID 83429',              timestamp: Date.now() },
  { id: 'resupply-19', townId: '8',  name: "Pond's Lodge Store",                hours: '7:00 AM - 8:00 PM Daily',           phone: '(208) 558-7221', address: '3757 US-20, Island Park, ID 83429',              timestamp: Date.now() },
  // Pinedale, WY (id: '9')
  { id: 'resupply-20', townId: '9',  name: "Ridley's Family Market",            hours: '6:00 AM - 10:00 PM Daily',          phone: '(307) 367-4131', address: '55 S Fremont Ave, Pinedale, WY 82941',           timestamp: Date.now() },
  { id: 'resupply-21', townId: '9',  name: 'Pinedale Mercantile',               hours: '8:00 AM - 8:00 PM Daily',           phone: '(307) 367-2111', address: '25 N Franklin Ave, Pinedale, WY 82941',          timestamp: Date.now() },
  // Atlantic City, WY (id: '20')
  { id: 'resupply-22', townId: '20', name: 'Atlantic City Mercantile',          hours: '10:00 AM - 6:00 PM Daily (Summer)', phone: '(307) 332-5143', address: '100 Main St, Atlantic City, WY 82520',           timestamp: Date.now() },
  // Wamsutter, WY (id: '21')
  { id: 'resupply-23', townId: '21', name: 'Conoco Station',                    hours: '24 Hours',                          phone: '(307) 324-3456', address: '1200 Daley St, Wamsutter, WY 82336',             timestamp: Date.now() },
  // Steamboat Springs, CO (id: '11')
  { id: 'resupply-24', townId: '11', name: 'City Market',                       hours: '6:00 AM - 11:00 PM Daily',          phone: '(970) 879-5420', address: '1825 Central Park Dr, Steamboat Springs, CO 80487', timestamp: Date.now() },
  { id: 'resupply-25', townId: '11', name: 'Safeway Steamboat',                 hours: '6:00 AM - 11:00 PM Daily',          phone: '(970) 879-2490', address: '1450 S Lincoln Ave, Steamboat Springs, CO 80487', timestamp: Date.now() },
  // Frisco, CO (id: '22')
  { id: 'resupply-26', townId: '22', name: 'City Market Frisco',                hours: '6:00 AM - 11:00 PM Daily',          phone: '(970) 668-3694', address: '880 N Summit Blvd, Frisco, CO 80443',            timestamp: Date.now() },
  // Hartsel, CO (id: '23')
  { id: 'resupply-27', townId: '23', name: 'South Park Saloon & General Store', hours: '7:00 AM - 9:00 PM Daily',           phone: '(719) 836-2806', address: '4865 US-24, Hartsel, CO 80449',                  timestamp: Date.now() },
  // Salida, CO (id: '13')
  { id: 'resupply-28', townId: '13', name: 'City Market Salida',                hours: '6:00 AM - 11:00 PM Daily',          phone: '(719) 539-6844', address: '1020 E Rainbow Blvd, Salida, CO 81201',          timestamp: Date.now() },
  { id: 'resupply-29', townId: '13', name: 'Simple Lodge & Hostel Market',      hours: '7:00 AM - 9:00 PM Daily',           phone: '(719) 650-7220', address: '224 E 1st St, Salida, CO 81201',                 timestamp: Date.now() },
  // Del Norte, CO (id: '14')
  { id: 'resupply-30', townId: '14', name: 'Del Norte Supermarket',             hours: '7:00 AM - 9:00 PM Daily',           phone: '(719) 657-3663', address: '680 Grand Ave, Del Norte, CO 81132',             timestamp: Date.now() },
  // Abiquiu, NM (id: '24')
  { id: 'resupply-31', townId: '24', name: "Bode's General Store",              hours: '9:00 AM - 6:00 PM Mon-Sat',         phone: '(505) 685-4422', address: '21196 US-84, Abiquiu, NM 87510',                 timestamp: Date.now() },
  // Cuba, NM (id: '25')
  { id: 'resupply-32', townId: '25', name: 'Cuba Mini Mart',                    hours: '6:00 AM - 10:00 PM Daily',          phone: '(575) 289-3595', address: '6301 US-550, Cuba, NM 87013',                    timestamp: Date.now() },
  { id: 'resupply-33', townId: '25', name: 'Cuba Trading Post',                 hours: '7:00 AM - 8:00 PM Daily',           phone: '(575) 289-3471', address: '100 Main St, Cuba, NM 87013',                    timestamp: Date.now() },
  // Grants, NM (id: '26')
  { id: 'resupply-34', townId: '26', name: 'Walmart Supercenter',               hours: '6:00 AM - 11:00 PM Daily',          phone: '(505) 285-4000', address: '1604 E Santa Fe Ave, Grants, NM 87020',          timestamp: Date.now() },
  { id: 'resupply-35', townId: '26', name: 'Family Dollar',                     hours: '8:00 AM - 9:00 PM Daily',           phone: '(505) 287-5550', address: '1106 E Santa Fe Ave, Grants, NM 87020',          timestamp: Date.now() },
  // Pie Town, NM (id: '27')
  { id: 'resupply-36', townId: '27', name: 'Pie-O-Neer Café',                   hours: '11:00 AM - 4:00 PM Thu-Mon (Seasonal)', phone: '(575) 772-2711', address: 'US-60, Pie Town, NM 87827',              timestamp: Date.now() },
  // Silver City, NM (id: '28')
  { id: 'resupply-37', townId: '28', name: 'Walmart Supercenter',               hours: '6:00 AM - 11:00 PM Daily',          phone: '(575) 388-8838', address: '1021 US-180 E, Silver City, NM 88061',           timestamp: Date.now() },
  { id: 'resupply-38', townId: '28', name: 'Silver Food Basket',                hours: '7:00 AM - 9:00 PM Daily',           phone: '(575) 538-5472', address: '1200 N Hudson St, Silver City, NM 88061',        timestamp: Date.now() },
  { id: 'resupply-39', townId: '28', name: 'Cobre Valley Natural Foods',        hours: '9:00 AM - 6:00 PM Mon-Sat',         phone: '(575) 388-5060', address: '915 N Hudson St, Silver City, NM 88061',         timestamp: Date.now() },
  // Hachita, NM (id: '29')
  { id: 'resupply-40', townId: '29', name: 'Hachita General Store',             hours: '8:00 AM - 6:00 PM Mon-Sat',         phone: '(575) 544-3344', address: 'Main St, Hachita, NM 88040',                     timestamp: Date.now() },
  // Antelope Wells, NM (id: '15')
  { id: 'resupply-41', townId: '15', name: 'Border Patrol Station (Emergency Only)', hours: 'Limited Hours',               phone: '(575) 542-3434', address: 'Border Rd, Antelope Wells, NM 88020',            timestamp: Date.now() },
];
