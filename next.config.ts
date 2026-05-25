import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '**.pexels.com' },
      { protocol: 'https', hostname: 'boatrentalinmarbella.com' },
      { protocol: 'https', hostname: '**.cloudflare.com' },
    ],
  },
  // Allow Supabase auth redirects
  async redirects() {
    return []
  },
}

export default nextConfig
