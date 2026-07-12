"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { Check, X, ArrowRightLeft, Clock } from 'lucide-react';
import Link from 'next/link';

interface TransferRequest {
  id: string;
  assetId: string;
  requestedById: string;
  targetUserId: string;
  status: string;
  createdAt: string;
  asset: { tag: string; name: string };
  requestedBy: { firstName: string; lastName: string };
  targetUser: { firstName: string; lastName: string } | null;
}

export default function TransfersPage() {
  const { user } = useAuth();
  const [transfers, setTransfers] = useState<TransferRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransfers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/allocations/transfers');
      setTransfers(data.requests || []);
    } catch (error) {
      console.error('Failed to fetch transfer requests', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransfers();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await api.put(`/allocations/transfers/${id}/approve`);
      fetchTransfers();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to approve transfer');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api.put(`/allocations/transfers/${id}/reject`);
      fetchTransfers();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to reject transfer');
    }
  };

  const canApprove = user?.role === 'ADMIN' || user?.role === 'ASSET_MANAGER' || user?.role === 'DEPARTMENT_HEAD';

  if (!canApprove) {
    return (
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500 text-sm">Access denied. You don't have permission to manage transfers.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden relative">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="sm:flex sm:items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold leading-6 text-gray-900 flex items-center gap-2">
                <ArrowRightLeft className="h-6 w-6 text-indigo-600" /> Transfer Requests
              </h1>
              <p className="mt-2 text-sm text-gray-700">
                Review and approve pending asset transfer requests.
              </p>
            </div>
          </div>

          <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl overflow-hidden">
            <ul role="list" className="divide-y divide-gray-100">
              {loading ? (
                <li className="px-6 py-10 text-center text-sm text-gray-500">Loading transfers...</li>
              ) : transfers.length === 0 ? (
                <li className="px-6 py-10 text-center text-sm text-gray-500">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-50 mb-3">
                    <Check className="h-6 w-6 text-green-600" />
                  </div>
                  No pending transfer requests. All caught up!
                </li>
              ) : (
                transfers.map((request) => (
                  <li key={request.id} className="flex items-center justify-between gap-x-6 px-6 py-5 hover:bg-gray-50">
                    <div className="min-w-0 flex flex-1 gap-x-4">
                      <div className="h-12 w-12 flex-none rounded-full bg-indigo-50 flex items-center justify-center">
                        <Clock className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div className="min-w-0 flex-auto">
                        <p className="text-sm font-semibold leading-6 text-gray-900">
                          <Link href={`/assets/${request.assetId}`} className="hover:underline text-indigo-600">
                            {request.asset.name} ({request.asset.tag})
                          </Link>
                        </p>
                        <p className="mt-1 truncate text-xs leading-5 text-gray-500">
                          Requested by <span className="font-medium text-gray-900">{request.requestedBy.firstName} {request.requestedBy.lastName}</span> 
                          {' '}for target user <span className="font-medium text-gray-900">{request.targetUser?.firstName} {request.targetUser?.lastName}</span>
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          Requested on {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-none items-center gap-x-3">
                      <button
                        onClick={() => handleReject(request.id)}
                        className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-red-600 shadow-sm ring-1 ring-inset ring-red-300 hover:bg-red-50"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleApprove(request.id)}
                        className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                      >
                        Approve Transfer
                      </button>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </main>
      </div>
    </div>
  );
}
