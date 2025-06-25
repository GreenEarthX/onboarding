import { AuthOptions, DefaultSession } from 'next-auth';
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
        totp: { label: '2FA Code', type: 'text' },
      },
      async authorize(credentials) {
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
          const verificationToken = uuid(); // Ensure unique token
          console.log('Generated verificationToken:', verificationToken);
          const newUser = await db.user.create({
            data: {
              id: uuid(),
              email: credentials.email,
              name: credentials.name,
              password: hashedPassword,
              verificationToken: verificationToken, // Explicitly set
              emailVerified: false, // Explicitly set to false
            },
          }).catch(err => {
            console.log('User creation error:', err);
            throw new Error('User creation failed');
          });
          await sendVerificationEmail(credentials.email, verificationToken);
          console.log('Verification email sent for new user:', newUser.email, 'with token:', verificationToken);
          throw new Error('Please verify your email before signing in');
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
          throw new Error('2FA token required');
        }

        if (user.twoFactorEnabled && credentials.totp) {
          const isValidTOTP = speakeasy.totp.verify({
            secret: user.twoFactorSecret!,
            encoding: 'base32',
            token: credentials.totp,
          });
          if (!isValidTOTP) {
            throw new Error('Invalid 2FA token');
          }
        }

        console.log('User authenticated:', { id: user.id, email: user.email });
        return { id: user.id, name: user.name, email: user.email };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 * 30,
  },
  callbacks: {
    async jwt({ token, user }) {
      console.log('JWT Callback:', { token, user });
      if (user) {
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