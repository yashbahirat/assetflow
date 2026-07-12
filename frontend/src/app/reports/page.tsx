"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { useAuth } from '@/context/AuthContext';
import {
  DownloadCloud, BarChart3, PieChart as PieChartIcon,
  Activity, Clock, Wrench, AlertTriangle, Zap, Package
} from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  Legend, ResponsiveContainer, CartesianGrid, AreaChart, Area
} from 'recharts';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316'];

const PRIORITY_COLOR: Record<string, string> = {
  CRITICAL: 'text-red-700 bg-red-50 ring-red-600/20',
  HIGH: 'text-orange-700 bg-orange-50 ring-orange-600/20',
  MEDIUM: 'text-yellow-700 bg-yellow-50 ring-yellow-600/20',
  LOW: 'text-blue-700 bg-blue-50 ring-blue-600/20',
};

export default function ReportsPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('utilization');

  useEffect(() => {
    api.get('/analytics/reports')
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const downloadCSV = async (type: 'inventory' | 'maintenance') => {
    try {
      const res = await api.get(`/analytics/export/${type}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      alert(`Failed to download ${type} report.`);
    }
  };

  if (loading) return null;

  if (user?.role !== 'ADMIN' && user?.role !== 'ASSET_MANAGER') {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 p-8 flex items-center justify-center">
          <p className="text-gray-500">Access Denied. You do not have permission to view reports.</p>
        </div>
      </div>
    );
  }

  const sections = [
    { id: 'utilization', label: 'Utilization', icon: BarChart3 },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench },
    { id: 'departments', label: 'Departments', icon: PieChartIcon },
    { id: 'bookings', label: 'Booking Heatmap', icon: Clock },
    { id: 'alerts', label: 'Alerts & Due', icon: AlertTriangle },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden relative">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-8">

          {/* Header */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold leading-7 text-gray-900">Reports &amp; Analytics</h1>
              <p className="mt-1 text-sm text-gray-500">Operational insights for managers.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => downloadCSV('inventory')}
                className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                <DownloadCloud className="h-4 w-4 mr-2 text-gray-500" /> Asset Inventory CSV
              </button>
              <button
                onClick={() => downloadCSV('maintenance')}
                className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                <DownloadCloud className="h-4 w-4 mr-2 text-gray-500" /> Maintenance CSV
              </button>
            </div>
          </div>

          {/* Section Nav */}
          <div className="mb-6 flex gap-1 bg-white rounded-xl p-1 shadow-sm ring-1 ring-gray-900/5 overflow-x-auto">
            {sections.map(s => {
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    activeSection === s.id
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4" /> {s.label}
                </button>
              );
            })}
          </div>

          {/* ── UTILIZATION SECTION ── */}
          {activeSection === 'utilization' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Most Booked Assets */}
              <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="h-5 w-5 text-indigo-500" />
                  <h3 className="text-base font-semibold text-gray-900">Most Booked Resources</h3>
                </div>
                {(data?.mostUsedAssets?.length ?? 0) === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">No booking data yet.</p>
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data?.mostUsedAssets || []} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 11 }} />
                        <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 11 }} />
                        <Tooltip cursor={{ fill: '#f3f4f6' }} />
                        <Bar dataKey="value" fill="#4f46e5" radius={[0, 4, 4, 0]} name="Bookings" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Idle Assets */}
              <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-6 flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                  <Package className="h-5 w-5 text-gray-400" />
                  <h3 className="text-base font-semibold text-gray-900">Idle Assets <span className="text-xs font-normal text-gray-400">(no activity &gt; 30 days)</span></h3>
                </div>
                {(data?.idleAssets?.length ?? 0) === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-sm text-green-600 font-medium">
                    ✓ No idle assets — great utilization!
                  </div>
                ) : (
                  <div className="overflow-y-auto max-h-64">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                          <th className="pb-2">Asset</th>
                          <th className="pb-2">Category</th>
                          <th className="pb-2">Location</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {data.idleAssets.map((a: any, i: number) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="py-2">
                              <p className="font-medium text-gray-900">{a.name}</p>
                              <p className="text-xs text-gray-400">{a.tag}</p>
                            </td>
                            <td className="py-2 text-gray-600">{a.category?.name}</td>
                            <td className="py-2 text-gray-500">{a.location || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── MAINTENANCE SECTION ── */}
          {activeSection === 'maintenance' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Maintenance by Category */}
              <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="h-5 w-5 text-red-500" />
                  <h3 className="text-base font-semibold text-gray-900">Maintenance Requests by Category</h3>
                </div>
                {(data?.maintenanceFrequency?.length ?? 0) === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">No maintenance data yet.</p>
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data?.maintenanceFrequency || []}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip cursor={{ fill: '#f3f4f6' }} />
                        <Bar dataKey="value" fill="#ef4444" radius={[4, 4, 0, 0]} name="Requests" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Maintenance Status Breakdown */}
              <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <PieChartIcon className="h-5 w-5 text-indigo-500" />
                  <h3 className="text-base font-semibold text-gray-900">Ticket Status Breakdown</h3>
                </div>
                {(data?.maintenanceStats?.length ?? 0) === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">No data yet.</p>
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data?.maintenanceStats || []}
                          cx="50%" cy="50%"
                          innerRadius={55} outerRadius={80}
                          paddingAngle={4}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                          labelLine={false}
                        >
                          {(data?.maintenanceStats || []).map((_: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend iconType="circle" iconSize={8} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── DEPARTMENTS SECTION ── */}
          {activeSection === 'departments' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Donut Chart */}
              <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <PieChartIcon className="h-5 w-5 text-indigo-500" />
                  <h3 className="text-base font-semibold text-gray-900">Active Allocations by Department</h3>
                </div>
                {(data?.departmentAllocationSummary?.length ?? 0) === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">No active allocations.</p>
                ) : (
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data?.departmentAllocationSummary || []}
                          cx="50%" cy="50%"
                          innerRadius={70} outerRadius={100}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {(data?.departmentAllocationSummary || []).map((_: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(val: any) => [`${val} allocations`]} />
                        <Legend iconType="circle" iconSize={8} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Bar chart */}
              <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="h-5 w-5 text-indigo-500" />
                  <h3 className="text-base font-semibold text-gray-900">Assets by Category</h3>
                </div>
                {(data?.categoryStats?.length ?? 0) === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">No category data.</p>
                ) : (
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data?.categoryStats || []}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip cursor={{ fill: '#f3f4f6' }} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]} name="Assets">
                          {(data?.categoryStats || []).map((_: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Summary Table */}
              <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-6 lg:col-span-2">
                <h3 className="text-base font-semibold text-gray-900 mb-4">Department Allocation Summary</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                        <th className="pb-3 pr-6">Department</th>
                        <th className="pb-3">Active Allocations</th>
                        <th className="pb-3">Share</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {(data?.departmentAllocationSummary || []).map((d: any, i: number) => {
                        const total = (data?.departmentAllocationSummary || []).reduce((s: number, x: any) => s + x.value, 0);
                        const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
                        return (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="py-3 pr-6 font-medium text-gray-900">{d.name}</td>
                            <td className="py-3 text-gray-700">{d.value}</td>
                            <td className="py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-32 bg-gray-100 rounded-full h-2">
                                  <div className="h-2 rounded-full" style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                                </div>
                                <span className="text-xs text-gray-500">{pct}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── BOOKING HEATMAP SECTION ── */}
          {activeSection === 'bookings' && (
            <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-6">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-5 w-5 text-indigo-500" />
                <h3 className="text-base font-semibold text-gray-900">Resource Booking Heatmap</h3>
              </div>
              <p className="text-xs text-gray-500 mb-6">Peak booking hours across all shared resources (based on booking start times).</p>
              {(data?.bookingHeatmap?.filter((h: any) => h.bookings > 0).length ?? 0) === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <Clock className="mx-auto h-12 w-12 mb-3 opacity-30" />
                  <p className="text-sm">No booking data to display yet.</p>
                </div>
              ) : (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data?.bookingHeatmap || []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="bookingGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={2} />
                      <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                      <Tooltip formatter={(val: any) => [`${val} bookings`, 'Count']} />
                      <Area type="monotone" dataKey="bookings" stroke="#4f46e5" strokeWidth={2} fill="url(#bookingGrad)" name="Bookings" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Hour breakdown table */}
              {(data?.bookingHeatmap?.some((h: any) => h.bookings > 0)) && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Peak Hours</h4>
                  <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-12 gap-2">
                    {(data?.bookingHeatmap || []).map((h: any) => {
                      const max = Math.max(...(data?.bookingHeatmap || []).map((x: any) => x.bookings));
                      const intensity = max > 0 ? h.bookings / max : 0;
                      return (
                        <div key={h.hour} className="flex flex-col items-center">
                          <div
                            className="w-full rounded-md h-8 flex items-center justify-center text-xs font-bold"
                            style={{
                              backgroundColor: `rgba(79, 70, 229, ${0.1 + intensity * 0.85})`,
                              color: intensity > 0.5 ? 'white' : '#4f46e5'
                            }}
                          >
                            {h.bookings || ''}
                          </div>
                          <span className="text-[10px] text-gray-400 mt-1">{h.hour.slice(0, 2)}h</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── ALERTS & DUE SECTION ── */}
          {activeSection === 'alerts' && (
            <div className="grid grid-cols-1 gap-6">

              {/* Due for Maintenance */}
              <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-6">
                <div className="flex items-center gap-2 mb-1">
                  <Wrench className="h-5 w-5 text-orange-500" />
                  <h3 className="text-base font-semibold text-gray-900">Assets Due for Maintenance</h3>
                </div>
                <p className="text-xs text-gray-500 mb-4">Assets with no maintenance in the last 90 days, or never maintained.</p>
                {(data?.assetsDueForMaintenance?.length ?? 0) === 0 ? (
                  <p className="text-sm text-green-600 font-medium py-4">✓ All assets are up to date!</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                          <th className="pb-3 pr-6">Asset</th>
                          <th className="pb-3 pr-6">Category</th>
                          <th className="pb-3 pr-6">Location</th>
                          <th className="pb-3 pr-6">Status</th>
                          <th className="pb-3">Last Maintained</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {data.assetsDueForMaintenance.map((a: any, i: number) => {
                          const lastMaint = a.maintenanceRequests?.[0]?.resolvedAt;
                          return (
                            <tr key={i} className="hover:bg-orange-50/30">
                              <td className="py-3 pr-6">
                                <p className="font-medium text-gray-900">{a.name}</p>
                                <p className="text-xs text-gray-400">{a.tag}</p>
                              </td>
                              <td className="py-3 pr-6 text-gray-600">{a.category?.name}</td>
                              <td className="py-3 pr-6 text-gray-500">{a.location || '—'}</td>
                              <td className="py-3 pr-6">
                                <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">{a.status}</span>
                              </td>
                              <td className="py-3">
                                {lastMaint ? (
                                  <span className="text-orange-600 font-medium">{new Date(lastMaint).toLocaleDateString()}</span>
                                ) : (
                                  <span className="text-red-500 font-medium">Never</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Retirement Candidates */}
              <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-6">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <h3 className="text-base font-semibold text-gray-900">Retirement Candidates</h3>
                </div>
                <p className="text-xs text-gray-500 mb-4">Assets acquired more than 5 years ago that are still active.</p>
                {(data?.retirementCandidates?.length ?? 0) === 0 ? (
                  <p className="text-sm text-green-600 font-medium py-4">✓ No assets nearing end of life.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                          <th className="pb-3 pr-6">Asset</th>
                          <th className="pb-3 pr-6">Category</th>
                          <th className="pb-3 pr-6">Status</th>
                          <th className="pb-3">Acquired</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {data.retirementCandidates.map((a: any, i: number) => {
                          const age = a.acquisitionDate
                            ? Math.floor((Date.now() - new Date(a.acquisitionDate).getTime()) / (365.25 * 24 * 3600 * 1000))
                            : null;
                          return (
                            <tr key={i} className="hover:bg-red-50/20">
                              <td className="py-3 pr-6">
                                <p className="font-medium text-gray-900">{a.name}</p>
                                <p className="text-xs text-gray-400">{a.tag}</p>
                              </td>
                              <td className="py-3 pr-6 text-gray-600">{a.category?.name}</td>
                              <td className="py-3 pr-6">
                                <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">{a.status}</span>
                              </td>
                              <td className="py-3">
                                <span className="text-red-600 font-medium">
                                  {a.acquisitionDate ? new Date(a.acquisitionDate).toLocaleDateString() : '—'}
                                </span>
                                {age !== null && <span className="ml-2 text-xs text-gray-400">({age} yrs)</span>}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
