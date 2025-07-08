import { NextResponse } from 'next/server';
import { handleSignup } from '@/services/auth/signupService';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, recaptchaToken } = body;

    await handleSignup({ name, email, password, recaptchaToken });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    console.error('Signup error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 400 });
  }
}