import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/nextAuth';
import { handleSend2FA } from '@/services/auth/send2FAService';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  try {
    const body = await req.json().catch(() => null);
    const email = session?.user?.email || body?.email;

    if (!email) {
      return NextResponse.json({ success: false, error: 'Unauthorized or no email provided' }, { status: 401 });
    }

    await handleSend2FA(email);
    return NextResponse.json({ success: true, message: '2FA code sent to your email.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}