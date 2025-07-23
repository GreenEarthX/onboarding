import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth/nextAuth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Log the logout action if user is found
    if (session?.user?.id) {
      try {
        // Import the logLogin function to log the logout action
        const { logLogin } = await import('@/services/auth/logLoginService');
        
        await logLogin({
          userId: session.user.id,
          action: 'signOut',
          userAgent: request.headers.get('user-agent') || 'unknown',
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
        });
      } catch (logError) {
        console.error('Failed to log logout action:', logError);
        // Don't fail the logout because of logging error
      }
    }
    
    // Note: NextAuth session invalidation happens automatically when the user
    // visits the signout page or calls signOut() from the client
    // We can't directly invalidate the session from a server-side API call
    // The client should call signOut() from next-auth/react after this
    
    return NextResponse.json({ 
      success: true, 
      message: 'Logout request processed',
      signOutUrl: '/api/auth/signout' // NextAuth's built-in signout endpoint
    });
    
  } catch (error) {
    console.error('Logout API error:', error);
    return NextResponse.json({ 
      error: 'Logout failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
