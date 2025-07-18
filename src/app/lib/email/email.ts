import nodemailer from 'nodemailer';

export async function sendVerificationEmail(email: string, token: string) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  console.log('Attempting to send verification email to:', email, 'with token:', token);
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify Your Email',
      text: `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${token}`,
      html: `
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
              <img src="https://i.ibb.co/8DLfxFz8/GEX-Logo.png" alt="GEX Logo" style="max-width: 120px; height: auto; display: block; margin: 0 auto;" />
            </div>
            <div class="content">
              <h1>Verify Your Email</h1>
              <p>Please click the button below to verify your email address and complete your registration.</p>
              <div class="button-container">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${token}" class="button">Verify Email</a>
              </div>
              <p>If the button doesn't work, copy and paste this link into your browser:</p>
              <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${token}">${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${token}</a></p>
            </div>
            <div class="footer">
              <p>© 2025 GEX. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
    console.log('Verification email sent successfully:', info.response);
    return info;
  } catch (error: any) {
    console.error('Error sending verification email:', {
      message: error.message,
      code: error.code,
      response: error.response,
      stack: error.stack,
    });
    throw error;
  }
}

export async function send2FACode(email: string, code: string) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  console.log('Attempting to send 2FA code to:', email, 'with code:', code);
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your 2FA Code',
      text: `Your 2FA code is: ${code}. It is valid for 30 seconds. Enter this code on the sign-in page. Do not share it with anyone.`,
      html: `
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
              <img src="https://i.ibb.co/8DLfxFz8/GEX-Logo.png" alt="GEX Logo" style="max-width: 120px; height: auto; display: block; margin: 0 auto;" />
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
      `,
    });
    console.log('2FA code sent successfully:', info.response);
    return info;
  } catch (error: any) {
    console.error('Error sending 2FA code:', {
      message: error.message,
      code: error.code,
      response: error.response,
      stack: error.stack,
    });
    throw error;
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  console.log('Attempting to send password reset email to:', email, 'with token:', token);
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Reset Your GreenearthX Password',
      text: `Click this link to reset your password: ${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}&email=${encodeURIComponent(email)}\nThis link expires in 15 minutes.`,
      html: `
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
              <img src="https://i.ibb.co/8DLfxFz8/GEX-Logo.png" alt="GEX Logo" style="max-width: 120px; height: auto; display: block; margin: 0 auto;" />
            </div>
            <div class="content">
              <h1>Reset Your Password</h1>
              <p>Click the button below to reset your GreenearthX password. This link expires in 15 minutes.</p>
              <div class="button-container">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}&email=${encodeURIComponent(email)}" class="button">Reset Password</a>
              </div>
              <p>If the button doesn't work, copy and paste this link into your browser:</p>
              <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}&email=${encodeURIComponent(email)}">${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}&email=${encodeURIComponent(email)}</a></p>
            </div>
            <div class="footer">
              <p>© 2025 GEX. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
    console.log('Password reset email sent successfully:', info.response);
    return info;
  } catch (error: any) {
    console.error('Error sending password reset email:', {
      message: error.message,
      code: error.code,
      response: error.response,
      stack: error.stack,
    });
    throw error;
  }
}