'use client';
import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion'; // For modal animation

export default function SigninForm({ email, password, setEmail, setPassword }: { email: string; password: string; setEmail: (value: string) => void; setPassword: (value: string) => void }) {
  const [totp, setTotp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);

  useEffect(() => {
    // Reset if email or password changes
    if (!email || !password) {
      setShow2FAModal(false);
      setTotp('');
      setError(null);
    }
  }, [email, password]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
      callbackUrl: '/profile',
    });

    setLoading(false);
    if (result?.error) {
      if (result.error.includes('2FA code required')) {
        // Send email in the request body
        const response = await fetch('/api/auth/send-2fa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include', // Include session cookies
          body: JSON.stringify({ email }), // Send email
        });
        const data = await response.json().catch(err => {
          console.error('Failed to parse JSON response:', err);
          return { success: false, error: 'Invalid server response' };
        });
        console.log('Send 2FA response:', data, 'Status:', response.status);
        if (response.ok && data.success) {
          setShow2FAModal(true);
          setError('A 6-digit 2FA code has been sent to your email. Please enter it below.');
        } else {
          setError(data.error || 'Failed to send 2FA code. Please try again.');
        }
      } else {
        setError(result.error);
      }
    } else if (result?.url) {
      window.location.href = result.url; // Direct to profile if no 2FA
    }
  };

  const handleConfirm2FA = async () => {
    setLoading(true);
    setError(null);

    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
      totp,
      callbackUrl: '/profile',
    });

    setLoading(false);
    if (result?.error) {
      setError(result.error);
    } else if (result?.url) {
      setShow2FAModal(false);
      window.location.href = result.url;
    }
  };

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <div>
        <label className="text-sm">Email</label>
        <div className="relative">
          <FaEnvelope className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 w-full px-4 py-2 rounded border"
            placeholder="you@example.com"
            required
            disabled={loading || show2FAModal}
          />
        </div>
      </div>
      <div>
        <label className="text-sm">Password</label>
        <div className="relative">
          <FaLock className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 w-full px-4 py-2 rounded border"
            placeholder="••••••••"
            required
            disabled={loading || show2FAModal}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={handleSignIn}
        disabled={loading}
        className="w-full py-2 bg-gradient-to-r from-[#0072BC] to-[#00B140] text-white rounded disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Sign In'}
      </button>

      <AnimatePresence>
        {show2FAModal && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-lg font-semibold mb-4">2FA Verification</h2>
              <p className="text-sm text-gray-600 mb-4">A 6-digit code has been sent to your email. Please enter it below.</p>
              <div>
                <label className="text-sm">2FA Code</label>
                <input
                  type="text"
                  value={totp}
                  onChange={(e) => setTotp(e.target.value)}
                  className="w-full px-4 py-2 rounded border mt-2"
                  placeholder="123456"
                  maxLength={6}
                  required
                />
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleConfirm2FA}
                  disabled={loading || !totp || totp.length !== 6}
                  className="py-2 px-4 bg-gradient-to-r from-[#0072BC] to-[#00B140] text-white rounded disabled:opacity-50"
                >
                  {loading ? 'Confirming...' : 'Confirm'}
                </button>
              </div>
              <button
                type="button"
                onClick={() => setShow2FAModal(false)}
                className="mt-4 w-full text-red-500 text-sm"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}