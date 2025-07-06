'use client';
import { useState, FormEvent } from 'react';
import { signIn } from 'next-auth/react';
import { FaEnvelope, FaLock, FaUser } from 'react-icons/fa';
import ReCAPTCHA from 'react-google-recaptcha';

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
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);

  const handleRecaptchaChange = (token: string | null) => {
    setRecaptchaToken(token);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!recaptchaToken) {
      setError('Please complete the reCAPTCHA verification.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, recaptchaToken }),
      });

      const data = await response.json();
      setLoading(false);

      if (!response.ok || !data.success) {
        setError(data.error || 'Signup failed. Please try again.');
        setName('');
        setEmail('');
        setPassword('');
        setRecaptchaToken(null);
      } else {
        setError('Verification email sent! Please check your inbox (and spam folder).');
        setName('');
        setEmail('');
        setPassword('');
        setRecaptchaToken(null);
      }
    } catch (err) {
      setLoading(false);
      setError('Unexpected error occurred. Try again later.');
      setName('');
      setEmail('');
      setPassword('');
      setRecaptchaToken(null);
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
      <div className="flex justify-center">
        <ReCAPTCHA
          sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '6LeFz3MrAAAAAAHeQFSkH9YUVpR2XDiDxTHV9957'}
          onChange={handleRecaptchaChange}
        />
      </div>
      <button
        type="submit"
        disabled={loading || !recaptchaToken}
        className="w-full py-2 bg-gradient-to-r from-[#0072BC] to-[#00B140] text-white rounded disabled:opacity-50"
      >
        {loading ? 'Creating Account...' : 'Create Account'}
      </button>
    </form>
  );
}