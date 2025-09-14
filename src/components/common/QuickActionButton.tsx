// =============================================================================
// Updated QuickActionButton with onClick support
// File path: src/components/common/QuickActionButton.tsx
// =============================================================================

import React from "react";
import type { LucideIcon } from "lucide-react";

interface QuickActionButtonProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  color: string;
  onClick?: () => void;
}

const QuickActionButton: React.FC<QuickActionButtonProps> = ({
  icon: Icon,
  title,
  subtitle,
  color,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-left group"
    >
      <div className="flex items-center space-x-3">
        <div className={`${color} p-3 rounded-xl group-hover:scale-110 transition-transform`}>
          <Icon size={20} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
          <p className="text-xs text-gray-500 truncate">{subtitle}</p>
        </div>
      </div>
    </button>
  );
};

export default QuickActionButton;