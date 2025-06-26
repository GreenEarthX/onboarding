import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/nextAuth';
import { db } from '@/app/lib/db';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await db.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  if (user.twoFactorEnabled) {
    await db.user.update({
      where: { email: session.user.email },
      data: { twoFactorSecret: null, twoFactorEnabled: false },
    });
    return NextResponse.json({ success: true, message: '2FA disabled successfully.' });
  }

  return NextResponse.json({ success: false, message: '2FA already disabled.' }, { status: 400 });
}