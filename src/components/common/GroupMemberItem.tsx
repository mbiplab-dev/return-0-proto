// =============================================================================
// COMPONENT: Group Member Item
// File path: src/components/common/GroupMemberItem.tsx
// =============================================================================

import { User } from "lucide-react";
import type { GroupMember } from "../../types";


interface GroupMemberItemProps {
  member: GroupMember;
  showLocation?: boolean;
}

const GroupMemberItem: React.FC<GroupMemberItemProps> = ({
  member,
  showLocation = true,
}) => {
  const statusColors = {
    safe: "bg-green-100 text-green-700 border-green-200",
    warning: "bg-orange-100 text-orange-700 border-orange-200",
    danger: "bg-red-100 text-red-700 border-red-200",
  };

  return (
    <div className="flex items-center space-x-3 p-3 bg-white rounded-xl border border-gray-100">
      <div className="relative">
        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
          <User size={20} className="text-gray-500" />
        </div>
        <div
          className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
            member.status === "safe"
              ? "bg-green-400"
              : member.status === "warning"
              ? "bg-orange-400"
              : "bg-red-400"
          }`}
        />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900 text-sm">{member.name}</h4>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              statusColors[member.status]
            }`}
          >
            {member.status}
          </span>
        </div>
        {showLocation && (
          <p className="text-xs text-gray-500 mt-1">
            {member.location} • {member.lastSeen}
          </p>
        )}
      </div>
    </div>
  );
};

export default GroupMemberItem;
