/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com'],
  },
  // Add Vercel-specific optimizations
  swcMinify: true,
  poweredByHeader: false,
  compress: true
};

module.exports = nextConfig;