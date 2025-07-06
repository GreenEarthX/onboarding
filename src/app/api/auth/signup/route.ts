import { NextResponse } from 'next/server';
import { handleSignup } from '@/services/auth/signupService';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, recaptchaToken } = body;

    // Verify reCAPTCHA token
    const recaptchaResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`,
    });

    const recaptchaData = await recaptchaResponse.json();
    if (!recaptchaResponse.ok || !recaptchaData.success) {
      return NextResponse.json(
        { success: false, error: 'reCAPTCHA verification failed' },
        { status: 400 }
      );
    }

    await handleSignup({ name, email, password });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}