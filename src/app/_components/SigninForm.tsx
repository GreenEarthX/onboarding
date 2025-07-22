'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

export default function SigninForm({ email, password, setEmail, setPassword }: { email: string; password: string; setEmail: (value: string) => void; setPassword: (value: string) => void }) {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');
  const [totp, setTotp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  // Get callbackUrl from search params if present
  let callbackUrl = '/profile';
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const cb = urlParams.get('callbackUrl');
    if (cb) callbackUrl = cb;
  }

  useEffect(() => {
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

    // Determine the callback URL based on redirect parameter
    let callbackUrl;
    if (redirectUrl) {
      // If there's a redirect URL, go directly to geomap-redirect which will handle the token and redirect
      callbackUrl = `/api/auth/geomap-redirect?redirect=${encodeURIComponent(redirectUrl)}`;
    } else {
      // Normal login - redirect directly to geomap homepage, not profile
      callbackUrl = `/api/auth/geomap-redirect`;
    }

    const result = await signIn('credentials', {
      redirect: false, // NEVER let NextAuth handle redirects
      email,
      password,
    });

    setLoading(false);
    console.log('Sign-in result:', result);

    if (result?.error) {
      if (result.error.includes('2FA code required')) {
        const response = await fetch('/api/auth/send-2fa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email }),
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
    } else if (result?.ok) {
      // Login successful - MANUALLY handle the redirect
      if (redirectUrl) {
        console.log('Redirecting to form:', redirectUrl);
        window.location.href = `/api/auth/geomap-redirect?redirect=${encodeURIComponent(redirectUrl)}`;
      } else {
        console.log('Redirecting to geomap homepage');
        window.location.href = `/api/auth/geomap-redirect`;
      }
    } else {
      setError('Sign-in failed. Please try again or contact support.');
    }
  };

  const handleConfirm2FA = async () => {
    setLoading(true);
    setError(null);

    const result = await signIn('credentials', {
      redirect: false, // NEVER let NextAuth handle redirects
      email,
      password,
      totp,
    });

    setLoading(false);
    setTotp('');
    console.log('2FA Confirm result:', result);

    if (result?.error) {
      setError(result.error);
    } else if (result?.ok) {
      setShow2FAModal(false);
      // Login successful - MANUALLY handle the redirect
      if (redirectUrl) {
        console.log('2FA success - Redirecting to form:', redirectUrl);
        window.location.href = `/api/auth/geomap-redirect?redirect=${encodeURIComponent(redirectUrl)}`;
      } else {
        console.log('2FA success - Redirecting to geomap homepage');
        window.location.href = `/api/auth/geomap-redirect`;
      }
    } else {
      setError('2FA verification failed. Please try again.');
    }
  };

  const handleResend2FACode = async () => {
    setResendLoading(true);
    setError(null);
    setTotp('');

    const response = await fetch('/api/auth/send-2fa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email }),
    });
    const data = await response.json().catch(err => {
      console.error('Failed to parse JSON response:', err);
      return { success: false, error: 'Invalid server response' };
    });
    console.log('Resend 2FA response:', data, 'Status:', response.status);

    setResendLoading(false);
    if (response.ok && data.success) {
      setError('A new 6-digit 2FA code has been sent to your email.');
    } else {
      setError(data.error || 'Failed to resend 2FA code. Please try again.');
    }
  };

  const handleForgotPassword = async () => {
    setForgotLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await response.json();

      setForgotLoading(false);
      if (response.ok && data.success) {
        setError('Password reset link sent to your email.');
        setShowForgotPasswordModal(false);
        setForgotEmail('');
      } else {
        setError(data.error || 'Failed to send reset link. Please try again.');
      }
    } catch (error: any) {
      setForgotLoading(false);
      setError('Failed to process password reset. Please try again or contact support.');
      console.error('Forgot password error:', error);
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
            disabled={loading || show2FAModal || showForgotPasswordModal}
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
            disabled={loading || show2FAModal || showForgotPasswordModal}
          />
        </div>
      </div>
      <div className="text-sm text-right">
        <button
          type="button"
          onClick={() => setShowForgotPasswordModal(true)}
          className="text-blue-500 hover:underline"
          disabled={loading || show2FAModal}
        >
          Forgot Password?
        </button>
      </div>
      <button
        type="button"
        onClick={handleSignIn}
        disabled={loading || showForgotPasswordModal}
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
              <h2 className="text-lg font-semibold mb-4">Two-Factor Authentication Verification</h2>
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
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={handleConfirm2FA}
                  disabled={loading || !totp || totp.length !== 6}
                  className="py-2 px-4 bg-gradient-to-r from-[#0072BC] to-[#00B140] text-white rounded disabled:opacity-50"
                >
                  {loading ? 'Confirming...' : 'Confirm'}
                </button>
                <button
                  type="button"
                  onClick={handleResend2FACode}
                  disabled={resendLoading || loading}
                  className="py-2 px-4 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
                >
                  {resendLoading ? 'Sending...' : 'Resend Code'}
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
        {showForgotPasswordModal && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-lg font-semibold mb-4">Reset Your Password</h2>
              <p className="text-sm text-gray-600 mb-4">Enter your email to receive a password reset link.</p>
              <div>
                <label className="text-sm">Email</label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full px-4 py-2 rounded border mt-2"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={forgotLoading || !forgotEmail}
                  className="py-2 px-4 bg-gradient-to-r from-[#0072BC] to-[#00B140] text-white rounded disabled:opacity-50"
                >
                  {forgotLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForgotPasswordModal(false)}
                  className="py-2 px-4 bg-gray-200 text-gray-700 rounded"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}