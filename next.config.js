/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  // Enable standalone output for Vercel deployments
  output: 'standalone',

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false, // Set to false in production
  },

  webpack: (config, { isServer }) => {
    // Optional: exclude 'xlsx' from server-side bundle (not always needed)
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push('xlsx');
    }

    return config;
  },

  // Remove these properties to help ensure a successful deployment
  outputFileTracing: false,
};

module.exports = nextConfig;