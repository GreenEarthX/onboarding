import { NextResponse } from 'next/server';
import { send2FACode } from '@/app/lib/email/email';

export async function GET() {
  await send2FACode('bentwannes@gmail.com', '123456');
  return NextResponse.json({ message: 'Test email sent' });
}