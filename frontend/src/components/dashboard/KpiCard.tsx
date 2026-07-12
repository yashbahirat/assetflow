import { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
}

export function KpiCard({ title, value, icon: Icon, trend, trendUp }: KpiCardProps) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className="p-2 bg-indigo-50 rounded-lg">
          <Icon className="h-5 w-5 text-indigo-600" />
        </div>
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-3xl font-semibold text-gray-900">{value}</span>
        {trend && (
          <span
            className={`text-sm font-medium ${
              trendUp ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}
