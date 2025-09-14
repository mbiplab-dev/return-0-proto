// =============================================================================
// COMPONENT: Quick Check-in Screen
// File path: src/components/screens/QuickCheckinScreen.tsx
// =============================================================================

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Clock, CheckCircle, Camera, Download, Share } from 'lucide-react';
import Header from '../layout/Header';
import { toast } from 'react-hot-toast';

interface QuickCheckinScreenProps {
  onBack: () => void;
  currentLocation: string;
}

const QuickCheckinScreen: React.FC<QuickCheckinScreenProps> = ({
  onBack,
  currentLocation
}) => {
  const { t } = useTranslation();
  const [checkinCode, setCheckinCode] = useState('');
  const [lastCheckin, setLastCheckin] = useState<Date | null>(null);
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  // Generate QR code data
  useEffect(() => {
    const generateCheckinCode = () => {
      const timestamp = new Date().getTime();
      const locationId = currentLocation.replace(/\s+/g, '').toLowerCase();
      const userId = 'user123'; // This would come from auth context
      return `CHECKIN:${userId}:${locationId}:${timestamp}`;
    };

    setCheckinCode(generateCheckinCode());
  }, [currentLocation]);

  const handleCheckin = () => {
    setIsCheckedIn(true);
    setLastCheckin(new Date());
    toast.success(t('success.locationShared'));
  };

  const handleShareLocation = () => {
    if (navigator.share) {
      navigator.share({
        title: t('home.quickCheckin'),
        text: t('map.currentLocation') + ': ' + currentLocation,
        url: `https://maps.google.com/?q=${encodeURIComponent(currentLocation)}`
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(currentLocation);
      toast.success(t('success.locationShared'));
    }
  };

  const QRCodeSVG = () => {
    // Simple QR code placeholder - in a real app, use a QR code library
    return (
      <div className="w-48 h-48 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto">
        <div className="grid grid-cols-8 gap-1 p-4">
          {Array.from({ length: 64 }, (_, i) => (
            <div
              key={i}
              className={`w-2 h-2 ${
                Math.random() > 0.5 ? 'bg-white' : 'bg-gray-900'
              }`}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Header title={t('home.quickCheckin')} onBack={onBack} />
      
      <div className="px-4 space-y-6">
        {/* Current Status */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <MapPin className="text-blue-600" size={20} />
              <h3 className="text-lg font-semibold text-gray-900">
                {t('map.currentLocation')}
              </h3>
            </div>
            <p className="text-gray-600">{currentLocation}</p>
            <div className="flex items-center justify-center space-x-1 mt-2">
              <Clock className="text-gray-400" size={16} />
              <span className="text-sm text-gray-500">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>

          {isCheckedIn && (
            <div className="bg-green-50 rounded-xl p-4 mb-4 border border-green-200">
              <div className="flex items-center space-x-2">
                <CheckCircle className="text-green-600" size={20} />
                <div>
                  <p className="text-green-800 font-medium">
                    {t('success.locationShared')}
                  </p>
                  <p className="text-green-600 text-sm">
                    {lastCheckin?.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* QR Code */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('home.scanLocationCode')}
            </h3>
            <p className="text-sm text-gray-600">
              Show this code to verify your location
            </p>
          </div>

          <QRCodeSVG  />

          <div className="mt-4 p-3 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-500 text-center font-mono break-all">
              {checkinCode}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={handleCheckin}
            className="w-full bg-blue-600 text-white rounded-2xl p-4 font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <CheckCircle size={20} />
            <span>{t('home.quickCheckin')}</span>
          </button>

          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => toast.success('Camera feature coming soon')}
              className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col items-center space-y-2 hover:bg-gray-50 transition-colors"
            >
              <Camera className="text-gray-600" size={24} />
              <span className="text-xs text-gray-600">Scan Code</span>
            </button>

            <button
              onClick={() => toast.success('Download feature coming soon')}
              className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col items-center space-y-2 hover:bg-gray-50 transition-colors"
            >
              <Download className="text-gray-600" size={24} />
              <span className="text-xs text-gray-600">Save</span>
            </button>

            <button
              onClick={handleShareLocation}
              className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col items-center space-y-2 hover:bg-gray-50 transition-colors"
            >
              <Share className="text-gray-600" size={24} />
              <span className="text-xs text-gray-600">Share</span>
            </button>
          </div>
        </div>

        {/* Recent Check-ins */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Check-ins
          </h3>
          <div className="space-y-3">
            {[
              { location: 'Burj Khalifa', time: '2 hours ago', status: 'verified' },
              { location: 'Dubai Mall', time: '5 hours ago', status: 'verified' },
              { location: 'Palm Jumeirah', time: '1 day ago', status: 'verified' }
            ].map((checkin, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {checkin.location}
                    </p>
                    <p className="text-xs text-gray-500">{checkin.time}</p>
                  </div>
                </div>
                <CheckCircle className="text-green-500" size={16} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickCheckinScreen;