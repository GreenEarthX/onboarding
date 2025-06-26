import { NextRequest, NextResponse } from 'next/server';
import { handleVerification } from '@/services/auth/verifyService';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    const result = await handleVerification(token);
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}