import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // All crawlers — full site except private areas
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dashboard/', '/host/', '/bookings/', '/admin', '/boats/*/book'],
      },
      // ── AI / LLM crawlers — explicitly allow everything ──────────────────
      // OpenAI
      { userAgent: 'GPTBot',           allow: '/' },
      { userAgent: 'OAI-SearchBot',    allow: '/' },
      { userAgent: 'ChatGPT-User',     allow: '/' },
      // Anthropic
      { userAgent: 'ClaudeBot',        allow: '/' },
      { userAgent: 'anthropic-ai',     allow: '/' },
      // Perplexity
      { userAgent: 'PerplexityBot',    allow: '/' },
      // Google AI
      { userAgent: 'Google-Extended',  allow: '/' },
      { userAgent: 'Googlebot',        allow: '/' },
      // Meta / AI2
      { userAgent: 'FacebookBot',      allow: '/' },
      // Cohere
      { userAgent: 'cohere-ai',        allow: '/' },
      // Diffbot
      { userAgent: 'Diffbot',          allow: '/' },
      // Bytespider (TikTok)
      { userAgent: 'Bytespider',       allow: '/' },
    ],
    sitemap: 'https://boathire24.com/sitemap.xml',
    host: 'https://boathire24.com',
  }
}
