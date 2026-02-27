import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth/nextAuth';
import { generateGeoMapTokenPair } from '@/app/lib/jwt';
import { db } from '@/app/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get full user details from database
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        twoFactorEnabled: true,
        role: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const tokens = generateGeoMapTokenPair(user);
    
    return NextResponse.json({ 
      ...tokens,
      redirectUrl: process.env.GEOMAP_APP_URL || 'http://localhost:3001',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        verified: user.emailVerified,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error generating geomap token:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  // Also support GET for simple token generation
  return POST(request);
}
