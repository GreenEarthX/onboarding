'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';

export default function ErrorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorDetails, setErrorDetails] = useState<any>(null);

  useEffect(() => {
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    
    console.log('NextAuth Error Details:', { error, errorDescription });
    
    setErrorDetails({
      error,
      errorDescription,
      isOAuthError: error === 'OAuthSignin' || error === 'OAuthCallback' || error === 'OAuthCreateAccount'
    });
  }, [searchParams]);

  const getErrorMessage = () => {
    if (!errorDetails?.error) {
      return 'An unexpected error occurred. Please try again.';
    }

    switch (errorDetails.error) {
      case 'OAuthSignin':
      case 'OAuthCallback':
        return 'There was a problem connecting to Google. This might be due to network issues or Google OAuth configuration. Please try again or use email/password login.';
      case 'OAuthCreateAccount':
        return 'There was a problem creating your account with Google. Please try again or use email/password registration.';
      case 'Configuration':
        return 'Authentication service is not properly configured. Please contact support.';
      case 'AccessDenied':
        return 'Access was denied. Please ensure you grant the necessary permissions when signing in with Google.';
      case 'Verification':
        return 'Email verification required. Please check your email and click the verification link.';
      default:
        return errorDetails.errorDescription || 'An authentication error occurred. Please try again.';
    }
  };

  const getErrorSolution = () => {
    if (!errorDetails?.error) return null;

    if (errorDetails.isOAuthError) {
      return (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Troubleshooting Steps:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Check your internet connection</li>
            <li>• Try disabling VPN or firewall temporarily</li>
            <li>• Use email/password login as an alternative</li>
            <li>• Clear your browser cache and cookies</li>
            <li>• Try again in a few minutes</li>
          </ul>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center"
      >
        <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 19c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">Authentication Error</h1>
        <p className="text-gray-600 mb-6">{getErrorMessage()}</p>

        {errorDetails?.isOAuthError && (
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-4">
              OAuth Error Code: <code className="bg-gray-100 px-2 py-1 rounded">{errorDetails.error}</code>
            </p>
          </div>
        )}

        {getErrorSolution()}

        <div className="flex flex-col gap-3 mt-6">
          <button 
            onClick={() => router.push('/auth/authenticate')} 
            className="w-full px-4 py-2 bg-gradient-to-r from-[#0072BC] to-[#00B140] text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Try Again
          </button>
          
          {errorDetails?.isOAuthError && (
            <button 
              onClick={() => router.push('/auth/authenticate?tab=signin')} 
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Use Email/Password Instead
            </button>
          )}
        </div>

        {process.env.NODE_ENV === 'development' && errorDetails && (
          <details className="mt-6 text-left">
            <summary className="text-xs text-gray-400 cursor-pointer">Debug Info</summary>
            <pre className="text-xs text-gray-500 mt-2 bg-gray-50 p-2 rounded overflow-auto">
              {JSON.stringify(errorDetails, null, 2)}
            </pre>
          </details>
        )}
      </motion.div>
    </div>
  );
}