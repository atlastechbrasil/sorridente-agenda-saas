
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  trend: "up" | "down";
}

const StatsCard = ({ title, value, change, icon: Icon, trend }: StatsCardProps) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          <p className={`text-sm mt-1 ${
            trend === "up" ? "text-green-600" : "text-red-600"
          }`}>
            {change}
          </p>
        </div>
        <div className={`p-3 rounded-full ${
          trend === "up" ? "bg-green-100" : "bg-blue-100"
        }`}>
          <Icon className={`w-6 h-6 ${
            trend === "up" ? "text-green-600" : "text-blue-600"
          }`} />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
