'use client';
import { useState, FormEvent } from 'react';
import { signIn } from 'next-auth/react';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import Link from 'next/link';

interface SigninFormProps {
  email: string;
  password: string;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
}

export default function SigninForm({ email, password, setEmail, setPassword }: SigninFormProps) {
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [totp, setTotp] = useState<string>('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
      totp,
    });

    setLoading(false);

    if (result?.error) {
      setError(result.error);
    } else {
      window.location.href = '/profile';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-500 text-sm">{error}</div>}
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
      <div>
        <label className="text-sm">2FA Code (if enabled)</label>
        <input
          type="text"
          value={totp}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTotp(e.target.value)}
          className="w-full px-4 py-2 rounded border"
          placeholder="6-digit code"
        />
      </div>
      <div className="flex justify-between items-center text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" className="rounded border" /> Remember me
        </label>
        <Link href="/forgot-password" className="text-indigo-600">
          Forgot password?
        </Link>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 bg-gradient-to-r from-[#0072BC] to-[#00B140] text-white rounded disabled:opacity-50"
      >
        {loading ? 'Signing In...' : 'Sign In'}
      </button>
    </form>
  );
}