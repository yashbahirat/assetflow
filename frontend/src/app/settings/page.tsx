"use client";

import { useAuth } from "@/context/AuthContext";

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-4xl py-8">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Settings
          </h2>
        </div>
      </div>

      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-base font-semibold leading-6 text-gray-900">Profile Information</h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>Your current account details.</p>
          </div>
          <div className="mt-5 border-t border-gray-100">
            <dl className="divide-y divide-gray-100">
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm font-medium leading-6 text-gray-900">Full name</dt>
                <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                  {user?.firstName} {user?.lastName}
                </dd>
              </div>
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm font-medium leading-6 text-gray-900">Role</dt>
                <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                  {user?.role}
                </dd>
              </div>
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm font-medium leading-6 text-gray-900">Email address</dt>
                <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                  {user?.email}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
      
      <div className="mt-8 bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-base font-semibold leading-6 text-gray-900">Preferences</h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>System settings and notifications.</p>
          </div>
          <div className="mt-5">
            <p className="text-sm text-gray-500 italic">Configuration options are coming in v2.0.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
