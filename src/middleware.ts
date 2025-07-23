import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { withAuth } from 'next-auth/middleware';
import { getToken } from 'next-auth/jwt';

export default withAuth(
  
   async function middleware(request: NextRequest) {
   const pathname = request.nextUrl.pathname;
   const isAuth = await getToken({ req: request });
  
   const protectedRoutes = ['/profile'];
   const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
   const isAuthRoute = pathname.startsWith('/auth/authenticate') ;

   if (!isAuth && isProtectedRoute) {
       return NextResponse.redirect(new URL('/auth/authenticate', request.url));
   }

   // Optional: prevent authenticated users from seeing login/signup, but allow cross-app navigation
   if (isAuth && isAuthRoute) {
       // Check if there's a redirect parameter for cross-app navigation
       const redirectParam = request.nextUrl.searchParams.get('redirect');
       
       // Get geomap URL from environment variables
       const geomapUrl = process.env.NEXT_PUBLIC_GEOMAP_URL || process.env.GEOMAP_URL || 'http://localhost:3001';
       const geomapDomain = new URL(geomapUrl).host;
       
       if (redirectParam && redirectParam.includes(geomapDomain)) {
           // Allow access to auth page for cross-app navigation, then redirect through geomap-redirect
           return NextResponse.redirect(new URL(`/api/auth/geomap-redirect?redirect=${encodeURIComponent(redirectParam)}`, request.url));
       } else {
           // Default redirect to profile for authenticated users without geomap redirect
           return NextResponse.redirect(new URL('/profile', request.url));
       }
   }

   return NextResponse.next();
},{
   callbacks: {
       async authorized() {
           return true; // Allow all requests to pass through
       },
   },   
});

export const config = {
 matcher: ['/profile', '/profile/:path*', '/auth/:path*']
};


