// =============================================================================
// UPDATED APP COMPONENT WITH TRIP MANAGEMENT
// File path: src/App.tsx
// =============================================================================

import React, { useState, useEffect, useRef } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "./i18n";

// Auth Components
import LoginScreen from "./components/auth/LoginScreen";
import SignupScreen from "./components/auth/SignupScreen";

// Main App Components
import BottomNavigation from "./components/navigation/BottomNavigation";
import HomeScreen from "./components/screens/HomeScreen";
import MapScreen from "./components/screens/MapScreen";
import NotificationScreen from "./components/screens/NotificationScreen";
import ProfileScreen from "./components/screens/ProfileScreen";
import AddTripScreen from "./components/screens/AddTripScreen";
import QuickCheckinScreen from "./components/screens/QuickCheckinScreen";
import GroupStatusScreen from "./components/screens/GroupStatusScreen";
import EmergencyContactsScreen from "./components/screens/EmergencyContactsScreen";
import TripDetailsScreen from "./components/screens/TripDetailsScreen";
import SOSInterface from "./components/sos/SOSInterface";

// Services
import authService from "./services/authService";
import tripService from "./services/tripService";

// Types
import type {  SOSState, GroupMember, ExtendedActiveTab } from "./types";
import type { Trip } from "./services/tripService";
import type { Notification } from "./types";
import { useTranslation } from "react-i18next";
import { supportedLanguages } from "./i18n/languages";
import PhoneFrame from "./components/layout/PhoneFrame";
import type { User } from "./services/authService";

// Mapbox access token
mapboxgl.accessToken = import.meta.env.VITE_REACT_APP_MAPBOX_TOKEN;

// =============================================================================
// MAIN APP COMPONENT WRAPPER
// =============================================================================

