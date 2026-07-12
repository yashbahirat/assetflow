"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { useAuth } from '@/context/AuthContext';
import {
  PackageCheck, PackageMinus, Wrench, AlertTriangle,
  Calendar, ArrowRightLeft, Clock, Plus, BookOpen, ChevronRight, Activity
} from 'lucide-react';
import Link from 'next/link';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

const ACTION_LABELS: Record<string, string> = {
  ASSET_ALLOCATED: 'Asset assigned',
  ASSET_RETURNED: 'Asset returned',
  TRANSFER_REQUESTED: 'Transfer requested',
  TRANSFER_APPROVED: 'Transfer approved',
  TRANSFER_REJECTED: 'Transfer rejected',
  MAINTENANCE_REQUESTED: 'Maintenance raised',
  MAINTENANCE_APPROVED: 'Maintenance approved',
  MAINTENANCE_REJECTED: 'Maintenance rejected',
  MAINTENANCE_RESOLVED: 'Maintenance resolved',
  BOOKING_CONFIRMED: 'Booking confirmed',
  BOOKING_CANCELLED: 'Booking cancelled',
  CREATED_CYCLE: 'Audit cycle started',
  CLOSED_CYCLE: 'Audit cycle closed',
  MARKED_ITEM_MISSING: 'Item marked missing',
  MARKED_ITEM_DAMAGED: 'Item marked damaged',
};

