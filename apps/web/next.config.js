/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    cssChunking: 'strict'
  },
  transpilePackages: ['@vt-link/core', '@vt-link/ui'],
  eslint: {
    ignoreDuringBuilds: true
  }
};

export default nextConfig;