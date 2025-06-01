/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Optimize for production
  reactStrictMode: true,
  swcMinify: true,
  // Add trailing slashes for consistent URLs
  trailingSlash: true,
  // Improve image optimization
  images: {
    domains: [],
    formats: ['image/avif', 'image/webp'],
  }
};

module.exports = nextConfig;