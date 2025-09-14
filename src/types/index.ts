// Types and Interfaces
export interface Notification {
  id: string;
  type: "warning" | "info" | "success" | "emergency" | "health";
  title?: string; // Optional title for notifications
  message: string;
  time: string;
  priority: "low" | "medium" | "high" | "critical";
  isRead?: boolean; // Optional flag for read/unread status
  hazardType?: string; // Optional hazard type (e.g., "flood", "fire")
}

export type ExtendedActiveTab = ActiveTab | "quickCheckin" | "groupStatus" | "emergencyContacts" | "tripDetails" | "addTrip" | "SOS";

export interface GroupMember {
  id: number;
  name: string;
  status: "safe" | "warning" | "danger";
  lastSeen: string;
  location: string;
  avatar?: string;
}


export type SOSState = "inactive" | "swipe" | "sending" | "sent" | "waiting";
export type ActiveTab = "home" | "map" | "notifications" | "profile" | "help" | "addTrip";

export interface GroupMemberItemProps {
  member: GroupMember;
  showLocation?: boolean;
}

// Trip related types
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