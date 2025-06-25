import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/nextAuth';
import { db } from '@/app/lib/db';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { secret } = await req.json();

  await db.user.update({
    where: { email: session.user.email },
    data: { twoFactorSecret: secret, twoFactorEnabled: true },
  });

  return NextResponse.json({ success: true });
}