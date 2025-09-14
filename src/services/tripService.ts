// =============================================================================
// TRIP SERVICE (Frontend)
// File path: src/services/tripService.ts
// =============================================================================

import authService from './authService';


// Types
interface TripMember {
  id: string;
  name: string;
  age: number;
  documentType: 'aadhar' | 'passport';
  documentNumber: string;
  phoneNumbers: PhoneNumber[];
  speciallyAbled?: boolean;
  specialNeeds?: string;
  emergencyContact?: string;
  relation?: string;
}

interface PhoneNumber {
  id: string;
  number: string;
  type: 'primary' | 'emergency' | 'other';
}

interface TripItinerary {
  id: string;
  date: string;
  location: string;
  activities: string[];
  notes?: string;
}

interface Trip {
  _id?: string;
  userId?: string;
  name: string;
  destination: string;
  description?: string;
  startDate: string;
  endDate: string;
  members: TripMember[];
  itinerary: TripItinerary[];
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  isArchived?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface CreateTripData {
  name: string;
  destination: string;
  description?: string;
  startDate: string;
  endDate: string;
  members: TripMember[];
  itinerary: TripItinerary[];
}

interface TripResponse {
  message: string;
  trip: Trip;
}

interface TripsResponse {
  message: string;
  trips: Trip[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface TripStats {
  total: number;
  statuses: Array<{ status: string; count: number }>;
}

interface TripStatsResponse {
  message: string;
  stats: TripStats;
}

interface ActiveTripResponse {
  hasActiveTrip: boolean;
  activeTrip: Trip | null;
}

class TripService {
  // Create a new trip
  async createTrip(tripData: CreateTripData): Promise<Trip> {
    try {
      const response = await authService.apiRequest('/trips', {
        method: 'POST',
        body: JSON.stringify(tripData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create trip');
      }

      const result: TripResponse = await response.json();
      return result.trip;
    } catch (error) {
      console.error('Create trip error:', error);
      throw error;
    }
  }

  // Get user's active trip
  async getActiveTrip(): Promise<Trip | null> {
    try {
      const response = await authService.apiRequest('/trips/active', {
        method: 'GET',
      });

      if (response.status === 404) {
        return null; // No active trip
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get active trip');
      }

      const result: TripResponse = await response.json();
      return result.trip;
    } catch (error) {
      console.error('Get active trip error:', error);
      throw error;
    }
  }

  // Get user's current trip (based on dates)
  async getCurrentTrip(): Promise<Trip | null> {
    try {
      const response = await authService.apiRequest('/trips/current', {
        method: 'GET',
      });

      if (response.status === 404) {
        return null; // No current trip
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get current trip');
      }

      const result: TripResponse = await response.json();
      return result.trip;
    } catch (error) {
      console.error('Get current trip error:', error);
      throw error;
    }
  }

  // Check if user has active trip
  async checkActiveTrip(): Promise<ActiveTripResponse> {
    try {
      const response = await authService.apiRequest('/trips/check-active', {
        method: 'GET',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to check active trip');
      }
      const rs = await response.json()
      console.log(rs)
      return rs;
    } catch (error) {
      console.error('Check active trip error:', error);
      return { hasActiveTrip: false, activeTrip: null };
    }
  }

  // Get all user trips
  async getUserTrips(options: {
    status?: string;
    limit?: number;
    page?: number;
    includeArchived?: boolean;
  } = {}): Promise<TripsResponse> {
    try {
      const params = new URLSearchParams();
      
      if (options.status) params.append('status', options.status);
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.page) params.append('page', options.page.toString());
      if (options.includeArchived) params.append('includeArchived', 'true');

      const response = await authService.apiRequest(`/trips?${params.toString()}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get trips');
      }

      return await response.json();
    } catch (error) {
      console.error('Get user trips error:', error);
      throw error;
    }
  }

  // Get trip by ID
  async getTripById(tripId: string): Promise<Trip> {
    try {
      const response = await authService.apiRequest(`/trips/${tripId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Trip not found');
      }

      const result: TripResponse = await response.json();
      return result.trip;
    } catch (error) {
      console.error('Get trip by ID error:', error);
      throw error;
    }
  }

  // Update trip
  async updateTrip(tripId: string, updateData: Partial<Trip>): Promise<Trip> {
    try {
      const response = await authService.apiRequest(`/trips/${tripId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update trip');
      }

      const result: TripResponse = await response.json();
      return result.trip;
    } catch (error) {
      console.error('Update trip error:', error);
      throw error;
    }
  }

  // Delete trip
  async deleteTrip(tripId: string): Promise<void> {
    try {
      const response = await authService.apiRequest(`/trips/${tripId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete trip');
      }
    } catch (error) {
      console.error('Delete trip error:', error);
      throw error;
    }
  }

  // Archive trip
  async archiveTrip(tripId: string): Promise<Trip> {
    try {
      const response = await authService.apiRequest(`/trips/${tripId}/archive`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to archive trip');
      }

      const result: TripResponse = await response.json();
      return result.trip;
    } catch (error) {
      console.error('Archive trip error:', error);
      throw error;
    }
  }

  // Activate trip
  async activateTrip(tripId: string): Promise<Trip> {
    try {
      const response = await authService.apiRequest(`/trips/${tripId}/activate`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to activate trip');
      }

      const result: TripResponse = await response.json();
      return result.trip;
    } catch (error) {
      console.error('Activate trip error:', error);
      throw error;
    }
  }

  // Complete trip
  async completeTrip(tripId: string): Promise<Trip> {
    try {
      const response = await authService.apiRequest(`/trips/${tripId}/complete`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to complete trip');
      }

      const result: TripResponse = await response.json();
      return result.trip;
    } catch (error) {
      console.error('Complete trip error:', error);
      throw error;
    }
  }

  // Get trip statistics
  async getTripStats(): Promise<TripStats> {
    try {
      const response = await authService.apiRequest('/trips/stats', {
        method: 'GET',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get trip stats');
      }

      const result: TripStatsResponse = await response.json();
      return result.stats;
    } catch (error) {
      console.error('Get trip stats error:', error);
      throw error;
    }
  }

  // Utility method to format trip data for API
  formatTripForApi(tripData: any): CreateTripData {
    return {
      name: tripData.name,
      destination: tripData.destination,
      description: tripData.description || '',
      startDate: tripData.startDate,
      endDate: tripData.endDate,
      members: tripData.members.map((member: any) => ({
        ...member,
        phoneNumbers: member.phoneNumbers.map((phone: any) => ({
          number: phone.number,
          type: phone.type || 'primary'
        }))
      })),
      itinerary: tripData.itinerary.map((day: any) => ({
        date: day.date,
        location: day.location,
        activities: day.activities.filter((activity: string) => activity.trim()),
        notes: day.notes || ''
      }))
    };
  }
}

// Create and export a singleton instance
const tripService = new TripService();
export default tripService;

// Export types
export type {
  Trip,
  TripMember,
  TripItinerary,
  CreateTripData,
  TripResponse,
  TripsResponse,
  TripStats,
  ActiveTripResponse
};