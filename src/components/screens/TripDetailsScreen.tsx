// =============================================================================
// Updated TripDetailsScreen.tsx with Backend Integration
// File path: src/components/screens/TripDetailsScreen.tsx
// =============================================================================

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  MapPin, 
  Calendar, 
  Users, 
  Clock, 
  Share, 
  Navigation, 
  Star, 
  Camera, 
  FileText, 
  CheckCircle,
  Loader,
  Phone,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Header from '../layout/Header';
import tripService from '../../services/tripService';
import type { Trip } from '../../services/tripService';

interface TripDetailsScreenProps {
  onBack: () => void;
  onTripCompleted?: () => void;
}

const TripDetailsScreen: React.FC<TripDetailsScreenProps> = ({
  onBack,
  onTripCompleted
}) => {
  const {  i18n } = useTranslation();
  const [selectedTab, setSelectedTab] = useState<'overview' | 'members' | 'itinerary'>('overview');
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load active trip on component mount
  useEffect(() => {
    loadActiveTrip();
  }, []);

  const loadActiveTrip = async () => {
    try {
      setLoading(true);
      setError(null);
      const activeTrip = await tripService.getActiveTrip();
      
      if (!activeTrip) {
        setError('No active trip found');
        return;
      }
      
      setTrip(activeTrip);
    } catch (error: any) {
      console.error('Failed to load active trip:', error);
      setError(error.message || 'Failed to load trip details');
      toast.error('Failed to load trip details');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTrip = async () => {
    if (!trip?._id) return;

    if (!confirm('Are you sure you want to complete this trip? This action cannot be undone.')) {
      return;
    }
    
    try {
      await tripService.completeTrip(trip._id);
      toast.success('Trip completed successfully!');
      if (onTripCompleted) {
        onTripCompleted();
      }
      onBack(); // Go back to home
    } catch (error: any) {
      console.error('Complete trip error:', error);
      toast.error(error.message || 'Failed to complete trip');
    }
  };

  const handleArchiveTrip = async () => {
    if (!trip?._id) return;

    if (!confirm('Are you sure you want to archive this trip?')) {
      return;
    }
    
    try {
      await tripService.archiveTrip(trip._id);
      toast.success('Trip archived successfully!');
      if (onTripCompleted) {
        onTripCompleted();
      }
      onBack(); // Go back to home
    } catch (error: any) {
      console.error('Archive trip error:', error);
      toast.error(error.message || 'Failed to archive trip');
    }
  };

  const handleShare = () => {
    if (!trip) return;
    
    if (navigator.share) {
      navigator.share({
        title: trip.name,
        text: `Check out my trip: ${trip.name} to ${trip.destination}`,
        url: window.location.href
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(`${trip.name} to ${trip.destination}`)
        .then(() => toast.success('Trip details copied to clipboard!'))
        .catch(() => toast.error('Failed to copy to clipboard'));
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString(i18n.language, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const calculateTripProgress = (): number => {
    if (!trip) return 0;
    
    const start = new Date(trip.startDate).getTime();
    const end = new Date(trip.endDate).getTime();
    const now = Date.now();
    
    if (now < start) return 0;
    if (now > end) return 100;
    
    return Math.round(((now - start) / (end - start)) * 100);
  };

  const getTripDuration = (): number => {
    if (!trip) return 0;
    return Math.ceil((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24));
  };

  const getDaysRemaining = (): number => {
    if (!trip) return 0;
    const end = new Date(trip.endDate).getTime();
    const now = Date.now();
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <Header 
          title="Trip Details"
          onBack={onBack}
        />
        
        <div className="px-4 flex items-center justify-center py-20">
          <div className="text-center">
            <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={32} />
            <p className="text-gray-600">Loading trip details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !trip) {
    return (
      <div className="space-y-6">
        <Header 
          title="Trip Details"
          onBack={onBack}
        />
        
        <div className="px-4 flex items-center justify-center py-20">
          <div className="text-center">
            <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Trip</h3>
            <p className="text-gray-600 mb-4">{error || 'No trip details available'}</p>
            <button
              onClick={onBack}
              className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const tripDuration = getTripDuration();
  const progress = calculateTripProgress();
  const daysRemaining = getDaysRemaining();

  return (
    <div className="space-y-6">
      <Header 
        title={trip.name}
        onBack={onBack}
        rightAction={
          <div className="flex space-x-2">
            <button 
              onClick={handleShare}
              className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
            >
              <Share size={18} className="text-gray-600" />
            </button>
          </div>
        }
      />
      
      <div className="px-4 space-y-6">
        {/* Trip Header */}
        <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-3xl p-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-2">{trip.name}</h1>
                <div className="flex items-center space-x-2 mb-2">
                  <MapPin size={16} />
                  <span className="text-blue-100">{trip.destination}</span>
                </div>
                {trip.description && (
                  <p className="text-blue-100 text-sm">{trip.description}</p>
                )}
              </div>
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Camera className="text-white" size={24} />
              </div>
            </div>

            {/* Trip Progress */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Trip Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div 
                  className="bg-white rounded-full h-2 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/20">
              <div className="text-center">
                <Calendar className="text-white mx-auto mb-1" size={20} />
                <p className="text-lg font-bold">{tripDuration}</p>
                <p className="text-xs text-blue-100">Days Total</p>
              </div>
              <div className="text-center">
                <Users className="text-white mx-auto mb-1" size={20} />
                <p className="text-lg font-bold">{trip.members.length}</p>
                <p className="text-xs text-blue-100">Members</p>
              </div>
              <div className="text-center">
                <Clock className="text-white mx-auto mb-1" size={20} />
                <p className="text-lg font-bold">{daysRemaining}</p>
                <p className="text-xs text-blue-100">Days Left</p>
              </div>
            </div>
          </div>
        </div>

        {/* Trip Actions */}
        <div className="flex space-x-3">
          <button
            onClick={handleCompleteTrip}
            className="flex-1 bg-green-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
          >
            <CheckCircle size={18} />
            <span>Complete Trip</span>
          </button>
          <button
            onClick={handleArchiveTrip}
            className="bg-gray-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-gray-700 transition-colors"
          >
            Archive
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-gray-100 rounded-2xl p-1">
          {[
            { key: 'overview' as const, label: 'Overview', icon: FileText },
            { key: 'members' as const, label: 'Members', icon: Users },
            { key: 'itinerary' as const, label: 'Itinerary', icon: MapPin }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedTab(tab.key)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                selectedTab === tab.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon size={16} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {selectedTab === 'overview' && (
          <div className="space-y-4">
            {/* Trip Dates */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <Calendar className="text-blue-600" size={20} />
                <span>Travel Dates</span>
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Departure:</span>
                  <span className="font-medium">{formatDate(trip.startDate)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Return:</span>
                  <span className="font-medium">{formatDate(trip.endDate)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{tripDuration} days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-medium px-2 py-1 rounded-full text-xs ${
                    trip.status === 'active' ? 'bg-green-100 text-green-800' :
                    trip.status === 'planned' ? 'bg-blue-100 text-blue-800' :
                    trip.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Trip Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
                <Users className="text-purple-600 mx-auto mb-2" size={24} />
                <p className="text-2xl font-bold text-gray-900">{trip.members.length}</p>
                <p className="text-sm text-gray-600">Travelers</p>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
                <MapPin className="text-green-600 mx-auto mb-2" size={24} />
                <p className="text-2xl font-bold text-gray-900">{trip.itinerary.length}</p>
                <p className="text-sm text-gray-600">Destinations</p>
              </div>
            </div>

            {/* Trip Progress */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3">Trip Progress</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <Clock className="text-blue-600" size={20} />
                    <span className="text-blue-800 font-medium">
                      {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Trip completed'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <Navigation className="text-green-600" size={20} />
                    <span className="text-green-800 font-medium">{progress}% of trip completed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'members' && (
          <div className="space-y-4">
            {trip.members.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users size={48} className="mx-auto mb-2 text-gray-300" />
                <p>No members added to this trip</p>
              </div>
            ) : (
              trip.members.map((member, index) => (
                <div key={member.id || index} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg">{member.name}</h3>
                      <p className="text-gray-600">Age: {member.age}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {index === 0 && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                          Trip Leader
                        </span>
                      )}
                      {member.speciallyAbled && (
                        <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">
                          Special Needs
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Document:</span>
                      <span className="font-medium">{member.documentType.toUpperCase()} - {member.documentNumber}</span>
                    </div>
                    {member.phoneNumbers && member.phoneNumbers.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-gray-600">Phone Numbers:</span>
                        {member.phoneNumbers.map((phone, phoneIndex) => (
                          <div key={phoneIndex} className="flex justify-between items-center">
                            <span className="font-medium flex items-center space-x-1">
                              <Phone size={14} />
                              <span>{phone.number}</span>
                            </span>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {phone.type}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    {member.emergencyContact && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Emergency Contact:</span>
                        <span className="font-medium">{member.emergencyContact}</span>
                      </div>
                    )}
                    {member.relation && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Relation:</span>
                        <span className="font-medium">{member.relation}</span>
                      </div>
                    )}
                    {member.specialNeeds && (
                      <div className="mt-2 p-2 bg-orange-50 rounded-lg">
                        <span className="text-gray-600">Special Needs:</span>
                        <p className="text-orange-800 text-sm mt-1">{member.specialNeeds}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {selectedTab === 'itinerary' && (
          <div className="space-y-4">
            {trip.itinerary.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar size={48} className="mx-auto mb-2 text-gray-300" />
                <p>No itinerary planned for this trip</p>
              </div>
            ) : (
              trip.itinerary.map((day, index) => (
                <div key={day.id || index} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">Day {index + 1}</h3>
                      <p className="text-gray-600">{formatDate(day.date)}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="text-blue-600" size={16} />
                      <span className="text-blue-600 font-medium">{day.location}</span>
                    </div>
                  </div>
                  
                  {day.activities && day.activities.length > 0 && (
                    <div className="space-y-2 mb-3">
                      <h4 className="font-medium text-gray-800">Activities:</h4>
                      <ul className="space-y-1">
                        {day.activities.map((activity, activityIndex) => (
                          <li key={activityIndex} className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0" />
                            <span className="text-gray-700">{activity}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {day.notes && (
                    <div className="p-3 bg-yellow-50 rounded-xl border border-yellow-200">
                      <div className="flex items-start space-x-2">
                        <Star className="text-yellow-600 flex-shrink-0 mt-0.5" size={16} />
                        <p className="text-yellow-800 text-sm">{day.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TripDetailsScreen;