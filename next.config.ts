import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    // Serve images directly from source (Supabase/Unsplash) instead of through
    // Vercel's image optimizer. The Hobby plan's optimization quota is exhausted,
    // which makes optimized <Image> URLs return 402 (broken photos) — bypassing
    // optimization keeps every listing photo loading reliably.
    unoptimized: true,
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
