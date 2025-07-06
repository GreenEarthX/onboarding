// app/api/profile/login-history/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/nextAuth';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const loginHistory = await db.loginHistory.findMany({
    where: { userId: session.user.id },
    orderBy: { timestamp: 'desc' },
  });

  return NextResponse.json(loginHistory);
}