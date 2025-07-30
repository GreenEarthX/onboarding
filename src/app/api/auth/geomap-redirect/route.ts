import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth/nextAuth';
import { generateGeoMapTokenPair } from '@/app/lib/jwt';
import { db } from '@/app/lib/prisma';

export const dynamic = 'force-dynamic';


  
const GEOMAP_APP_URL = process.env.GEOMAP_APP_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const redirectUrl = searchParams.get('redirect');

    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      // Redirect to signin with the original redirect URL, but add a flag to prevent loops
      const signinUrl = new URL('/auth/authenticate', request.url);
      if (redirectUrl) {
        signinUrl.searchParams.set('redirect', redirectUrl);
        signinUrl.searchParams.set('from_geomap_redirect', 'true');
      }
      return NextResponse.redirect(signinUrl);
    }

    // Get full user details from database
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        twoFactorEnabled: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.emailVerified) {
      // Redirect to verification page
      const verifyUrl = new URL('/auth/verify', request.url);
      if (redirectUrl) {
        verifyUrl.searchParams.set('redirect', redirectUrl);
      }
      return NextResponse.redirect(verifyUrl);
    }

    // Generate token and redirect back to geomap with token
    const tokens = generateGeoMapTokenPair(user);
    
    if (redirectUrl) {
      const finalUrl = new URL(redirectUrl);
      finalUrl.searchParams.set('token', tokens.accessToken);
      finalUrl.searchParams.set('refresh_token', tokens.refreshToken);
      return NextResponse.redirect(finalUrl.toString());
    } else {
      // Default redirect to geomap
      const defaultUrl = `${process.env.GEOMAP_APP_URL || 'http://localhost:3001'}?token=${tokens.accessToken}&refresh_token=${tokens.refreshToken}`;
      return NextResponse.redirect(defaultUrl);
    }
  } catch (error) {
    console.error('Error in geomap redirect:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
