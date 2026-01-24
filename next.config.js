/** @type {import('next').NextConfig} */
const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin();

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '82mobile.com',
        pathname: '/wp-content/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '82mobile.com',
        pathname: '/wp-content/uploads/**',
      },
    ],
  },
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  // Optimize production builds
  swcMinify: true,
};

module.exports = withNextIntl(nextConfig);
