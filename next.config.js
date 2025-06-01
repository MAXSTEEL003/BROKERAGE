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
  // Updated to use stable API instead of experimental
  serverExternalPackages: ['xlsx', 'jspdf', 'jspdf-autotable'],
  
  experimental: {
    // Enable optimization for package imports
    optimizePackageImports: ['react-icons'],
    // Enable Lightning CSS for better performance
    useLightningcss: true,
  }
};

module.exports = nextConfig;









