"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { Users, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  department: { name: string } | null;
  createdAt: string;
}

export default function DirectoryPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    if (!user || user.role !== 'ADMIN') {
      setLoading(false);
      return;
    }
    
    try {
      const { data } = await api.get('/users');
      setUsers(data.users);
    } catch (err) {
      console.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [user]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await api.put(`/users/${userId}/role`, { role: newRole });
      fetchUsers();
    } catch (err) {
      alert('Failed to update role');
    }
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
          <div className="mb-8">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight flex items-center gap-2">
              <Users className="h-8 w-8 text-indigo-600" />
              Employee Directory
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Manage user accounts and promote employees to administrative roles.
            </p>
          </div>

          <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{u.firstName} {u.lastName}</div>
                        <div className="text-sm text-gray-500">{u.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {u.department?.name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          disabled={u.id === user.id} // Prevent demoting oneself
                          className={`mt-1 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 ${
                            u.role === 'ADMIN' ? 'font-bold text-indigo-700' : ''
                          }`}
                        >
                          <option value="EMPLOYEE">Employee</option>
                          <option value="DEPARTMENT_HEAD">Department Head</option>
                          <option value="ASSET_MANAGER">Asset Manager</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
