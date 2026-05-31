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
    return [
      // Outreach-campaign aliases — short URLs that route to /list-your-boat
      // (the canonical page is /list-your-boat, which reads ?city / ?op / ?ref
      // params for personalization).
      { source: '/list', destination: '/list-your-boat', permanent: false },
      { source: '/owners', destination: '/list-your-boat', permanent: false },
      { source: '/sell', destination: '/list-your-boat', permanent: false },
    ]
  },
}

export default nextConfig
