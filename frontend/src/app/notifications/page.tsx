"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import {
  Bell, User, Clock, AlertTriangle, Package, Calendar,
  CheckCircle, XCircle, ArrowRightLeft, Wrench, ClipboardCheck,
  RefreshCw, Filter, AlertCircle
} from 'lucide-react';

interface ActivityLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  createdAt: string;
  user: { firstName: string; lastName: string; role: string };
}

interface OverdueAlert {
  id: string;
  action: string;
  createdAt: string | null;
  isVirtual: boolean;
  meta: { assetName: string; assetTag: string; holderName: string; dueDate: string | null };
}

const ACTION_META: Record<string, { label: string; icon: React.ComponentType<any>; color: string; bg: string }> = {
  ASSET_ALLOCATED:        { label: 'Asset Assigned',           icon: Package,        color: 'text-blue-600',    bg: 'bg-blue-50' },
  ASSET_RETURNED:         { label: 'Asset Returned',           icon: CheckCircle,    color: 'text-green-600',   bg: 'bg-green-50' },
  TRANSFER_REQUESTED:     { label: 'Transfer Requested',       icon: ArrowRightLeft, color: 'text-indigo-600',  bg: 'bg-indigo-50' },
  TRANSFER_APPROVED:      { label: 'Transfer Approved',        icon: CheckCircle,    color: 'text-green-600',   bg: 'bg-green-50' },
  TRANSFER_REJECTED:      { label: 'Transfer Rejected',        icon: XCircle,        color: 'text-red-600',     bg: 'bg-red-50' },
  MAINTENANCE_REQUESTED:  { label: 'Maintenance Requested',    icon: Wrench,         color: 'text-orange-600',  bg: 'bg-orange-50' },
  MAINTENANCE_APPROVED:   { label: 'Maintenance Approved',     icon: CheckCircle,    color: 'text-green-600',   bg: 'bg-green-50' },
  MAINTENANCE_REJECTED:   { label: 'Maintenance Rejected',     icon: XCircle,        color: 'text-red-600',     bg: 'bg-red-50' },
  MAINTENANCE_IN_PROGRESS:{ label: 'Work In Progress',         icon: Wrench,         color: 'text-purple-600',  bg: 'bg-purple-50' },
  MAINTENANCE_RESOLVED:   { label: 'Maintenance Resolved',     icon: CheckCircle,    color: 'text-green-600',   bg: 'bg-green-50' },
  BOOKING_CONFIRMED:      { label: 'Booking Confirmed',        icon: Calendar,       color: 'text-indigo-600',  bg: 'bg-indigo-50' },
  BOOKING_CANCELLED:      { label: 'Booking Cancelled',        icon: XCircle,        color: 'text-gray-600',    bg: 'bg-gray-100' },
  MARKED_ITEM_MISSING:    { label: 'Audit: Asset Missing',     icon: AlertTriangle,  color: 'text-red-600',     bg: 'bg-red-50' },
  MARKED_ITEM_DAMAGED:    { label: 'Audit: Asset Damaged',     icon: AlertTriangle,  color: 'text-yellow-600',  bg: 'bg-yellow-50' },
  MARKED_ITEM_VERIFIED:   { label: 'Audit: Verified',          icon: CheckCircle,    color: 'text-green-600',   bg: 'bg-green-50' },
  CLOSED_CYCLE:           { label: 'Audit Cycle Closed',       icon: ClipboardCheck, color: 'text-indigo-600',  bg: 'bg-indigo-50' },
  CREATED_CYCLE:          { label: 'Audit Cycle Started',      icon: ClipboardCheck, color: 'text-indigo-600',  bg: 'bg-indigo-50' },
  OVERDUE_RETURN:         { label: 'Overdue Return Alert',     icon: AlertCircle,    color: 'text-red-600',     bg: 'bg-red-50' },
};

const getActionMeta = (action: string) =>
  ACTION_META[action] || { label: action.replace(/_/g, ' '), icon: Bell, color: 'text-gray-600', bg: 'bg-gray-100' };

const ENTITY_TYPES = ['ALL', 'ALLOCATION', 'TRANSFER', 'MAINTENANCE', 'BOOKING', 'AUDIT_CYCLE'];

