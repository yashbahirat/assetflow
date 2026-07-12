"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { CalendarClock, CalendarDays, X, Clock, Edit2 } from 'lucide-react';

interface Asset {
  id: string;
  name: string;
  tag: string;
}

interface Booking {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  dynamicStatus: string;
  userId: string;
  user: { firstName: string; lastName: string };
}

export default function BookingsPage() {
  const { user } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showReschedule, setShowReschedule] = useState(false);
  const [rescheduleData, setRescheduleData] = useState({ id: '', startTime: '', endTime: '' });

  const fetchAssets = async () => {
    try {
      const { data } = await api.get('/assets?isShared=true');
      setAssets(data.assets);
      if (data.assets.length > 0) {
        setSelectedAssetId(data.assets[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch shared assets');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async (assetId: string) => {
    if (!assetId) return;
    try {
      const { data } = await api.get(`/bookings/assets/${assetId}`);
      setBookings(data.bookings);
    } catch (error) {
      console.error('Failed to fetch bookings');
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  useEffect(() => {
    if (selectedAssetId) {
      fetchBookings(selectedAssetId);
    }
  }, [selectedAssetId]);

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await api.put(`/bookings/${id}/cancel`);
      fetchBookings(selectedAssetId);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to cancel booking');
    }
  };

  const handleReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put(`/bookings/${rescheduleData.id}/reschedule`, rescheduleData);
      setShowReschedule(false);
      alert('Booking rescheduled successfully!');
      fetchBookings(selectedAssetId);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to reschedule (Time slot might be overlapping)');
    }
  };

  const openReschedule = (b: Booking) => {
    setRescheduleData({
      id: b.id,
      startTime: new Date(b.startTime).toISOString().slice(0, 16),
      endTime: new Date(b.endTime).toISOString().slice(0, 16)
    });
    setShowReschedule(true);
  };

  const canManageBooking = (b: Booking) => {
    if (b.status === 'CANCELLED' || b.dynamicStatus === 'COMPLETED') return false;
    return b.userId === user?.id || user?.role === 'ADMIN' || user?.role === 'ASSET_MANAGER' || user?.role === 'DEPARTMENT_HEAD';
  };

  // Filter bookings to selected date
  const selectedDateStr = selectedDate;
  const daysBookings = bookings.filter(b => {
    const bDate = new Date(b.startTime).toISOString().split('T')[0];
    return bDate === selectedDateStr;
  });

  const getStatusBadge = (b: Booking) => {
    if (b.status === 'CANCELLED') return <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-500 ring-1 ring-inset ring-gray-500/10">Cancelled</span>;
    if (b.dynamicStatus === 'UPCOMING') return <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">Upcoming</span>;
    if (b.dynamicStatus === 'ONGOING') return <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">Ongoing</span>;
    return <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">Completed</span>;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden relative">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 flex items-center gap-2">
              <CalendarClock className="h-6 w-6 text-indigo-600" /> Resource Schedule
            </h1>
            <p className="mt-2 text-sm text-gray-700">Check availability and manage bookings for shared resources.</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left: Resource List */}
            <div className="lg:w-1/3">
              <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h3 className="text-base font-semibold text-gray-900">Bookable Resources</h3>
                </div>
                <ul className="divide-y divide-gray-200">
                  {loading ? (
                    <li className="p-4 text-sm text-gray-500">Loading resources...</li>
                  ) : assets.length === 0 ? (
                    <li className="p-4 text-sm text-gray-500">No shared resources found.</li>
                  ) : (
                    assets.map(a => (
                      <li 
                        key={a.id} 
                        onClick={() => setSelectedAssetId(a.id)}
                        className={`p-4 cursor-pointer hover:bg-indigo-50 transition-colors ${selectedAssetId === a.id ? 'bg-indigo-50 border-l-4 border-indigo-600' : 'border-l-4 border-transparent'}`}
                      >
                        <div className="font-medium text-gray-900">{a.name}</div>
                        <div className="text-xs text-gray-500">{a.tag}</div>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>

            {/* Right: Agenda/Calendar */}
            <div className="lg:w-2/3">
              <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl overflow-hidden min-h-[500px]">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-gray-400" /> Agenda View
                  </h3>
                  <div>
                    <input 
                      type="date" 
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>
                
                <div className="p-6">
                  {daysBookings.length === 0 ? (
                    <div className="text-center py-12">
                      <Clock className="mx-auto h-12 w-12 text-gray-300" />
                      <h3 className="mt-2 text-sm font-semibold text-gray-900">No bookings</h3>
                      <p className="mt-1 text-sm text-gray-500">This resource is completely free on this date.</p>
                    </div>
                  ) : (
                    <ul className="space-y-4">
                      {daysBookings.map(b => (
                        <li key={b.id} className={`rounded-lg border p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${b.status === 'CANCELLED' ? 'bg-gray-50 border-gray-200 opacity-75' : 'bg-white border-gray-200'}`}>
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <span className="text-sm font-bold text-gray-900">
                                {new Date(b.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(b.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </span>
                              {getStatusBadge(b)}
                            </div>
                            <p className="text-sm text-gray-600">
                              Booked by <span className="font-medium text-gray-900">{b.user.firstName} {b.user.lastName}</span>
                            </p>
                          </div>
                          
                          {canManageBooking(b) && (
                            <div className="flex items-center gap-2">
                              <button onClick={() => openReschedule(b)} className="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                                <Edit2 className="h-4 w-4 mr-1" /> Reschedule
                              </button>
                              <button onClick={() => handleCancel(b.id)} className="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-red-600 shadow-sm ring-1 ring-inset ring-red-300 hover:bg-red-50">
                                <X className="h-4 w-4 mr-1" /> Cancel
                              </button>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Reschedule Modal */}
      {showReschedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reschedule Booking</h3>
            <form onSubmit={handleReschedule} className="space-y-4">
              <div>
                <label className="block text-sm font-medium leading-6 text-gray-900">New Start Time</label>
                <input
                  type="datetime-local"
                  required
                  value={rescheduleData.startTime}
                  onChange={e => setRescheduleData({...rescheduleData, startTime: e.target.value})}
                  className="mt-1 block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
              <div>
                <label className="block text-sm font-medium leading-6 text-gray-900">New End Time</label>
                <input
                  type="datetime-local"
                  required
                  value={rescheduleData.endTime}
                  onChange={e => setRescheduleData({...rescheduleData, endTime: e.target.value})}
                  className="mt-1 block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setShowReschedule(false)} className="px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 rounded-md">Cancel</button>
                <button type="submit" className="px-3 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-md">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
