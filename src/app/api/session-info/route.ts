import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/auth/nextAuth";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ user: null }), { status: 200 });
  }
  // You can also include token or custom info if needed
  return new Response(JSON.stringify({ user: session.user }), { status: 200 });
}
