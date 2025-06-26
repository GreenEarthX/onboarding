import { db } from '@/app/lib/db';
import speakeasy from 'speakeasy';
import { send2FACode } from '@/app/lib/email';

export async function handleSend2FA(email: string) {
  const user = await db.user.findUnique({ where: { email } });
  if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
    throw new Error('2FA not enabled or user not found');
  }

  const code = speakeasy.totp({
    secret: user.twoFactorSecret,
    encoding: 'base32',
  });

  await send2FACode(user.email, code);
}