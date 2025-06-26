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
      console.log('Starting verification with token:', token);
      fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
        .then((res) => {
          console.log('Verification response status:', res.status);
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          console.log('Verification response data:', data);
          if (isMounted && data.success) {
            setVerified(true);
            router.push('/auth/signinUI?verified=true');
          } else {
            throw new Error(data.error || 'Verification failed');
          }
        })
        .catch((err) => {
          console.error('Verification error caught:', err);
          if (isMounted) setError(err.message || 'Invalid token or server error');
          router.push('/error');
        });
    } else if (!token) {
      console.log('No token provided, redirecting to error');
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