const timeAgo = (date: string) => {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'notifications' | 'activity'>('notifications');
  const [notifications, setNotifications] = useState<ActivityLog[]>([]);
  const [overdueAlerts, setOverdueAlerts] = useState<OverdueAlert[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [logTotal, setLogTotal] = useState(0);
  const [logPage, setLogPage] = useState(1);
  const [logType, setLogType] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/analytics/notifications');
      setNotifications(data.notifications || []);
      setOverdueAlerts(data.overdueAlerts || []);
    } catch (err) {
      console.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async (page = 1, type = 'ALL') => {
    setLogsLoading(true);
    try {
      const params: any = { page, limit: 25 };
      if (type !== 'ALL') params.type = type;
      const { data } = await api.get('/analytics/activity', { params });
      setLogs(data.logs || []);
      setLogTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to fetch logs');
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (activeTab === 'activity') {
      fetchLogs(logPage, logType);
    }
  }, [activeTab, logPage, logType]);

  const handleTypeChange = (type: string) => {
    setLogType(type);
    setLogPage(1);
  };

  const totalPages = Math.ceil(logTotal / 25);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden relative">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-8">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold leading-7 text-gray-900 flex items-center gap-2">
                <Bell className="h-6 w-6 text-indigo-600" /> Activity &amp; Notifications
              </h1>
              <p className="mt-1 text-sm text-gray-500">Stay informed — every action, alert, and system event in one place.</p>
            </div>
            <button
              onClick={() => { fetchNotifications(); if (activeTab === 'activity') fetchLogs(logPage, logType); }}
              className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-indigo-600 font-medium"
            >
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
          </div>

          {/* Tab Switcher */}
          <div className="mb-6 flex gap-1 bg-white rounded-xl p-1 shadow-sm ring-1 ring-gray-900/5 w-fit">
            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'notifications' ? 'bg-indigo-600 text-white shadow' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Bell className="h-4 w-4" />
              Notifications
              {overdueAlerts.length > 0 && (
                <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${activeTab === 'notifications' ? 'bg-white text-indigo-600' : 'bg-red-500 text-white'}`}>
                  {overdueAlerts.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'activity' ? 'bg-indigo-600 text-white shadow' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <ClipboardCheck className="h-4 w-4" /> Full Audit Log
            </button>
          </div>

          {/* ── NOTIFICATIONS TAB ── */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">

              {/* Overdue Alerts Banner */}
              {overdueAlerts.length > 0 && (
                <div className="bg-red-50 rounded-xl border border-red-200 p-4">
                  <h3 className="text-sm font-semibold text-red-800 flex items-center gap-2 mb-3">
                    <AlertCircle className="h-4 w-4" /> Overdue Return Alerts ({overdueAlerts.length})
                  </h3>
                  <ul className="space-y-2">
                    {overdueAlerts.map(alert => (
                      <li key={alert.id} className="flex items-center justify-between bg-white rounded-lg px-4 py-3 border border-red-100 shadow-sm">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {alert.meta.assetName}
                            <span className="ml-2 text-xs text-gray-400 font-normal">{alert.meta.assetTag}</span>
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Held by <span className="font-medium text-gray-700">{alert.meta.holderName}</span>
                            {alert.meta.dueDate && ` · was due ${new Date(alert.meta.dueDate).toLocaleDateString()}`}
                          </p>
                        </div>
                        <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
                          Overdue
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recent Notifications */}
              <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">Recent Notifications</h3>
                  <span className="text-xs text-gray-500">{notifications.length} events</span>
                </div>
                {loading ? (
                  <div className="p-8 text-center text-sm text-gray-400">Loading notifications...</div>
                ) : notifications.length === 0 ? (
                  <div className="p-12 text-center">
                    <Bell className="mx-auto h-10 w-10 text-gray-200 mb-3" />
                    <p className="text-sm text-gray-400">No notifications yet. Start using AssetFlow!</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-50">
                    {notifications.map((n) => {
                      const meta = getActionMeta(n.action);
                      const Icon = meta.icon;
                      return (
                        <li key={n.id} className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                          <div className={`h-9 w-9 rounded-full ${meta.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                            <Icon className={`h-4 w-4 ${meta.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{meta.label}</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              By <span className="font-medium text-gray-700">{n.user.firstName} {n.user.lastName}</span>
                              <span className="mx-1.5 text-gray-300">·</span>
                              <span className="capitalize text-gray-400">{n.user.role?.replace('_', ' ')}</span>
                            </p>
                          </div>
                          <div className="flex-shrink-0 text-right">
                            <p className="text-xs text-gray-400 whitespace-nowrap">{timeAgo(n.createdAt)}</p>
                            <p className="text-[10px] text-gray-300 mt-0.5">{new Date(n.createdAt).toLocaleDateString()}</p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* ── ACTIVITY LOG TAB ── */}
          {activeTab === 'activity' && (
            <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl overflow-hidden">
              {/* Filter Bar */}
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <div className="flex gap-1 flex-wrap">
                    {ENTITY_TYPES.map(type => (
                      <button
                        key={type}
                        onClick={() => handleTypeChange(type)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          logType === type
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-50 ring-1 ring-inset ring-gray-200'
                        }`}
                      >
                        {type === 'ALL' ? 'All Types' : type.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
                <span className="text-xs text-gray-400">{logTotal} total entries</span>
              </div>

              {/* Log Table */}
              {logsLoading ? (
                <div className="p-8 text-center text-sm text-gray-400">Loading logs...</div>
              ) : logs.length === 0 ? (
                <div className="p-8 text-center text-sm text-gray-400">No log entries found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actor</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">When</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {logs.map((log) => {
                        const meta = getActionMeta(log.action);
                        const Icon = meta.icon;
                        return (
                          <tr key={log.id} className="hover:bg-gray-50">
                            <td className="px-6 py-3">
                              <div className="flex items-center gap-2.5">
                                <div className={`h-7 w-7 rounded-full ${meta.bg} flex items-center justify-center flex-shrink-0`}>
                                  <Icon className={`h-3.5 w-3.5 ${meta.color}`} />
                                </div>
                                <span className="font-medium text-gray-900">{meta.label}</span>
                              </div>
                            </td>
                            <td className="px-6 py-3">
                              <p className="font-medium text-gray-800">{log.user.firstName} {log.user.lastName}</p>
                              <p className="text-xs text-gray-400 capitalize">{log.user.role?.replace('_', ' ')}</p>
                            </td>
                            <td className="px-6 py-3">
                              <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                                {log.entityType}
                              </span>
                            </td>
                            <td className="px-6 py-3">
                              <p className="text-gray-700">{new Date(log.createdAt).toLocaleDateString()}</p>
                              <p className="text-xs text-gray-400">{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                  <button
                    disabled={logPage <= 1}
                    onClick={() => setLogPage(p => p - 1)}
                    className="text-sm font-medium text-gray-600 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    ← Previous
                  </button>
                  <span className="text-xs text-gray-500">Page {logPage} of {totalPages}</span>
                  <button
                    disabled={logPage >= totalPages}
                    onClick={() => setLogPage(p => p + 1)}
                    className="text-sm font-medium text-gray-600 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
