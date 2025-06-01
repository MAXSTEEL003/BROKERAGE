/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Make sure experimental features for App Router are enabled
  experimental: {
    appDir: true,
  },
  // Other configs
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Add webpack configuration to handle xlsx
  webpack: (config, { isServer }) => {
    // If it's on the server side, add xlsx to externals
    if (isServer) {
      config.externals = [...config.externals, 'xlsx'];
    }
    
    return config;
  }
};

module.exports = nextConfig;





