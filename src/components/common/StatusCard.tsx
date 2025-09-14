// =============================================================================
// COMPONENT: Status Card Component
// File path: src/components/common/StatusCard.tsx
// =============================================================================
interface StatusCardProps {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  value: string;
  subtitle: string;
  color: "blue" | "green" | "red" | "orange" | "purple";
  onClick?: () => void;
}

const StatusCard: React.FC<StatusCardProps> = ({
  icon: Icon,
  title,
  value,
  subtitle,
  color,
  onClick,
}) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    green: "bg-green-50 text-green-600 border-green-100",
    red: "bg-red-50 text-red-600 border-red-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
  };

  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-2xl p-4 border border-gray-100 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
        <div className="flex-1 text-left">
          <h3 className="font-semibold text-gray-900 text-base">{title}</h3>
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        </div>
        <div className="text-right">
          <p className={`text-xl font-bold text-${color}-600`}>{value}</p>
        </div>
      </div>
    </button>
  );
};

export default StatusCard;
