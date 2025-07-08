import { db } from '@/app/lib/prisma';

export async function handleVerification(token: string) {
  const user = await db.user.findFirst({ where: { verificationToken: token } });
  if (user) {
    await db.user.update({
      where: { id: user.id },
      data: { emailVerified: true, verificationToken: null },
    });
    return { success: true, message: 'Email verified successfully' };
  }

  const previouslyVerifiedUser = await db.user.findFirst({
    where: { emailVerified: true, verificationToken: null },
  });

  if (previouslyVerifiedUser) {
    return { success: true, message: 'Already verified' };
  }

  throw new Error('Invalid or expired token');
}
