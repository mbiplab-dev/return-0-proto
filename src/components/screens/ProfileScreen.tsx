import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  Activity,
  ChevronRight,
  Users,
  Navigation,
  Heart,
  Bell,
  MapPin,
  HelpCircle,
  Settings,
  LogOut,
  Loader,
} from "lucide-react";
import Header from "../layout/Header";
import LanguageSelector from "../common/LanguageSelector";
import authService, {type User as UserType } from "../../services/authService";

const ProfileScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        
        // Check if user is authenticated
        if (!authService.isAuthenticated()) {
          navigate('/login');
          return;
        }

        // Get user data from auth service
        let userData = authService.getUser();
        
        // If no user data in memory, fetch from API
        if (!userData) {
          userData = await authService.getProfile();
        }
        
        setUser(userData);
      } catch (error) {
        console.error('Failed to load user data:', error);
        // If failed to get user data, redirect to login
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await authService.logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout API fails, clear local data and redirect
      navigate('/login', { replace: true });
    } finally {
      setLoggingOut(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader className="animate-spin text-blue-600" size={24} />
          <span className="text-gray-600">{t("common.loading", "Loading...")}</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">{t("profile.noUserData", "No user data available")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header title={t("profile.profile")}/>

      {/* Profile Header */}
      <div className="px-6 pt-6 pb-8">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">
              {user.username || t("profile.defaultUsername", "User")}
            </h2>
            <p className="text-gray-600 mt-1">
              {user.email}
            </p>
            {user.phone && (
              <p className="text-gray-500 text-sm mt-1">
                {user.phone}
              </p>
            )}
            <div className="flex items-center mt-2">
              <Shield className="text-green-500 mr-1" size={16} />
              <span className="text-xs text-green-600 font-medium">
                {t("profile.verifiedIdentity")}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {t("profile.memberSince", "Member since")}: {formatDate(user.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Profile Menu */}
      <div className="space-y-3 px-6">
        <button className="w-full bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-all duration-200">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Shield className="text-blue-600" size={20} />
            </div>
            <div className="text-left">
              <span className="font-semibold text-gray-900">
                {t("profile.sections.digitalIdentityWallet")}
              </span>
              <p className="text-xs text-gray-500 mt-1">
                {t("profile.sections.blockchainVerified")}
              </p>
            </div>
          </div>
          <ChevronRight className="text-gray-400" size={20} />
        </button>

        <button className="w-full bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-all duration-200">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Users className="text-purple-600" size={20} />
            </div>
            <div className="text-left">
              <span className="font-semibold text-gray-900">
                {t("notifications.emergencyContacts")}
              </span>
              <p className="text-xs text-gray-500 mt-1">
                {t("profile.sections.manageTrustedContacts")}
              </p>
            </div>
          </div>
          <ChevronRight className="text-gray-400" size={20} />
        </button>

        <button className="w-full bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-all duration-200">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Navigation className="text-green-600" size={20} />
            </div>
            <div className="text-left">
              <span className="font-semibold text-gray-900">
                {t("profile.sections.travelHistory")}
              </span>
              <p className="text-xs text-gray-500 mt-1">
                {t("profile.sections.viewPastTrips")}
              </p>
            </div>
          </div>
          <ChevronRight className="text-gray-400" size={20} />
        </button>

        <button className="w-full bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-all duration-200">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <Heart className="text-red-600" size={20} />
            </div>
            <div className="text-left">
              <span className="font-semibold text-gray-900">
                {t("profile.sections.healthMonitoring")}
              </span>
              <p className="text-xs text-gray-500 mt-1">
                {t("profile.sections.iotDevices")}
              </p>
            </div>
          </div>
          <ChevronRight className="text-gray-400" size={20} />
        </button>
      </div>

      {/* Settings Section */}
      <div className="mx-6 px-6 mt-6 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-900 mb-4">
          {t("profile.sections.settingsPreferences")}
        </h3>
        <div className="space-y-4">
          {/* Language Selector */}
          <LanguageSelector showFlag={true} showNativeName={true} />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="text-gray-600" size={18} />
              <span className="text-sm font-medium text-gray-900">
                {t("profile.sections.pushNotifications")}
              </span>
            </div>
            <div className="w-12 h-6 bg-blue-500 rounded-full p-1 transition-colors">
              <div className="w-4 h-4 bg-white rounded-full ml-6 transition-transform" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MapPin className="text-gray-600" size={18} />
              <span className="text-sm font-medium text-gray-900">
                {t("profile.sections.locationSharing")}
              </span>
            </div>
            <div className="w-12 h-6 bg-blue-500 rounded-full p-1 transition-colors">
              <div className="w-4 h-4 bg-white rounded-full ml-6 transition-transform" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Activity className="text-gray-600" size={18} />
              <span className="text-sm font-medium text-gray-900">
                {t("profile.sections.healthMonitoring")}
              </span>
            </div>
            <div className="w-12 h-6 bg-blue-500 rounded-full p-1 transition-colors">
              <div className="w-4 h-4 bg-white rounded-full ml-6 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Options */}
      <div className="px-6 mt-6 space-y-3">
        <button className="w-full bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-all duration-200">
          <div className="flex items-center space-x-4">
            <HelpCircle className="text-gray-600" size={20} />
            <span className="font-semibold text-gray-900">
              {t("profile.sections.helpSupport")}
            </span>
          </div>
          <ChevronRight className="text-gray-400" size={20} />
        </button>

        <button className="w-full bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-all duration-200">
          <div className="flex items-center space-x-4">
            <Settings className="text-gray-600" size={20} />
            <span className="font-semibold text-gray-900">
              {t("profile.sections.advancedSettings")}
            </span>
          </div>
          <ChevronRight className="text-gray-400" size={20} />
        </button>

        <button 
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full bg-white rounded-2xl p-5 shadow-sm border border-red-200 flex items-center justify-between hover:shadow-md transition-all duration-200 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center space-x-4">
            {loggingOut ? (
              <Loader className="text-red-600 animate-spin" size={20} />
            ) : (
              <LogOut className="text-red-600" size={20} />
            )}
            <span className="font-semibold text-red-600">
              {loggingOut ? t("profile.loggingOut", "Logging out...") : t("profile.signOut")}
            </span>
          </div>
          <ChevronRight className="text-red-400" size={20} />
        </button>
      </div>

      {/* User Info Section */}
      <div className="mx-6 px-6 mt-6 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-900 mb-4">
          {t("profile.accountInfo", "Account Information")}
        </h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">{t("profile.userId", "User ID")}:</span>
            <span className="text-gray-900 font-mono text-xs">{user.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">{t("profile.lastUpdated", "Last Updated")}:</span>
            <span className="text-gray-900">{formatDate(user.updatedAt)}</span>
          </div>
        </div>
      </div>

      {/* App Version */}
      <div className="px-6 pt-6 pb-8 text-center">
        <p className="text-xs text-gray-400">{t("profile.appVersion")}</p>
        <p className="text-xs text-gray-400">
          {t("profile.version", { version: "2.1.0" })}
        </p>
      </div>
    </div>
  );
};

export default ProfileScreen;