const timeAgo = (d: string) => {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [overdue, setOverdue] = useState<any[]>([]);
  const [upcomingReturns, setUpcomingReturns] = useState<any[]>([]);
  const [myAssets, setMyAssets] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [categoryStats, setCategoryStats] = useState<any[]>([]);
  const [maintenanceStats, setMaintenanceStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const [dashRes, repRes] = await Promise.all([
          api.get('/analytics/dashboard'),
          api.get('/analytics/reports')
        ]);
        setStats(dashRes.data.stats);
        setOverdue(dashRes.data.overdueAllocations || []);
        setUpcomingReturns(dashRes.data.upcomingReturns || []);
        setMyAssets(dashRes.data.myAllocations || []);
        setRecentActivity(dashRes.data.recentActivity || []);
        setCategoryStats(repRes.data.categoryStats || []);
        setMaintenanceStats(repRes.data.maintenanceStats || []);
      } catch { /* silent */ } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  if (loading) return null;

  const isManager = user?.role === 'ADMIN' || user?.role === 'ASSET_MANAGER';

  const kpis = [
    { label: 'Available Assets', value: stats?.available ?? 0, icon: PackageCheck, color: 'text-green-600', bg: 'bg-green-50', href: '/assets?status=AVAILABLE' },
    { label: 'Allocated Assets', value: stats?.allocated ?? 0, icon: PackageMinus, color: 'text-blue-600', bg: 'bg-blue-50', href: '/assets?status=ALLOCATED' },
    { label: 'In Maintenance', value: stats?.maintenance ?? 0, icon: Wrench, color: 'text-yellow-600', bg: 'bg-yellow-50', href: '/maintenance' },
    { label: 'Active Bookings', value: stats?.activeBookings ?? 0, icon: Calendar, color: 'text-indigo-600', bg: 'bg-indigo-50', href: '/bookings' },
    { label: 'Pending Transfers', value: stats?.pendingTransfers ?? 0, icon: ArrowRightLeft, color: 'text-purple-600', bg: 'bg-purple-50', href: '/transfers' },
    { label: 'Upcoming Returns', value: stats?.upcomingCount ?? 0, icon: Clock, color: 'text-cyan-600', bg: 'bg-cyan-50', href: '#upcoming' },
  ];

  const quickActions = [
    { label: 'Register Asset', href: '/assets', icon: Plus, color: 'bg-indigo-600 hover:bg-indigo-500' },
    { label: 'Book Resource', href: '/bookings', icon: BookOpen, color: 'bg-emerald-600 hover:bg-emerald-500' },
    { label: 'Raise Maintenance', href: '/maintenance', icon: Wrench, color: 'bg-orange-600 hover:bg-orange-500' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col relative overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-8">

          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {user?.firstName}! 👋
              </h1>
              <p className="mt-1 text-sm text-gray-500">Here's your operational snapshot for today.</p>
            </div>
            {/* Quick Actions */}
            <div className="hidden sm:flex items-center gap-2">
              {quickActions.map(a => (
                <Link key={a.label} href={a.href} className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold text-white shadow-sm ${a.color} transition-all`}>
                  <a.icon className="h-4 w-4" /> {a.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Overdue Banner */}
          {overdue.length > 0 && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-800">{overdue.length} Overdue Return{overdue.length > 1 ? 's' : ''} — Action Required</p>
                <p className="text-xs text-red-600 mt-0.5">
                  {overdue.slice(0, 2).map(a => `${a.asset.name} (${a.user ? `${a.user.firstName} ${a.user.lastName}` : a.department?.name})`).join(', ')}
                  {overdue.length > 2 && ` and ${overdue.length - 2} more`}
                </p>
              </div>
              <Link href="#overdue" className="ml-auto text-xs font-medium text-red-700 hover:text-red-900 whitespace-nowrap">View all →</Link>
            </div>
          )}

          {/* KPI Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {kpis.map(k => (
              <Link key={k.label} href={k.href} className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-4 flex flex-col hover:shadow-md transition-shadow group">
                <div className={`h-9 w-9 rounded-lg ${k.bg} flex items-center justify-center mb-3`}>
                  <k.icon className={`h-5 w-5 ${k.color}`} />
                </div>
                <p className="text-2xl font-bold text-gray-900">{k.value}</p>
                <p className="text-xs text-gray-500 mt-1 leading-tight">{k.label}</p>
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

            {/* Charts — only for managers */}
            {isManager && (
              <>
                <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Assets by Category</h3>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={categoryStats} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value">
                          {categoryStats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Maintenance by Status</h3>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={maintenanceStats} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip cursor={{ fill: '#f3f4f6' }} />
                        <Bar dataKey="value" fill="#6366f1" radius={[3, 3, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            )}

            {/* Recent Activity Feed */}
            <div className={`bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl overflow-hidden ${isManager ? '' : 'lg:col-span-3'}`}>
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-indigo-500" /> Recent Activity
                </h3>
                <Link href="/notifications" className="text-xs text-indigo-600 hover:text-indigo-500 font-medium">View all</Link>
              </div>
              <ul className="divide-y divide-gray-50">
                {recentActivity.length === 0 ? (
                  <li className="px-5 py-6 text-sm text-gray-400 text-center">No recent activity.</li>
                ) : recentActivity.map((log: any) => (
                  <li key={log.id} className="flex items-center gap-3 px-5 py-3">
                    <span className="h-7 w-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700 flex-shrink-0">
                      {log.user?.firstName?.[0] || '?'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-700 truncate">
                        <span className="font-medium">{log.user?.firstName} {log.user?.lastName}</span>
                        {' · '}
                        {ACTION_LABELS[log.action] || log.action.replace(/_/g, ' ').toLowerCase()}
                      </p>
                    </div>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap flex-shrink-0">{timeAgo(log.createdAt)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* My Assets */}
          <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <PackageCheck className="h-4 w-4 text-indigo-500" /> My Assigned Assets
              </h3>
              {myAssets.length > 0 && <span className="text-xs text-gray-400">{myAssets.length} active</span>}
            </div>
            {myAssets.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-400">You have no assets currently assigned to you.</div>
            ) : (
              <ul className="divide-y divide-gray-50">
                {myAssets.map((alloc: any) => (
                  <li key={alloc.id} className="flex items-center justify-between px-6 py-3 hover:bg-gray-50">
                    <div>
                      <Link href={`/assets/${alloc.asset.id}`} className="text-sm font-medium text-indigo-600 hover:underline">{alloc.asset.name}</Link>
                      <p className="text-xs text-gray-400">{alloc.asset.tag} · {alloc.asset.condition || 'Good'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {alloc.expectedReturnDate
                          ? <span className={new Date(alloc.expectedReturnDate) < new Date() ? 'text-red-600 font-medium' : 'text-gray-700'}>
                              Due {new Date(alloc.expectedReturnDate).toLocaleDateString()}
                            </span>
                          : <span className="text-gray-400">Indefinite</span>}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Upcoming Returns */}
          {upcomingReturns.length > 0 && (
            <div id="upcoming" className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                <Clock className="h-4 w-4 text-cyan-500" />
                <h3 className="text-sm font-semibold text-gray-900">Upcoming Returns (Next 7 Days)</h3>
              </div>
              <ul className="divide-y divide-gray-50">
                {upcomingReturns.map((alloc: any) => (
                  <li key={alloc.id} className="flex items-center justify-between px-6 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{alloc.asset.name}</p>
                      <p className="text-xs text-gray-400">{alloc.asset.tag} · Held by {alloc.user ? `${alloc.user.firstName} ${alloc.user.lastName}` : alloc.department?.name}</p>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-cyan-50 px-2.5 py-0.5 text-xs font-medium text-cyan-700 ring-1 ring-inset ring-cyan-600/20">
                      Due {new Date(alloc.expectedReturnDate).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Overdue Returns */}
          {overdue.length > 0 && (
            <div id="overdue" className="bg-white shadow-sm ring-1 ring-red-200 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-red-100 bg-red-50 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <h3 className="text-sm font-semibold text-red-800">Overdue Returns ({overdue.length})</h3>
              </div>
              <ul className="divide-y divide-gray-50">
                {overdue.map((alloc: any) => {
                  const daysOverdue = Math.floor((Date.now() - new Date(alloc.expectedReturnDate).getTime()) / 86400000);
                  return (
                    <li key={alloc.id} className="flex items-center justify-between px-6 py-3 hover:bg-red-50/30">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{alloc.asset.name}</p>
                        <p className="text-xs text-gray-500">{alloc.asset.tag} · {alloc.user ? `${alloc.user.firstName} ${alloc.user.lastName}` : alloc.department?.name}</p>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 ring-1 ring-inset ring-red-600/20">
                          {daysOverdue}d overdue
                        </span>
                        <p className="text-[10px] text-gray-400 mt-0.5">Due {new Date(alloc.expectedReturnDate).toLocaleDateString()}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
