// =============================================================================
// COMPONENT: Group Status Screen
// File path: src/components/screens/GroupStatusScreen.tsx
// =============================================================================

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Phone, MessageCircle, MapPin, Clock, Shield, AlertTriangle, UserPlus, MoreHorizontal } from 'lucide-react';
import Header from '../layout/Header';
import GroupMemberItem from '../common/GroupMemberItem';
import type { GroupMember } from '../../types';

interface GroupStatusScreenProps {
  onBack: () => void;
  groupMembers: GroupMember[];
}

const GroupStatusScreen: React.FC<GroupStatusScreenProps> = ({
  onBack,
  groupMembers
}) => {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState<'all' | 'safe' | 'warning'>('all');

  const filteredMembers = groupMembers.filter(member => {
    if (selectedTab === 'all') return true;
    return member.status === selectedTab;
  });

  const safeCount = groupMembers.filter(m => m.status === 'safe').length;
  const warningCount = groupMembers.filter(m => m.status === 'warning').length;

  const handleCallMember = (member: GroupMember) => {
    // In a real app, this would initiate a call
    console.log(`Calling ${member.name}`);
  };

  const handleMessageMember = (member: GroupMember) => {
    // In a real app, this would open messaging
    console.log(`Messaging ${member.name}`);
  };

  const handleLocateMember = (member: GroupMember) => {
    // In a real app, this would show member's location on map
    console.log(`Locating ${member.name}`);
  };

  return (
    <div className="space-y-6">
      <Header 
        title={t('home.groupStatus')} 
        onBack={onBack}
        rightAction={
          <button className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
            <MoreHorizontal size={18} className="text-gray-600" />
          </button>
        }
      />
      
      <div className="px-4 space-y-6">
        {/* Group Overview */}
        <div className="bg-gray-700 rounded-3xl p-6 text-white relative overflow-hidden">
          <div className="absolute inset-0  to-transparent" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Users className="text-white" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Travel Group</h2>
                  <p className="text-purple-100">{t('home.members', { count: groupMembers.length })}</p>
                </div>
              </div>
              
              <button className="p-3 bg-white/20 rounded-xl backdrop-blur-sm hover:bg-white/30 transition-colors">
                <UserPlus className="text-white" size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <Shield className="text-green-300" size={16} />
                  <span className="text-2xl font-bold">{safeCount}</span>
                </div>
                <p className="text-sm text-purple-100">{t('map.safe')}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <AlertTriangle className="text-orange-300" size={16} />
                  <span className="text-2xl font-bold">{warningCount}</span>
                </div>
                <p className="text-sm text-purple-100">{t('map.warnings')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex bg-gray-100 rounded-2xl p-1">
          {[
            { key: 'all' as const, label: t('common.all'), count: groupMembers.length },
            { key: 'safe' as const, label: t('map.safe'), count: safeCount },
            { key: 'warning' as const, label: t('map.warnings'), count: warningCount }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedTab(tab.key)}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                selectedTab === tab.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Members List */}
        <div className="space-y-4">
          {filteredMembers.map((member) => (
            <div key={member.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <GroupMemberItem member={member} />
              
              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleCallMember(member)}
                  className="flex items-center justify-center space-x-2 py-3 px-4 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-colors"
                >
                  <Phone size={16} />
                  <span className="text-sm font-medium">Call</span>
                </button>
                
                <button
                  onClick={() => handleMessageMember(member)}
                  className="flex items-center justify-center space-x-2 py-3 px-4 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors"
                >
                  <MessageCircle size={16} />
                  <span className="text-sm font-medium">Message</span>
                </button>
                
                <button
                  onClick={() => handleLocateMember(member)}
                  className="flex items-center justify-center space-x-2 py-3 px-4 bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-100 transition-colors"
                >
                  <MapPin size={16} />
                  <span className="text-sm font-medium">Locate</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Emergency Actions */}
        <div className="bg-red-50 rounded-2xl p-4 border border-red-200">
          <div className="flex items-center space-x-3 mb-3">
            <AlertTriangle className="text-red-600" size={20} />
            <h3 className="font-semibold text-red-800">Emergency Actions</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button className="bg-red-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-red-700 transition-colors">
              Alert All Members
            </button>
            <button className="bg-white border border-red-300 text-red-600 py-3 px-4 rounded-xl font-medium hover:bg-red-50 transition-colors">
              Emergency Call
            </button>
          </div>
        </div>

        {/* Group Activity */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {[
              { member: 'Sarah Chen', action: 'checked in', location: 'Burj Khalifa', time: '2 min ago' },
              { member: 'Mike Johnson', action: 'shared location', location: 'Dubai Mall', time: '5 min ago' },
              { member: 'David Kim', action: 'marked safe', location: 'Dubai Marina', time: '8 min ago' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 py-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{activity.member}</span> {activity.action} at {activity.location}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center space-x-1">
                    <Clock size={12} />
                    <span>{activity.time}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupStatusScreen;