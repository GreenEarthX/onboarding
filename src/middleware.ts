import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { withAuth } from 'next-auth/middleware';
import { getToken } from 'next-auth/jwt';

export default withAuth(
  
   async function middleware(request: NextRequest) {
   const pathname = request.nextUrl.pathname;
   const isAuth = await getToken({ req: request });
  
   const protectedRoutes = ['/profile', '/admin'];
   const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
   const isAuthRoute = pathname.startsWith('/auth/signinUI') || pathname.startsWith('/auth/signup');

   if (!isAuth && isProtectedRoute) {
       return NextResponse.redirect(new URL('/auth/signinUI', request.url));
   }

   // Optional: prevent authenticated users from seeing login/signup
   if (isAuth && isAuthRoute) {
       return NextResponse.redirect(new URL('/profile', request.url));
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


