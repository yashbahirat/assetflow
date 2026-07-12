"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would call an API endpoint to send a reset email.
    // For this prototype, we simulate a successful email send.
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100"
      >
        {!submitted ? (
          <>
            <div className="flex flex-col items-center">
              <div className="bg-indigo-100 p-3 rounded-full mb-4 text-indigo-600">
                <Mail className="h-8 w-8" />
              </div>
              <h2 className="text-center text-2xl font-extrabold text-gray-900">
                Forgot password?
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                No worries, we'll send you reset instructions.
              </p>
            </div>
            
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email-address" className="block text-sm font-medium leading-6 text-gray-900">
                  Email address
                </label>
                <div className="mt-2">
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-md hover:shadow-lg"
                >
                  Reset Password
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="text-center space-y-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Check your email</h2>
            <p className="text-sm text-gray-500">
              We sent a password reset link to <span className="font-medium text-gray-900">{email}</span>.
            </p>
            <div className="pt-4">
              <Link href="/login">
                <button className="w-full py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors">
                  Return to login
                </button>
              </Link>
            </div>
          </div>
        )}

        {!submitted && (
          <div className="mt-6 text-center">
            <Link href="/login" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to log in
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}
