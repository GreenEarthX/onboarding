"use client";

import { signOut } from 'next-auth/react'

interface SignoutProps {
  className?: string;
}

const Signout = ({ className }: SignoutProps) => {
  const handleSignOut = () => {
    const fullUrl = window.location.origin + window.location.pathname + window.location.search;
    signOut({ callbackUrl: fullUrl });
  };
  return (
    <button
      type='button'
      onClick={handleSignOut}
      className={`${className} text-sm text-blue hover:text-emerald-200 transition-colors`}
      >
        Sign Out
      </button>
  )
}

export default Signout