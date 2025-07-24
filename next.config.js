/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'],
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
  output: 'standalone', // Enable standalone output for Docker optimization
};

module.exports = nextConfig;