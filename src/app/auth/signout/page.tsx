"use client";
import { useEffect } from "react";
import { useSearchParams, usePathname } from "next/navigation";

export default function CustomSignOut() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const callbackUrl = searchParams.get("callbackUrl");
  const redirect = searchParams.get("redirect");

  useEffect(() => {
    // Only redirect if not already on /api/auth/signout and no callbackUrl
    if (!callbackUrl && !pathname.startsWith("/api/auth/signout")) {
      let url = "/api/auth/signout?callbackUrl=http://localhost:3001";
      if (redirect) {
        url += `&redirect=${encodeURIComponent(redirect)}`;
      }
      window.location.replace(url);
    }
  }, [callbackUrl, pathname, redirect]);

  // If callbackUrl is not present, don't render anything (redirect in progress)
  if (!callbackUrl) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="bg-white rounded shadow p-8 max-w-sm w-full text-center">
        <h1 className="text-2xl font-bold mb-4">Signout</h1>
        <p className="mb-6">Are you sure you want to sign out?</p>
        <form method="POST" action={`/api/auth/signout?callbackUrl=${encodeURIComponent(callbackUrl)}${redirect ? `&redirect=${encodeURIComponent(redirect)}` : ''}`}> 
          <button type="submit" className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">Sign out</button>
        </form>
      </div>
    </div>
  );
}
