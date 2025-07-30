'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const redirectUrl = searchParams.get('redirect');
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      console.log('No token provided, redirecting to error');
      setError('No verification token provided');
      return;
    }

    if (!verified) {
      console.log('Starting verification with token:', token);
      fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
        .then((res) =>
          res.json().then((data) => ({
            ok: res.ok,
            status: res.status,
            data,
          }))
        )
        .then(({ ok, status, data }) => {
          console.log('Verification response status:', status);
          console.log('Verification response data:', data);

          if (ok && data.success) {
            setVerified(true);
            // Delay redirect to show success animation
            setTimeout(() => {
              if (redirectUrl) {
                // If there's a redirect URL, use the geomap-redirect endpoint
                const geomapRedirectUrl = `/api/auth/geomap-redirect?redirect=${encodeURIComponent(redirectUrl)}`;
                window.location.href = geomapRedirectUrl;
              } else {
                // Default redirect to authenticate page
                router.push('/auth/authenticate?verified=true');
              }
            }, 2000); // 2-second delay for animation
          } else {
            throw new Error(data.error || 'Verification failed');
          }
        })
        .catch((err) => {
          console.error('Verification error caught:', err.message);
          if (!verified) {
            setError(err.message || 'Invalid token or server error');
          }
        });
    }
  }, [token, verified, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-100 px-4">
      <AnimatePresence mode="wait">
        {error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white p-6 rounded-xl shadow-lg max-w-md w-full text-center"
          >
            <h2 className="text-xl font-semibold text-red-600 mb-4">Verification Failed</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => {
                const returnUrl = redirectUrl 
                  ? `/auth/authenticate?redirect=${encodeURIComponent(redirectUrl)}`
                  : '/auth/authenticate';
                router.push(returnUrl);
              }}
              className="py-2 px-4 bg-gradient-to-r from-[#0072BC] to-[#00B140] text-white rounded-lg hover:from-[#005f9e] hover:to-[#009933] transition-colors"
            >
              Return to Sign In
            </button>
          </motion.div>
        ) : verified ? (
          <motion.div
            key="verified"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4"
            >
              <svg
                className="w-10 h-10 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Email Verified!</h2>
            <p className="text-gray-600">Your email has been successfully verified. Redirecting to sign-in...</p>
          </motion.div>
        ) : (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 border-4 border-t-[#0072BC] border-r-[#00B140] border-b-gray-200 border-l-gray-200 rounded-full mx-auto mb-4"
            ></motion.div>
            <p className="text-gray-600 text-lg">Verifying your email...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <VerifyContent />
    </Suspense>
  );
}