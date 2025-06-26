'use client';
import { useState, FormEvent } from 'react';
import { signIn } from 'next-auth/react';
import { FaEnvelope, FaLock, FaUser } from 'react-icons/fa';

interface SignupFormProps {
  name: string;
  email: string;
  password: string;
  setName: (value: string) => void;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
}

export default function SignupForm({
  name,
  email,
  password,
  setName,
  setEmail,
  setPassword,
}: SignupFormProps) {
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn('credentials', {
      redirect: false,
      name,
      email,
      password,
      callbackUrl: '/auth/verify', // Redirect to verification page after sign-up
    });

    setLoading(false);

    if (result?.error) {
      setError(result.error);
    } else if (result?.ok) {
      // Sign-up successful, user needs to verify email
      setError('Please check your email to verify your account.');
      // Optionally, you can redirect or show a link to the verification page
      // window.location.href = '/auth/verify'; // Uncomment if you want immediate redirect
    } else {
      setError('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <div>
        <label className="text-sm">Name</label>
        <div className="relative">
          <FaUser className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            className="pl-10 w-full px-4 py-2 rounded border"
            placeholder="Your Name"
            required
          />
        </div>
      </div>
      <div>
        <label className="text-sm">Email</label>
        <div className="relative">
          <FaEnvelope className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
          <input
            type="email"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            className="pl-10 w-full px-4 py-2 rounded border"
            placeholder="you@example.com"
            required
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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            className="pl-10 w-full px-4 py-2 rounded border"
            placeholder="••••••••"
            required
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 bg-gradient-to-r from-[#0072BC] to-[#00B140] text-white rounded disabled:opacity-50"
      >
        {loading ? 'Creating Account...' : 'Create Account'}
      </button>
    </form>
  );
}