import { db } from '@/app/lib/db';
import { sendVerificationEmail } from '@/app/lib/email';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'This email is already registered. Please sign in.' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = uuid();

    await db.user.create({
      data: {
        id: uuid(),
        name,
        email,
        password: hashedPassword,
        emailVerified: false,
        verificationToken,
        twoFactorEnabled: false,
        twoFactorSecret: null,
      },
    });

    await sendVerificationEmail(email, verificationToken);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
