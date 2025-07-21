'use client'

import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { FaGoogle, FaApple } from 'react-icons/fa'
import React from 'react'

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
  
  // Determine the callback URL based on redirect parameter
  const callbackUrl = redirectUrl ? `/api/auth/geomap-redirect?redirect=${encodeURIComponent(redirectUrl)}` : '/profile';

  return (
    <button
      onClick={() =>
        signIn(provider, { redirect: true, callbackUrl })
      }
      className={`w-full flex items-center justify-center space-x-2 ${
        provider === 'google'
          ? 'bg-red-600 hover:bg-red-700'
          : provider === 'apple'
          ? 'bg-black hover:bg-gray-800' 
          : 'bg-gray-800 hover:bg-gray-700'
      } text-white rounded-lg py-2 px-4 transition-colors`}
    >
      {providerIcons[provider]}
      <span>Sign in with {providerLabels[provider]}</span>
    </button>
  )
}

export default OAuthButton