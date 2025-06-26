import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/lib/db';

export async function POST(request: NextRequest) {
  const { token } = await request.json();
  console.log('Verification request received with token:', token);

  if (!token) {
    console.log('No token provided');
    return NextResponse.json({ success: false, error: 'No token provided' }, { status: 400 });
  }

  try {
    const user = await db.user.findFirst({
      where: { verificationToken: token },
    });

    if (user) {
      await db.user.update({
        where: { id: user.id },
        data: {
          emailVerified: true,
          verificationToken: null,
        },
      });
      console.log('User verified successfully:', user.email);
      return NextResponse.json({ success: true, message: 'Email verified successfully' }, { status: 200 });
    }

    // 🔥 If token not found, check if user was already verified
    const previouslyVerifiedUser = await db.user.findFirst({
      where: {
        emailVerified: true,
        verificationToken: null,
      },
    });

    if (previouslyVerifiedUser) {
      console.log('Token already used — user previously verified.');
      return NextResponse.json({ success: true, message: 'Already verified' }, { status: 200 });
    }

    console.log('No user found for token:', token);
    return NextResponse.json({ success: false, error: 'Invalid or expired token' }, { status: 400 });

  } catch (err) {
    console.error('Verification error:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
