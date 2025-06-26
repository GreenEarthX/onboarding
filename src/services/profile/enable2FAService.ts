import { db } from '@/app/lib/db';
import speakeasy from 'speakeasy';

export async function handleEnable2FA(email: string) {
  const user = await db.user.findUnique({ where: { email } });
  if (!user) throw new Error('User not found');

  if (!user.twoFactorEnabled) {
    const secret = speakeasy.generateSecret({ name: `NextAuthApp:${email}` }).base32;
    await db.user.update({
      where: { email },
      data: { twoFactorSecret: secret, twoFactorEnabled: true },
    });
    return { success: true, message: '2FA enabled.' };
  }

  throw new Error('2FA already enabled');
}