// =============================================================================
// TYPES: Trip Related Types
// File path: src/types/trip.ts
// =============================================================================

export interface PhoneNumber {
  id: string;
  number: string;
  type: 'primary' | 'emergency' | 'other';
  label?: string;
}

export interface TripMember {
  id: string;
  name: string;
  age: number;
  documentType: 'aadhar' | 'passport';
  documentNumber: string;
  phoneNumbers: PhoneNumber[];
  speciallyAbled: boolean;
  specialNeeds?: string;
  emergencyContact?: string;
  relation?: string;
}

export interface TripItinerary {
  id: string;
  date: string;
  location: string;
  activities: string[];
  notes?: string;
}

export interface Trip {
  id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  description?: string;
  members: TripMember[];
  itinerary: TripItinerary[];
  createdAt: string;
  updatedAt: string;
}