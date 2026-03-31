export interface ItineraryStop {
  id: string;
  mileage: number;
  location: string;
  isClickable: boolean;
  linkedTownId?: string;
}

export const itineraryStops: ItineraryStop[] = [
  { id: 'i1',  mileage: 0,    location: 'Banff, AB',             isClickable: true,  linkedTownId: '1' },
  { id: 'i2',  mileage: 155,  location: 'Fernie, BC',            isClickable: true,  linkedTownId: '2' },
  { id: 'i3',  mileage: 250,  location: 'US / CAN Border',       isClickable: false },
  { id: 'i4',  mileage: 270,  location: 'Eureka, MT',            isClickable: true,  linkedTownId: '3' },
  { id: 'i5',  mileage: 360,  location: 'Whitefish, MT',         isClickable: true,  linkedTownId: '4' },
  { id: 'i6',  mileage: 530,  location: 'Ovando, MT',            isClickable: true,  linkedTownId: '5' },
  { id: 'i7',  mileage: 570,  location: 'Lincoln, MT',           isClickable: true,  linkedTownId: '16' },
  { id: 'i8',  mileage: 630,  location: 'Helena, MT',            isClickable: true,  linkedTownId: '17' },
  { id: 'i9',  mileage: 700,  location: 'Butte, MT',             isClickable: true,  linkedTownId: '18' },
  { id: 'i10', mileage: 755,  location: 'Wise River, MT',        isClickable: true,  linkedTownId: '19' },
  { id: 'i11', mileage: 890,  location: 'Lima, MT',              isClickable: true,  linkedTownId: '6' },
  { id: 'i12', mileage: 990,  location: 'Island Park, ID',       isClickable: true,  linkedTownId: '8' },
  { id: 'i13', mileage: 1215, location: 'Pinedale, WY',          isClickable: true,  linkedTownId: '9' },
  { id: 'i14', mileage: 1300, location: 'Atlantic City, WY',     isClickable: true,  linkedTownId: '20' },
  { id: 'i15', mileage: 1400, location: 'Wamsutter, WY',         isClickable: true,  linkedTownId: '21' },
  { id: 'i16', mileage: 1535, location: 'Steamboat Springs, CO', isClickable: true,  linkedTownId: '11' },
  { id: 'i17', mileage: 1665, location: 'Frisco, CO',            isClickable: true,  linkedTownId: '22' },
  { id: 'i18', mileage: 1730, location: 'Hartsel, CO',           isClickable: true,  linkedTownId: '23' },
  { id: 'i19', mileage: 1775, location: 'Salida, CO',            isClickable: true,  linkedTownId: '13' },
  { id: 'i20', mileage: 1930, location: 'Del Norte, CO',         isClickable: true,  linkedTownId: '14' },
  { id: 'i21', mileage: 2100, location: 'Abiquiu, NM',           isClickable: true,  linkedTownId: '24' },
  { id: 'i22', mileage: 2175, location: 'Cuba, NM',              isClickable: true,  linkedTownId: '25' },
  { id: 'i23', mileage: 2300, location: 'Grants, NM',            isClickable: true,  linkedTownId: '26' },
  { id: 'i24', mileage: 2370, location: 'Pie Town, NM',          isClickable: true,  linkedTownId: '27' },
  { id: 'i25', mileage: 2545, location: 'Silver City, NM',       isClickable: true,  linkedTownId: '28' },
  { id: 'i26', mileage: 2630, location: 'Hachita, NM',           isClickable: true,  linkedTownId: '29' },
  { id: 'i27', mileage: 2700, location: 'Antelope Wells, NM',    isClickable: true,  linkedTownId: '15' },
];

// alias for any code still referencing itinerary
export const itinerary = itineraryStops;
