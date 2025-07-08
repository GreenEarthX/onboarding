'use client';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SigninWithGoogle from '@/app/_components/SigninWithGoogle';
import Signout from '@/app/_components/Signout';

export default function Profile() {
  const [session, setSession] = useState<any>(null);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginHistory, setLoginHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [logged, setLogged] = useState(false);

  // Get session
  useEffect(() => {
    async function fetchSession() {
      const res = await fetch('/api/auth/session');
      const data = await res.json();
      setSession(data);
      setTwoFactorEnabled(data?.user?.twoFactorEnabled || false);
    }
    fetchSession();
  }, []);

  // Get login history
  useEffect(() => {
    async function fetchHistory() {
      setHistoryLoading(true);
      try {
        const res = await fetch('/api/profile/login-history');
        const data = await res.json();
        setLoginHistory(data || []);
      } catch (err) {
        console.error("Failed to fetch login history", err);
      }
      setHistoryLoading(false);
    }
    fetchHistory();
  }, []);

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
    ];
    const index = name?.charCodeAt(0) % colors.length || 0;
    return colors[index];
  };

  const handleEnable2FA = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/profile/2fa/enable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setTwoFactorEnabled(true);
        setShow2FAModal(true);
      } else {
        setError(data.error || 'Failed to enable 2FA. Please try again.');
      }
    } catch (err) {
      setError('Unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.id && !logged) {
      fetch('/api/log-login', {
        method: 'POST',
        body: JSON.stringify({
          userId: session.user.id,
          action: 'signIn',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      }).then(() => setLogged(true));
    }
  }, [session?.user?.id, logged]);


  const isCredentialsUser = session?.user?.provider === 'credentials';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 p-4">
      {session ? (
        <div className="max-w-4xl mx-auto">
          {/* Dashboard Header */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
            <div className="p-8 flex flex-col md:flex-row items-center">
              <div className="mb-6 md:mb-0 md:mr-8">
                {session.user?.image ? (
                  <Image
                    className="rounded-full shadow-lg"
                    src={session.user.image}
                    alt="User Avatar"
                    width={120}
                    height={120}
                  />
                ) : (
                  <div className={`flex items-center justify-center w-28 h-28 rounded-full shadow-lg text-white text-4xl font-bold ${getAvatarColor(session.user?.name || '')}`}>
                    {session.user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  Welcome back, {session.user?.name}!
                </h1>
                <p className="text-gray-600 mb-4">{session.user?.email}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {isCredentialsUser ? 'Email Account' : 'Google Account'}
                  </span>
                  {twoFactorEnabled && (
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      2FA Enabled
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Account Security */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Account Security</h2>
              <div className="space-y-4">
                <Signout className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors" />
                {isCredentialsUser && !twoFactorEnabled && (
                  <button
                    type="button"
                    onClick={handleEnable2FA}
                    disabled={loading}
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Enabling...' : 'Enable two-factor authentication'}
                  </button>
                )}
                {error && <div className="text-red-500 text-sm">{error}</div>}
              </div>
            </div>

            {/* Login History */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Login History</h2>
              {historyLoading ? (
                <div className="text-gray-600 text-sm">Loading login history...</div>
              ) : loginHistory.length === 0 ? (
                <div className="text-gray-600 text-sm">No login history yet.</div>
              ) : (
                <ul className="divide-y divide-gray-200 max-h-60 overflow-y-auto text-sm">
                  {loginHistory.map((entry) => (
                    <li key={entry.id} className="py-2 flex justify-between">
                      <span>
                        <strong>{entry.action}</strong> from
                        <span className="ml-1 font-mono">{entry.device}</span>
                        {entry.country && (
                          <span className="ml-1 text-gray-400">({entry.country})</span>
                        )}
                      </span>
                      <span className="text-gray-500">{new Date(entry.timestamp).toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* 2FA Modal */}
          <AnimatePresence>
            {show2FAModal && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              >
                <motion.div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                  <h2 className="text-lg font-semibold mb-4">Two-Factor Authentication Enabled</h2>
                  <p className="text-sm text-gray-600 mb-4">
                    Two-factor authentication has been successfully enabled. You'll now receive a 6-digit code when signing in.
                  </p>
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShow2FAModal(false)}
                      className="py-2 px-4 bg-gradient-to-r from-[#0072BC] to-[#00B140] text-white rounded"
                    >
                      Close
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8 animate-fadeIn">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome!</h2>
            <p className="text-gray-600 mb-6">Sign in to access your dashboard</p>
            <SigninWithGoogle />
          </div>
        </div>
      )}
    </div>
  );
}
