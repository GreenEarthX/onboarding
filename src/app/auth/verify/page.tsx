'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
  if (!token) {
    console.log('No token provided, redirecting to error');
    router.push('/error');
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
          router.push('/auth/authenticate?verified=true');
          return; // ✅ Prevents continuing to error flow
        }

        throw new Error(data.error || 'Verification failed');
      })
      .catch((err) => {
        console.error('Verification error caught:', err.message);
        if (!verified) {
          setError(err.message || 'Invalid token or server error');
          router.push('/error');
        }
      });
  }
}, [token, verified, router]);



  if (verified) return <p>Email verified! Redirecting...</p>;
  if (error) return <p>Error: {error}</p>;
  return <p>Verifying your email...</p>;
}