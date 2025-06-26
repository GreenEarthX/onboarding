import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/lib/db';

export async function POST(request: NextRequest) {
  const { token } = await request.json();
  console.log('Verification request received with token:', token);

  if (!token) {
    console.log('No token provided');
    return NextResponse.json({ success: false, error: 'No token provided' }, { status: 400 });
  }

  const user = await db.user.findFirst({
    where: { verificationToken: token },
  }).catch(err => {
    console.log('Database findFirst error:', err);
    return null;
  });

  if (!user) {
    console.log('No user found for token:', token);
    return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 400 });
  }

  try {
    await db.user.update({
      where: { id: user.id },
      data: { emailVerified: true, verificationToken: null },
    });
    console.log('User verified successfully:', user.email);
    return NextResponse.json({ success: true, message: 'Email verified successfully' }, { status: 200 });
  } catch (err) {
    console.error('User update error:', err);
    return NextResponse.json({ success: false, error: 'Verification failed' }, { status: 500 });
  }
}