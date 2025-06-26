"use client";

import { signOut } from 'next-auth/react'

interface SignoutProps {
  className?: string;
}

const Signout = ({ className }: SignoutProps) => {
  return (
    <button
      type='button'
      onClick={() => { signOut() }}
      className={`${className} text-sm text-blue hover:text-emerald-200 transition-colors`}
      >
        Sign Out
      </button>
  )
}

export default Signout