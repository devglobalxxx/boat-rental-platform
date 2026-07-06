import type { MetadataRoute } from 'next'
import { ALL_POSTS } from '@/lib/blog/posts'
import { LANDING_PAGES } from '@/lib/landing/pages'
import { LANDING_PAGES_ES, hasEs } from '@/lib/landing/pages-es'
import { CATEGORIES } from '@/lib/landing/categories'

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
      // Hero videos → <video:video> entries so they're eligible for Google Video / video results.
      videos: [
        {
          title: 'Luxury yacht & boat charter — Marbella, Costa del Sol',
          thumbnail_loc: `${BASE_URL}/video/hero-1.jpg`,
          description: 'Charter motor yachts, catamarans and speedboats with BoatHire24 across Marbella and 45+ destinations — licensed skippers included.',
          content_loc: `${BASE_URL}/video/hero-1.mp4`,
        },
        {
          title: 'Rent a yacht on the Costa del Sol — BoatHire24',
          thumbnail_loc: `${BASE_URL}/video/hero-2.jpg`,
          description: 'Luxury boat and yacht rentals on the Costa del Sol with instant booking and verified listings.',
          content_loc: `${BASE_URL}/video/hero-2.mp4`,
        },
      ],
    },
    {
      url: `${BASE_URL}/search`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/fishing-trips`,
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
      url: `${BASE_URL}/faq`,
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

  // ── Blog posts (all 21: editorial + 17 boat reviews) ───────────────────────
  const blogEntries: SitemapEntry[] = ALL_POSTS.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: post.tag === 'Boat review' ? 0.8 : 0.6,  // boat reviews rank higher — direct transaction intent
  }))

  // ── Active boats (+ every photo as an <image:image> entry for Google Images) ──
  const boats = await supabaseFetch<{
    id: string
    slug: string
    updated_at: string
  }>('boats?select=id,slug,updated_at&status=eq.active')

  const boatPhotos = await supabaseFetch<{ boat_id: string; storage_url: string }>(
    'boat_images?select=boat_id,storage_url&order=sort_order.asc'
  )
  const photosByBoat = new Map<string, string[]>()
  for (const p of boatPhotos) {
    const arr = photosByBoat.get(p.boat_id) ?? []
    arr.push(p.storage_url)
    photosByBoat.set(p.boat_id, arr)
  }

  const boatEntries: SitemapEntry[] = boats.map((boat) => ({
    url: `${BASE_URL}/boats/${boat.slug}`,
    lastModified: new Date(boat.updated_at),
    changeFrequency: 'daily' as const,
    priority: 0.9,
    images: (photosByBoat.get(boat.id) ?? []).slice(0, 50),
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

  // ── Active-boat inventory (shared by the location + city×type sections) ──
  const catBoats = await supabaseFetch<{ location_id: string; type: string; is_fishing_trip: boolean }>(
    'boats?select=location_id,type,is_fishing_trip&status=eq.active'
  )
  const activeLocationIds = new Set(catBoats.map((b) => b.location_id))

  // ── Location pages — only cities with real inventory. Zero-boat locations
  // render a noindexed "coming soon" shell; submitting 360 of those to Google
  // is index-bloat that hurts the whole (new) domain.
  const locations = await supabaseFetch<{ id: string; slug: string }>(
    'locations?select=id,slug'
  )
  const locationEntries: SitemapEntry[] = locations
    .filter((loc) => activeLocationIds.has(loc.id))
    .map((loc) => ({
      url: `${BASE_URL}/${loc.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

  // ── City × type landing pages (only combos that actually have inventory) ──
  const locSlugById = new Map<string, string>()
  for (const l of locations) locSlugById.set(l.id, l.slug)

  const categoryCombos = new Set<string>() // `${locSlug}/${catSlug}`
  for (const b of catBoats) {
    const locSlug = locSlugById.get(b.location_id)
    if (!locSlug) continue
    for (const cat of CATEGORIES) {
      if (cat.types.includes(b.type) && !!b.is_fishing_trip === !!cat.fishing) {
        categoryCombos.add(`${locSlug}/${cat.slug}`)
      }
    }
  }
  const categoryEntries: SitemapEntry[] = Array.from(categoryCombos).map((path) => ({
    url: `${BASE_URL}/${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.85, // high-intent long-tail — the real ranking pages
  }))

  // ── Keyword landing pages (auto-generated) ────────────────────────────────
  // Only canonical pages belong in a sitemap: a URL whose own <link rel=canonical>
  // points elsewhere is a contradictory signal Google has to untangle.
  const landingEntries: SitemapEntry[] = LANDING_PAGES
    .filter((lp) => !lp.canonicalSlug || lp.canonicalSlug === lp.slug)
    .map((lp) => ({
      url: `${BASE_URL}/${lp.slug}`,
      lastModified: new Date(lp.date),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
      ...(hasEs(lp.slug) ? {
        alternates: { languages: { en: `${BASE_URL}/${lp.slug}`, 'es-ES': `${BASE_URL}/es/${lp.slug}` } },
      } : {}),
    }))

  // ── Spanish (es) landing pages ────────────────────────────────────────────
  const nonCanonicalEn = new Set(
    LANDING_PAGES.filter((lp) => lp.canonicalSlug && lp.canonicalSlug !== lp.slug).map((lp) => lp.slug),
  )
  const esLandingEntries: SitemapEntry[] = LANDING_PAGES_ES
    .filter((lp) => !nonCanonicalEn.has(lp.slug))
    .map((lp) => ({
    url: `${BASE_URL}/es/${lp.slug}`,
    lastModified: new Date(lp.date),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
    alternates: { languages: { en: `${BASE_URL}/${lp.slug}`, 'es-ES': `${BASE_URL}/es/${lp.slug}` } },
  }))

  return [
    ...staticPages,
    ...blogEntries,
    ...boatEntries,
    ...galleryEntries,
    ...tagEntries,
    ...locationEntries,
    ...categoryEntries,
    ...landingEntries,
    ...esLandingEntries,
  ]
}
