import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth/nextAuth';
import { generateGeoMapTokenPair } from '@/app/lib/jwt';
import { db } from '@/app/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      // OAuth failed, redirect to signin
      return NextResponse.redirect(new URL('/auth/authenticate', request.url));
    }

    // Get full user details from database
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        twoFactorEnabled: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.emailVerified) {
      // Redirect to verification page
      return NextResponse.redirect(new URL('/auth/verify', request.url));
    }

    // Generate token and create a page that redirects using the query param or state param
    const tokens = generateGeoMapTokenPair(user);
    let redirectParam = request.nextUrl.searchParams.get('redirect');
    // Try to get redirect from state param if not present
    if (!redirectParam) {
      const stateParam = request.nextUrl.searchParams.get('state');
      if (stateParam) {
        try {
          const stateObj = JSON.parse(stateParam);
          if (stateObj && stateObj.redirect) {
            redirectParam = stateObj.redirect;
          }
        } catch (e) {}
      }
    }
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Redirecting...</title>
</head>
<body>
    <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
        <h2>Authentication successful!</h2>
        <p>Redirecting you to your destination...</p>
    </div>
    <script>
        const accessToken = '${tokens.accessToken}';
        const refreshToken = '${tokens.refreshToken}';
        let finalUrl = '${process.env.GEOMAP_APP_URL || 'http://localhost:3001'}';
        if (${Boolean('' + '${redirectParam}')} && '${redirectParam}' !== 'null') {
          finalUrl = decodeURIComponent('${redirectParam}');
        }
        try {
          const urlObj = new URL(finalUrl);
          urlObj.searchParams.set('token', accessToken);
          urlObj.searchParams.set('refresh_token', refreshToken);
          window.location.href = urlObj.toString();
        } catch (e) {
          window.location.href = finalUrl;
        }
    </script>
</body>
</html>`;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('Error in OAuth redirect:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
