"use client";

import { Home, Package, Users, Building2, Settings, MonitorCheck, ClipboardCheck } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Assets', href: '/assets', icon: Package },
  { name: 'Directory', href: '/directory', icon: Users },
  { name: 'Departments', href: '/departments', icon: Building2 },
  { name: 'Maintenance', href: '/maintenance', icon: MonitorCheck },
  { name: 'Audits', href: '/audits', icon: ClipboardCheck },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

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
            const isCurrent = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  isCurrent
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                  "group flex items-center gap-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors"
                )}
              >
                <Icon
                  className={cn(
                    isCurrent ? "text-indigo-700" : "text-gray-400 group-hover:text-gray-600",
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
