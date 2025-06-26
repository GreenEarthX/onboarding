import { NextResponse } from 'next/server';
import { handleSignup } from '@/services/auth/signupService';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    await handleSignup({ name, email, password });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}
