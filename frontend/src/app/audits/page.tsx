"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { ClipboardCheck, Play, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface AuditItem {
  id: string;
  asset: { tag: string; name: string; location: string | null };
  status: 'UNVERIFIED' | 'VERIFIED' | 'MISSING' | 'DAMAGED';
}

interface AuditCycle {
  id: string;
  name: string;
  status: string;
  createdAt: string;
  items?: AuditItem[];
  _count?: { items: number };
}

export default function AuditsPage() {
  const [cycles, setCycles] = useState<AuditCycle[]>([]);
  const [activeCycle, setActiveCycle] = useState<AuditCycle | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCycles = async () => {
    try {
      const { data } = await api.get('/audits');
      setCycles(data.cycles);
    } catch (err) {
      console.error('Failed to fetch audits');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCycles();
  }, []);

  const startNewAudit = async () => {
    const name = prompt("Enter a name for the new Audit Cycle (e.g. 'Q3 Asset Audit'):");
    if (!name) return;
    try {
      await api.post('/audits', { name });
      fetchCycles();
    } catch (err) {
      alert('Failed to create audit cycle');
    }
  };

  const loadCycleDetails = async (id: string) => {
    try {
      const { data } = await api.get(`/audits/${id}`);
      setActiveCycle(data.cycle);
    } catch (err) {
      console.error('Failed to load cycle details');
    }
  };

  const updateItemStatus = async (itemId: string, status: string) => {
    if (!activeCycle || !activeCycle.items) return;
    
    // Optimistic UI update
    const updatedItems = activeCycle.items.map(item => 
      item.id === itemId ? { ...item, status: status as AuditItem['status'] } : item
    );
    setActiveCycle({ ...activeCycle, items: updatedItems });

    try {
      await api.put(`/audits/items/${itemId}`, { status });
    } catch (err) {
      alert('Failed to update status');
      loadCycleDetails(activeCycle.id); // revert on failure
    }
  };

  if (loading) return null;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col relative overflow-hidden">
        <Topbar />
        
        <main className="flex-1 overflow-y-auto p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight flex items-center gap-2">
                <ClipboardCheck className="h-8 w-8 text-indigo-600" />
                Asset Audits
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                Manage physical verification of your assets.
              </p>
            </div>
            {!activeCycle && (
              <button
                onClick={startNewAudit}
                className="inline-flex items-center gap-x-2 rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                <Play className="-ml-0.5 h-5 w-5" aria-hidden="true" />
                Start New Audit Cycle
              </button>
            )}
          </div>

          {!activeCycle ? (
            <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl overflow-hidden">
              {cycles.length === 0 ? (
                <div className="p-12 text-center">
                  <ClipboardCheck className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-semibold text-gray-900">No audits found</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by creating a new audit cycle.</p>
                </div>
              ) : (
                <ul role="list" className="divide-y divide-gray-100">
                  {cycles.map((cycle) => (
                    <li key={cycle.id} className="relative flex justify-between gap-x-6 px-6 py-5 hover:bg-gray-50">
                      <div className="flex min-w-0 gap-x-4 items-center">
                        <div className="min-w-0 flex-auto">
                          <p className="text-sm font-semibold leading-6 text-gray-900">
                            <button onClick={() => loadCycleDetails(cycle.id)} className="hover:underline focus:outline-none">
                              {cycle.name}
                            </button>
                          </p>
                          <p className="mt-1 flex text-xs leading-5 text-gray-500">
                            Started {new Date(cycle.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-x-4">
                        <div className="hidden sm:flex sm:flex-col sm:items-end">
                          <p className="text-sm leading-6 text-gray-900">{cycle._count?.items} Assets</p>
                          <p className="mt-1 text-xs leading-5 text-gray-500">{cycle.status}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <div>
              <button 
                onClick={() => setActiveCycle(null)}
                className="mb-6 text-sm text-indigo-600 hover:text-indigo-500 font-medium"
              >
                &larr; Back to all audits
              </button>

              <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl overflow-hidden mb-6 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">{activeCycle.name} - Discrepancy Report</h2>
                
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <p className="text-sm text-gray-500">Total Assets</p>
                    <p className="text-2xl font-bold text-gray-900">{activeCycle.items?.length || 0}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                    <p className="text-sm text-green-700">Verified</p>
                    <p className="text-2xl font-bold text-green-900">
                      {activeCycle.items?.filter(i => i.status === 'VERIFIED').length || 0}
                    </p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                    <p className="text-sm text-red-700">Missing</p>
                    <p className="text-2xl font-bold text-red-900">
                      {activeCycle.items?.filter(i => i.status === 'MISSING').length || 0}
                    </p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
                    <p className="text-sm text-yellow-700">Damaged</p>
                    <p className="text-2xl font-bold text-yellow-900">
                      {activeCycle.items?.filter(i => i.status === 'DAMAGED').length || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {activeCycle.items?.map((item) => (
                      <tr key={item.id} className={item.status !== 'UNVERIFIED' ? 'bg-gray-50/50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{item.asset.name}</div>
                          <div className="text-sm text-gray-500">{item.asset.tag}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{item.asset.location || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {item.status === 'UNVERIFIED' && <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">Unverified</span>}
                          {item.status === 'VERIFIED' && <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20"><CheckCircle2 className="w-3 h-3 mr-1"/> Verified</span>}
                          {item.status === 'MISSING' && <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10"><XCircle className="w-3 h-3 mr-1"/> Missing</span>}
                          {item.status === 'DAMAGED' && <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20"><AlertTriangle className="w-3 h-3 mr-1"/> Damaged</span>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                           <div className="flex gap-2">
                             <button 
                               onClick={() => updateItemStatus(item.id, 'VERIFIED')}
                               className="text-green-600 hover:text-green-900 bg-green-50 px-2 py-1 rounded"
                             >
                               Verify
                             </button>
                             <button 
                               onClick={() => updateItemStatus(item.id, 'MISSING')}
                               className="text-red-600 hover:text-red-900 bg-red-50 px-2 py-1 rounded"
                             >
                               Missing
                             </button>
                             <button 
                               onClick={() => updateItemStatus(item.id, 'DAMAGED')}
                               className="text-yellow-600 hover:text-yellow-900 bg-yellow-50 px-2 py-1 rounded"
                             >
                               Damaged
                             </button>
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
