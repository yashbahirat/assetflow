"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import Link from 'next/link';
import { PackageSearch, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      login(data.user);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-indigo-700 flex-col justify-between p-12 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="absolute rounded-full border border-white"
              style={{ width: `${(i + 1) * 120}px`, height: `${(i + 1) * 120}px`, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
          ))}
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <div className="bg-white bg-opacity-20 p-2 rounded-lg">
              <PackageSearch className="h-6 w-6 text-white" />
            </div>
            <span className="text-white font-bold text-xl">AssetFlow</span>
          </div>
        </div>

        <div className="relative z-10">
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Enterprise Asset &amp;<br />Resource Management
          </h2>
          <p className="text-indigo-200 text-lg">
            Centralize tracking, automate lifecycle management, and gain real-time visibility across your organization.
          </p>

          <div className="mt-10 space-y-3">
            {[
              { stat: '100%', label: 'Asset visibility across departments' },
              { stat: '0 conflicts', label: 'With built-in allocation rules' },
              { stat: 'Real-time', label: 'Maintenance & audit tracking' },
            ].map(item => (
              <div key={item.stat} className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-indigo-300" />
                <span className="text-indigo-100 text-sm">
                  <strong className="text-white">{item.stat}</strong> — {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-indigo-300 text-xs">
          © {new Date().getFullYear()} AssetFlow. All rights reserved.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-8 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <PackageSearch className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-xl">AssetFlow</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
            <p className="text-gray-500 mt-1 text-sm">
              Sign in to your account to continue.
              {' '}
              <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                Create account →
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-xl bg-red-50 border border-red-200 p-3.5 text-sm text-red-700"
              >
                {error}
              </motion.div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-1.5">Email address</label>
              <input
                id="email" type="email" autoComplete="email" required
                value={email} onChange={e => setEmail(e.target.value)}
                className="block w-full rounded-xl border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm transition-all"
                placeholder="you@company.com"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-gray-900">Password</label>
                <Link href="/forgot-password" className="text-xs text-indigo-600 hover:text-indigo-500 font-medium">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password" type={showPwd ? 'text' : 'password'} autoComplete="current-password" required
                  value={password} onChange={e => setPassword(e.target.value)}
                  className="block w-full rounded-xl border-0 py-3 px-4 pr-11 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button" onClick={() => setShowPwd(v => !v)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-gray-600"
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all disabled:opacity-60"
            >
              {loading ? (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <>Sign In <ArrowRight className="h-4 w-4" /></>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-gray-400">
            New accounts are created as <strong>Employee</strong> role.
            Contact your admin to be promoted.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
