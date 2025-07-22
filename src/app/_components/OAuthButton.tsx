'use client'

import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { FaGoogle, FaApple } from 'react-icons/fa'
import React, { useState } from 'react'

type OAuthButtonProps = {
  provider: 'google' | 'apple' 
}

const providerIcons = {
  google: <FaGoogle />,
  apple: <FaApple />, 
}

const providerLabels = {
  google: 'Google',
  apple: 'Apple',
}

const OAuthButton = ({ provider }: OAuthButtonProps) => {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOAuthSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Pass the redirect param to the custom OAuth callback handler (absolute URL)
      let callbackUrl = `${window.location.origin}/api/auth/geomap-redirect-oauth`;
      let state;
      if (redirectUrl) {
        callbackUrl += '?redirect=' + encodeURIComponent(redirectUrl);
        state = JSON.stringify({ redirect: redirectUrl });
      }

      await signIn(provider, {
        redirect: true,
        callbackUrl,
        ...(state ? { state } : {})
      });
    } catch (error) {
      console.error('OAuth sign-in error:', error);
      setError('Connection timeout. Please try again or use email/password login.');
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleOAuthSignIn}
        disabled={isLoading}
        className={`w-full flex items-center justify-center space-x-2 ${
          provider === 'google'
            ? 'bg-red-600 hover:bg-red-700'
            : provider === 'apple'
            ? 'bg-black hover:bg-gray-800' 
            : 'bg-gray-800 hover:bg-gray-700'
        } text-white rounded-lg py-2 px-4 transition-colors disabled:opacity-50`}
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
        ) : (
          providerIcons[provider]
        )}
        <span>
          {isLoading ? 'Connecting...' : `Sign in with ${providerLabels[provider]}`}
        </span>
      </button>
      
      {error && (
        <div className="mt-2 text-sm text-red-600 text-center">
          {error}
        </div>
      )}
    </div>
  )
}

export default OAuthButton