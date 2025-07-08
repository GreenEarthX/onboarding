'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { FaLock } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    const tokenParam = searchParams.get('token');
    if (emailParam && tokenParam) {
      setEmail(decodeURIComponent(emailParam));
      setToken(tokenParam);
    } else {
      setError('Invalid or missing reset link parameters');
    }
  }, [searchParams]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, token, newPassword }),
    });
    const data = await response.json();

    setLoading(false);
    if (response.ok && data.success) {
      setSuccess('Password reset successfully. Redirecting to sign-in...');
      setTimeout(() => window.location.href = '/auth/authenticate', 2000);
    } else {
      setError(data.error || 'Failed to reset password. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md"
      >
        <h2 className="text-2xl font-semibold mb-6">Reset Your Password</h2>
        {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
        {success && <div className="text-green-500 text-sm mb-4">{success}</div>}
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label className="text-sm">Email</label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full px-4 py-2 rounded border bg-gray-100"
            />
          </div>
          <div>
            <label className="text-sm">New Password</label>
            <div className="relative">
              <FaLock className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="pl-10 w-full px-4 py-2 rounded border"
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>
          </div>
          <div>
            <label className="text-sm">Confirm Password</label>
            <div className="relative">
              <FaLock className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10 w-full px-4 py-2 rounded border"
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-gradient-to-r from-[#0072BC] to-[#00B140] text-white rounded disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Reset Password'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
