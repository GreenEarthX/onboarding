"use client";

import { signIn } from 'next-auth/react'
import { redirect } from 'next/dist/server/api-utils';
import React from 'react'

const SigninWithGoogle = () => {
  return (
     <div className="text-center">
        <h1 className="text-2xl font-bold">Welcome to Next.js!</h1>
        <p className="text-sm text-gray-500">You are not logged in.</p> 
        <button
        type='button'   onClick={() => { signIn('google', {redirect: true, callbackUrl: '/profile'} ) }}
        >
          Sign in with Google     
        </button>
       </div>
  )
}

export default SigninWithGoogle