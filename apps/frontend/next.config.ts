import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@vt-link/api-client', '@vt-link/schema-zod'],
  env: {
    NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080',
  },
  experimental: {
    // Next.js 15でturbopackはデフォルトで有効化されるため削除
  },
}

export default nextConfig