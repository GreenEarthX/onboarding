import { ConfidentialClientApplication } from "@azure/msal-node";
import { Client } from "@microsoft/microsoft-graph-client";

// --- MSAL CONFIG ---
const msalConfig = {
  auth: {
    clientId: process.env.MICROSOFT_CLIENT_ID!,
    authority: `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID}`,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
  },
};

const cca = new ConfidentialClientApplication(msalConfig);

// --- TOKEN ACQUISITION ---
async function getAccessToken(): Promise<string> {
  const result = await cca.acquireTokenByClientCredential({
    scopes: ["https://graph.microsoft.com/.default"],
  });
  if (!result?.accessToken) throw new Error("❌ Failed to acquire access token");
  return result.accessToken;
}

// --- GRAPH CLIENT ---
async function getGraphClient() {
  const token = await getAccessToken();
  return Client.init({
    authProvider: (done) => done(null, token),
  });
}

// --- GENERIC SEND EMAIL ---
async function sendMail(to: string, subject: string, html: string) {
  const client = await getGraphClient();

  await client.api("/users/no-reply@greenearthx.com/sendMail").post({
    message: {
      subject,
      body: { contentType: "HTML", content: html },
      toRecipients: [{ emailAddress: { address: to } }],
      from: { emailAddress: { address: process.env.EMAIL_USER } },
    },
  });

  console.log(`✅ Email sent to ${to}: ${subject}`);
}

// --- EMAIL HELPERS ---

export async function sendVerificationEmail(email: string, token: string) {
  const link = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${token}`;
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
      .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
      .header { background: linear-gradient(to right, #0072BC, #00B140); padding: 15px 20px; text-align: center; }
      .header img { max-width: 120px; height: auto; display: block; margin: 0 auto; }
      .content { padding: 30px; }
      .content h1 { color: #333333; font-size: 24px; margin-bottom: 20px; }
      .content p { color: #666666; font-size: 16px; line-height: 1.5; margin-bottom: 20px; }
      .button { display: inline-block; padding: 12px 24px; background: linear-gradient(to right, #0072BC, #00B140); color: #ffffff; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold; }
      .button-container { text-align: center; margin: 20px 0; }
      .footer { background: #f4f4f4; padding: 20px; text-align: center; color: #666666; font-size: 14px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <img src="https://geomap.greenearthx.io/gex-logo.png" alt="GEX Logo"/>
      </div>
      <div class="content">
        <h1>Verify Your Email</h1>
        <p>Please click the button below to verify your email address and complete your registration.</p>
        <div class="button-container">
          <a href="${link}" class="button">Verify Email</a>
        </div>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p><a href="${link}">${link}</a></p>
      </div>
      <div class="footer">
        <p>© 2025 GEX. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>
  `;
  await sendMail(email, "Verify Your Email", html);
}

export async function send2FACode(email: string, code: string) {
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
      .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
      .header { background: linear-gradient(to right, #0072BC, #00B140); padding: 15px 20px; text-align: center; }
      .header img { max-width: 120px; height: auto; display: block; margin: 0 auto; }
      .content { padding: 30px; }
      .content h1 { color: #333333; font-size: 24px; margin-bottom: 20px; }
      .content p { color: #666666; font-size: 16px; line-height: 1.5; margin-bottom: 20px; }
      .code { font-size: 32px; font-weight: bold; color: #0072BC; text-align: center; margin: 20px 0; letter-spacing: 5px; }
      .footer { background: #f4f4f4; padding: 20px; text-align: center; color: #666666; font-size: 14px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <img src="https://geomap.greenearthx.io/gex-logo.png" alt="GEX Logo"/>
      </div>
      <div class="content">
        <h1>Your Two-Factor Authentication Code</h1>
        <p>Please use the following code to complete your sign-in. This code is valid for 30 seconds.</p>
        <div class="code">${code}</div>
        <p>Enter this code on the sign-in page to proceed.</p>
        <p>Do not share this code with anyone.</p>
      </div>
      <div class="footer">
        <p>© 2025 GEX. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>
  `;
  await sendMail(email, "Your 2FA Code", html);
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const link = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
      .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
      .header { background: linear-gradient(to right, #0072BC, #00B140); padding: 15px 20px; text-align: center; }
      .header img { max-width: 120px; height: auto; display: block; margin: 0 auto; }
      .content { padding: 30px; }
      .content h1 { color: #333333; font-size: 24px; margin-bottom: 20px; }
      .content p { color: #666666; font-size: 16px; line-height: 1.5; margin-bottom: 20px; }
      .button { display: inline-block; padding: 12px 24px; background: linear-gradient(to right, #0072BC, #00B140); color: #ffffff; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold; }
      .button-container { text-align: center; margin: 20px 0; }
      .footer { background: #f4f4f4; padding: 20px; text-align: center; color: #666666; font-size: 14px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <img src="https://geomap.greenearthx.io/gex-logo.png" alt="GEX Logo"/>
      </div>
      <div class="content">
        <h1>Reset Your Password</h1>
        <p>Click the button below to reset your GreenearthX password. This link expires in 15 minutes.</p>
        <div class="button-container">
          <a href="${link}" class="button">Reset Password</a>
        </div>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p><a href="${link}">${link}</a></p>
      </div>
      <div class="footer">
        <p>© 2025 GEX. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>
  `;
  await sendMail(email, "Reset Your Password", html);
}
