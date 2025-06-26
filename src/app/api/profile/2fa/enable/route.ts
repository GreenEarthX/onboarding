import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/nextAuth';
import { db } from '@/app/lib/db';
import speakeasy from 'speakeasy';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await db.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  if (!user.twoFactorEnabled) {
    const secret = speakeasy.generateSecret({ name: `NextAuthApp:${user.email}` }).base32;
    await db.user.update({
      where: { email: session.user.email },
      data: { twoFactorSecret: secret, twoFactorEnabled: true },
    });
    return NextResponse.json({ success: true, message: '2FA enabled. A code will be sent during sign-in.' });
  }

  return NextResponse.json({ success: false, message: '2FA already enabled.' }, { status: 400 });
}