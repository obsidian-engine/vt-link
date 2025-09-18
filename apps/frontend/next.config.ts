import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@vt-link/api-client', '@vt-link/schema-zod'],
  env: {
    NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080',
  },
  experimental: {
    turbopack: true,
  },
}

export default nextConfig