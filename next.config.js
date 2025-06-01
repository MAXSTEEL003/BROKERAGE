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
    ignoreBuildErrors: true,
  },

  webpack: (config, { isServer }) => {
    // Optional: exclude 'xlsx' from server-side bundle (not always needed)
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push('xlsx');
    }

    return config;
  },

  // You can keep experimental section minimal or omit if not needed
  experimental: {
    appDir: false // Use this only if you're using the `pages/` directory (which you are)
  }
};

module.exports = nextConfig;
