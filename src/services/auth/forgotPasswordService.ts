import { db } from '@/app/lib/prisma';
import { sendPasswordResetEmail } from '@/app/lib/email/email';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';

export async function requestPasswordReset(email: string) {
  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error('User not found');
  }

  const resetToken = uuid();
  const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  await db.user.update({
    where: { email },
    data: { resetPasswordToken: resetToken, resetPasswordTokenExpiry: resetTokenExpiry },
  });

  await sendPasswordResetEmail(email, resetToken);
}

export async function resetPassword(email: string, token: string, newPassword: string) {
  const user = await db.user.findUnique({
    where: { email },
    select: {
      id: true,
      resetPasswordToken: true,
      resetPasswordTokenExpiry: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }
  if (!user.resetPasswordToken || user.resetPasswordToken !== token) {
    throw new Error('Invalid or missing reset token');
  }
  if (!user.resetPasswordTokenExpiry || user.resetPasswordTokenExpiry < new Date()) {
    throw new Error('Reset token expired');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await db.user.update({
    where: { email },
    data: {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordTokenExpiry: null,
    },
  });
}
