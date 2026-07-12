"use client";

import { useEffect, useState, useRef } from "react";
import { Bell, Search, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

interface ActivityLog {
  id: string;
  action: string;
  entityType: string;
  createdAt: string;
  user: { firstName: string, lastName: string };
}

export function Topbar() {
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [upcomingReminder, setUpcomingReminder] = useState<any>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const getInitials = () => {
    if (!user) return "??";
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  };

  const fetchLogs = async () => {
    try {
      const { data } = await api.get('/analytics/activity');
      setLogs(data.logs);
    } catch (error) {
      console.error('Failed to fetch notifications');
    }
  };

  useEffect(() => {
    if (user) {
      fetchLogs();
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    
    const checkBookings = async () => {
      try {
        const { data } = await api.get('/bookings');
        const now = new Date();
        const next15 = new Date(now.getTime() + 15 * 60000);
        
        const myUpcoming = data.bookings.filter((b: any) => {
          if (b.userId !== user.id) return false;
          if (b.status === 'CANCELLED') return false;
          const start = new Date(b.startTime);
          return start > now && start <= next15;
        });

        if (myUpcoming.length > 0) {
          setUpcomingReminder(myUpcoming[0]);
        } else {
          setUpcomingReminder(null);
        }
      } catch (e) {
        console.error('Failed to check upcoming bookings', e);
      }
    };
    
    checkBookings();
    const int = setInterval(checkBookings, 60000);
    return () => clearInterval(int);
  }, [user]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      {upcomingReminder && (
        <div className="bg-indigo-600 px-4 py-2 text-white text-center text-sm font-medium sticky top-0 z-20 shadow-md flex items-center justify-center gap-2">
          <Bell className="h-4 w-4" /> Reminder: You have an upcoming booking for {upcomingReminder.asset.name} starting at {new Date(upcomingReminder.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </div>
      )}
      <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 items-center gap-x-4 border-b bg-white px-6 shadow-sm">
        <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <form className="relative flex flex-1" action="#" method="GET">
          <label htmlFor="search-field" className="sr-only">
            Search
          </label>
          <Search
            className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400"
            aria-hidden="true"
          />
          <input
            id="search-field"
            className="block h-full w-full border-0 py-0 pl-8 pr-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm bg-transparent outline-none"
            placeholder="Search assets, users, or departments..."
            type="search"
            name="search"
          />
        </form>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <div className="relative" ref={notifRef}>
            <button 
              type="button" 
              onClick={() => setShowNotifications(!showNotifications)}
              className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500 relative"
            >
              <span className="sr-only">View notifications</span>
              <Bell className="h-6 w-6" aria-hidden="true" />
              {logs.length > 0 && (
                <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none max-h-96 overflow-y-auto">
                <div className="px-4 py-2 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                </div>
                {logs.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-500 text-center">No recent activity</div>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="px-4 py-3 border-b border-gray-50 hover:bg-gray-50">
                      <p className="text-sm font-medium text-gray-900">
                        {log.user.firstName} {log.user.lastName} <span className="text-gray-500 font-normal">{log.action}</span> {log.entityType}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(log.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" aria-hidden="true" />
          
          {user ? (
            <div className="flex items-center gap-x-4">
              <span className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-sm">
                {getInitials()}
              </span>
              <div className="flex flex-col">
                <span className="text-sm font-medium leading-5 text-gray-900">{user.firstName} {user.lastName}</span>
                <span className="text-xs text-gray-500 leading-4">{user.role}</span>
              </div>
              <button 
                onClick={logout}
                className="ml-2 text-gray-400 hover:text-red-500 transition-colors"
                title="Log out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
    </>
  );
}
