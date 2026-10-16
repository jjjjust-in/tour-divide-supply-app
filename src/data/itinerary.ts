export interface ItineraryStop {
  id: string;
  mileage: number;
  location: string;
  isClickable: boolean;
  linkedTownId?: string;
}

export const itineraryStops: ItineraryStop[] = [
  { id: 'i1',  mileage: 0,    location: 'Banff, AB',             isClickable: true,  linkedTownId: '1' },
  { id: 'i2',  mileage: 160,  location: 'Fernie, BC',            isClickable: true,  linkedTownId: '2' },
  { id: 'i3',  mileage: 255,  location: 'US / CAN Border',       isClickable: false },
  { id: 'i4',  mileage: 275,  location: 'Eureka, MT',            isClickable: true,  linkedTownId: '3' },
  { id: 'i5',  mileage: 365,  location: 'Whitefish, MT',         isClickable: true,  linkedTownId: '4' },
  { id: 'i6',  mileage: 540,  location: 'Ovando, MT',            isClickable: true,  linkedTownId: '5' },
  { id: 'i7',  mileage: 580,  location: 'Lincoln, MT',           isClickable: true,  linkedTownId: '16' },
  { id: 'i8',  mileage: 640,  location: 'Helena, MT',            isClickable: true,  linkedTownId: '17' },
  { id: 'i9',  mileage: 710,  location: 'Butte, MT',             isClickable: true,  linkedTownId: '18' },
  { id: 'i10', mileage: 770,  location: 'Wise River, MT',        isClickable: true,  linkedTownId: '19' },
  { id: 'i11', mileage: 905,  location: 'Lima, MT',              isClickable: true,  linkedTownId: '6' },
  { id: 'i12', mileage: 1005,  location: 'Island Park, ID',       isClickable: true,  linkedTownId: '8' },
  { id: 'i13', mileage: 1235, location: 'Pinedale, WY',          isClickable: true,  linkedTownId: '9' },
  { id: 'i14', mileage: 1320, location: 'Atlantic City, WY',     isClickable: true,  linkedTownId: '20' },
  { id: 'i15', mileage: 1425, location: 'Wamsutter, WY',         isClickable: true,  linkedTownId: '21' },
  { id: 'i16', mileage: 1560, location: 'Steamboat Springs, CO', isClickable: true,  linkedTownId: '11' },
  { id: 'i17', mileage: 1695, location: 'Frisco, CO',            isClickable: true,  linkedTownId: '22' },
  { id: 'i18', mileage: 1760, location: 'Hartsel, CO',           isClickable: true,  linkedTownId: '23' },
  { id: 'i19', mileage: 1805, location: 'Salida, CO',            isClickable: true,  linkedTownId: '13' },
  { id: 'i20', mileage: 1960, location: 'Del Norte, CO',         isClickable: true,  linkedTownId: '14' },
  { id: 'i21', mileage: 2135, location: 'Abiquiu, NM',           isClickable: true,  linkedTownId: '24' },
  { id: 'i22', mileage: 2210, location: 'Cuba, NM',              isClickable: true,  linkedTownId: '25' },
  { id: 'i23', mileage: 2340, location: 'Grants, NM',            isClickable: true,  linkedTownId: '26' },
  { id: 'i24', mileage: 2410, location: 'Pie Town, NM',          isClickable: true,  linkedTownId: '27' },
  { id: 'i25', mileage: 2585, location: 'Silver City, NM',       isClickable: true,  linkedTownId: '28' },
  { id: 'i26', mileage: 2675, location: 'Hachita, NM',           isClickable: true,  linkedTownId: '29' },
  { id: 'i27', mileage: 2745, location: 'Antelope Wells, NM',    isClickable: true,  linkedTownId: '15' },
];

// alias for any code still referencing itinerary
export const itinerary = itineraryStops;
