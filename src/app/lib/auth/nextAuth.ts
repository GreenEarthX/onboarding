import { AuthOptions, DefaultSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import AzureADProvider from 'next-auth/providers/azure-ad';
import bcrypt from 'bcryptjs';
import { db } from '@/app/lib/prisma';
import { v4 as uuid } from 'uuid';
import { sendVerificationEmail } from '@/app/lib/email/email';
import { upsertCertificationUser, upsertCert2User } from '@/app/lib/user-provisioning';
import speakeasy from 'speakeasy';

// Extend NextAuth types

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null | undefined;
      email?: string | null | undefined;
      image?: string | null | undefined;
      twoFactorEnabled: boolean;
      provider?: string;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    email: string;
    name: string | null;
    password: string | null;
    role: string;
    twoFactorEnabled: boolean;
    twoFactorSecret: string | null;
    emailVerified: boolean;
    verificationToken: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    twoFactorEnabled: boolean;
    provider?: string;
  }
}

const isProd = process.env.NODE_ENV === 'production';
const cookieDomain = process.env.NEXTAUTH_COOKIE_DOMAIN;

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    AzureADProvider({
      clientId: process.env.MICROSOFT_CLIENT_ID as string,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET as string,
      tenantId: process.env.MICROSOFT_TENANT_ID as string,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        name: { label: 'Name', type: 'text' },
        totp: { label: '2FA Code', type: 'text', required: false },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Missing email or password');
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user && credentials.name) {
          // Register new user
          const hashedPassword = await bcrypt.hash(credentials.password, 10);
          const verificationToken = uuid();
          const userId = uuid();
          await db.user.create({
            data: {
              id: userId,
              email: credentials.email,
              name: credentials.name,
              password: hashedPassword,
              verificationToken,
              emailVerified: false,
              twoFactorEnabled: false,
              twoFactorSecret: null,
            },
          });
          try {
            await upsertCertificationUser({ email: credentials.email, name: credentials.name, authId: userId });
            await upsertCert2User({ email: credentials.email, name: credentials.name, authId: userId });
          } catch (err) {
            console.error('Provisioning to certification/cert2 failed:', err);
            await db.user.delete({ where: { id: userId } }).catch(() => null);
            throw new Error('Signup failed while provisioning accounts. Please try again.');
          }
          await sendVerificationEmail(credentials.email, verificationToken);
          return null; // must verify before login
        }

        if (!user || !user.password || !(await bcrypt.compare(credentials.password, user.password))) {
          throw new Error('Invalid credentials');
        }

        if (!user.emailVerified) {
          throw new Error('Email not verified');
        }

        if (user.twoFactorEnabled && !credentials.totp) {
          throw new Error('2FA code required');
        }

        if (user.twoFactorEnabled && credentials.totp) {
          const isValidTOTP = speakeasy.totp.verify({
            secret: user.twoFactorSecret!,
            encoding: 'base32',
            token: credentials.totp,
            window: 1,
          });
          if (!isValidTOTP) {
            throw new Error('Invalid 2FA code');
          }
        }

        return user;
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 * 30,
  },
  useSecureCookies: isProd,
  cookies: {
    sessionToken: {
      name: `${isProd ? '__Secure-' : ''}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isProd,
        ...(cookieDomain ? { domain: cookieDomain } : {}),
      },
    },
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (account?.provider) {
        token.provider = account.provider;
      }

      if ((account?.provider === 'google' || account?.provider === 'azure-ad') && user) {
        const existingUser = await db.user.findUnique({
          where: { email: user.email as string },
        });

        if (!existingUser) {
          const userId = uuid();
          const newUser = await db.user.create({
            data: {
              id: userId,
              email: user.email as string,
              name: (user.name as string) ?? '',
              emailVerified: true,
              twoFactorEnabled: false,
              twoFactorSecret: null,
            },
          });
          try {
            await upsertCertificationUser({ email: newUser.email, name: newUser.name ?? '', authId: userId });
            await upsertCert2User({ email: newUser.email, name: newUser.name ?? '', authId: userId });
          } catch (err) {
            console.error('Provisioning to certification/cert2 failed:', err);
            await db.user.delete({ where: { id: userId } }).catch(() => null);
            throw new Error('Signup failed while provisioning accounts. Please try again.');
          }
          token.id = newUser.id;
          token.twoFactorEnabled = false;
        } else {
          token.id = existingUser.id;
          token.twoFactorEnabled = existingUser.twoFactorEnabled;
          try {
            await upsertCertificationUser({
              email: existingUser.email,
              name: existingUser.name ?? '',
              authId: existingUser.id,
            });
            await upsertCert2User({
              email: existingUser.email,
              name: existingUser.name ?? '',
              authId: existingUser.id,
            });
          } catch (err) {
            console.error('Provisioning to certification/cert2 failed for existing user:', err);
          }
        }
      } else if (user) {
        token.id = user.id;
        token.twoFactorEnabled = user.twoFactorEnabled;
      }

      return token;
    },
    async session({ session, token }) {
      if (token.id) {
        session.user.id = token.id;
        session.user.twoFactorEnabled = token.twoFactorEnabled;
        session.user.provider = token.provider;
      }
      return session;
    },
    async signIn() {
      return true;
    },
    async redirect({ url, baseUrl }) {
      if (
        url.startsWith('http://localhost:3001') ||
        url.startsWith('http://localhost:3000') ||
        url.startsWith('http://localhost:3002') ||
        (process.env.GEX_ADMIN_BASE_URL && url.startsWith(process.env.GEX_ADMIN_BASE_URL)) ||
        url.startsWith('https://geomap.greenearthx.io') ||
        url.startsWith('https://auth.greenearthx.io') ||
        url.startsWith(baseUrl)
      ) {
        return url;
      }
      return baseUrl;
    },
  },
  secret: process.env.NEXTAUTH_SECRET as string,
  pages: {
    signIn: '/auth/authenticate',
    error: '/error',
  },
};
