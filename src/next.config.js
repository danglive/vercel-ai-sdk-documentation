/** @type {import('next').NextConfig} */
const nextConfig = {
  // For example: disable React strict mode
  reactStrictMode: false,

  // For example: configure experimental features
  experimental: {
    esmExternals: 'loose', // allows importing ESM packages
  },

  // For example: configure image domains
  images: {
    domains: ['example.com', 'images.unsplash.com'],
  },

  // For example: override webpack configuration (if needed)
  webpack: (config, { isServer }) => {
    // customize webpack here
    return config;
  },
};

module.exports = nextConfig;