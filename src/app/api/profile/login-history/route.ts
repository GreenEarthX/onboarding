import { NextRequest } from 'next/server';
import { db } from '@/app/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth/nextAuth';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return new Response(JSON.stringify([]), { status: 200 });
  }

  try {
    const history = await db.loginHistory.findMany({
      where: {
        user: { email: session.user.email },
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: 20, // limit to last 20
    });

    return Response.json(history);
  } catch (error) {
    console.error('Error fetching login history:', error);
    return new Response(JSON.stringify([]), { status: 200 });
  }
}
