"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { Tags, Plus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface Category {
  id: string;
  name: string;
  description: string | null;
}

export default function CategoriesPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  const fetchCategories = async () => {
    if (!user || user.role !== 'ADMIN') {
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get('/categories');
      setCategories(data.categories);
    } catch (err) {
      console.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCat) {
        await api.put(`/categories/${editingCat.id}`, formData);
      } else {
        await api.post('/categories', formData);
      }
      setShowModal(false);
      fetchCategories();
    } catch (err) {
      alert('Failed to save category');
    }
  };

  const openEdit = (cat: Category) => {
    setEditingCat(cat);
    setFormData({ name: cat.name, description: cat.description || '' });
    setShowModal(true);
  };

  const openNew = () => {
    setEditingCat(null);
    setFormData({ name: '', description: '' });
    setShowModal(true);
  };

  if (loading) return null;

  if (user?.role !== 'ADMIN') {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 p-8">
          <h1 className="text-xl">Access Denied. Admin only.</h1>
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight flex items-center gap-2">
                <Tags className="h-8 w-8 text-indigo-600" />
                Asset Categories
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                Manage the categorization structure for your assets.
              </p>
            </div>
            <button
              onClick={openNew}
              className="inline-flex items-center gap-x-2 rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              <Plus className="-ml-0.5 h-5 w-5" /> Add Category
            </button>
          </div>

          <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categories.map((c) => (
                    <tr key={c.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {c.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {c.description || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => openEdit(c)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                      </td>
                    </tr>
                  ))}
                  {categories.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-sm text-gray-500">No categories found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{editingCat ? 'Edit Category' : 'New Category'}</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium leading-6 text-gray-900">Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="mt-1 block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium leading-6 text-gray-900">Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="mt-1 block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button type="button" onClick={() => setShowModal(false)} className="px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 rounded-md">Cancel</button>
                  <button type="submit" className="px-3 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-md">Save Category</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
