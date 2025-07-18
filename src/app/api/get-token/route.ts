import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // If your token object has a 'token' string inside, return just that
  return NextResponse.json({ token: token.token }); // <-- CHANGE THIS LINE
}
