// =============================================================================
// COMPONENT: Emergency Contacts Screen
// File path: src/components/screens/EmergencyContactsScreen.tsx
// =============================================================================

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Phone, Plus, Edit3, Trash2, Shield, Users, MapPin, Clock, AlertTriangle, Star } from 'lucide-react';
import Header from '../layout/Header';
import { toast } from 'react-hot-toast';

interface EmergencyContact {
  id: number;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  isPrimary: boolean;
  isLocal: boolean;
  lastContacted?: Date;
}

interface EmergencyContactsScreenProps {
  onBack: () => void;
}

const EmergencyContactsScreen: React.FC<EmergencyContactsScreenProps> = ({ onBack }) => {
  const { t } = useTranslation();
  const [contacts, setContacts] = useState<EmergencyContact[]>([
    {
      id: 1,
      name: 'Sarah Johnson',
      relationship: 'Spouse',
      phone: '+1-555-0123',
      email: 'sarah@email.com',
      isPrimary: true,
      isLocal: false,
      lastContacted: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
    },
    {
      id: 2,
      name: 'Dr. Michael Chen',
      relationship: 'Doctor',
      phone: '+1-555-0456',
      email: 'dr.chen@hospital.com',
      isPrimary: false,
      isLocal: true,
      lastContacted: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
    },
    {
      id: 3,
      name: 'Emirates Support',
      relationship: 'Travel Insurance',
      phone: '+971-4-316-6666',
      isPrimary: false,
      isLocal: true
    },
    {
      id: 4,
      name: 'John Smith',
      relationship: 'Emergency Contact',
      phone: '+1-555-0789',
      email: 'john@email.com',
      isPrimary: false,
      isLocal: false
    }
  ]);

  const [selectedTab, setSelectedTab] = useState<'personal' | 'official' | 'local'>('personal');

  const handleCall = (contact: EmergencyContact) => {
    // Update last contacted time
    setContacts(prev => prev.map(c => 
      c.id === contact.id 
        ? { ...c, lastContacted: new Date() }
        : c
    ));
    
    // In a real app, this would initiate a call
    window.open(`tel:${contact.phone}`);
    toast.success(`Calling ${contact.name}`);
  };

  const handleEdit = (contact: EmergencyContact) => {
    // In a real app, this would open an edit modal
    if(contact){toast.success('Edit functionality coming soon');}
  };

  const handleDelete = (contactId: number) => {
    setContacts(prev => prev.filter(c => c.id !== contactId));
    toast.success('Contact removed');
  };

  const handleAddContact = () => {
    // In a real app, this would open an add contact modal
    toast.success('Add contact functionality coming soon');
  };

  const getFilteredContacts = () => {
    switch (selectedTab) {
      case 'personal':
        return contacts.filter(c => ['Spouse', 'Emergency Contact', 'Parent', 'Sibling'].includes(c.relationship));
      case 'official':
        return contacts.filter(c => ['Doctor', 'Travel Insurance', 'Embassy'].includes(c.relationship));
      case 'local':
        return contacts.filter(c => c.isLocal);
      default:
        return contacts;
    }
  };

  const formatLastContacted = (date?: Date) => {
    if (!date) return 'Never contacted';
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="space-y-6">
      <Header 
        title={t('notifications.emergencyContacts')} 
        onBack={onBack}
        rightAction={
          <button 
            onClick={handleAddContact}
            className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} />
          </button>
        }
      />
      
      <div className="px-4 space-y-6">
        {/* Quick Emergency Numbers */}
        <div className="bg-gradient-to-br from-red-600 via-red-500 to-orange-600 rounded-3xl p-6 text-white">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <AlertTriangle className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Quick Emergency</h2>
              <p className="text-red-100">Local emergency services</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => window.open('tel:999')}
              className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 hover:bg-white/30 transition-colors"
            >
              <Shield className="text-white mb-2" size={20} />
              <p className="font-semibold">Police</p>
              <p className="text-sm text-red-100">999</p>
            </button>
            
            <button 
              onClick={() => window.open('tel:998')}
              className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 hover:bg-white/30 transition-colors"
            >
              <Plus className="text-white mb-2" size={20} />
              <p className="font-semibold">Medical</p>
              <p className="text-sm text-red-100">998</p>
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex bg-gray-100 rounded-2xl p-1">
          {[
            { key: 'personal' as const, label: 'Personal', icon: Users },
            { key: 'official' as const, label: 'Official', icon: Shield },
            { key: 'local' as const, label: 'Local', icon: MapPin }
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

        {/* Contacts List */}
        <div className="space-y-4">
          {getFilteredContacts().map((contact) => (
            <div key={contact.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                    {contact.isPrimary && (
                      <Star className="text-yellow-500 fill-current" size={16} />
                    )}
                    {contact.isLocal && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                        Local
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{contact.relationship}</p>
                  <p className="text-sm font-mono text-gray-500">{contact.phone}</p>
                  {contact.email && (
                    <p className="text-sm text-gray-500">{contact.email}</p>
                  )}
                  <div className="flex items-center space-x-1 mt-2">
                    <Clock size={12} className="text-gray-400" />
                    <span className="text-xs text-gray-400">
                      Last contacted: {formatLastContacted(contact.lastContacted)}
                    </span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(contact)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(contact.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <button
                onClick={() => handleCall(contact)}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Phone size={18} />
                <span>Call {contact.name}</span>
              </button>
            </div>
          ))}
        </div>

        {/* Additional Services */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Services</h3>
          <div className="space-y-3">
            {[
              { name: 'Tourist Helpline', number: '+971-600-555-559', description: '24/7 tourist assistance' },
              { name: 'Embassy Hotline', number: '+971-4-397-1777', description: 'US Embassy UAE' },
              { name: 'Travel Insurance', number: '+971-4-316-6666', description: 'Emergency travel support' }
            ].map((service, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{service.name}</p>
                  <p className="text-sm text-gray-600">{service.description}</p>
                  <p className="text-sm font-mono text-gray-500">{service.number}</p>
                </div>
                <button
                  onClick={() => window.open(`tel:${service.number}`)}
                  className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-blue-100 hover:text-blue-600 transition-colors"
                >
                  <Phone size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Safety Tips */}
        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
          <div className="flex items-center space-x-2 mb-3">
            <Shield className="text-blue-600" size={20} />
            <h3 className="font-semibold text-blue-800">Emergency Contact Tips</h3>
          </div>
          <div className="space-y-2 text-sm text-blue-700">
            <p>• Keep at least 2 emergency contacts from different locations</p>
            <p>• Ensure contacts know your travel itinerary</p>
            <p>• Test contact numbers before traveling</p>
            <p>• Keep physical copies of important numbers</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyContactsScreen;