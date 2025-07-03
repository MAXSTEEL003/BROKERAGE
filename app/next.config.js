/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  // Enables optimized output for serverless hosting (like Vercel)
  output: 'standalone',

  // Required for standalone mode to trace file dependencies
  outputFileTracing: true,

  // Ignore linting errors during builds on Vercel
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Set to true only in development if you want to ignore TypeScript errors
  typescript: {
    ignoreBuildErrors: false,
  },

  webpack: (config, { isServer }) => {
    // Optional: exclude 'xlsx' from server-side bundle if needed
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push('xlsx');
    }

    return config;
  }
};

module.exports = nextConfig;
