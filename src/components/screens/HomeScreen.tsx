// =============================================================================
// Updated HomeScreen.tsx with Trip Logic and Backend Integration
// File path: src/components/screens/HomeScreen.tsx
// =============================================================================

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, Heart, MapPin, Phone, QrCode, Shield, Star, Users, Plus, Calendar, Plane, Clock, CheckCircle, Loader } from "lucide-react";
import { toast } from "react-hot-toast";
import QuickActionButton from "../common/QuickActionButton";
import StatusCard from "../common/StatusCard";
import { getTimeBasedGreeting, formatNumber } from "../../utils/i18n";
import tripService from "../../services/tripService";
import authService from "../../services/authService";
import type { GroupMember, Notification } from "../../types";
import type { Trip } from "../../services/tripService";

interface HomeScreenProps {
  currentLocation: string;
  safetyScore: number;
  groupMembers: GroupMember[];
  notifications: Notification[];
  onAddTripPress: () => void;
  onQuickCheckinPress: () => void;
  onGroupStatusPress: () => void;
  onTripDetailsPress: () => void;
  onEmergencyContactsPress: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({
  currentLocation,
  safetyScore,
  groupMembers,
  onAddTripPress,
  onQuickCheckinPress,
  onGroupStatusPress,
  onTripDetailsPress,
  onEmergencyContactsPress,
}) => {
  const { t, i18n } = useTranslation();
  
  // State for active trip
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [hasActiveTrip, setHasActiveTrip] = useState(false);
  const [isLoadingTrip, setIsLoadingTrip] = useState(true);
  
  // Get current user for greeting
  const currentUser = authService.getUser();
  const userName = currentUser?.username || 'User';
  
  // Get localized greeting based on time of day
  const greeting = getTimeBasedGreeting(t);
  
  // Format numbers according to locale
  const formattedScore = formatNumber(safetyScore, i18n.language);
  const stepCount = 8421; // Example step count
  const formattedSteps = formatNumber(stepCount, i18n.language);

  // Load active trip on component mount
  useEffect(() => {
    loadActiveTrip();
  }, []);

  const loadActiveTrip = async () => {
    try {
      setIsLoadingTrip(true);
      const tripStatus = await tripService.checkActiveTrip();
      setHasActiveTrip(tripStatus.hasActiveTrip);
      setActiveTrip(tripStatus.activeTrip);
    } catch (error) {
      console.error('Failed to load active trip:', error);
      setHasActiveTrip(false);
      setActiveTrip(null);
    } finally {
      setIsLoadingTrip(false);
    }
  };

  const handleTripComplete = async () => {
    if (!activeTrip?._id) return;
    
    try {
      await tripService.completeTrip(activeTrip._id);
      toast.success('Trip completed successfully!');
      await loadActiveTrip(); // Refresh trip status
    } catch (error) {
      toast.error('Failed to complete trip');
      console.error('Complete trip error:', error);
    }
  };

  const calculateTripProgress = (startDate: string, endDate: string): number => {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const now = Date.now();
    
    if (now < start) return 0;
    if (now > end) return 100;
    
    return Math.round(((now - start) / (end - start)) * 100);
  };

  const getDaysRemaining = (endDate: string): number => {
    const end = new Date(endDate).getTime();
    const now = Date.now();
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  // Loading state
  if (isLoadingTrip) {
    return (
      <div className="space-y-6 p-4">
        {/* Welcome Header */}
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-3xl p-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20" />
          <div className="relative">
            <div className="flex items-center justify-center py-8">
              <Loader className="animate-spin text-white" size={32} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No Active Trip - Show only Add Trip button and minimal content
  if (!hasActiveTrip) {
    return (
      <div className="space-y-6 p-4">
        {/* Welcome Header */}
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-3xl p-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20" />
          <div className="relative">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-2">{greeting}, {userName}</h1>
              <div className="flex items-center justify-center space-x-2 text-gray-300 mb-4">
                <MapPin size={16} />
                <span className="text-sm">{currentLocation}</span>
              </div>
              <p className="text-gray-300 text-sm">Ready to plan your next adventure?</p>
            </div>
          </div>
        </div>

        {/* Add Trip Button */}
        <button
          onClick={onAddTripPress}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
        >
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto backdrop-blur-sm">
              <Plus size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">{t('home.planNewTrip')}</h3>
              <p className="text-blue-100">{t('home.addDestinations')}</p>
            </div>
            <div className="flex justify-center">
              <Plane size={32} className="text-white/80" />
            </div>
          </div>
        </button>

        {/* Minimal Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <QuickActionButton
            icon={Phone}
            title={t('home.emergency')}
            subtitle={t('home.quickContacts')}
            color="bg-red-500"
            onClick={onEmergencyContactsPress}
          />
          <QuickActionButton
            icon={QrCode}
            title={t('home.quickCheckin')}
            subtitle={t('home.scanLocationCode')}
            color="bg-blue-500"
            onClick={onQuickCheckinPress}
          />
        </div>
      </div>
    );
  }

  // Has Active Trip - Show full content
  return (
    <div className="space-y-6 p-4">
      {/* Welcome Header */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-3xl p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20" />
        <div className="relative">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold mb-2">{greeting}, {userName}</h1>
              <div className="flex items-center space-x-2 text-gray-300">
                <MapPin size={16} />
                <span className="text-sm">{currentLocation}</span>
              </div>
            </div>
            <button className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <Bell size={20} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm mb-1">{t('home.safetyScore')}</p>
              <div className="flex items-center space-x-3">
                <span className="text-3xl font-bold">{formattedScore}</span>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={16}
                      className={
                        star <= safetyScore / 20
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-600"
                      }
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-2">
                <Shield size={28} className="text-green-400" />
              </div>
              <span className="text-xs text-gray-300">{t('home.protected')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Trip Card */}
      <div className="bg-gradient-to-br from-green-600 via-blue-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <Plane size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold">{activeTrip?.name}</h3>
              <p className="text-green-100 text-sm flex items-center space-x-1">
                <MapPin size={14} />
                <span>{activeTrip?.destination}</span>
              </p>
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{getDaysRemaining(activeTrip?.endDate || '')}</div>
            <div className="text-xs text-green-100">days left</div>
          </div>
        </div>

        {/* Trip Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Trip Progress</span>
            <span>{calculateTripProgress(activeTrip?.startDate || '', activeTrip?.endDate || '')}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-white rounded-full h-2 transition-all duration-300"
              style={{ 
                width: `${calculateTripProgress(activeTrip?.startDate || '', activeTrip?.endDate || '')}%` 
              }}
            ></div>
          </div>
        </div>

        {/* Trip Actions */}
        <div className="flex space-x-3 mt-4">
          <button
            onClick={onTripDetailsPress}
            className="flex-1 bg-white/20 backdrop-blur-sm text-white py-2 px-4 rounded-xl text-sm font-medium hover:bg-white/30 transition-colors"
          >
            View Details
          </button>
          <button
            onClick={handleTripComplete}
            className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-xl text-sm font-medium transition-colors flex items-center space-x-1"
          >
            <CheckCircle size={16} />
            <span>Complete</span>
          </button>
        </div>
      </div>

      {/* Trip Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm text-center">
          <Users className="text-blue-600 mx-auto mb-1" size={20} />
          <div className="text-lg font-bold text-gray-900">{activeTrip?.members.length || 0}</div>
          <div className="text-xs text-gray-600">Members</div>
        </div>
        <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm text-center">
          <MapPin className="text-green-600 mx-auto mb-1" size={20} />
          <div className="text-lg font-bold text-gray-900">{activeTrip?.itinerary.length || 0}</div>
          <div className="text-xs text-gray-600">Places</div>
        </div>
        <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm text-center">
          <Clock className="text-purple-600 mx-auto mb-1" size={20} />
          <div className="text-lg font-bold text-gray-900">
            {activeTrip ? Math.ceil((new Date(activeTrip.endDate).getTime() - new Date(activeTrip.startDate).getTime()) / (1000 * 60 * 60 * 24)) : 0}
          </div>
          <div className="text-xs text-gray-600">Days</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <QuickActionButton
          icon={QrCode}
          title={t('home.quickCheckin')}
          subtitle={t('home.scanLocationCode')}
          color="bg-blue-500"
          onClick={onQuickCheckinPress}
        />
        <QuickActionButton
          icon={Users}
          title={t('home.groupStatus')}
          subtitle={t('home.members', { count: groupMembers.length })}
          color="bg-purple-500"
          onClick={onGroupStatusPress}
        />
        <QuickActionButton
          icon={Calendar}
          title="Trip Details"
          subtitle="View itinerary"
          color="bg-green-500"
          onClick={onTripDetailsPress}
        />
        <QuickActionButton
          icon={Phone}
          title={t('home.emergency')}
          subtitle={t('home.quickContacts')}
          color="bg-orange-500"
          onClick={onEmergencyContactsPress}
        />
      </div>

      {/* Live Status */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">{t('home.liveStatus')}</h3>
        <StatusCard
          icon={Heart}
          title={t('home.healthMonitor')}
          value={t('home.normal')}
          subtitle={`${t('home.hrBpm', { bpm: 72 })} • ${t('home.stepsToday', { steps: formattedSteps })}`}
          color="red"
        />
        <StatusCard
          icon={MapPin}
          title={t('home.locationStatus')}
          value={t('home.safeZone')}
          subtitle={t('home.touristDistrict')}
          color="green"
        />
        <StatusCard
          icon={Users}
          title={t('home.travelGroup')}
          value={`${groupMembers.filter((m) => m.status === "safe").length}/${groupMembers.length}`}
          subtitle={t('home.membersCheckedIn')}
          color="purple"
        />
      </div>
    </div>
  );
};

export default HomeScreen;