// src/app/error.tsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ErrorPage() {
  const router = useRouter();

  useEffect(() => {
    // Optionally redirect after a delay or show a message
    console.log('Error page loaded');
  }, [router]);

  return (
    <div className="text-center p-4">
      <h1 className="text-2xl font-bold">Error</h1>
      <p>Something went wrong. Please try again or contact support.</p>
      <button onClick={() => router.push('/auth/signinUI')} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
        Back to Sign-In
      </button>
    </div>
  );
}