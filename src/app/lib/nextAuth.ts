import { AuthOptions, DefaultSession, User } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { db } from '@/app/lib/db';
import { v4 as uuid } from 'uuid';
import { sendVerificationEmail } from '@/app/lib/email';
import speakeasy from 'speakeasy';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    email: string;
    name: string | null;
    password: string | null;
    twoFactorEnabled: boolean;
    twoFactorSecret: string | null;
    emailVerified: boolean;
    verificationToken: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
  }
}

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        name: { label: 'Name', type: 'text' },
        totp: { label: '2FA Code', type: 'text', required: false },
      },
      async authorize(credentials, req) {
        console.log('Authorize called with credentials:', credentials);
        if (!credentials?.email || !credentials?.password) {
          console.log('Missing credentials:', { email: credentials?.email, password: credentials?.password });
          throw new Error('Missing email or password');
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email },
        }).catch(err => {
          console.log('Database findUnique error:', err);
          throw new Error('Database error');
        });

        console.log('User found:', user);
        if (!user && credentials.name) {
          const hashedPassword = await bcrypt.hash(credentials.password, 10);
          const verificationToken = uuid();
          console.log('Generated verificationToken:', verificationToken);
          const newUser = await db.user.create({
            data: {
              id: uuid(),
              email: credentials.email,
              name: credentials.name,
              password: hashedPassword,
              verificationToken,
              emailVerified: false,
              twoFactorEnabled: false,
              twoFactorSecret: null,
            },
          }).catch(err => {
            console.log('User creation error:', err);
            throw new Error('User creation failed');
          });
          await sendVerificationEmail(credentials.email, verificationToken);
          console.log('Verification email sent for new user:', newUser.email);
          return null;
        }

        if (!user || !user.password || !(await bcrypt.compare(credentials.password, user.password))) {
          console.log('Invalid credentials check:', { user, password: user?.password });
          throw new Error('Invalid credentials');
        }

        if (!user.emailVerified) {
          console.log('Email not verified for user:', user.email);
          throw new Error('Email not verified');
        }

        if (user.twoFactorEnabled && !credentials.totp) {
          console.log('2FA required but no code provided for:', user.email);
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
            console.log('Invalid 2FA token for:', user.email);
            throw new Error('Invalid 2FA code');
          }
        }

        console.log('User authenticated:', { id: user.id, email: user.email });
        return user;
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 * 30,
  },
  callbacks: {
    async jwt({ token, user, account, profile }) {
      console.log('JWT Callback:', { token, user, account, profile });
      if (account?.provider === 'google' && user) {
        const existingUser = await db.user.findUnique({
          where: { email: user.email as string },
        });
        if (!existingUser) {
          const newUser = await db.user.create({
            data: {
              id: uuid(),
              email: user.email as string,
              name: user.name as string,
              emailVerified: true,
              twoFactorEnabled: false,
              twoFactorSecret: null,
            },
          });
          token.id = newUser.id;
          console.log('New Google user created:', newUser.email);
        } else {
          token.id = existingUser.id;
          console.log('Existing user authenticated with Google:', existingUser.email);
        }
      } else if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      console.log('Session Callback:', { session, token });
      if (token.id) {
        session.user.id = token.id;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET as string,
  pages: {
    signIn: '/auth/signinUI',
    signOut: '/auth/signout',
    error: '/error',
    verifyRequest: '/verify-request',
  },
};