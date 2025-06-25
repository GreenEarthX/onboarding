import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/lib/db';

export async function POST(request: NextRequest) {
  const { token } = await request.json();
  console.log('Verification token received:', token);

  if (!token) {
    return NextResponse.json({ error: 'No token provided' }, { status: 400 });
  }

  const user = await db.user.findFirst({
    where: { verificationToken: token },
  }).catch(err => {
    console.log('Database findFirst error:', err);
    return null;
  });

  if (!user) {
    console.log('No user found for token:', token);
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
  }

  await db.user.update({
    where: { id: user.id },
    data: { emailVerified: true, verificationToken: null },
  }).catch(err => {
    console.log('User update error:', err);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  });

  console.log('User verified:', user.email);
  return NextResponse.json({ success: true, message: 'Email verified successfully' });
}