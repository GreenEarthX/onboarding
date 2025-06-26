import { db } from '@/app/lib/db';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import { sendVerificationEmail } from '@/app/lib/email';

export async function handleSignup({ name, email, password }: { name: string, email: string, password: string }) {
  const existingUser = await db.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error('This email is already registered. Please sign in.');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const verificationToken = uuid();

  await db.user.create({
    data: {
      id: uuid(),
      name,
      email,
      password: hashedPassword,
      emailVerified: false,
      verificationToken,
      twoFactorEnabled: false,
      twoFactorSecret: null,
    },
  });

  await sendVerificationEmail(email, verificationToken);
}
