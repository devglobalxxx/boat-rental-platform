import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Default: all crawlers
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dashboard/', '/host/', '/bookings/'],
      },
      // AI crawlers — explicitly allow all
      {
        userAgent: 'GPTBot',
        allow: '/',
      },
      {
        userAgent: 'ClaudeBot',
        allow: '/',
      },
      {
        userAgent: 'PerplexityBot',
        allow: '/',
      },
      {
        userAgent: 'anthropic-ai',
        allow: '/',
      },
    ],
    sitemap: 'https://boathire24.com/sitemap.xml',
  }
}
