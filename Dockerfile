# Multi-stage Dockerfile for Onboarding App with Prisma
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Accept build arguments
ARG MICROSOFT_CLIENT_ID
ARG MICROSOFT_CLIENT_SECRET  
ARG MICROSOFT_TENANT_ID
ARG MICROSOFT_REFRESH_TOKEN
ARG NEXTAUTH_SECRET
ARG NEXTAUTH_URL

# Set them as environment variables for the build process
ENV MICROSOFT_CLIENT_ID=$MICROSOFT_CLIENT_ID
ENV MICROSOFT_CLIENT_SECRET=$MICROSOFT_CLIENT_SECRET
ENV MICROSOFT_TENANT_ID=$MICROSOFT_TENANT_ID  
ENV MICROSOFT_REFRESH_TOKEN=$MICROSOFT_REFRESH_TOKEN
ENV NEXTAUTH_SECRET=$NEXTAUTH_SECRET
ENV NEXTAUTH_URL=$NEXTAUTH_URL


# Build Next.js application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Set correct permissions
USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
