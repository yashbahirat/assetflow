"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import {
  ClipboardCheck, Plus, CheckCircle2, XCircle, AlertTriangle,
  Lock, ChevronRight, Users, MapPin, Tag, AlertCircle
} from 'lucide-react';

interface AuditItem {
  id: string;
  status: 'UNVERIFIED' | 'VERIFIED' | 'MISSING' | 'DAMAGED';
  notes: string | null;
  asset: { tag: string; name: string; location: string | null; status: string };
  auditor: { firstName: string; lastName: string };
}

interface AuditCycle {
  id: string;
  name: string;
  status: string;
  scopeType: string | null;
  scopeValue: string | null;
  startDate: string;
  endDate: string | null;
  auditorIds: string | null;
  createdAt: string;
  items?: AuditItem[];
  _count?: { items: number };
}

interface ActivityLog {
  id: string;
  action: string;
  createdAt: string;
  user: { firstName: string; lastName: string };
}

export default function AuditsPage() {
  const { user } = useAuth();
  const [cycles, setCycles] = useState<AuditCycle[]>([]);
  const [activeCycle, setActiveCycle] = useState<AuditCycle | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newData, setNewData] = useState({ name: '', scopeType: 'ALL', scopeValue: '', auditorIds: [] as string[] });
  const [noteInput, setNoteInput] = useState<{ [itemId: string]: string }>({});

  const canManage = user?.role === 'ADMIN' || user?.role === 'ASSET_MANAGER';

  const fetchCycles = async () => {
    if (!canManage) { setLoading(false); return; }
    try {
      const [{ data }, { data: usersData }] = await Promise.all([
        api.get('/audits'),
        api.get('/users')
      ]);
      setCycles(data.cycles);
      setUsers(usersData.users || []);
    } catch (err) {
      console.error('Failed to fetch audits');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCycles(); }, [user]);

  const loadCycleDetails = async (id: string) => {
    try {
      const [{ data: cycleData }, { data: logsData }] = await Promise.all([
        api.get(`/audits/${id}`),
        api.get(`/analytics/activity?entityId=${id}`)
      ]);
      setActiveCycle(cycleData.cycle);
      setActivityLogs(logsData.logs);
    } catch (err) {
      console.error('Failed to load cycle details');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/audits', {
        name: newData.name,
        scopeType: newData.scopeType,
        scopeValue: newData.scopeType !== 'ALL' ? newData.scopeValue : undefined,
        auditorIds: newData.auditorIds
      });
      setShowNewModal(false);
      setNewData({ name: '', scopeType: 'ALL', scopeValue: '', auditorIds: [] });
      fetchCycles();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create audit cycle');
    }
  };

  const updateItemStatus = async (itemId: string, status: string) => {
    if (!activeCycle || !activeCycle.items) return;
    const updatedItems = activeCycle.items.map(item =>
      item.id === itemId ? { ...item, status: status as AuditItem['status'] } : item
    );
    setActiveCycle({ ...activeCycle, items: updatedItems });
    try {
      await api.put(`/audits/items/${itemId}`, { status, notes: noteInput[itemId] || '' });
      const { data: logsData } = await api.get(`/analytics/activity?entityId=${activeCycle.id}`);
      setActivityLogs(logsData.logs);
    } catch (err) {
      alert('Failed to update status');
      loadCycleDetails(activeCycle.id);
    }
  };

  const handleCloseCycle = async () => {
    if (!activeCycle) return;
    const discrepancies = activeCycle.items?.filter(i => i.status === 'MISSING' || i.status === 'DAMAGED').length || 0;
    const msg = discrepancies > 0
      ? `Are you sure you want to close this cycle? ${discrepancies} discrepancies will be applied (MISSING → LOST, DAMAGED → MAINTENANCE). This cannot be undone.`
      : 'Are you sure you want to close this audit cycle? This cannot be undone.';
    if (!confirm(msg)) return;
    try {
      const { data } = await api.put(`/audits/${activeCycle.id}/close`, {});
      alert(data.message);
      setActiveCycle(null);
      fetchCycles();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to close audit cycle');
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED': return <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20"><CheckCircle2 className="w-3 h-3" /> Verified</span>;
      case 'MISSING': return <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10"><XCircle className="w-3 h-3" /> Missing</span>;
      case 'DAMAGED': return <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20"><AlertTriangle className="w-3 h-3" /> Damaged</span>;
      default: return <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-500 ring-1 ring-inset ring-gray-500/10">Unverified</span>;
    }
  };

  const cycleScopeBadge = (cycle: AuditCycle) => {
    if (!cycle.scopeType || cycle.scopeType === 'ALL') return <span className="text-xs text-gray-500">All Assets</span>;
    const Icon = cycle.scopeType === 'DEPARTMENT' ? Users : MapPin;
    return <span className="text-xs text-gray-500 flex items-center gap-1"><Icon className="w-3 h-3" />{cycle.scopeValue}</span>;
  };

  if (loading) return null;

  if (!canManage) {
    return (
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <Sidebar />
        <div className="flex flex-1 flex-col relative overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-8">
            <div className="text-center py-24 text-gray-500">You don&apos;t have permission to view this page.</div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col relative overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-8">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold leading-7 text-gray-900 flex items-center gap-2">
                <ClipboardCheck className="h-7 w-7 text-indigo-600" /> Asset Audits
              </h1>
              <p className="mt-1 text-sm text-gray-500">Run structured verification cycles for physical asset checks.</p>
            </div>
            {!activeCycle && user?.role === 'ADMIN' && (
              <button
                onClick={() => setShowNewModal(true)}
                className="inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
              >
                <Plus className="-ml-0.5 h-5 w-5" /> New Audit Cycle
              </button>
            )}
          </div>

          {!activeCycle ? (
            /* Cycles List */
            <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl overflow-hidden">
              {cycles.length === 0 ? (
                <div className="p-12 text-center">
                  <ClipboardCheck className="mx-auto h-12 w-12 text-gray-300" />
                  <h3 className="mt-2 text-sm font-semibold text-gray-900">No audit cycles yet</h3>
                  <p className="mt-1 text-sm text-gray-500">Start a new audit cycle to verify your assets.</p>
                </div>
              ) : (
                <ul role="list" className="divide-y divide-gray-100">
                  {cycles.map((cycle) => (
                    <li key={cycle.id} className="relative flex justify-between gap-x-6 px-6 py-5 hover:bg-gray-50 cursor-pointer" onClick={() => loadCycleDetails(cycle.id)}>
                      <div className="flex min-w-0 gap-x-4 items-center">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${cycle.status === 'CLOSED' ? 'bg-gray-100' : 'bg-indigo-100'}`}>
                          {cycle.status === 'CLOSED'
                            ? <Lock className="h-5 w-5 text-gray-500" />
                            : <ClipboardCheck className="h-5 w-5 text-indigo-600" />}
                        </div>
                        <div className="min-w-0 flex-auto">
                          <p className="text-sm font-semibold leading-6 text-gray-900">{cycle.name}</p>
                          <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                            <span>Started {new Date(cycle.startDate).toLocaleDateString()}</span>
                            {cycle.endDate && <span>· Closed {new Date(cycle.endDate).toLocaleDateString()}</span>}
                            · {cycleScopeBadge(cycle)}
                          </div>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-x-4">
                        <div className="hidden sm:flex sm:flex-col sm:items-end">
                          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${cycle.status === 'CLOSED' ? 'bg-gray-100 text-gray-700' : 'bg-green-100 text-green-700'}`}>
                            {cycle.status}
                          </span>
                          <p className="mt-1 text-xs text-gray-500">{cycle._count?.items} assets</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            /* Active Cycle Detail */
            <div>
              <button onClick={() => setActiveCycle(null)} className="mb-6 text-sm text-indigo-600 hover:text-indigo-500 font-medium">
                ← Back to all audits
              </button>

              {/* Summary Header */}
              <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{activeCycle.name}</h2>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span>Started {new Date(activeCycle.startDate).toLocaleDateString()}</span>
                      {activeCycle.endDate && <span>· Closed {new Date(activeCycle.endDate).toLocaleDateString()}</span>}
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 font-medium ${activeCycle.status === 'CLOSED' ? 'bg-gray-100 text-gray-700' : 'bg-green-100 text-green-700'}`}>
                        {activeCycle.status}
                      </span>
                    </div>
                  </div>
                  {activeCycle.status === 'IN_PROGRESS' && user?.role === 'ADMIN' && (
                    <button
                      onClick={handleCloseCycle}
                      className="inline-flex items-center gap-x-1.5 rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500"
                    >
                      <Lock className="-ml-0.5 h-4 w-4" /> Close & Lock Cycle
                    </button>
                  )}
                </div>

                {/* Discrepancy Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 text-center">
                    <p className="text-xs text-gray-500 mb-1">Total Assets</p>
                    <p className="text-2xl font-bold text-gray-900">{activeCycle.items?.length || 0}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 border border-green-100 text-center">
                    <p className="text-xs text-green-700 mb-1">Verified</p>
                    <p className="text-2xl font-bold text-green-900">{activeCycle.items?.filter(i => i.status === 'VERIFIED').length || 0}</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4 border border-red-100 text-center">
                    <p className="text-xs text-red-700 mb-1">Missing</p>
                    <p className="text-2xl font-bold text-red-900">{activeCycle.items?.filter(i => i.status === 'MISSING').length || 0}</p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100 text-center">
                    <p className="text-xs text-yellow-700 mb-1">Damaged</p>
                    <p className="text-2xl font-bold text-yellow-900">{activeCycle.items?.filter(i => i.status === 'DAMAGED').length || 0}</p>
                  </div>
                </div>

                {/* Flagged Discrepancies Alert */}
                {(activeCycle.items?.some(i => i.status === 'MISSING' || i.status === 'DAMAGED')) && activeCycle.status === 'IN_PROGRESS' && (
                  <div className="mt-4 rounded-md bg-amber-50 border border-amber-200 p-3 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-amber-800">
                      <strong>Discrepancies detected.</strong> Closing this cycle will mark MISSING assets as <strong>LOST</strong> and DAMAGED assets as <strong>UNDER MAINTENANCE</strong>.
                    </p>
                  </div>
                )}
              </div>

              {/* Asset Table */}
              <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl overflow-hidden mb-6">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                  <h3 className="text-sm font-semibold text-gray-900">Asset Verification Checklist</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                        {activeCycle.status === 'IN_PROGRESS' && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {activeCycle.items?.map((item) => (
                        <tr key={item.id} className={item.status !== 'UNVERIFIED' ? 'bg-gray-50/40' : ''}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{item.asset.name}</div>
                            <div className="text-xs text-gray-500 flex items-center gap-1"><Tag className="w-3 h-3" />{item.asset.tag}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-700">{item.asset.location || <span className="text-gray-400">—</span>}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {statusBadge(item.status)}
                          </td>
                          <td className="px-6 py-4">
                            {activeCycle.status === 'IN_PROGRESS' ? (
                              <input
                                type="text"
                                placeholder="Add notes…"
                                value={noteInput[item.id] ?? (item.notes || '')}
                                onChange={e => setNoteInput({ ...noteInput, [item.id]: e.target.value })}
                                className="text-sm border-0 bg-transparent text-gray-700 placeholder-gray-400 focus:ring-0 focus:outline-none w-full"
                              />
                            ) : (
                              <span className="text-sm text-gray-500 italic">{item.notes || '—'}</span>
                            )}
                          </td>
                          {activeCycle.status === 'IN_PROGRESS' && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <div className="flex gap-1.5">
                                <button onClick={() => updateItemStatus(item.id, 'VERIFIED')} className="px-2 py-1 rounded bg-green-50 text-green-700 text-xs font-medium hover:bg-green-100">✓ Verify</button>
                                <button onClick={() => updateItemStatus(item.id, 'MISSING')} className="px-2 py-1 rounded bg-red-50 text-red-700 text-xs font-medium hover:bg-red-100">✗ Missing</button>
                                <button onClick={() => updateItemStatus(item.id, 'DAMAGED')} className="px-2 py-1 rounded bg-yellow-50 text-yellow-700 text-xs font-medium hover:bg-yellow-100">⚠ Damaged</button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Activity Log */}
              <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4">Audit Activity Log</h3>
                {activityLogs.length === 0 ? (
                  <p className="text-sm text-gray-500">No activity recorded yet.</p>
                ) : (
                  <ul role="list" className="space-y-4">
                    {activityLogs.map((log) => (
                      <li key={log.id} className="flex gap-3">
                        <span className="h-7 w-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700 flex-shrink-0">
                          {log.user.firstName[0]}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium text-gray-900">{log.user.firstName} {log.user.lastName}</span>{' '}
                            {log.action.replace(/_/g, ' ').toLowerCase()}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">{new Date(log.createdAt).toLocaleString()}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* New Audit Cycle Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">New Audit Cycle</h3>
            <p className="text-sm text-gray-500 mb-6">Define the scope and assign auditors to this verification cycle.</p>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium leading-6 text-gray-900">Cycle Name *</label>
                <input
                  type="text"
                  required
                  value={newData.name}
                  onChange={e => setNewData({...newData, name: e.target.value})}
                  placeholder="e.g. Q3 2025 Physical Verification"
                  className="mt-1 block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium leading-6 text-gray-900">Scope</label>
                <select
                  value={newData.scopeType}
                  onChange={e => setNewData({...newData, scopeType: e.target.value, scopeValue: ''})}
                  className="mt-1 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                >
                  <option value="ALL">All Assets</option>
                  <option value="DEPARTMENT">By Department</option>
                  <option value="LOCATION">By Location</option>
                </select>
              </div>
              {newData.scopeType !== 'ALL' && (
                <div>
                  <label className="block text-sm font-medium leading-6 text-gray-900">
                    {newData.scopeType === 'DEPARTMENT' ? 'Department Name' : 'Location (e.g. "Floor 2")'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={newData.scopeValue}
                    onChange={e => setNewData({...newData, scopeValue: e.target.value})}
                    className="mt-1 block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium leading-6 text-gray-900">Additional Auditors</label>
                <select
                  multiple
                  value={newData.auditorIds}
                  onChange={e => setNewData({...newData, auditorIds: Array.from(e.target.selectedOptions, o => o.value)})}
                  className="mt-1 block w-full rounded-md border-0 py-1.5 pl-3 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm h-28"
                >
                  {users.filter(u => u.id !== user?.id && (u.role === 'ADMIN' || u.role === 'ASSET_MANAGER' || u.role === 'DEPARTMENT_HEAD')).map(u => (
                    <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.role})</option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-400">Hold Ctrl/Cmd to select multiple. You (the creator) are always an auditor.</p>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setShowNewModal(false)} className="px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 rounded-md">Cancel</button>
                <button type="submit" className="px-3 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-md">Start Cycle</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
