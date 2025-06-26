'use client'

import { signIn } from 'next-auth/react'
import { FaGoogle, FaGithub } from 'react-icons/fa'
import React from 'react'

type OAuthButtonProps = {
  provider: 'google' | 'github'
}

const providerIcons = {
  google: <FaGoogle />,
  github: <FaGithub />,
}

const providerLabels = {
  google: 'Google',
  github: 'GitHub',
}

const OAuthButton = ({ provider }: OAuthButtonProps) => {
  return (
    <button
      onClick={() =>
        signIn(provider, { redirect: true, callbackUrl: '/profile' })
      }
      className={`w-full flex items-center justify-center space-x-2 ${
        provider === 'google' ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-800 hover:bg-gray-700'
      } text-white rounded-lg py-2 px-4 transition-colors`}
    >
      {providerIcons[provider]}
      <span>Sign in with {providerLabels[provider]}</span>
    </button>
  )
}

export default OAuthButton
