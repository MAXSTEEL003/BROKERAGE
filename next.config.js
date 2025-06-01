/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Optimize for production
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Enhanced fix for 'self is not defined' error
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Mark all client-side libraries as external for server build
      config.externals = [
        ...(config.externals || []),
        'jspdf',
        'jspdf-autotable',
        'xlsx',
        /^(canvas|jsdom|chart\.js|html-to-image)/,
        // Add more potential problematic packages
        'html2canvas',
        'canvg',
        'dompurify',
        'core-js',
        'fflate',
        'atob',
        'btoa'
      ];
    }
    
    // Add fallbacks for browser APIs
    if (!config.resolve) config.resolve = {};
    if (!config.resolve.fallback) config.resolve.fallback = {};
    
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
      os: false,
      stream: false,
      process: false,
      util: false,
      buffer: false,
      canvas: false,
    };
    
    return config;
  },
  // Ensure output is standalone for Vercel deployment
  output: 'standalone',
  // Improve error handling
  trailingSlash: false,
  poweredByHeader: false
};

module.exports = nextConfig;








