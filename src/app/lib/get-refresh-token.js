const { AuthorizationCode } = require('simple-oauth2');

const config = {
  client: {
    id: '8946aa8d-aa2f-40cf-9f6f-1413150cc319',
    secret: 'iws8Q~AriijK3Z~GsJ3FFiPiYlce3Sv54rfxeb3r',
  },
  auth: {
    tokenHost: 'https://login.microsoftonline.com',
    tokenPath: '/ff53f505-cae5-4f9a-b7e7-7bd5c639de9b/oauth2/v2.0/token',
    authorizePath: '/ff53f505-cae5-4f9a-b7e7-7bd5c639de9b/oauth2/v2.0/authorize',
  },
};

async function generateAuthorizeUrl() {
  const client = new AuthorizationCode(config);
  const authorizationUrl = client.authorizeURL({
    redirect_uri: '${process.env.NEXT_PUBLIC_ONBOARDING_URL}/api/auth/callback/microsoft',
    scope: 'https://outlook.office365.com/SMTP.Send offline_access',
  });
  console.log('Open this URL in your browser to authorize:', authorizationUrl);
}

generateAuthorizeUrl().catch((error) => {
  console.error('Error generating authorization URL:', error.message);
});