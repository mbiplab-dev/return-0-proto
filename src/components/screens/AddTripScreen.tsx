// =============================================================================
// Updated AddTripScreen.tsx with API Integration
// File path: src/components/screens/AddTripScreen.tsx
// =============================================================================

import React, { useState } from "react";
import {
  Plus,
  Trash2,
  Calendar,
  MapPin,
  Users,
  Save,
  X,
  UserPlus,
  Edit3,
  Loader
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import Header from "../layout/Header";
import tripService from "../../services/tripService";
import type { TripMember, TripItinerary } from "../../services/tripService";

interface PhoneNumber {
  id: string;
  number: string;
  type: 'primary' | 'emergency' | 'other';
}

interface AddTripScreenProps {
  onBack: () => void;
  onTripSaved: () => void; // Callback when trip is successfully saved
}

const AddTripScreen: React.FC<AddTripScreenProps> = ({ onBack, onTripSaved }) => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState<'basic' | 'members' | 'itinerary'>('basic');
  const [isSaving, setIsSaving] = useState(false);
  
  // Basic trip info
  const [tripName, setTripName] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  
  // Members and itinerary
  const [members, setMembers] = useState<TripMember[]>([]);
  const [itinerary, setItinerary] = useState<TripItinerary[]>([]);
  
  // Member form state
  const [showAddMember, setShowAddMember] = useState(false);
  const [editingMember, setEditingMember] = useState<TripMember | null>(null);
  const [memberForm, setMemberForm] = useState<Partial<TripMember>>({
    name: "",
    age: 18,
    documentType: "aadhar",
    documentNumber: "",
    phoneNumbers: [{ id: "1", number: "", type: "primary" }],
    speciallyAbled: false,
    specialNeeds: "",
    emergencyContact: "",
    relation: ""
  });

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addPhoneNumber = () => {
    const newPhone: PhoneNumber = {
      id: generateId(),
      number: "",
      type: "other"
    };
    setMemberForm({
      ...memberForm,
      phoneNumbers: [...(memberForm.phoneNumbers || []), newPhone]
    });
  };

  const updatePhoneNumber = (id: string, field: keyof PhoneNumber, value: string) => {
    setMemberForm({
      ...memberForm,
      phoneNumbers: memberForm.phoneNumbers?.map(phone =>
        phone.id === id ? { ...phone, [field]: value } : phone
      )
    });
  };

  const removePhoneNumber = (id: string) => {
    setMemberForm({
      ...memberForm,
      phoneNumbers: memberForm.phoneNumbers?.filter(phone => phone.id !== id)
    });
  };

  const saveMember = () => {
    if (!memberForm.name || !memberForm.documentNumber) {
      toast.error(t('trip.fillRequiredFields'));
      return;
    }

    const newMember: TripMember = {
      id: editingMember?.id || generateId(),
      name: memberForm.name!,
      age: memberForm.age || 18,
      documentType: memberForm.documentType!,
      documentNumber: memberForm.documentNumber!,
      phoneNumbers: memberForm.phoneNumbers!,
      speciallyAbled: memberForm.speciallyAbled || false,
      specialNeeds: memberForm.specialNeeds,
      emergencyContact: memberForm.emergencyContact,
      relation: memberForm.relation
    };

    if (editingMember) {
      setMembers(members.map(m => m.id === editingMember.id ? newMember : m));
      toast.success(t('success.memberUpdated'));
    } else {
      setMembers([...members, newMember]);
      toast.success(t('success.memberAdded'));
    }

    resetMemberForm();
  };

  const resetMemberForm = () => {
    setMemberForm({
      name: "",
      age: 18,
      documentType: "aadhar",
      documentNumber: "",
      phoneNumbers: [{ id: generateId(), number: "", type: "primary" }],
      speciallyAbled: false,
      specialNeeds: "",
      emergencyContact: "",
      relation: ""
    });
    setShowAddMember(false);
    setEditingMember(null);
  };

  const editMember = (member: TripMember) => {
    setMemberForm(member);
    setEditingMember(member);
    setShowAddMember(true);
  };

  const removeMember = (id: string) => {
    if (confirm(t('trip.deleteConfirm'))) {
      setMembers(members.filter(m => m.id !== id));
      toast.success(t('success.memberDeleted'));
    }
  };

  const addItineraryDay = () => {
    const newDay: TripItinerary = {
      id: generateId(),
      date: "",
      location: "",
      activities: [""],
      notes: ""
    };
    setItinerary([...itinerary, newDay]);
  };

  const updateItinerary = (id: string, field: keyof TripItinerary, value: any) => {
    setItinerary(itinerary.map(day =>
      day.id === id ? { ...day, [field]: value } : day
    ));
  };

  const removeItineraryDay = (id: string) => {
    if (confirm(t('trip.deleteDay'))) {
      setItinerary(itinerary.filter(day => day.id !== id));
    }
  };

  const addActivity = (dayId: string) => {
    setItinerary(itinerary.map(day =>
      day.id === dayId ? { ...day, activities: [...day.activities, ""] } : day
    ));
  };

  const updateActivity = (dayId: string, activityIndex: number, value: string) => {
    setItinerary(itinerary.map(day =>
      day.id === dayId ? {
        ...day,
        activities: day.activities.map((activity, index) =>
          index === activityIndex ? value : activity
        )
      } : day
    ));
  };

  const removeActivity = (dayId: string, activityIndex: number) => {
    setItinerary(itinerary.map(day =>
      day.id === dayId ? {
        ...day,
        activities: day.activities.filter((_, index) => index !== activityIndex)
      } : day
    ));
  };

  const handleSaveTrip = async () => {
    if (!tripName || !destination || !startDate || !endDate) {
      toast.error(t('trip.fillRequiredFields'));
      return;
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) {
      toast.error('End date must be after start date');
      return;
    }

    setIsSaving(true);
    
    try {
      const tripData = {
        name: tripName,
        destination,
        description,
        startDate,
        endDate,
        members,
        itinerary: itinerary.filter(day => day.date && day.location) // Only include complete itinerary items
      };

      const formattedTripData = tripService.formatTripForApi(tripData);
      await tripService.createTrip(formattedTripData);
      
      toast.success(t('success.tripSaved'));
      onTripSaved(); // Notify parent component
      onBack();
    } catch (error: any) {
      console.error('Save trip error:', error);
      toast.error(error.message || 'Failed to save trip');
    } finally {
      setIsSaving(false);
    }
  };

  const renderBasicInfo = () => (
    <div className="px-4 space-y-4">
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <MapPin className="mr-2 text-blue-600" size={20} />
          {t('trip.tripDetails')}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('trip.tripName')} *
            </label>
            <input
              type="text"
              value={tripName}
              onChange={(e) => setTripName(e.target.value)}
              placeholder={t('trip.tripNamePlaceholder')}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSaving}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('trip.destination')} *
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder={t('trip.destinationPlaceholder')}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSaving}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('trip.startDate')} *
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]} // Prevent past dates
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSaving}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('trip.endDate')} *
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || new Date().toISOString().split('T')[0]} // End date must be after start date
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSaving}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('trip.description')}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('trip.descriptionPlaceholder')}
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              disabled={isSaving}
            />
          </div>
        </div>

        <button
          onClick={() => setCurrentStep('members')}
          className="w-full mt-6 bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          disabled={isSaving}
        >
          {t('trip.continueToMembers')}
        </button>
      </div>
    </div>
  );

  const renderMembers = () => (
    <div className="px-4 space-y-4">
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Users className="mr-2 text-purple-600" size={20} />
            {t('trip.tripMembers')} ({t('trip.memberCount', { count: members.length })})
          </h3>
          <button
            onClick={() => setShowAddMember(true)}
            className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
            disabled={isSaving}
          >
            <UserPlus size={16} />
            <span>{t('trip.addMember')}</span>
          </button>
        </div>

        {members.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users size={48} className="mx-auto mb-2 text-gray-300" />
            <p>{t('trip.noMembersYet')}</p>
            <p className="text-sm">{t('trip.addTravelers')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {members.map((member) => (
              <div key={member.id} className="border border-gray-100 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{member.name}</h4>
                    <p className="text-sm text-gray-600">
                      {t('trip.age')}: {member.age} • {member.documentType.toUpperCase()}: {member.documentNumber}
                    </p>
                    <p className="text-sm text-gray-500">
                      {member.phoneNumbers.length} {t('trip.phoneNumbers').toLowerCase()}
                      {member.speciallyAbled && ` • ${t('trip.speciallyAbled')}`}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => editMember(member)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors disabled:opacity-50"
                      disabled={isSaving}
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => removeMember(member.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                      disabled={isSaving}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex space-x-3 mt-6">
          <button
            onClick={() => setCurrentStep('basic')}
            className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
            disabled={isSaving}
          >
            {t('common.back')}
          </button>
          <button
            onClick={() => setCurrentStep('itinerary')}
            className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            disabled={isSaving}
          >
            {t('trip.continueToItinerary')}
          </button>
        </div>
      </div>
    </div>
  );

  const renderAddMemberModal = () => {
    if (!showAddMember) return null;

    return (
      <div className="absolute inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-center">
        <div className="bg-white rounded-t-3xl w-full max-w-sm h-full overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingMember ? t('trip.editMember') : t('trip.addMember')}
              </h3>
              <button
                onClick={resetMemberForm}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                disabled={isSaving}
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('trip.fullName')} *
              </label>
              <input
                type="text"
                value={memberForm.name || ""}
                onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                placeholder={t('trip.fullNamePlaceholder')}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={isSaving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('trip.age')} *
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={memberForm.age || 18}
                onChange={(e) => setMemberForm({ ...memberForm, age: parseInt(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={isSaving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('trip.documentType')} *
              </label>
              <select
                value={memberForm.documentType || "aadhar"}
                onChange={(e) => setMemberForm({ ...memberForm, documentType: e.target.value as 'aadhar' | 'passport' })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={isSaving}
              >
                <option value="aadhar">{t('trip.aadharCard')}</option>
                <option value="passport">{t('trip.passport')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('trip.documentNumber')} *
              </label>
              <input
                type="text"
                value={memberForm.documentNumber || ""}
                onChange={(e) => setMemberForm({ ...memberForm, documentNumber: e.target.value })}
                placeholder={memberForm.documentType === 'aadhar' ? t('trip.aadharPlaceholder') : t('trip.passportPlaceholder')}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={isSaving}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  {t('trip.phoneNumbers')} *
                </label>
                <button
                  onClick={addPhoneNumber}
                  className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center disabled:opacity-50"
                  disabled={isSaving}
                >
                  <Plus size={16} className="mr-1" />
                  {t('trip.addPhone')}
                </button>
              </div>
              <div className="space-y-2">
                {memberForm.phoneNumbers?.map((phone) => (
                  <div key={phone.id} className="flex space-x-2">
                    <input
                      type="tel"
                      value={phone.number}
                      onChange={(e) => updatePhoneNumber(phone.id, 'number', e.target.value)}
                      placeholder={t('common.phone')}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      disabled={isSaving}
                    />
                    <select
                      value={phone.type}
                      onChange={(e) => updatePhoneNumber(phone.id, 'type', e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      disabled={isSaving}
                    >
                      <option value="primary">{t('trip.phoneType.primary')}</option>
                      <option value="emergency">{t('trip.phoneType.emergency')}</option>
                      <option value="other">{t('trip.phoneType.other')}</option>
                    </select>
                    {memberForm.phoneNumbers!.length > 1 && (
                      <button
                        onClick={() => removePhoneNumber(phone.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        disabled={isSaving}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={memberForm.speciallyAbled || false}
                  onChange={(e) => setMemberForm({ ...memberForm, speciallyAbled: e.target.checked })}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  disabled={isSaving}
                />
                <span className="text-sm font-medium text-gray-700">{t('trip.speciallyAbled')}</span>
              </label>
            </div>

            {memberForm.speciallyAbled && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('trip.specialNeeds')}
                </label>
                <textarea
                  value={memberForm.specialNeeds || ""}
                  onChange={(e) => setMemberForm({ ...memberForm, specialNeeds: e.target.value })}
                  placeholder={t('trip.specialNeedsPlaceholder')}
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  disabled={isSaving}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('trip.emergencyContactName')}
              </label>
              <input
                type="text"
                value={memberForm.emergencyContact || ""}
                onChange={(e) => setMemberForm({ ...memberForm, emergencyContact: e.target.value })}
                placeholder={t('trip.emergencyContactPlaceholder')}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={isSaving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('trip.relationship')}
              </label>
              <input
                type="text"
                value={memberForm.relation || ""}
                onChange={(e) => setMemberForm({ ...memberForm, relation: e.target.value })}
                placeholder={t('trip.relationshipPlaceholder')}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={isSaving}
              />
            </div>

            <button
              onClick={saveMember}
              className="w-full bg-purple-600 text-white py-3 rounded-xl font-medium hover:bg-purple-700 transition-colors mt-6 disabled:opacity-50"
              disabled={isSaving}
            >
              {editingMember ? t('trip.updateMember') : t('trip.addMember')}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderItinerary = () => (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{t('trip.tripItinerary')}</h3>
        <button
          onClick={addItineraryDay}
          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
          disabled={isSaving}
        >
          <Plus size={16} />
          <span>{t('trip.addDay')}</span>
        </button>
      </div>

      <div className="mb-6">
        {itinerary.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-sm font-medium text-gray-900 mb-1">{t('trip.noItineraryYet')}</h3>
            <p className="text-sm text-gray-500">{t('trip.planDailyActivities')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {itinerary.map((day, index) => (
              <div key={day.id} className="border border-gray-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{t('trip.day')} {index + 1}</h4>
                  <button
                    onClick={() => removeItineraryDay(day.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                    disabled={isSaving}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="date"
                      value={day.date}
                      onChange={(e) => updateItinerary(day.id, 'date', e.target.value)}
                      min={startDate}
                      max={endDate}
                      className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                      disabled={isSaving}
                    />
                    <input
                      type="text"
                      value={day.location}
                      onChange={(e) => updateItinerary(day.id, 'location', e.target.value)}
                      placeholder={t('common.location')}
                      className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                      disabled={isSaving}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">{t('trip.activities')}</label>
                      <button
                        onClick={() => addActivity(day.id)}
                        className="text-green-600 hover:text-green-700 text-sm font-medium disabled:opacity-50"
                        disabled={isSaving}
                      >
                        {t('trip.addActivity')}
                      </button>
                    </div>
                    <div className="space-y-2">
                      {day.activities.map((activity, activityIndex) => (
                        <div key={activityIndex} className="flex space-x-2">
                          <input
                            type="text"
                            value={activity}
                            onChange={(e) => updateActivity(day.id, activityIndex, e.target.value)}
                            placeholder={t('trip.activityPlaceholder')}
                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                            disabled={isSaving}
                          />
                          {day.activities.length > 1 && (
                            <button
                              onClick={() => removeActivity(day.id, activityIndex)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                              disabled={isSaving}
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <textarea
                    value={day.notes || ""}
                    onChange={(e) => updateItinerary(day.id, 'notes', e.target.value)}
                    placeholder={t('trip.additionalNotes')}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none text-sm"
                    disabled={isSaving}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex space-x-3 mt-6">
          <button
            onClick={() => setCurrentStep('members')}
            className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
            disabled={isSaving}
          >
            {t('common.back')}
          </button>
          <button
            onClick={handleSaveTrip}
            className="flex-1 bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader size={16} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>{t('trip.saveTrip')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full bg-gray-50">
      <Header
        title={t('trip.addNewTrip')}
        showBack
        onBack={onBack}
        rightAction={
          <button
            onClick={handleSaveTrip}
            className="text-sm text-blue-600 font-medium disabled:opacity-50"
            disabled={isSaving}
          >
            {isSaving ? <Loader size={16} className="animate-spin" /> : t('common.save')}
          </button>
        }
      />

      <div className="pb-6">
        {currentStep === 'basic' && renderBasicInfo()}
        {currentStep === 'members' && renderMembers()}
        {currentStep === 'itinerary' && renderItinerary()}
      </div>

      {renderAddMemberModal()}
    </div>
  );
};

export default AddTripScreen;