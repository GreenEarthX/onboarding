# Onboarding App

A secure authentication system built with **Next.js**, **NextAuth.js**, and **Prisma**, featuring Single Sign-On (SSO) with Google, credentials-based authentication, two-factor authentication (2FA), and email verification. 

## Features
- **Single Sign-On (SSO)**: authentication via Google OAuth provider.
- **Credentials-Based Authentication**: Login with email and password, with passwords hashed using **bcryptjs**.
- **Two-Factor Authentication (2FA)**: 2FA using Time-Based One-Time Password (TOTP) implemented with **speakeasy**.
- **Email Verification**: Single-use verification token sent via email using **nodemailer** to verify user email addresses.
- **Session Management**: JWT-based sessions with a 30-day expiration.
- **Protected Routes**: Middleware ensures secure access to profile routes.
- **Responsive UI**: Built with **React** and **Tailwind CSS** for styling.
- **Database Integration**: Uses **Prisma** with PostgreSQL for data management.

## Technologies
- **Next.js**: React framework for server-side rendering and API routes.
- **NextAuth.js**: Authentication library for handling SSO, credentials, and session management.
- **Prisma**: ORM for PostgreSQL database interactions.
- **bcryptjs**: Password hashing for secure storage.
- **speakeasy**: TOTP-based 2FA implementation.
- **nodemailer**: Email sending for verification and 2FA codes.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **TypeScript**: Type-safe JavaScript for better developer experience.
- **PostgreSQL**: Relational database for storing user data.

## Project Structure
```
.
├── next.config.js                # Next.js configuration
├── package.json                  # Project dependencies and scripts
├── prisma/                       # Prisma schema and migrations
│   ├── migrations/               # Database migration files
│   └── schema.prisma             # Prisma schema definition
├── public/                       # Static assets (logos, icons)
├── src/
│   ├── app/                      # Next.js app directory
│   │   ├── api/                  # API routes for auth and profile
│   │   ├── auth/                 # Authentication pages (signin, verify)
│   │   ├── _components/          # Reusable React components
│   │   ├── lib/                  # Utility functions (db, email, auth)
│   │   ├── profile/              # Profile page
│   │   ├── providers/            # NextAuth provider component
│   │   └── types/                # TypeScript type definitions
│   ├── middleware.ts             # Authentication middleware
│   └── services/                 # Business logic for auth and profile
└── tsconfig.json                 # TypeScript configuration
```

## Setup and Installation
1. **Clone the Repository**:
   ```bash
   git clone git clone https://github.com/GreenEarthX/onboarding.app.git
   cd onboarding.app
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Set Up PostgreSQL**:
   - Ensure PostgreSQL is installed and running.
   - Create a database named `gex_auth`.
   - Update the `DATABASE_URL` in the `.env` file (see [Environment Variables](#environment-variables)).

4. **Run Database Migrations**:
   ```bash
   npx prisma migrate dev
   ```

5. **Set Up Environment Variables**:
   Create a `.env` file in the root directory and configure the required variables (see below).

6. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`.

## Environment Variables
Create a `.env` file in the project root and add the following variables:
```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
DATABASE_URL=postgresql://gex_user:gex_user@localhost:5432/gex_auth
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-app-password
```

- **GOOGLE_CLIENT_ID** and **GOOGLE_CLIENT_SECRET**: Obtain from Google Cloud Console for SSO.
- **NEXTAUTH_URL**: The base URL of your application.
- **NEXTAUTH_SECRET**: A secure key for NextAuth.js (generate using `openssl rand -base64 32`).
- **DATABASE_URL**: PostgreSQL connection string.
- **EMAIL_USER** and **EMAIL_PASS**: Credentials for sending emails via nodemailer (e.g., Gmail app password).
