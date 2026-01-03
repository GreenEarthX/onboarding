import { db } from '@/app/lib/prisma';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import { sendVerificationEmail } from '@/app/lib/email/email';
import disposableEmailDomains from 'disposable-email-domains';
import { promises as dns } from 'dns';
import { upsertCertificationUser, upsertCert2User } from '@/app/lib/user-provisioning';


interface SignupData {
  name: string;
  email: string;
  password: string;
  recaptchaToken: string;
}

export async function handleSignup({ name, email, password, recaptchaToken }: SignupData) {
  // Validate environment variables
  if (!process.env.RECAPTCHA_SECRET_KEY) {
    throw new Error('RECAPTCHA_SECRET_KEY is not defined');
  }

  // Validate input fields
  if (!name || !email || !password || !recaptchaToken) {
    throw new Error('Missing required fields');
  }
  if (!email.includes('@')) {
    throw new Error('Invalid email format');
  }

  // Check for disposable email
  const isDisposableEmail = (email: string) => {
    const domain = email.split('@')[1]?.toLowerCase();
    return domain ? disposableEmailDomains.includes(domain) : true;
  };

  if (isDisposableEmail(email)) {
    throw new Error('Disposable email addresses are not allowed');
  }

  // Verify email domain MX records
  const validateEmailDomain = async (email: string) => {
    const domain = email.split('@')[1];
    try {
      const mxRecords = await dns.resolveMx(domain);
      return mxRecords.length > 0;
    } catch (error) {
      return false; // Domain has no valid MX records
    }
  };

  if (!(await validateEmailDomain(email))) {
    throw new Error('Invalid or non-existent email domain');
  }

  // Verify reCAPTCHA token
  const recaptchaResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      secret: process.env.RECAPTCHA_SECRET_KEY,
      response: recaptchaToken,
    }).toString(),
  });

  const recaptchaData = await recaptchaResponse.json();
  if (!recaptchaResponse.ok || !recaptchaData.success) {
    console.error('reCAPTCHA errors:', recaptchaData['error-codes']);
    throw new Error('reCAPTCHA verification failed');
  }

  // Check for existing user
  const existingUser = await db.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error('This email is already registered. Please sign in.');
  }

  // Create user
  const hashedPassword = await bcrypt.hash(password, 10);
  const verificationToken = uuid();
  const userId = uuid(); // canonical identity across all DBs

  await db.user.create({
    data: {
      id: userId,
      name,
      email,
      password: hashedPassword,
      emailVerified: false,
      verificationToken,
      twoFactorEnabled: false,
      twoFactorSecret: null,
    },
  });
  
  // Provision user to external certification DBs
  try {
    await upsertCertificationUser({ email, name, authId: userId });
    await upsertCert2User({ email, name, authId: userId });
  } catch (err) {
    console.error("Provisioning to certification/cert2 failed:", err);

    // strict policy: rollback onboarding user to avoid inconsistent identity state
    await db.user.delete({ where: { id: userId } }).catch(() => null);

    throw new Error("Signup failed while provisioning accounts. Please try again.");
  }


  // Send verification email
  await sendVerificationEmail(email, verificationToken);
}