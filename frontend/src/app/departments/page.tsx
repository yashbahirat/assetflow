"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import {
  Building2, Tags, Users, Plus, Edit, CheckCircle,
  XCircle, Shield, ShieldCheck, ShieldAlert, RefreshCw
} from 'lucide-react';

/* ─────────────────── Types ─────────────────── */
interface Department { id: string; name: string; isActive: boolean; createdAt: string }
interface Category   { id: string; name: string; description: string | null }
interface Employee   { id: string; firstName: string; lastName: string; email: string; role: string; department?: { name: string }; isActive?: boolean }

const ROLE_META: Record<string, { label: string; color: string; icon: React.ComponentType<any> }> = {
  ADMIN:         { label: 'Admin',          color: 'bg-red-50 text-red-700 ring-red-600/20',      icon: ShieldAlert },
  ASSET_MANAGER: { label: 'Asset Manager',  color: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20', icon: ShieldCheck },
  DEPARTMENT_HEAD:{ label: 'Dept. Head',   color: 'bg-purple-50 text-purple-700 ring-purple-600/20', icon: Shield },
  EMPLOYEE:      { label: 'Employee',       color: 'bg-gray-50 text-gray-600 ring-gray-500/10',   icon: Users },
};

const getRoleMeta = (role: string) => ROLE_META[role] || ROLE_META['EMPLOYEE'];

/* ═══════════════════════════════════════════════════ */
export default function OrganizationPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<'departments' | 'categories' | 'employees'>('departments');

  /* ── Departments ── */
  const [departments, setDepartments] = useState<Department[]>([]);
  const [deptModal, setDeptModal]     = useState(false);
  const [editDept, setEditDept]       = useState<Department | null>(null);
  const [deptForm, setDeptForm]       = useState({ name: '', isActive: true });
  const [deptErr, setDeptErr]         = useState('');

  /* ── Categories ── */
  const [categories, setCategories] = useState<Category[]>([]);
  const [catModal, setCatModal]     = useState(false);
  const [editCat, setEditCat]       = useState<Category | null>(null);
  const [catForm, setCatForm]       = useState({ name: '', description: '' });
  const [catErr, setCatErr]         = useState('');

  /* ── Employees ── */
  const [employees, setEmployees]   = useState<Employee[]>([]);
  const [roleModal, setRoleModal]   = useState(false);
  const [editEmp, setEditEmp]       = useState<Employee | null>(null);
  const [newRole, setNewRole]       = useState('EMPLOYEE');
  const [roleErr, setRoleErr]       = useState('');

  const isAdmin = user?.role === 'ADMIN';

  /* ─── Fetch All ─── */
  const fetchAll = async () => {
    try {
      const [d, c, e] = await Promise.all([
        api.get('/departments'),
        api.get('/categories'),
        api.get('/users')
      ]);
      setDepartments(d.data.departments || []);
      setCategories(c.data.categories || []);
      setEmployees(e.data.users || []);
    } catch {}
  };

  useEffect(() => { fetchAll(); }, []);

  /* ─── Department Handlers ─── */
  const submitDept = async (e: React.FormEvent) => {
    e.preventDefault(); setDeptErr('');
    if (!deptForm.name.trim()) { setDeptErr('Name is required'); return; }
    try {
      if (editDept) await api.put(`/departments/${editDept.id}`, deptForm);
      else          await api.post('/departments', deptForm);
      setDeptModal(false); fetchAll();
    } catch (err: any) { setDeptErr(err.response?.data?.error || 'Failed'); }
  };

  /* ─── Category Handlers ─── */
  const submitCat = async (e: React.FormEvent) => {
    e.preventDefault(); setCatErr('');
    if (!catForm.name.trim()) { setCatErr('Name is required'); return; }
    try {
      if (editCat) await api.put(`/categories/${editCat.id}`, catForm);
      else         await api.post('/categories', catForm);
      setCatModal(false); fetchAll();
    } catch (err: any) { setCatErr(err.response?.data?.error || 'Failed'); }
  };

  /* ─── Role Promotion Handler ─── */
  const submitRole = async (e: React.FormEvent) => {
    e.preventDefault(); setRoleErr('');
    if (!editEmp) return;
    try {
      await api.put(`/users/${editEmp.id}/role`, { role: newRole });
      setRoleModal(false); fetchAll();
    } catch (err: any) { setRoleErr(err.response?.data?.error || 'Failed'); }
  };

  if (!isAdmin) {
    return (
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <Sidebar />
        <div className="flex flex-1 flex-col relative overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-8 flex items-center justify-center">
            <p className="text-gray-500 text-sm">Admin access required.</p>
          </main>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'departments', label: 'Departments', icon: Building2 },
    { id: 'categories',  label: 'Asset Categories', icon: Tags },
    { id: 'employees',   label: 'Employee Directory', icon: Users },
  ] as const;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden relative">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-8">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Organization Setup</h1>
              <p className="mt-1 text-sm text-gray-500">Manage master data: departments, categories, and employee roles.</p>
            </div>
            <button onClick={fetchAll} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 font-medium">
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
          </div>

          {/* Tab Bar */}
          <div className="mb-6 flex gap-1 bg-white rounded-xl p-1 shadow-sm ring-1 ring-gray-900/5 w-fit">
            {tabs.map(t => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                    tab === t.id ? 'bg-indigo-600 text-white shadow' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4" /> {t.label}
                </button>
              );
            })}
          </div>

          {/* ══════════ TAB A: DEPARTMENTS ══════════ */}
          {tab === 'departments' && (
            <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Departments ({departments.length})</h3>
                <button
                  onClick={() => { setEditDept(null); setDeptForm({ name: '', isActive: true }); setDeptErr(''); setDeptModal(true); }}
                  className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-500"
                >
                  <Plus className="h-4 w-4" /> Add Department
                </button>
              </div>
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 bg-white">
                  {departments.length === 0 && (
                    <tr><td colSpan={4} className="py-8 text-center text-sm text-gray-400">No departments yet.</td></tr>
                  )}
                  {departments.map(d => (
                    <tr key={d.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{d.name}</td>
                      <td className="px-6 py-4">
                        {d.isActive
                          ? <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20"><CheckCircle className="h-3 w-3" /> Active</span>
                          : <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10"><XCircle className="h-3 w-3" /> Inactive</span>}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{new Date(d.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => { setEditDept(d); setDeptForm({ name: d.name, isActive: d.isActive }); setDeptErr(''); setDeptModal(true); }} className="text-indigo-600 hover:text-indigo-900 text-sm font-medium inline-flex items-center gap-1">
                          <Edit className="h-3.5 w-3.5" /> Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ══════════ TAB B: CATEGORIES ══════════ */}
          {tab === 'categories' && (
            <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Asset Categories ({categories.length})</h3>
                <button
                  onClick={() => { setEditCat(null); setCatForm({ name: '', description: '' }); setCatErr(''); setCatModal(true); }}
                  className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-500"
                >
                  <Plus className="h-4 w-4" /> Add Category
                </button>
              </div>
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 bg-white">
                  {categories.length === 0 && (
                    <tr><td colSpan={3} className="py-8 text-center text-sm text-gray-400">No categories yet.</td></tr>
                  )}
                  {categories.map(c => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-lg bg-indigo-100 flex items-center justify-center">
                            <Tags className="h-3.5 w-3.5 text-indigo-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-900">{c.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{c.description || <span className="text-gray-300 italic">—</span>}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => { setEditCat(c); setCatForm({ name: c.name, description: c.description || '' }); setCatErr(''); setCatModal(true); }} className="text-indigo-600 hover:text-indigo-900 text-sm font-medium inline-flex items-center gap-1">
                          <Edit className="h-3.5 w-3.5" /> Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ══════════ TAB C: EMPLOYEES ══════════ */}
          {tab === 'employees' && (
            <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Employee Directory ({employees.length})</h3>
                <p className="text-xs text-gray-400">Click <strong>Manage Role</strong> to promote/demote users.</p>
              </div>
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 bg-white">
                  {employees.length === 0 && (
                    <tr><td colSpan={5} className="py-8 text-center text-sm text-gray-400">No employees found.</td></tr>
                  )}
                  {employees.map(emp => {
                    const meta = getRoleMeta(emp.role);
                    const Icon = meta.icon;
                    return (
                      <tr key={emp.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-700 flex-shrink-0">
                              {emp.firstName[0]}{emp.lastName[0]}
                            </div>
                            <span className="text-sm font-medium text-gray-900">{emp.firstName} {emp.lastName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{emp.email}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{emp.department?.name || <span className="text-gray-300">—</span>}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${meta.color}`}>
                            <Icon className="h-3 w-3" /> {meta.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {emp.id !== user?.id && (
                            <button
                              onClick={() => { setEditEmp(emp); setNewRole(emp.role); setRoleErr(''); setRoleModal(true); }}
                              className="text-indigo-600 hover:text-indigo-900 text-sm font-medium inline-flex items-center gap-1"
                            >
                              <Shield className="h-3.5 w-3.5" /> Manage Role
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

        </main>
      </div>

      {/* ── Department Modal ── */}
      {deptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{editDept ? 'Edit' : 'Add'} Department</h3>
            <form onSubmit={submitDept} className="space-y-4">
              {deptErr && <p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2">{deptErr}</p>}
              <div>
                <label className="block text-sm font-medium text-gray-900">Name *</label>
                <input type="text" required value={deptForm.name} onChange={e => setDeptForm({...deptForm, name: e.target.value})}
                  className="mt-1 block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm" />
              </div>
              {editDept && (
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="deptActive" checked={deptForm.isActive} onChange={e => setDeptForm({...deptForm, isActive: e.target.checked})} className="h-4 w-4 rounded border-gray-300 text-indigo-600" />
                  <label htmlFor="deptActive" className="text-sm text-gray-900">Active</label>
                </div>
              )}
              <div className="flex justify-end gap-3 mt-5">
                <button type="button" onClick={() => setDeptModal(false)} className="px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 rounded-md">Cancel</button>
                <button type="submit" className="px-3 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-md">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Category Modal ── */}
      {catModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{editCat ? 'Edit' : 'Add'} Category</h3>
            <form onSubmit={submitCat} className="space-y-4">
              {catErr && <p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2">{catErr}</p>}
              <div>
                <label className="block text-sm font-medium text-gray-900">Name *</label>
                <input type="text" required value={catForm.name} onChange={e => setCatForm({...catForm, name: e.target.value})}
                  placeholder="e.g. Electronics, Furniture, Vehicles"
                  className="mt-1 block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900">Description</label>
                <textarea rows={2} value={catForm.description} onChange={e => setCatForm({...catForm, description: e.target.value})}
                  className="mt-1 block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm" />
              </div>
              <div className="flex justify-end gap-3 mt-5">
                <button type="button" onClick={() => setCatModal(false)} className="px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 rounded-md">Cancel</button>
                <button type="submit" className="px-3 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-md">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Role Modal ── */}
      {roleModal && editEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Manage Role</h3>
            <p className="text-sm text-gray-500 mb-5">
              Changing role for <strong>{editEmp.firstName} {editEmp.lastName}</strong>.
              <span className="block mt-1 text-xs text-amber-600">⚠ This is the only place roles are assigned. Employees cannot self-promote.</span>
            </p>
            <form onSubmit={submitRole} className="space-y-4">
              {roleErr && <p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2">{roleErr}</p>}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Select Role</label>
                <div className="space-y-2">
                  {Object.entries(ROLE_META).map(([role, meta]) => {
                    const Icon = meta.icon;
                    return (
                      <label key={role} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${newRole === role ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                        <input type="radio" name="role" value={role} checked={newRole === role} onChange={() => setNewRole(role)} className="sr-only" />
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${meta.color.split(' ')[0]} ring-1 ring-inset ${meta.color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{meta.label}</p>
                          <p className="text-xs text-gray-400">
                            {role === 'ADMIN' && 'Full system access'}
                            {role === 'ASSET_MANAGER' && 'Manage assets, allocations, and maintenance'}
                            {role === 'DEPARTMENT_HEAD' && 'Approve transfers for their department'}
                            {role === 'EMPLOYEE' && 'Request maintenance and view own assets'}
                          </p>
                        </div>
                        {newRole === role && <CheckCircle className="h-4 w-4 text-indigo-600 ml-auto" />}
                      </label>
                    );
                  })}
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-5">
                <button type="button" onClick={() => setRoleModal(false)} className="px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 rounded-md">Cancel</button>
                <button type="submit" className="px-3 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-md">Update Role</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
