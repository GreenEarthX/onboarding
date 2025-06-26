import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/nextAuth';
import { db } from '@/app/lib/db';
import speakeasy from 'speakeasy';
import { send2FACode } from '@/app/lib/email';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    console.log('Unauthorized resend attempt, no session');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await db.user.findUnique({ where: { email: session.user.email } });
  if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
    return NextResponse.json({ error: '2FA not enabled or user not found' }, { status: 400 });
  }

  const code = speakeasy.totp({
    secret: user.twoFactorSecret,
    encoding: 'base32',
  });
  console.log('Resending 2FA code to:', user.email, 'Code:', code); // Debug log
  try {
    await send2FACode(user.email, code);
    return NextResponse.json({ success: true, message: 'New 2FA code sent to your email.' });
  } catch (error) {
    console.error('Error resending 2FA code:', error);
    return NextResponse.json({ error: 'Failed to resend 2FA code' }, { status: 500 });
  }
}