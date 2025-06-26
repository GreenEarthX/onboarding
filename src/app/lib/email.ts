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
      text: `Please verify your email by clicking this link: http://localhost:3000/auth/verify?token=${token}`,
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