const AppWrapper: React.FC = () => {
  const { i18n } = useTranslation();

  useEffect(() => {
    const currentLang = supportedLanguages.find(
      (lang) => lang.code === i18n.language
    );
    document.documentElement.dir = currentLang?.rtl ? "rtl" : "ltr";
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <PhoneFrame>
      <Router>
        <SmartTouristApp />
      </Router>
    </PhoneFrame>
  );
};

// =============================================================================
// MAIN APP COMPONENT
// =============================================================================

const SmartTouristApp: React.FC = () => {
  const navigate = useNavigate();

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Trip state
  const [ activeTrip,setActiveTrip] = useState<Trip | null>(null);
  const [hasActiveTrip, setHasActiveTrip] = useState(false);

  // Check authentication status on app load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        if (authService.isAuthenticated()) {
          const isValid = await authService.verifyToken();
          if (isValid) {
            setIsAuthenticated(true);
            setCurrentUser(authService.getUser());
            
            // Load active trip after authentication
            await loadActiveTrip();
          } else {
            // Token is invalid, clear auth state
            await authService.logout();
            setIsAuthenticated(false);
            setCurrentUser(null);
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsAuthenticated(false);
        setCurrentUser(null);
      } finally {
        setIsAuthLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Load active trip
  const loadActiveTrip = async () => {
    try {
      const tripStatus = await tripService.checkActiveTrip();
      setHasActiveTrip(tripStatus.hasActiveTrip);
      setActiveTrip(tripStatus.activeTrip);
    } catch (error) {
      console.error("Failed to load active trip:", error);
      setHasActiveTrip(false);
      setActiveTrip(null);
    }
  };

  useEffect(()=>{if(currentUser){
    toast.success("User loged in")
  }
  if(activeTrip && hasActiveTrip){
    toast.success("active trip")
  }
  },[])

  // State management
  const [activeTab, setActiveTab] = useState<ExtendedActiveTab>("home");
  const [sosState, setSosState] = useState<SOSState>("inactive");
  const [swipeProgress, setSwipeProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);

  // App data
  const [currentLocation] = useState("Dubai Marina, UAE");
  const [safetyScore] = useState(85);

  // Map refs
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const sosMapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const sosMapRef = useRef<mapboxgl.Map | null>(null);

  const [notifications] = useState<Notification[]>([]);

  const [groupMembers] = useState<GroupMember[]>([
    {
      id: 1,
      name: "Sarah Chen",
      status: "safe",
      lastSeen: "2 min ago",
      location: "Burj Khalifa",
    },
    {
      id: 2,
      name: "Mike Johnson",
      status: "safe",
      lastSeen: "5 min ago",
      location: "Dubai Mall",
    },
    {
      id: 3,
      name: "Lisa Park",
      status: "warning",
      lastSeen: "15 min ago",
      location: "Unknown",
    },
    {
      id: 4,
      name: "David Kim",
      status: "safe",
      lastSeen: "1 min ago",
      location: "Dubai Marina",
    },
  ]);

  // Authentication handlers
  const handleAuthSuccess = async () => {
    setIsAuthenticated(true);
    setCurrentUser(authService.getUser());
    await loadActiveTrip(); // Load trip after successful auth
    navigate("/app"); // Navigate to main app
  };

  // const handleLogout = async () => {
  //   try {
  //     await authService.logout();
  //   } catch (error) {
  //     console.error("Logout error:", error);
  //   } finally {
  //     setIsAuthenticated(false);
  //     setCurrentUser(null);
  //     setActiveTab("home");
  //     setSosState("inactive");
  //     setSwipeProgress(0);
  //     setIsDragging(false);
  //     setHasActiveTrip(false);
  //     setActiveTrip(null);
  //     navigate("/login"); // Navigate to login page
  //   }
  // };

  

  // Set up listener for auth state changes
  useEffect(() => {
    const checkAuthState = () => {
      if (!authService.isAuthenticated() && isAuthenticated) {
        // User has been logged out
        setIsAuthenticated(false);
        setCurrentUser(null);
        setActiveTab("home");
        setSosState("inactive");
        setSwipeProgress(0);
        setIsDragging(false);
        setHasActiveTrip(false);
        setActiveTrip(null);
        navigate("/login");
      }
    };

    // Check auth state periodically
    const interval = setInterval(checkAuthState, 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, navigate]);

  // Navigation handlers for new screens
  const handleQuickCheckinPress = () => {
    setActiveTab("quickCheckin");
  };

  const handleGroupStatusPress = () => {
    setActiveTab("groupStatus");
  };

  const handleEmergencyContactsPress = () => {
    setActiveTab("emergencyContacts");
  };

  const handleTripDetailsPress = () => {
    setActiveTab("tripDetails");
  };

  const handleAddTripPress = () => {
    setActiveTab("addTrip");
  };

  // Back navigation handlers
  const handleBackToHome = () => {
    setActiveTab("home");
  };

  // Trip management handlers
  const handleTripSaved = async () => {
    // Reload active trip after saving
    await loadActiveTrip();
  };

  const handleTripCompleted = async () => {
    // Reload active trip after completion
    await loadActiveTrip();
  };

  // Map initialization
  useEffect(() => {
    if (
      !isAuthenticated ||
      activeTab !== "map" ||
      !mapContainer.current ||
      mapRef.current
    )
      return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v10",
      center: [55.2708, 25.2048],
      zoom: 12,
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl());

    // Add user marker
    new mapboxgl.Marker({ color: "#000000" })
      .setLngLat([55.2708, 25.2048])
      .addTo(mapRef.current);

    // Add group member markers
    groupMembers.forEach((member) => {
      const coords: [number, number] = [
        55.2708 + (Math.random() - 0.5) * 0.02,
        25.2048 + (Math.random() - 0.5) * 0.02,
      ];

      const color =
        member.status === "safe"
          ? "#22c55e"
          : member.status === "warning"
          ? "#f59e0b"
          : "#ef4444";

      new mapboxgl.Marker({ color })
        .setLngLat(coords)
        .setPopup(
          new mapboxgl.Popup().setHTML(`
            <div class="p-2">
              <h3 class="font-semibold">${member.name}</h3>
              <p class="text-sm text-gray-600">${member.location}</p>
              <p class="text-xs text-gray-500">${member.lastSeen}</p>
            </div>
          `)
        )
        .addTo(mapRef.current!);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [activeTab, groupMembers, isAuthenticated]);

  // SOS Map initialization
  useEffect(() => {
    if (!isAuthenticated || sosState !== "waiting") {
      if (sosMapRef.current) {
        sosMapRef.current.remove();
        sosMapRef.current = null;
      }
      return;
    }

    if (!sosMapContainer.current || sosMapRef.current) return;

    sosMapRef.current = new mapboxgl.Map({
      container: sosMapContainer.current,
      style: "mapbox://styles/mapbox/light-v10",
      center: [55.2708, 25.2048],
      zoom: 15,
    });

    sosMapRef.current.on("load", () => {
      if (!sosMapRef.current) return;

      // Add user location marker
      new mapboxgl.Marker({ color: "#ef4444" })
        .setLngLat([55.2708, 25.2048])
        .addTo(sosMapRef.current!);

      // Add emergency vehicle markers
      new mapboxgl.Marker({ color: "#3b82f6" })
        .setLngLat([55.2758, 25.2098])
        .addTo(sosMapRef.current!);

      new mapboxgl.Marker({ color: "#22c55e" })
        .setLngLat([55.2658, 25.1998])
        .addTo(sosMapRef.current!);
    });
  }, [sosState, isAuthenticated]);

  // SOS handlers
  const handleSOSPress = () => {
    if (activeTab !== "SOS") {
      setActiveTab("SOS");
      setSosState("swipe");
      setSwipeProgress(0);
    } else {
      setSosState("swipe");
      setSwipeProgress(0);
    }
  };

  const handleSwipeStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    setDragStartX(clientX);
  };

  const handleSwipeMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const deltaX = clientX - dragStartX;
    const maxWidth = 280; // Max swipe distance
    const progress = Math.max(0, Math.min(100, (deltaX / maxWidth) * 100));

    setSwipeProgress(progress);

    if (progress >= 90) {
      handleSwipeComplete();
    }
  };

  const handleSwipeEnd = () => {
    setIsDragging(false);
    if (swipeProgress < 90) {
      setSwipeProgress(0);
    }
  };

  const handleSwipeComplete = () => {
    setSosState("sending");
    setSwipeProgress(100);
    setIsDragging(false);

    setTimeout(() => {
      setSosState("sent");
    }, 2000);

    setTimeout(() => {
      setSosState("waiting");
    }, 4000);
  };

  // Global swipe event listeners
  useEffect(() => {
    if (isDragging && isAuthenticated) {
      const handleMove = (e: MouseEvent | TouchEvent) => handleSwipeMove(e);
      const handleEnd = () => handleSwipeEnd();

      document.addEventListener("mousemove", handleMove);
      document.addEventListener("mouseup", handleEnd);
      document.addEventListener("touchmove", handleMove, { passive: false });
      document.addEventListener("touchend", handleEnd);

      return () => {
        document.removeEventListener("mousemove", handleMove);
        document.removeEventListener("mouseup", handleEnd);
        document.removeEventListener("touchmove", handleMove);
        document.removeEventListener("touchend", handleEnd);
      };
    }
  }, [isDragging, dragStartX, isAuthenticated]);

  const closeSOS = () => {
    setSosState("inactive");
    setSwipeProgress(0);
    setIsDragging(false);
    setActiveTab("home");

    if (sosMapRef.current) {
      sosMapRef.current.remove();
      sosMapRef.current = null;
    }
  };

  // Show loading screen during auth check
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Main App Component (after authentication)
  const MainApp: React.FC = () => {
    const renderScreen = () => {
      switch (activeTab) {
        case "home":
          return (
            <HomeScreen
              currentLocation={currentLocation}
              safetyScore={safetyScore}
              groupMembers={groupMembers}
              notifications={notifications}
              onAddTripPress={handleAddTripPress}
              onQuickCheckinPress={handleQuickCheckinPress}
              onGroupStatusPress={handleGroupStatusPress}
              onTripDetailsPress={handleTripDetailsPress}
              onEmergencyContactsPress={handleEmergencyContactsPress}
            />
          );
        case "map":
          return (
            <MapScreen
              groupMembers={groupMembers}
              mapContainer={mapContainer}
            />
          );
        case "notifications":
          return <NotificationScreen notifications={notifications} />;
        case "profile":
          return <ProfileScreen />;
        case "addTrip":
          return (
            <AddTripScreen
              onBack={handleBackToHome}
              onTripSaved={handleTripSaved}
            />
          );
        case "quickCheckin":
          return (
            <QuickCheckinScreen
              onBack={handleBackToHome}
              currentLocation={currentLocation}
            />
          );
        case "groupStatus":
          return (
            <GroupStatusScreen
              onBack={handleBackToHome}
              groupMembers={groupMembers}
            />
          );
        case "emergencyContacts":
          return (
            <EmergencyContactsScreen
              onBack={handleBackToHome}
            />
          );
        case "tripDetails":
          return (
            <TripDetailsScreen
              onBack={handleBackToHome}
              onTripCompleted={handleTripCompleted}
            />
          );
        case "SOS":
          return (
            <SOSInterface
              sosState={sosState}
              swipeProgress={swipeProgress}
              currentLocation={currentLocation}
              onSwipeStart={handleSwipeStart}
              onClose={closeSOS}
              sosMapContainer={sosMapContainer}
            />
          );
        default:
          return null;
      }
    };

    return (
      <div className="max-w-sm mx-auto bg-gray-50 min-h-screen flex flex-col">
        {/* Scrollable screen */}
        <div className="flex-1 overflow-y-auto pb-16">
          {renderScreen()}
        </div>

        {/* Sticky bottom nav inside the container */}
        <div className="sticky bottom-0 w-full">
          <BottomNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onSOSPress={handleSOSPress}
            notificationCount={
              notifications.filter((n) => n.priority === "high").length
            }
            sosState={sosState}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="App">
      {/* Toast Notifications */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: "#4ade80",
              secondary: "#fff",
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />

      <Routes>
        {/* Authentication Routes */}
        <Route
          path="/login"
          element={
            !isAuthenticated ? (
              <LoginScreen onAuthSuccess={handleAuthSuccess} />
            ) : (
              <Navigate to="/app" replace />
            )
          }
        />
        <Route
          path="/signup"
          element={
            !isAuthenticated ? (
              <SignupScreen onAuthSuccess={handleAuthSuccess} />
            ) : (
              <Navigate to="/app" replace />
            )
          }
        />

        {/* Main App Route */}
        <Route
          path="/app"
          element={
            isAuthenticated ? <MainApp /> : <Navigate to="/login" replace />
          }
        />

        {/* Default Route */}
        <Route
          path="/"
          element={
            <Navigate to={isAuthenticated ? "/app" : "/login"} replace />
          }
        />

        {/* Catch all route */}
        <Route
          path="*"
          element={
            <Navigate to={isAuthenticated ? "/app" : "/login"} replace />
          }
        />
      </Routes>
    </div>
  );
};

export default AppWrapper;