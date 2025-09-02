import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: __dirname,
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.line.me',
      },
      {
        protocol: 'https',
        hostname: 'scdn.line-apps.com',
      },
      {
        protocol: 'https',
        hostname: 'profile.line-scdn.net',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/api/webhook',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'POST',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, x-line-signature',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
