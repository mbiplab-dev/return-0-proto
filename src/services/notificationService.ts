import { type Notification } from "../types";

const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken");
  return {
    "Content-Type": "application/json",
    ...(token && { "Authorization": `Bearer ${token}` })
  };
};

const getUserData = () => {
  try {
    return JSON.parse(localStorage.getItem('userData') || "{}");
  } catch {
    return {};
  }
};

const API_BASE_URL = import.meta.env.VITE_BASE_URL || '';

const fetchNotifications = async (): Promise<Notification[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications?all`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Ensure we always work with the array
    const notifications = data.notifications || [];

    // Normalize fields (_id → id, createdAt → time)
    return notifications.map((n: any) => ({
      id: n._id,
      type: n.type,
      title: n.title,
      message: n.message,
      time: n.createdAt,
      priority: n.priority,
      isRead: n.isRead,
      hazardType: n.hazardType,
    }));
  } catch (error) {
    console.error("Error fetching notifications:", error);

    // Return mock data as fallback
    return [
      {
        id: "1",
        type: "info",
        title: "Trip Starting Soon",
        message: "Your trip to Dubai is starting tomorrow!",
        time: new Date().toISOString(),
        priority: "high",
        isRead: false,
        hazardType: undefined,
      },
      {
        id: "2",
        type: "warning",
        title: "Safety Alert",
        message:
          "High winds detected in your area. Please exercise caution when outdoors.",
        time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        priority: "critical",
        isRead: false,
        hazardType: "weather",
      },
      {
        id: "3",
        type: "health",
        title: "Health Check",
        message: "Your daily health check has been completed successfully.",
        time: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        priority: "medium",
        isRead: true,
        hazardType: undefined,
      },
      {
        id: "4",
        type: "emergency",
        title: "Emergency Alert",
        message:
          "Flash flood warning issued for your current location. Seek higher ground immediately.",
        time: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        priority: "critical",
        isRead: false,
        hazardType: "flood",
      },
      {
        id: "5",
        type: "success",
        title: "Payment Confirmed",
        message:
          "Your travel insurance payment has been processed successfully.",
        time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        priority: "low",
        isRead: true,
        hazardType: undefined,
      },
    ];
  }
};


const handleMapHazardAlert = async (
  hazardType: string,
  message: string,
  location?: { type: string; coordinates: [number, number]; address: string; }
): Promise<void> => {
  try {
    const userData = getUserData();
    const response = await fetch(`${API_BASE_URL}/notifications`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        userId: userData?.id,
        title: `${hazardType} Alert`,
        hazardType,
        message,
        location,
        type: "warning",
        priority: "high"
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error creating hazard notification:", error);
    throw error;
  }
};

const getUnreadCount = async (): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      // If unread-count endpoint doesn't exist, fall back to getting all notifications
      const notifications = await fetchNotifications();
      return notifications.filter(n => !n.isRead).length;
    }
    
    const data = await response.json();
    return data.count || data.unreadCount || 0;
  } catch (error) {
    console.error("Error fetching unread count:", error);
    // Fallback: try to get from all notifications
    try {
      const notifications = await fetchNotifications();
      return notifications.filter(n => !n.isRead).length;
    } catch {
      return 0;
    }
  }
};

const markAsRead = async (notificationId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
      method: "POST",
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

const markAllAsRead = async (): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications/mark-all-read`, {
      method: "POST",
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
};

const deleteNotification = async (notificationId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
      method: "DELETE",
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw error;
  }
};

export default {
  fetchNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  handleMapHazardAlert
};