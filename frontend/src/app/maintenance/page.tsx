"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { Wrench, CheckCircle, Clock, AlertTriangle, AlertCircle, PlayCircle, Plus } from 'lucide-react';

export default function MaintenancePage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showNewModal, setShowNewModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);

  // Modal Data
  const [newData, setNewData] = useState({ assetId: '', description: '', priority: 'MEDIUM', photoUrl: '' });
  const [assignData, setAssignData] = useState({ requestId: '', technicianName: '' });
  const [resolveData, setResolveData] = useState({ requestId: '', notes: '' });

  const fetchData = async () => {
    try {
      const [reqRes, astRes] = await Promise.all([
        api.get('/maintenance'),
        api.get('/assets')
      ]);
      setRequests(reqRes.data.requests);
      setAssets(astRes.data.assets);
    } catch (error) {
      console.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const canManage = user?.role === 'ADMIN' || user?.role === 'ASSET_MANAGER';

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/maintenance', newData);
      setShowNewModal(false);
      setNewData({ assetId: '', description: '', priority: 'MEDIUM', photoUrl: '' });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create request');
    }
  };

  const handleStatusUpdate = async (id: string, status: string, extraData: any = {}) => {
    try {
      await api.put(`/maintenance/${id}/status`, { status, ...extraData });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update status');
    }
  };

  const submitAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    // First set TECHNICIAN_ASSIGNED, then they can set IN_PROGRESS
    await handleStatusUpdate(assignData.requestId, 'TECHNICIAN_ASSIGNED', { technicianName: assignData.technicianName });
    setShowAssignModal(false);
  };

  const submitResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleStatusUpdate(resolveData.requestId, 'RESOLVED', { notes: resolveData.notes });
    setShowResolveModal(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const renderCard = (req: any) => (
    <div key={req.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="text-sm font-semibold text-gray-900">{req.asset.name}</h4>
          <p className="text-xs text-gray-500">{req.asset.tag}</p>
        </div>
        <span className={`text-[10px] font-bold px-2 py-1 rounded-full border uppercase ${getPriorityColor(req.priority)}`}>
          {req.priority || 'MEDIUM'}
        </span>
      </div>
      
      <p className="text-sm text-gray-700 my-3 line-clamp-3">{req.description}</p>
      
      {req.photoUrl && (
        <div className="mb-3">
          <img src={req.photoUrl} alt="Issue" className="h-16 w-16 object-cover rounded border border-gray-200" />
        </div>
      )}

      <div className="text-xs text-gray-500 mb-4 space-y-1">
        <p>Reported by: <span className="font-medium text-gray-700">{req.user.firstName} {req.user.lastName}</span></p>
        <p>{new Date(req.createdAt).toLocaleDateString()}</p>
        {req.technicianName && <p>Tech: <span className="font-medium text-gray-700">{req.technicianName}</span></p>}
      </div>

      {canManage && (
        <div className="pt-3 border-t border-gray-100 flex flex-wrap gap-2">
          {req.status === 'PENDING' && (
            <>
              <button onClick={() => handleStatusUpdate(req.id, 'APPROVED')} className="text-xs font-semibold px-3 py-1.5 bg-green-50 text-green-700 rounded hover:bg-green-100 flex-1">Approve</button>
              <button onClick={() => handleStatusUpdate(req.id, 'REJECTED')} className="text-xs font-semibold px-3 py-1.5 bg-red-50 text-red-700 rounded hover:bg-red-100 flex-1">Reject</button>
            </>
          )}
          {req.status === 'APPROVED' && (
            <button 
              onClick={() => { setAssignData({ requestId: req.id, technicianName: '' }); setShowAssignModal(true); }} 
              className="text-xs font-semibold px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100 w-full"
            >
              Assign Technician
            </button>
          )}
          {req.status === 'TECHNICIAN_ASSIGNED' && (
            <button 
              onClick={() => handleStatusUpdate(req.id, 'IN_PROGRESS')}
              className="text-xs font-semibold px-3 py-1.5 bg-purple-50 text-purple-700 rounded hover:bg-purple-100 w-full"
            >
              Start Work
            </button>
          )}
          {req.status === 'IN_PROGRESS' && (
            <button 
              onClick={() => { setResolveData({ requestId: req.id, notes: '' }); setShowResolveModal(true); }} 
              className="text-xs font-semibold px-3 py-1.5 bg-green-50 text-green-700 rounded hover:bg-green-100 w-full"
            >
              Mark Resolved
            </button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden relative">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold leading-7 text-gray-900 flex items-center gap-2">
                <Wrench className="h-6 w-6 text-indigo-600" /> Maintenance Board
              </h1>
              <p className="mt-2 text-sm text-gray-700">Track and manage asset repairs.</p>
            </div>
            <button
              onClick={() => setShowNewModal(true)}
              className="inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              <Plus className="-ml-0.5 h-5 w-5" aria-hidden="true" />
              New Request
            </button>
          </div>

          <div className="flex flex-nowrap overflow-x-auto gap-6 pb-4 h-[calc(100vh-200px)] items-start">
            {/* PENDING */}
            <div className="flex-shrink-0 w-72 bg-yellow-50/50 rounded-xl p-4 flex flex-col h-full border border-yellow-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-500" /> Pending ({requests.filter(r => r.status === 'PENDING').length})
              </h3>
              <div className="flex-1 overflow-y-auto pr-1">
                {requests.filter(r => r.status === 'PENDING').map(renderCard)}
              </div>
            </div>

            {/* APPROVED */}
            <div className="flex-shrink-0 w-72 bg-blue-50/50 rounded-xl p-4 flex flex-col h-full border border-blue-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-blue-500" /> Approved ({requests.filter(r => r.status === 'APPROVED').length})
              </h3>
              <div className="flex-1 overflow-y-auto pr-1">
                {requests.filter(r => r.status === 'APPROVED').map(renderCard)}
              </div>
            </div>

            {/* TECHNICIAN ASSIGNED */}
            <div className="flex-shrink-0 w-72 bg-indigo-50/50 rounded-xl p-4 flex flex-col h-full border border-indigo-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4 text-indigo-500" /> Tech Assigned ({requests.filter(r => r.status === 'TECHNICIAN_ASSIGNED').length})
              </h3>
              <div className="flex-1 overflow-y-auto pr-1">
                {requests.filter(r => r.status === 'TECHNICIAN_ASSIGNED').map(renderCard)}
              </div>
            </div>

            {/* IN PROGRESS */}
            <div className="flex-shrink-0 w-72 bg-purple-50/50 rounded-xl p-4 flex flex-col h-full border border-purple-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <PlayCircle className="h-4 w-4 text-purple-500" /> In Progress ({requests.filter(r => r.status === 'IN_PROGRESS').length})
              </h3>
              <div className="flex-1 overflow-y-auto pr-1">
                {requests.filter(r => r.status === 'IN_PROGRESS').map(renderCard)}
              </div>
            </div>

            {/* RESOLVED */}
            <div className="flex-shrink-0 w-72 bg-green-50/50 rounded-xl p-4 flex flex-col h-full border border-green-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" /> Resolved ({requests.filter(r => r.status === 'RESOLVED').length})
              </h3>
              <div className="flex-1 overflow-y-auto pr-1">
                {requests.filter(r => r.status === 'RESOLVED').map(renderCard)}
              </div>
            </div>

            {/* REJECTED */}
            <div className="flex-shrink-0 w-72 bg-red-50/50 rounded-xl p-4 flex flex-col h-full border border-red-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" /> Rejected ({requests.filter(r => r.status === 'REJECTED').length})
              </h3>
              <div className="flex-1 overflow-y-auto pr-1">
                {requests.filter(r => r.status === 'REJECTED').map(renderCard)}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* New Request Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-indigo-600">New Maintenance Request</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium leading-6 text-gray-900">Select Asset *</label>
                <select
                  required
                  value={newData.assetId}
                  onChange={e => setNewData({...newData, assetId: e.target.value})}
                  className="mt-1 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                >
                  <option value="">-- Choose Asset --</option>
                  {assets.map((a: any) => (
                    <option key={a.id} value={a.id}>{a.name} ({a.tag})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium leading-6 text-gray-900">Issue Description *</label>
                <textarea
                  required
                  rows={3}
                  value={newData.description}
                  onChange={e => setNewData({...newData, description: e.target.value})}
                  className="mt-1 block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
              <div>
                <label className="block text-sm font-medium leading-6 text-gray-900">Priority</label>
                <select
                  value={newData.priority}
                  onChange={e => setNewData({...newData, priority: e.target.value})}
                  className="mt-1 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium leading-6 text-gray-900">Photo URL (Optional)</label>
                <input
                  type="url"
                  value={newData.photoUrl}
                  onChange={e => setNewData({...newData, photoUrl: e.target.value})}
                  className="mt-1 block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setShowNewModal(false)} className="px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 rounded-md">Cancel</button>
                <button type="submit" className="px-3 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-md">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Tech Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Assign Technician</h3>
            <form onSubmit={submitAssign} className="space-y-4">
              <div>
                <label className="block text-sm font-medium leading-6 text-gray-900">Technician Name *</label>
                <input
                  type="text"
                  required
                  value={assignData.technicianName}
                  onChange={e => setAssignData({...assignData, technicianName: e.target.value})}
                  className="mt-1 block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setShowAssignModal(false)} className="px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 rounded-md">Cancel</button>
                <button type="submit" className="px-3 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-md">Assign</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resolve Modal */}
      {showResolveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resolve Maintenance</h3>
            <form onSubmit={submitResolve} className="space-y-4">
              <div>
                <label className="block text-sm font-medium leading-6 text-gray-900">Resolution Notes (Optional)</label>
                <textarea
                  rows={3}
                  value={resolveData.notes}
                  onChange={e => setResolveData({...resolveData, notes: e.target.value})}
                  className="mt-1 block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setShowResolveModal(false)} className="px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 rounded-md">Cancel</button>
                <button type="submit" className="px-3 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-500 rounded-md">Mark Resolved</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
