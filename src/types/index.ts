export interface Town {
  id: string;
  name: string;
  state: string;
  mileage: number;
  elevation: number;
  position: { x: number; y: number };
  population: number;
  funFacts: [string, string, string];
}

export interface Note {
  id: string;
  townId: string;
  content: string;
  timestamp: number;
  isShared?: boolean;
  author?: string;
}

export interface JournalEntry {
  id: string;
  townId?: string;
  content: string;
  timestamp: number;
  imageUrl?: string;
}

export interface Resupply {
  id: string;
  townId: string;
  name: string;
  hours: string;
  phone: string;
  address: string;
  timestamp: number;
}

export interface Resource {
  id: string;
  type: 'gpx' | 'note';
  title: string;
  description: string;
  timestamp: number;
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  isPushed?: boolean;
}
