import { NextResponse } from 'next/server'
import { ALL_POSTS } from '@/lib/blog/posts'

export const dynamic = 'force-dynamic'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

interface BoatRow {
  name: string
  type: string
  capacity_pax: number
  length_m: number | null
  tags: string[] | null
  lowestPrice: number | null
}

async function fetchFleet(): Promise<BoatRow[]> {
  // Fetch boats with their lowest pricing in a single query via Supabase REST
  const boatsRes = await fetch(
    `${SUPABASE_URL}/rest/v1/boats?select=name,type,capacity_pax,length_m,tags,boat_pricing(price,currency,duration_hours)&status=eq.active&order=name.asc`,
    {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
    }
  )

  if (!boatsRes.ok) return []

  const raw = (await boatsRes.json()) as Array<{
    name: string
    type: string
    capacity_pax: number
    length_m: number | null
    tags: string[] | null
    boat_pricing: Array<{ price: number; currency: string; duration_hours: number | null }>
  }>

  return raw.map((b) => {
    const prices = b.boat_pricing?.map((p) => p.price) ?? []
    const lowestPrice = prices.length > 0 ? Math.min(...prices) : null
    // Find duration_hours for the cheapest price entry
    const cheapestEntry = b.boat_pricing?.find((p) => p.price === lowestPrice)
    return {
      name: b.name,
      type: b.type,
      capacity_pax: b.capacity_pax,
      length_m: b.length_m,
      tags: b.tags,
      lowestPrice,
      lowestDuration: cheapestEntry?.duration_hours ?? null,
    }
  }) as BoatRow[]
}

function formatType(type: string): string {
  return type
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export async function GET(): Promise<NextResponse> {
  const fleet = await fetchFleet()

  const fleetLines = fleet.map((boat) => {
    const type = formatType(boat.type)
    const length = boat.length_m ? `${boat.length_m}m` : 'n/a'
    const price = boat.lowestPrice
      ? `from €${boat.lowestPrice.toLocaleString('en')}/2h`
      : 'price on request'
    const tags =
      Array.isArray(boat.tags) && boat.tags.length > 0
        ? `Tags: ${boat.tags.slice(0, 5).join(', ')}`
        : ''
    return `- **${boat.name}** — ${type}, ${boat.capacity_pax} guests, ${length}, ${price}${tags ? `. ${tags}` : ''}`
  })

  // Blog posts grouped by type
  const editorialPosts = ALL_POSTS.filter((p) => p.tag !== 'Boat review')
  const boatReviews    = ALL_POSTS.filter((p) => p.tag === 'Boat review')

  const editorialLines = editorialPosts.map(
    (p) => `- [${p.title}](/blog/${p.slug}) — ${p.excerpt.slice(0, 100)}…`
  )
  const reviewLines = boatReviews.map(
    (p) => `- [${p.title}](/blog/${p.slug}) — ${p.excerpt.slice(0, 90)}…`
  )

  const body = `# BoatHire24 — Boat & Yacht Charter Marketplace

> Find and book verified boats, yachts, catamarans, and sailing boats worldwide. Licensed skippers, instant booking, secure payments.

## About

BoatHire24 is an online marketplace for boat charter in Marbella, Spain and beyond. All bookings include a licensed skipper, fuel, and drinks. Instant confirmation available on selected vessels.

**Platform:** boathire24.com
**Headquarters:** Marbella, Spain
**Service area:** Marbella, Ibiza, Miami and 45+ destinations globally
**Payment:** Stripe (card, Apple Pay, Google Pay) — funds held in escrow until charter day
**Commission:** 15% service fee; hosts keep 85%

## Fleet (Marbella / Puerto Banús)

${fleetLines.join('\n')}

## Locations

- Marbella, Spain (Puerto Banús marina) — ${fleet.length} vessel${fleet.length !== 1 ? 's' : ''} active
- Ibiza, Spain — 24+ vessels (coming soon)
- Miami, USA — 30+ vessels (coming soon)

## What's always included

Every BoatHire24 charter includes: licensed skipper, fuel, drinks (water, soft drinks, beer, white wine, cava), light snacks, full insurance, safety equipment, and VAT.

## How booking works

1. Search by location, date, and guest count at /search
2. Choose duration (2 hours minimum, up to full day or multi-day)
3. Instant book (confirms immediately) or request-to-book (host has 24h)
4. Secure payment via Stripe — held in escrow until 24h after charter
5. Receive confirmation with captain's number and marina coordinates
6. Meet your licensed skipper at the marina and set sail

## Pricing

- Entry level (licence-free day boat): €230 / 2 hours
- Standard 12 m motor yacht: €749–€2,299 (2–8 hours)
- Mid-size (14–17 m): priced on request
- Flagship 24 m superyacht: from €4,719 / 4 hours
- A 15% service fee applies to all bookings

## Editorial content — Charter guides

${editorialLines.join('\n')}

## Boat reviews — Complete Marbella fleet

${reviewLines.join('\n')}

## Key pages

- /search — Browse and filter all available boats
- /marbella — Marbella destination + fleet overview
- /blog — All charter guides and boat reviews
- /how-it-works — Full platform explainer (renters + hosts)
- /become-a-host — Host onboarding and earnings info
- /llms.txt — This file (machine-readable index, refreshed live)
- /sitemap.xml — Full XML sitemap
`

  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}
