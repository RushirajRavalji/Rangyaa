/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com'],
    unoptimized: process.env.NODE_ENV === 'development'
  },
  swcMinify: true,
  poweredByHeader: false,
  compress: true,
  // Add output configuration for better Vercel compatibility
  output: 'standalone'
};

module.exports = nextConfig;