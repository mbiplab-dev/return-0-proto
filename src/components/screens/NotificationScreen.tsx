import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  Bell,
  CheckCircle,
  Clock,
  Headphones,
  Heart,
  Phone,
  Shield,
  Zap,
  RefreshCw,
  Trash2,
} from "lucide-react";
import Header from "../layout/Header";
import { type Notification } from "../../types";
import notificationService from "../../services/notificationService";
import toast from "react-hot-toast";

const NotificationScreen: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "warning":
        return <AlertTriangle size={20} className="text-orange-600" />;
      case "success":
        return <CheckCircle size={20} className="text-green-600" />;
      case "emergency":
        return <Zap size={20} className="text-red-600" />;
      case "health":
        return <Heart size={20} className="text-purple-600" />;
      case "info":
        return <Bell size={20} className="text-blue-600" />;
      default:
        return <Bell size={20} className="text-blue-600" />;
    }
  };

  const getNotificationBgColor = (type: Notification["type"]) => {
    switch (type) {
      case "warning":
        return "bg-orange-100";
      case "success":
        return "bg-green-100";
      case "emergency":
        return "bg-red-100";
      case "health":
        return "bg-purple-100";
      case "info":
        return "bg-blue-100";
      default:
        return "bg-blue-100";
    }
  };

  const getPriorityColor = (priority: Notification["priority"]) => {
    switch (priority) {
      case "critical":
        return "text-red-600 bg-red-100";
      case "high":
        return "text-orange-600 bg-orange-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      case "low":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-blue-600 bg-blue-100";
    }
  };

  const formatTime = (timeString: string) => {
    try {
      const date = new Date(timeString);
      const now = new Date();
      const diffInMs = now.getTime() - date.getTime();
      const diffInHours = diffInMs / (1000 * 60 * 60);
      const diffInDays = diffInHours / 24;

      if (diffInHours < 1) {
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        return `${diffInMinutes}m ago`;
      } else if (diffInHours < 24) {
        return `${Math.floor(diffInHours)}h ago`;
      } else if (diffInDays < 7) {
        return `${Math.floor(diffInDays)}d ago`;
      } else {
        return date.toLocaleDateString();
      }
    } catch (error) {
      return timeString;
    }
  };

  const emergencyContacts = [
    {
      icon: Phone,
      title: "Emergency Services",
      subtitle: "999",
      bgColor: "bg-red-50 hover:bg-red-100",
      iconColor: "text-red-600",
      textColor: "text-red-900",
      subtitleColor: "text-red-700",
    },
    {
      icon: Shield,
      title: "Tourist Police",
      subtitle: "+971-4-TOURIST",
      bgColor: "bg-blue-50 hover:bg-blue-100",
      iconColor: "text-blue-600",
      textColor: "text-blue-900",
      subtitleColor: "text-blue-700",
    },
    {
      icon: Heart,
      title: "Medical Emergency",
      subtitle: "+971-800-HEALTH",
      bgColor: "bg-green-50 hover:bg-green-100",
      iconColor: "text-green-600",
      textColor: "text-green-900",
      subtitleColor: "text-green-700",
    },
    {
      icon: Headphones,
      title: "Support",
      subtitle: "24x7 Help",
      bgColor: "bg-purple-50 hover:bg-purple-100",
      iconColor: "text-purple-600",
      textColor: "text-purple-900",
      subtitleColor: "text-purple-700",
    },
  ];

  // Load notifications
  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationService.fetchNotifications();
      setNotifications(data);
      // Calculate unread count from the fetched notifications
      const unread = data.filter(notif => !notif.isRead).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Failed to load notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, isRead: true }
            : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      toast.success("Notification marked as read");
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      toast.error("Failed to mark as read");
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      // Update local state
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      toast.error("Failed to mark all as read");
    }
  };

  // Delete notification
  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      // Find the notification to check if it was unread
      const deletedNotification = notifications.find(n => n.id === notificationId);
      // Update local state
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      toast.success("Notification deleted");
    } catch (error) {
      console.error("Failed to delete notification:", error);
      toast.error("Failed to delete notification");
    }
  };

  // Refresh notifications
  const handleRefresh = async () => {
    await loadNotifications();
    toast.success("Notifications refreshed");
  };

  // Initial load
  useEffect(() => {
    loadNotifications();
  }, []);

  return (
    <div className="space-y-4">
      <Header
        title={`Notifications ${unreadCount > 0 ? `(${unreadCount})` : ""}`}
        rightAction={
          <div className="flex space-x-3">
            <button
              className="text-sm text-blue-600 font-medium flex items-center space-x-1"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              <span>Refresh</span>
            </button>
            <button
              className="text-sm text-blue-600 font-medium"
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0 || loading}
            >
              Mark All Read
            </button>
          </div>
        }
      />

      <div className="px-4 space-y-4">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="animate-spin text-blue-600" size={24} />
            <span className="ml-2 text-gray-600">Loading notifications...</span>
          </div>
        )}

        {/* Notifications List */}
        {!loading && notifications.length === 0 && (
          <div className="text-center py-8">
            <Bell className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500">No notifications found</p>
          </div>
        )}

        {!loading && notifications.length > 0 && (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`bg-white rounded-2xl p-4 border border-gray-100 relative ${
                  !notif.isRead ? "bg-blue-50 border-blue-200" : ""
                }`}
              >
                {notif.priority === "critical" && (
                  <div className="absolute top-0 left-0 w-1 h-full bg-red-500 rounded-l-2xl" />
                )}
                {notif.priority === "high" && (
                  <div className="absolute top-0 left-0 w-1 h-full bg-orange-500 rounded-l-2xl" />
                )}

                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-xl ${getNotificationBgColor(notif.type)}`}>
                    {getNotificationIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 mb-1">
                          {notif.title || notif.message}
                        </h4>
                        {notif.title && (
                          <p className="text-sm text-gray-700 mb-2">
                            {notif.message}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteNotification(notif.id)}
                        className="text-gray-400 hover:text-red-500 ml-2"
                        disabled={loading}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-2">
                        <p className="text-xs text-gray-500 flex items-center">
                          <Clock size={12} className="mr-1" />
                          {formatTime(notif.time)}
                        </p>
                        {notif.hazardType && (
                          <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                            {notif.hazardType}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        {notif.priority && notif.priority !== "medium" && (
                          <span
                            className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(
                              notif.priority
                            )}`}
                          >
                            {notif.priority}
                          </span>
                        )}
                        {!notif.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(notif.id)}
                            className="text-xs text-blue-600 hover:text-blue-800"
                            disabled={loading}
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Emergency Contacts */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-3">Emergency Contacts</h3>
          <div className="grid grid-cols-2 gap-3">
            {emergencyContacts.map((contact, index) => (
              <button
                key={index}
                className={`flex items-center justify-between p-3 rounded-xl transition-colors ${contact.bgColor}`}
                disabled={loading}
              >
                <div className="flex items-center space-x-2">
                  <contact.icon className={contact.iconColor} size={18} />
                  <div className="text-left">
                    <p className={`font-medium text-sm ${contact.textColor}`}>
                      {contact.title}
                    </p>
                    <p className={`text-xs ${contact.subtitleColor}`}>
                      {contact.subtitle}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationScreen;