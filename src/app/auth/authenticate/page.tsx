'use client';
import { useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import AuthTabs from '@/app/_components/AuthTabs';
import SigninForm from '@/app/_components/SigninForm';
import SignupForm from '@/app/_components/SignupForm';
import SocialAuthButtons from '@/app/_components/SocialAuthButtons';
import Image from 'next/image';

function AuthenticateContent() {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');

  const handleTabChange = (tab: 'signin' | 'signup') => {
    setActiveTab(tab);
    setEmail('');
    setPassword('');
    setName('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 px-4">
      <motion.div className="bg-white w-full max-w-md rounded-xl shadow-xl overflow-hidden">
        <div className="bg-white p-6 text-center">
          <div className="flex justify-center items-center gap-2">
            <Image src="/gex-logo.png" alt="GEX Logo" width={120} height={50} />
          </div>
        </div>

        <AuthTabs activeTab={activeTab} onChange={handleTabChange} />

        <div className="p-6 space-y-6">
          {activeTab === 'signin' ? (
            <SigninForm email={email} password={password} setEmail={setEmail} setPassword={setPassword} />
          ) : (
            <SignupForm
              name={name}
              email={email}
              password={password}
              setName={setName}
              setEmail={setEmail}
              setPassword={setPassword}
            />
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">Or continue with</span>
            </div>
          </div>

          <SocialAuthButtons />
        </div>

        <div className="bg-gray-50 px-6 py-4 text-center text-sm text-gray-600">
          {activeTab === 'signin' ? (
            <>
              Don’t have an account?{' '}
              <button onClick={() => handleTabChange('signup')} className="text-indigo-600 font-medium">
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button onClick={() => handleTabChange('signin')} className="text-indigo-600 font-medium">
                Sign in
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function SigninPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <AuthenticateContent />
    </Suspense>
  );
}