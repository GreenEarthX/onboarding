import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/nextAuth';
import { db } from '@/app/lib/db';
import speakeasy from 'speakeasy';
import { send2FACode } from '@/app/lib/email';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  console.log('Send 2FA session check:', session ? 'Session exists' : 'No session', 'Headers:', req.headers.get('cookie'));

  let email;
  try {
    const body = await req.json().catch(() => null); // Handle empty body
    email = session?.user?.email || body?.email;
  } catch (err) {
    console.error('Failed to parse request body:', err);
    email = null;
  }

  if (!email) {
    console.log('No email provided in session or request');
    return NextResponse.json({ success: false, error: 'Unauthorized or no email provided' }, { status: 401 });
  }

  const user = await db.user.findUnique({ where: { email } });
  if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
    console.log('User or 2FA not found:', { email, twoFactorEnabled: user?.twoFactorEnabled });
    return NextResponse.json({ success: false, error: '2FA not enabled or user not found' }, { status: 400 });
  }

  const code = speakeasy.totp({
    secret: user.twoFactorSecret,
    encoding: 'base32',
  });
  console.log('Sending initial 2FA code to:', user.email, 'Code:', code);
  try {
    await send2FACode(user.email, code);
    return NextResponse.json({ success: true, message: '2FA code sent to your email.' });
  } catch (error) {
    console.error('Error sending 2FA code:', error);
    return NextResponse.json({ success: false, error: 'Failed to send 2FA code' }, { status: 500 });
  }
}