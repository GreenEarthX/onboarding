import { NextResponse } from 'next/server';
import { AuthorizationCode } from 'simple-oauth2';

const config = {
  client: {
    id: process.env.MICROSOFT_CLIENT_ID || '8946aa8d-aa2f-40cf-9f6f-1413150cc319',
    secret: process.env.MICROSOFT_CLIENT_SECRET || '083312ec-8d32-4ab2-b68a-fae32b0b6bbb',
  },
  auth: {
    tokenHost: 'https://login.microsoftonline.com',
    tokenPath: `/ff53f505-cae5-4f9a-b7e7-7bd5c639de9b/oauth2/v2.0/token`,
    authorizePath: `/ff53f505-cae5-4f9a-b7e7-7bd5c639de9b/oauth2/v2.0/authorize`,
  },
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'No authorization code provided' }, { status: 400 });
  }

  const client = new AuthorizationCode(config);

  const tokenParams = {
    code,
    redirect_uri: '${process.env.NEXT_PUBLIC_ONBOARDING_URL}/api/auth/callback/microsoft',
    scope: 'https://outlook.office365.com/SMTP.Send offline_access',
  };

  try {
    const accessToken = await client.getToken(tokenParams);
    return NextResponse.json({
      access_token: accessToken.token.access_token,
      refresh_token: accessToken.token.refresh_token,
      expires_at: accessToken.token.expires_at,
    });
  } catch (error: any) {
    console.error('Error exchanging code for tokens:', error.message);
    return NextResponse.json({ error: 'Failed to exchange code for tokens', details: error.message }, { status: 500 });
  }
}