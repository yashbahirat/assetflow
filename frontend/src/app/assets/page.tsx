"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import Link from 'next/link';
import { Search, Plus, X, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Category {
  id: string;
  name: string;
}

interface Asset {
  id: string;
  tag: string;
  serialNumber: string | null;
  name: string;
  condition: string | null;
  location: string | null;
  status: string;
  category: Category;
}

export default function AssetsPage() {
  const { user } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [isSharedFilter, setIsSharedFilter] = useState('');

  // Slide-over state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // New Asset Form State
  const [newAsset, setNewAsset] = useState({
    tag: '',
    serial: '',
    name: '',
    categoryId: '',
    condition: 'NEW',
    location: '',
    isShared: false,
    acquisitionDate: '',
    acquisitionCost: '',
    photoUrl: ''
  });
  const [formError, setFormError] = useState('');

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append('tag', searchQuery);
      if (statusFilter) params.append('status', statusFilter);
      if (categoryFilter) params.append('categoryId', categoryFilter);
      if (locationFilter) params.append('location', locationFilter);
      if (isSharedFilter) params.append('isShared', isSharedFilter);

      const { data } = await api.get(`/assets?${params.toString()}`);
      setAssets(data.assets);
    } catch (err) {
      setError('Failed to fetch assets');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(data.categories);
    } catch (err) {
      console.error('Failed to fetch categories', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      fetchAssets();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter, categoryFilter, locationFilter, isSharedFilter]);

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    try {
      await api.post('/assets', newAsset);
      setIsDrawerOpen(false);
      setNewAsset({ tag: '', serial: '', name: '', categoryId: '', condition: 'NEW', location: '', isShared: false, acquisitionDate: '', acquisitionCost: '', photoUrl: '' });
      fetchAssets();
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'Failed to create asset');
    }
  };

  const canManageAssets = user?.role === 'ADMIN' || user?.role === 'ASSET_MANAGER';

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden relative">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="sm:flex sm:items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold leading-6 text-gray-900">Asset Directory</h1>
              <p className="mt-2 text-sm text-gray-700">
                Manage and track all company assets, including their current status and location.
              </p>
            </div>
            {canManageAssets && (
              <div className="mt-4 sm:mt-0">
                <button
                  onClick={() => setIsDrawerOpen(true)}
                  className="inline-flex items-center gap-x-2 rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
                >
                  <Plus className="-ml-0.5 h-5 w-5" aria-hidden="true" />
                  New Asset
                </button>
              </div>
            )}
          </div>

          {/* Filters */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4 items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="relative flex-1 w-full">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                placeholder="Search by name, tag, or serial number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full rounded-md border-0 py-2 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
            <div className="relative flex-1 w-full">
              <input
                type="text"
                placeholder="Filter by location..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="block w-full rounded-md border-0 py-2 pl-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="block w-full sm:w-48 rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full sm:w-48 rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
            >
              <option value="">All Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="ALLOCATED">Allocated</option>
              <option value="RESERVED">Reserved</option>
              <option value="MAINTENANCE">Under Maintenance</option>
              <option value="LOST">Lost</option>
              <option value="RETIRED">Retired</option>
              <option value="DISPOSED">Disposed</option>
            </select>
            <select
              value={isSharedFilter}
              onChange={(e) => setIsSharedFilter(e.target.value)}
              className="block w-full sm:w-40 rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
            >
              <option value="">All Resources</option>
              <option value="true">Shared (Bookable)</option>
              <option value="false">Non-Shared</option>
            </select>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Table */}
          <div className="mt-8 flex flex-col">
            <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Asset Tag</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Name</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Category</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Location</th>
                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                          <span className="sr-only">View</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {loading ? (
                        <tr><td colSpan={6} className="text-center py-10 text-gray-500">Loading...</td></tr>
                      ) : assets.length === 0 ? (
                        <tr><td colSpan={6} className="text-center py-10 text-gray-500">No assets found.</td></tr>
                      ) : (
                        assets.map((asset) => (
                          <tr key={asset.id} className="hover:bg-gray-50 transition-colors">
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                              <div className="flex items-center gap-2">
                                <Package className="h-4 w-4 text-gray-400" />
                                {asset.tag}
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{asset.name}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{asset.category.name}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                                asset.status === 'AVAILABLE'    ? 'bg-green-50 text-green-700 ring-green-600/20' :
                                asset.status === 'ALLOCATED'    ? 'bg-blue-50 text-blue-700 ring-blue-700/10' :
                                asset.status === 'MAINTENANCE'  ? 'bg-yellow-50 text-yellow-700 ring-yellow-600/20' :
                                asset.status === 'RESERVED'     ? 'bg-purple-50 text-purple-700 ring-purple-600/20' :
                                asset.status === 'LOST'         ? 'bg-red-50 text-red-700 ring-red-600/20' :
                                asset.status === 'RETIRED'      ? 'bg-orange-50 text-orange-700 ring-orange-600/20' :
                                'bg-gray-50 text-gray-600 ring-gray-500/10'
                              }`}>
                                {asset.status === 'MAINTENANCE' ? 'Under Maintenance' : asset.status.charAt(0) + asset.status.slice(1).toLowerCase()}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{asset.location || '-'}</td>
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                              <Link href={`/assets/${asset.id}`} className="text-indigo-600 hover:text-indigo-900">
                                View<span className="sr-only">, {asset.tag}</span>
                              </Link>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Slide-over */}
        <AnimatePresence>
          {isDrawerOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-gray-500 bg-opacity-75 z-20"
                onClick={() => setIsDrawerOpen(false)}
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 right-0 z-30 w-full max-w-md bg-white shadow-xl flex flex-col"
              >
                <div className="flex items-center justify-between px-6 py-4 border-b">
                  <h2 className="text-lg font-medium text-gray-900">Register New Asset</h2>
                  <button onClick={() => setIsDrawerOpen(false)} className="text-gray-400 hover:text-gray-500">
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  <form id="new-asset-form" onSubmit={handleCreateAsset} className="space-y-4">
                    {formError && (
                      <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{formError}</div>
                    )}
                    <div>
                      <label className="block text-sm font-medium leading-6 text-gray-900">Asset Tag</label>
                      <input
                        type="text"
                        value={newAsset.tag}
                        onChange={e => setNewAsset({...newAsset, tag: e.target.value})}
                        className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        placeholder="Leave blank to auto-generate"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium leading-6 text-gray-900">Asset Name *</label>
                      <input
                        required
                        type="text"
                        value={newAsset.name}
                        onChange={e => setNewAsset({...newAsset, name: e.target.value})}
                        className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        placeholder="e.g. MacBook Pro M3"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium leading-6 text-gray-900">Serial Number</label>
                      <input
                        type="text"
                        value={newAsset.serial}
                        onChange={e => setNewAsset({...newAsset, serial: e.target.value})}
                        className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium leading-6 text-gray-900">Category *</label>
                      <select
                        required
                        value={newAsset.categoryId}
                        onChange={e => setNewAsset({...newAsset, categoryId: e.target.value})}
                        className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      >
                        <option value="">Select a category</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium leading-6 text-gray-900">Condition *</label>
                      <select
                        required
                        value={newAsset.condition}
                        onChange={e => setNewAsset({...newAsset, condition: e.target.value})}
                        className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      >
                        <option value="NEW">New</option>
                        <option value="GOOD">Good</option>
                        <option value="FAIR">Fair</option>
                        <option value="POOR">Poor</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium leading-6 text-gray-900">Location</label>
                      <input
                        type="text"
                        value={newAsset.location}
                        onChange={e => setNewAsset({...newAsset, location: e.target.value})}
                        className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        placeholder="e.g. NY Office - IT Room"
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        id="isShared"
                        type="checkbox"
                        checked={newAsset.isShared}
                        onChange={e => setNewAsset({...newAsset, isShared: e.target.checked})}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                      />
                      <label htmlFor="isShared" className="ml-2 block text-sm leading-6 text-gray-900">
                        This is a shared resource (bookable)
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium leading-6 text-gray-900">Acquisition Date</label>
                      <input
                        type="date"
                        value={newAsset.acquisitionDate}
                        onChange={e => setNewAsset({...newAsset, acquisitionDate: e.target.value})}
                        className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium leading-6 text-gray-900">Acquisition Cost ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={newAsset.acquisitionCost}
                        onChange={e => setNewAsset({...newAsset, acquisitionCost: e.target.value})}
                        className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        placeholder="e.g. 1500.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium leading-6 text-gray-900">Photo URL</label>
                      <input
                        type="url"
                        value={newAsset.photoUrl}
                        onChange={e => setNewAsset({...newAsset, photoUrl: e.target.value})}
                        className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        placeholder="https://example.com/photo.jpg"
                      />
                    </div>
                  </form>
                </div>
                <div className="border-t px-6 py-4 bg-gray-50 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsDrawerOpen(false)}
                    className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    form="new-asset-form"
                    className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                  >
                    Register Asset
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
