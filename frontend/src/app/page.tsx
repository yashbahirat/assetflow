"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { PackageCheck, PackageMinus, Wrench, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface DashboardStats {
  available: number;
  allocated: number;
  maintenance: number;
}

interface OverdueAllocation {
  id: string;
  asset: { name: string; tag: string };
  user?: { firstName: string; lastName: string };
  department?: { name: string };
  expectedReturnDate: string;
}

interface ReportData {
  categoryStats: { name: string; value: number }[];
  maintenanceStats: { name: string; value: number }[];
}

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [overdue, setOverdue] = useState<OverdueAllocation[]>([]);
  const [reports, setReports] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, repRes] = await Promise.all([
          api.get('/analytics/dashboard'),
          api.get('/analytics/reports')
        ]);
        setStats(dashRes.data.stats);
        setOverdue(dashRes.data.overdueAllocations);
        setReports(repRes.data);
      } catch (error) {
        console.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return null;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col relative overflow-hidden">
        <Topbar />
        
        <main className="flex-1 overflow-y-auto p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              Dashboard Overview
            </h1>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
            <div className="bg-white overflow-hidden shadow-sm rounded-xl ring-1 ring-gray-900/5 p-6 flex items-center">
              <div className="p-3 bg-green-50 rounded-lg">
                <PackageCheck className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500 truncate">Available Assets</p>
                <p className="mt-1 text-3xl font-semibold text-gray-900">{stats?.available || 0}</p>
              </div>
            </div>
            
            <div className="bg-white overflow-hidden shadow-sm rounded-xl ring-1 ring-gray-900/5 p-6 flex items-center">
              <div className="p-3 bg-blue-50 rounded-lg">
                <PackageMinus className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500 truncate">Allocated Assets</p>
                <p className="mt-1 text-3xl font-semibold text-gray-900">{stats?.allocated || 0}</p>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow-sm rounded-xl ring-1 ring-gray-900/5 p-6 flex items-center">
              <div className="p-3 bg-yellow-50 rounded-lg">
                <Wrench className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500 truncate">In Maintenance</p>
                <p className="mt-1 text-3xl font-semibold text-gray-900">{stats?.maintenance || 0}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-8">
            {/* Asset Breakdown Chart */}
            <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl p-6">
              <h3 className="text-base font-semibold leading-6 text-gray-900 mb-6">Asset Distribution by Category</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={reports?.categoryStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {reports?.categoryStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Maintenance Bar Chart */}
            <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl p-6">
              <h3 className="text-base font-semibold leading-6 text-gray-900 mb-6">Maintenance Requests</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reports?.maintenanceStats}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: '#f3f4f6'}} />
                    <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Overdue Allocations */}
          <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
              <h3 className="text-base font-semibold leading-6 text-gray-900 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" /> Overdue Returns
              </h3>
            </div>
            {overdue.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-500">No overdue allocations! 🎉</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expected Return</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {overdue.map((alloc) => (
                      <tr key={alloc.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{alloc.asset.name}</div>
                          <div className="text-sm text-gray-500">{alloc.asset.tag}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {alloc.user ? `${alloc.user.firstName} ${alloc.user.lastName}` : alloc.department?.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                            {new Date(alloc.expectedReturnDate).toLocaleDateString()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </main>
      </div>
    </div>
  );
}
