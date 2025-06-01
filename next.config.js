/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Enable standalone output for server deployment
  output: 'standalone',
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
  },
  // Add server components configuration
  serverComponents: true,
  // Specify external packages that should not be bundled
  serverExternalPackages: ['xlsx', 'jspdf', 'jspdf-autotable']
};

module.exports = nextConfig;






