// =============================================================================
// COMPONENT: Bottom Navigation with i18n support
// File path: src/components/navigation/BottomNavigation.tsx
// =============================================================================

import { Home, MapPin, Bell, User, AlertTriangle } from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation";
import type { ActiveTab, ExtendedActiveTab, SOSState } from "../../types";

interface BottomNavigationProps {
  activeTab: ExtendedActiveTab;
  onTabChange: (tab: ExtendedActiveTab) => void; // Updated to ExtendedActiveTab
  onSOSPress: () => void;
  notificationCount: number;
  sosState: SOSState;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabChange,
  onSOSPress,
  sosState, // Include sosState to style SOS button
}) => {
  const { t } = useTranslation();

  const navigationItems = [
    {
      tab: "home" as ActiveTab,
      icon: Home,
      labelKey: "navigation.home",
    },
    {
      tab: "map" as ActiveTab,
      icon: MapPin,
      labelKey: "navigation.map",
    },
    {
      tab: "notifications" as ActiveTab,
      icon: Bell,
      labelKey: "navigation.notifications",
    },
    {
      tab: "profile" as ActiveTab,
      icon: User,
      labelKey: "navigation.profile",
    },
    {
      tab: "SOS" as ExtendedActiveTab, // Use ExtendedActiveTab for SOS
      icon: AlertTriangle,
      labelKey: "navigation.sos",
      isSpecial: true,
    },
  ];

  return (
    <div className="w-full bg-white border-t border-gray-200 px-4 py-2 shadow-lg rounded-b-2xl z-100">
      <div className="flex justify-around items-center">
        {navigationItems.map(({ tab, icon: Icon, labelKey, isSpecial }) => (
          <button
            key={tab}
            onClick={() => {
              if (isSpecial) {
                onSOSPress();
              } else {
                onTabChange(tab);
              }
            }}
            className={`flex flex-col items-center p-3 rounded-xl transition-all duration-200 ${
              activeTab === tab
                ? isSpecial
                  ? "bg-red-500 text-white"
                  : "bg-black text-white"
                : isSpecial
                ? "text-red-500 hover:text-red-700"
                : "text-gray-500 hover:text-gray-900"
            } ${isSpecial && sosState !== "inactive" ? "animate-pulse" : ""}`}
            aria-label={t(labelKey)}
          >
            <div className="relative">
              <Icon size={24} />
            </div>
            <span className="text-xs mt-1 font-medium">{t(labelKey)}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BottomNavigation;