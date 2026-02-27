import { NextRequest, NextResponse } from 'next/server';
import { verifyGeoMapToken, generateGeoMapTokenPair } from '@/app/lib/jwt';
import { db } from '@/app/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json();
    
    if (!refreshToken) {
      return NextResponse.json({ error: 'Refresh token required' }, { status: 400 });
    }

    // Verify refresh token
    const payload = verifyGeoMapToken(refreshToken, 'refresh');
    if (!payload) {
      return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
    }

    // Get current user data
    const user = await db.user.findUnique({
      where: { id: payload.userId },
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

    // Generate new token pair
    const tokens = generateGeoMapTokenPair(user);
    
    return NextResponse.json(tokens);
  } catch (error) {
    console.error('Token refresh failed:', error);
    return NextResponse.json({ error: 'Token refresh failed' }, { status: 500 });
  }
}
