import { NextResponse } from 'next/server';
import { resetPassword } from '@/services/auth/forgotPasswordService';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, token, newPassword } = body;

    if (!email || !token || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    if (!email.includes('@') || newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password (minimum 8 characters)' },
        { status: 400 }
      );
    }

    await resetPassword(email, token, newPassword);

    return NextResponse.json({ success: true, message: 'Password reset successfully' }, { status: 200 });
  } catch (error: unknown) {
    console.error('Reset password error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
