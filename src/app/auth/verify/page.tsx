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
    let isMounted = true;

    if (token && !verified) {
      setError(null);
      fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
        .then((res) => {
          if (!res.ok) throw new Error('Verification failed');
          return res.json();
        })
        .then((data) => {
          if (isMounted && data.success) {
            setVerified(true);
            router.push('/auth/signinUI');
          }
        })
        .catch((err) => {
          console.log('Verification error:', err);
          if (isMounted) setError(err.message || 'Invalid token');
          router.push('/error');
        });
    } else if (!token) {
      router.push('/error');
    }

    return () => {
      isMounted = false;
    };
  }, [token, verified, router]);

  if (verified) return <p>Email verified! Redirecting...</p>;
  if (error) return <p>Error: {error}</p>;
  return <p>Verifying your email...</p>;
}