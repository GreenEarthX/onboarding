import { NextRequest, NextResponse } from 'next/server';
import { logLogin } from '@/services/auth/logLoginService';

export async function POST(req: NextRequest) {
  try {
    const { userId, action } = await req.json();
    const userAgent = req.headers.get('user-agent') || 'unknown';
    const ipAddress = req.headers.get('x-forwarded-for') || 'unknown';

    await logLogin({ userId, action, userAgent, ipAddress });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error logging login history:', error);
    return NextResponse.json({ success: false, error: 'Failed to log login activity.' }, { status: 400 });
  }
}