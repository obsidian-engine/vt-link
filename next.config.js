/** @type {import('next').NextConfig} */
const nextConfig = {
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
