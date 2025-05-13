/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com'],
    unoptimized: process.env.NODE_ENV === 'development'
  },
  // Add Vercel-specific optimizations
  swcMinify: true,
  poweredByHeader: false,
  compress: true
};

module.exports = nextConfig;