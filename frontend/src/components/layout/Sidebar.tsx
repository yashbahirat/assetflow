import { LayoutDashboard, Users, Box, CalendarRange, Wrench, ShieldCheck, Settings } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard, current: true },
  { name: "Assets", href: "/assets", icon: Box, current: false },
  { name: "Bookings", href: "/bookings", icon: CalendarRange, current: false },
  { name: "Maintenance", href: "/maintenance", icon: Wrench, current: false },
  { name: "Audits", href: "/audits", icon: ShieldCheck, current: false },
  { name: "Directory", href: "/directory", icon: Users, current: false },
];

export function Sidebar() {
  return (
    <div className="flex h-full w-64 flex-col border-r bg-white">
      <div className="flex h-16 shrink-0 items-center px-6">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <span className="text-white font-bold text-xl">A</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900">AssetFlow</span>
        </div>
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto px-4 py-4">
        <nav className="flex-1 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  item.current
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                  "group flex items-center gap-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors"
                )}
              >
                <Icon
                  className={cn(
                    item.current ? "text-indigo-700" : "text-gray-400 group-hover:text-gray-600",
                    "h-5 w-5 shrink-0"
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto">
          <Link
            href="/settings"
            className="group flex items-center gap-x-3 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            <Settings className="h-5 w-5 shrink-0 text-gray-400 group-hover:text-gray-600" />
            Settings
          </Link>
        </div>
      </div>
    </div>
  );
}
