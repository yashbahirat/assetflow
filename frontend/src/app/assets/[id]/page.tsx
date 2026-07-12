"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { ArrowLeft, Package, User, Building, CalendarClock, Wrench, Calendar } from 'lucide-react';
import Link from 'next/link';

interface AssetHistoryEvent {
  id: string;
  type: string;
  status: string;
  allocatedAt: string;
  returnedAt: string | null;
  returnNotes: string | null;
  expectedReturnAt: string | null;
  assignedUser: string | null;
  assignedUserId: string | null;
  assignedDept: string | null;
}

interface AssetMaintenanceEvent {
  id: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
  resolvedAt: string | null;
  technicianName: string | null;
  notes: string | null;
  photoUrl?: string;
  reportedBy: string | null;
}

interface Booking {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  user: { firstName: string, lastName: string };
}

interface AssetDetail {
  id: string;
  tag: string;
  name: string;
  serialNumber: string | null;
  condition: string | null;
  location: string | null;
  status: string;
  isShared: boolean;
  category: { id: string; name: string };
  acquisitionDate: string | null;
  acquisitionCost: number | null;
  photoUrl: string | null;
}

export default function AssetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [asset, setAsset] = useState<AssetDetail | null>(null);
  const [history, setHistory] = useState<AssetHistoryEvent[]>([]);
  const [maintenanceHistory, setMaintenanceHistory] = useState<AssetMaintenanceEvent[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Actions State
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showBookModal, setShowBookModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportData, setReportData] = useState({ description: '', priority: 'MEDIUM', photoUrl: '' });
  
  // Forms State
  const [allocateData, setAllocateData] = useState({ userId: '', departmentId: '', expectedReturnDate: '' });
  const [transferData, setTransferData] = useState({ targetUserId: '' });
  const [returnData, setReturnData] = useState({ returnNotes: '' });
  const [bookData, setBookData] = useState({ startTime: '', endTime: '' });
  
  // Data for Selects
  const [users, setUsers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);

  const fetchAssetData = async () => {
    try {
      const { data } = await api.get(`/assets/${params.id}/history`);
      setAsset(data.asset);
      setHistory(data.history);
      setMaintenanceHistory(data.maintenanceHistory || []);

      if (data.asset.isShared) {
        const bRes = await api.get(`/bookings/assets/${params.id}`);
        setBookings(bRes.data.bookings);
      }
    } catch (err) {
      setError('Failed to fetch asset details');
    } finally {
      setLoading(false);
    }
  };

  const toggleSharedStatus = async () => {
    if (!asset) return;
    try {
      const newStatus = !asset.isShared;
      await api.put(`/assets/${asset.id}`, { isShared: newStatus });
      setAsset({ ...asset, isShared: newStatus });
      if (newStatus && bookings.length === 0) {
        const bRes = await api.get(`/bookings/assets/${params.id}`);
        setBookings(bRes.data.bookings);
      }
    } catch (err) {
      alert('Failed to update shared status');
    }
  };

  const fetchLookups = async () => {
    try {
      const [uRes, dRes] = await Promise.all([
        api.get('/users'),
        api.get('/departments')
      ]);
      setUsers(uRes.data.users);
      setDepartments(dRes.data.departments);
    } catch (err) {
      console.error('Failed to fetch lookup data');
    }
  };

  useEffect(() => {
    fetchAssetData();
    if (user?.role === 'ADMIN' || user?.role === 'ASSET_MANAGER') {
      fetchLookups();
    }
  }, [params.id, user]);

  const handleAllocate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/allocations', { assetId: asset?.id, ...allocateData });
      setShowAllocateModal(false);
      fetchAssetData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to allocate asset');
    }
  };

  const handleRequestTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/allocations/assets/${asset?.id}/transfer`, transferData);
      setShowTransferModal(false);
      alert('Transfer requested successfully');
      fetchAssetData(); 
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to request transfer');
    }
  };

  const handleReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAllocation) return;
    try {
      await api.put(`/allocations/${activeAllocation.id}/return`, returnData);
      setShowReturnModal(false);
      setReturnData({ returnNotes: '' });
      fetchAssetData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to return asset');
    }
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/bookings', { assetId: asset?.id, ...bookData });
      setShowBookModal(false);
      alert('Asset booked successfully');
      fetchAssetData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to book asset');
    }
  };

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/maintenance', { assetId: asset?.id, ...reportData });
      setShowReportModal(false);
      setReportData({ description: '', priority: 'MEDIUM', photoUrl: '' });
      alert('Maintenance request submitted successfully');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to submit maintenance request');
    }
  };

  if (loading) return null;
  if (!asset) return <div className="p-8 text-center text-gray-500">Asset not found.</div>;

  const canManage = user?.role === 'ADMIN' || user?.role === 'ASSET_MANAGER';
  // Dept Head can approve returns and view dept assets but not allocate
  const canReturn = canManage || user?.role === 'DEPARTMENT_HEAD';

  // activeAllocation must be declared before it is used below
  const activeAllocation = history.find((h: any) => h.status === 'ACTIVE');

  // Any user can request a transfer (employee initiates it, manager approves)
  const canRequestTransfer = asset.status === 'ALLOCATED';
  // Only the person holding the asset or managers can initiate a return request
  const isHolder = activeAllocation?.assignedUserId === user?.id;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden relative">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-8">
          
          <div className="mb-6">
            <Link href="/assets" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" /> Back to Assets
            </Link>
          </div>

          <div className="lg:flex lg:items-center lg:justify-between mb-8">
            <div className="min-w-0 flex-1 flex items-center gap-4">
              <div className="h-16 w-16 bg-white border rounded-xl flex items-center justify-center shadow-sm">
                <Package className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                  {asset.name}
                </h2>
                <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    Tag: {asset.tag}
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    Serial: {asset.serialNumber || 'N/A'}
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    Category: {asset.category.name}
                  </div>
                  {asset.isShared && (
                    <div className="mt-2 flex items-center text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full ring-1 ring-inset ring-indigo-600/20">
                      <CalendarClock className="h-3.5 w-3.5 mr-1" />
                      Shared Bookable Resource
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap lg:ml-4 lg:mt-0 gap-3">
              {asset.isShared && (
                <button
                  type="button"
                  onClick={() => setShowBookModal(true)}
                  className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                >
                  <CalendarClock className="h-4 w-4 mr-2" /> Book Resource
                </button>
              )}
              {canManage && (
                <button
                  type="button"
                  onClick={toggleSharedStatus}
                  className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                  {asset.isShared ? 'Remove Bookable Status' : 'Make Bookable'}
                </button>
              )}
              {/* Allocate: only Admin / Asset Manager */}
              {canManage && asset.status === 'AVAILABLE' && (
                <button
                  type="button"
                  onClick={() => setShowAllocateModal(true)}
                  className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                  Allocate Asset
                </button>
              )}
              {/* Transfer: any user on an allocated asset */}
              {canRequestTransfer && (
                <button
                  type="button"
                  onClick={() => setShowTransferModal(true)}
                  className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                  Request Transfer
                </button>
              )}
              {/* Return: Admin/Asset Manager/Dept Head can mark returned */}
              {canReturn && activeAllocation && (
                <button
                  type="button"
                  onClick={() => setShowReturnModal(true)}
                  className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                  Mark Returned
                </button>
              )}
              {/* Report issue: all authenticated users */}
              <button
                type="button"
                onClick={() => setShowReportModal(true)}
                className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-red-600 shadow-sm ring-1 ring-inset ring-red-300 hover:bg-red-50"
              >
                <Wrench className="h-4 w-4 mr-2" /> Report Issue
              </button>
            </div>
          </div>

          {/* Conflict UI Banner */}
          {asset.status === 'ALLOCATED' && activeAllocation && (
            <div className="mb-8 rounded-md bg-yellow-50 p-4 border border-yellow-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <User className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                </div>
                <div className="ml-3 flex-1 md:flex md:justify-between">
                  <p className="text-sm text-yellow-700">
                    This asset is currently held by <span className="font-bold">{activeAllocation.assignedUser || activeAllocation.assignedDept}</span>. 
                    You cannot allocate it until it is returned. If you need it immediately, please use the Request Transfer button.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            
            {/* Details Card */}
            <div className="lg:col-span-1 bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
              {asset.photoUrl && (
                <div className="w-full h-48 bg-gray-100 rounded-t-xl overflow-hidden border-b border-gray-100">
                  <img src={asset.photoUrl} alt={asset.name} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-base font-semibold leading-6 text-gray-900 mb-4">Asset Details</h3>
                <dl className="space-y-4 text-sm leading-6">
                  <div className="flex justify-between gap-x-4 border-b border-gray-100 pb-4">
                    <dt className="text-gray-500">Status</dt>
                    <dd className="font-medium text-gray-900">
                      <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                        asset.status === 'AVAILABLE' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                        asset.status === 'ALLOCATED' ? 'bg-blue-50 text-blue-700 ring-blue-700/10' :
                        asset.status === 'MAINTENANCE' ? 'bg-yellow-50 text-yellow-700 ring-yellow-700/10' :
                        'bg-gray-50 text-gray-600 ring-gray-500/10'
                      }`}>
                        {asset.status}
                      </span>
                    </dd>
                  </div>
                  <div className="flex justify-between gap-x-4 border-b border-gray-100 pb-4">
                    <dt className="text-gray-500">Condition</dt>
                    <dd className="font-medium text-gray-900">{asset.condition}</dd>
                  </div>
                  <div className="flex justify-between gap-x-4 border-b border-gray-100 pb-4">
                    <dt className="text-gray-500">Location</dt>
                    <dd className="font-medium text-gray-900">{asset.location || 'N/A'}</dd>
                  </div>
                  <div className="flex justify-between gap-x-4 border-b border-gray-100 pb-4">
                    <dt className="text-gray-500">Shared Resource</dt>
                    <dd className="font-medium text-gray-900">{asset.isShared ? 'Yes' : 'No'}</dd>
                  </div>
                  <div className="flex justify-between gap-x-4 border-b border-gray-100 pb-4">
                    <dt className="text-gray-500">Acquisition Date</dt>
                    <dd className="font-medium text-gray-900">
                      {asset.acquisitionDate ? new Date(asset.acquisitionDate).toLocaleDateString() : 'N/A'}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-x-4">
                    <dt className="text-gray-500">Acquisition Cost</dt>
                    <dd className="font-medium text-gray-900">
                      {asset.acquisitionCost ? `$${asset.acquisitionCost.toFixed(2)}` : 'N/A'}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Timelines Column */}
            <div className="lg:col-span-2 space-y-6">
              
              {asset.isShared && (
                <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-base font-semibold leading-6 text-gray-900 mb-6 flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-indigo-500" /> Upcoming Bookings
                    </h3>
                    
                    {bookings.length === 0 ? (
                      <p className="text-sm text-gray-500">No upcoming bookings for this asset.</p>
                    ) : (
                      <ul role="list" className="divide-y divide-gray-100">
                        {bookings.map((booking) => (
                          <li key={booking.id} className="flex justify-between gap-x-6 py-4">
                            <div className="flex min-w-0 gap-x-4 items-center">
                              <div className="h-10 w-10 flex-none rounded-full bg-indigo-50 flex items-center justify-center">
                                <span className="font-medium text-indigo-700">{booking.user.firstName[0]}{booking.user.lastName[0]}</span>
                              </div>
                              <div className="min-w-0 flex-auto">
                                <p className="text-sm font-semibold leading-6 text-gray-900">
                                  {booking.user.firstName} {booking.user.lastName}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end">
                              <p className="text-sm leading-6 text-gray-900">
                                {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                              <p className="mt-1 text-xs leading-5 text-gray-500">
                                {new Date(booking.startTime).toLocaleDateString()}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}

              <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-base font-semibold leading-6 text-gray-900 mb-6">Asset Allocation History</h3>
                  
                  {history.length === 0 ? (
                    <p className="text-sm text-gray-500">No history available for this asset.</p>
                  ) : (
                    <div className="flow-root">
                      <ul role="list" className="-mb-8">
                        {history.map((event, eventIdx) => (
                          <li key={event.id}>
                            <div className="relative pb-8">
                              {eventIdx !== history.length - 1 ? (
                                <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                              ) : null}
                              <div className="relative flex space-x-3">
                                <div>
                                  <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                                    event.status === 'ACTIVE' ? 'bg-blue-500' :
                                    event.status === 'RETURNED' ? 'bg-green-500' : 'bg-gray-400'
                                  }`}>
                                    {event.assignedUser ? <User className="h-4 w-4 text-white" /> : <Building className="h-4 w-4 text-white" />}
                                  </span>
                                </div>
                                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                                  <div>
                                    <p className="text-sm text-gray-500">
                                      Allocated to <span className="font-medium text-gray-900">{event.assignedUser || event.assignedDept}</span>
                                      {event.status === 'RETURNED' && ' (Returned)'}
                                      {event.status === 'TRANSFERRED' && ' (Transferred)'}
                                    </p>
                                    {event.returnNotes && (
                                      <p className="text-xs text-gray-500 mt-1 italic">
                                        Return Notes: {event.returnNotes}
                                      </p>
                                    )}
                                  </div>
                                  <div className="whitespace-nowrap text-right text-sm text-gray-500">
                                    <time dateTime={event.allocatedAt}>{new Date(event.allocatedAt).toLocaleDateString()}</time>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Maintenance History */}
              <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-base font-semibold leading-6 text-gray-900 mb-6 flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-gray-400" /> Maintenance History
                  </h3>
                  
                  {maintenanceHistory.length === 0 ? (
                    <p className="text-sm text-gray-500">No maintenance records for this asset.</p>
                  ) : (
                    <div className="flow-root">
                      <ul role="list" className="-mb-8">
                        {maintenanceHistory.map((event, eventIdx) => (
                          <li key={event.id}>
                            <div className="relative pb-8">
                              {eventIdx !== maintenanceHistory.length - 1 ? (
                                <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                              ) : null}
                              <div className="relative flex space-x-3">
                                <div>
                                  <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                                    event.status === 'RESOLVED' ? 'bg-green-500' :
                                    event.status === 'PENDING' ? 'bg-yellow-500' : 'bg-blue-500'
                                  }`}>
                                    <Wrench className="h-4 w-4 text-white" />
                                  </span>
                                </div>
                                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                                  <div>
                                    <p className="text-sm text-gray-900 font-medium">
                                      {event.description}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      Status: <span className="font-semibold">{event.status}</span>
                                      {event.priority && ` • Priority: ${event.priority}`}
                                      {event.technicianName && ` • Tech: ${event.technicianName}`}
                                      {event.notes && ` • Notes: ${event.notes}`}
                                    </p>
                                    {event.photoUrl && (
                                      <div className="mt-2">
                                        <img src={event.photoUrl} alt="Issue" className="h-20 w-20 object-cover rounded-md border border-gray-200" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="whitespace-nowrap text-right text-sm text-gray-500">
                                    <time dateTime={event.createdAt}>{new Date(event.createdAt).toLocaleDateString()}</time>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </main>

        {/* Allocate Modal */}
        {showAllocateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Allocate Asset</h3>
              <form onSubmit={handleAllocate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium leading-6 text-gray-900">Assign to User</label>
                  <select
                    value={allocateData.userId}
                    onChange={e => setAllocateData({...allocateData, userId: e.target.value, departmentId: ''})}
                    className="mt-1 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  >
                    <option value="">-- Select User --</option>
                    {users.map((u: any) => (
                      <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
                    ))}
                  </select>
                </div>
                <div className="text-center text-sm text-gray-500 font-medium">OR</div>
                <div>
                  <label className="block text-sm font-medium leading-6 text-gray-900">Assign to Department</label>
                  <select
                    value={allocateData.departmentId}
                    onChange={e => setAllocateData({...allocateData, departmentId: e.target.value, userId: ''})}
                    className="mt-1 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  >
                    <option value="">-- Select Department --</option>
                    {departments.map((d: any) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium leading-6 text-gray-900">Expected Return Date</label>
                  <input
                    type="datetime-local"
                    value={allocateData.expectedReturnDate}
                    onChange={e => setAllocateData({...allocateData, expectedReturnDate: e.target.value})}
                    className="mt-1 block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button type="button" onClick={() => setShowAllocateModal(false)} className="px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 rounded-md">Cancel</button>
                  <button type="submit" disabled={!allocateData.userId && !allocateData.departmentId} className="px-3 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-md disabled:opacity-50">Confirm Allocation</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Transfer Modal */}
        {showTransferModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Transfer</h3>
              <form onSubmit={handleRequestTransfer} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium leading-6 text-gray-900">Target User *</label>
                  <select
                    required
                    value={transferData.targetUserId}
                    onChange={e => setTransferData({...transferData, targetUserId: e.target.value})}
                    className="mt-1 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  >
                    <option value="">-- Select User --</option>
                    {users.map((u: any) => (
                      <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
                    ))}
                  </select>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button type="button" onClick={() => setShowTransferModal(false)} className="px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 rounded-md">Cancel</button>
                  <button type="submit" className="px-3 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-md">Submit Request</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Return Modal */}
        {showReturnModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Return Asset</h3>
              <form onSubmit={handleReturn} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium leading-6 text-gray-900">Condition Check-in Notes</label>
                  <textarea
                    rows={3}
                    value={returnData.returnNotes}
                    onChange={e => setReturnData({...returnData, returnNotes: e.target.value})}
                    className="mt-1 block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="e.g. Scratches on lid, missing charger..."
                  />
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button type="button" onClick={() => setShowReturnModal(false)} className="px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 rounded-md">Cancel</button>
                  <button type="submit" className="px-3 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-md">Confirm Return</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Book Resource Modal */}
        {showBookModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Book Resource</h3>
              <form onSubmit={handleBook} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium leading-6 text-gray-900">Start Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={bookData.startTime}
                    onChange={e => setBookData({...bookData, startTime: e.target.value})}
                    className="mt-1 block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium leading-6 text-gray-900">End Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={bookData.endTime}
                    onChange={e => setBookData({...bookData, endTime: e.target.value})}
                    className="mt-1 block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button type="button" onClick={() => setShowBookModal(false)} className="px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 rounded-md">Cancel</button>
                  <button type="submit" className="px-3 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-md">Book Time</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Report Issue Modal */}
        {showReportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-red-600">Report Issue</h3>
              <p className="text-sm text-gray-500 mb-4">Describe the issue you are experiencing with this asset.</p>
              <form onSubmit={handleReport} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium leading-6 text-gray-900">Issue Description *</label>
                  <textarea
                    required
                    rows={4}
                    value={reportData.description}
                    onChange={e => setReportData({...reportData, description: e.target.value})}
                    className="mt-1 block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-red-600 sm:text-sm sm:leading-6"
                    placeholder="e.g. Screen is flickering..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium leading-6 text-gray-900">Priority</label>
                  <select
                    value={reportData.priority}
                    onChange={e => setReportData({...reportData, priority: e.target.value})}
                    className="mt-1 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-red-600 sm:text-sm sm:leading-6"
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
                    value={reportData.photoUrl}
                    onChange={e => setReportData({...reportData, photoUrl: e.target.value})}
                    className="mt-1 block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-red-600 sm:text-sm sm:leading-6"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button type="button" onClick={() => setShowReportModal(false)} className="px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 rounded-md">Cancel</button>
                  <button type="submit" className="px-3 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-500 rounded-md">Submit Ticket</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
