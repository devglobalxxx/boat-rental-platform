import type { MetadataRoute } from 'next'
import { POSTS } from '@/lib/blog/posts'

export const revalidate = 3600

const BASE_URL = 'https://boathire24.com'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

type SitemapEntry = MetadataRoute.Sitemap[number]

async function supabaseFetch<T>(path: string): Promise<T[]> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      Accept: 'application/json',
    },
    next: { revalidate: 3600 },
  })
  if (!res.ok) return []
  return res.json() as Promise<T[]>
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ── Static pages ────────────────────────────────────────────────────────────
  const staticPages: SitemapEntry[] = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/search`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/how-it-works`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/become-a-host`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
  ]

  // ── Blog posts (static from lib/blog/posts.ts) ───────────────────────────
  const blogEntries: SitemapEntry[] = POSTS.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  // ── Active boats ──────────────────────────────────────────────────────────
  const boats = await supabaseFetch<{
    slug: string
    updated_at: string
  }>('boats?select=slug,updated_at&status=eq.active')

  const boatEntries: SitemapEntry[] = boats.map((boat) => ({
    url: `${BASE_URL}/boats/${boat.slug}`,
    lastModified: new Date(boat.updated_at),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }))

  // ── Gallery images with slugs ─────────────────────────────────────────────
  // boat_images table has slug column added via migration
  const images = await supabaseFetch<{
    slug: string
  }>('boat_images?select=slug&slug=not.is.null&order=sort_order.asc')

  const galleryEntries: SitemapEntry[] = images
    .filter((img) => img.slug)
    .map((img) => ({
      url: `${BASE_URL}/gallery/${img.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

  // ── Tags (distinct from boats + images) ──────────────────────────────────
  const [boatTagRows, imageTagRows] = await Promise.all([
    supabaseFetch<{ tags: string[] }>('boats?select=tags&status=eq.active'),
    supabaseFetch<{ tags: string[] }>(
      'boat_images?select=tags&tags=not.is.null'
    ),
  ])

  const allTags = new Set<string>()
  for (const row of [...boatTagRows, ...imageTagRows]) {
    if (Array.isArray(row.tags)) {
      for (const tag of row.tags) {
        if (tag) allTags.add(tag)
      }
    }
  }

  const tagEntries: SitemapEntry[] = Array.from(allTags).map((tag) => ({
    url: `${BASE_URL}/tags/${encodeURIComponent(tag)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  // ── Location pages ────────────────────────────────────────────────────────
  const locations = await supabaseFetch<{ slug: string }>(
    'locations?select=slug'
  )

  const locationEntries: SitemapEntry[] = locations.map((loc) => ({
    url: `${BASE_URL}/${loc.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [
    ...staticPages,
    ...blogEntries,
    ...boatEntries,
    ...galleryEntries,
    ...tagEntries,
    ...locationEntries,
  ]
}
