/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Mark browser-only packages as external during server-side rendering
      config.externals = [...(config.externals || []), 
        'jspdf', 
        'jspdf-autotable', 
        'xlsx',
        'html2canvas'
      ];
    }
    
    return config;
  }
};

module.exports = nextConfig;










