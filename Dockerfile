# Simple Dockerfile for Onboarding App
FROM node:22-alpine

WORKDIR /app

# Copy package files and install ALL dependencies (including dev deps for build)
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

EXPOSE 3000

# Just use npm start - simple!
CMD ["npm", "start"]
