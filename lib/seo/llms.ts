import { ALL_POSTS } from '@/lib/blog/posts'
import { LANDING_PAGES } from '@/lib/landing/pages'

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
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/boats?select=name,type,capacity_pax,length_m,tags,boat_pricing(price)&status=eq.active&order=name.asc`,
    { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, Accept: 'application/json' }, cache: 'no-store' }
  )
  if (!res.ok) return []
  const raw = (await res.json()) as Array<{
    name: string; type: string; capacity_pax: number; length_m: number | null; tags: string[] | null; boat_pricing: Array<{ price: number }>
  }>
  return raw.map((b) => {
    const prices = b.boat_pricing?.map((p) => p.price) ?? []
    return { name: b.name, type: b.type, capacity_pax: b.capacity_pax, length_m: b.length_m, tags: b.tags, lowestPrice: prices.length ? Math.min(...prices) : null }
  })
}

function formatType(type: string): string {
  return type.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

// Builds the llms.txt body. `full: false` is a concise index (a few KB); `full: true` also
// dumps all landing pages (the heavy part) — served at /llms-full.txt for deep ingestion.
export async function buildLlms({ full }: { full: boolean }): Promise<string> {
  const fleet = await fetchFleet()
  const fleetLines = fleet.map((b) => {
    const type = formatType(b.type)
    const length = b.length_m ? `${b.length_m}m` : 'n/a'
    const price = b.lowestPrice ? `from €${b.lowestPrice.toLocaleString('en')}/2h` : 'price on request'
    const tags = Array.isArray(b.tags) && b.tags.length ? `. Tags: ${b.tags.slice(0, 5).join(', ')}` : ''
    return `- **${b.name}** — ${type}, ${b.capacity_pax} guests, ${length}, ${price}${tags}`
  })
  const editorialLines = ALL_POSTS.filter((p) => p.tag !== 'Boat review').map((p) => `- [${p.title}](/blog/${p.slug}) — ${p.excerpt.slice(0, 100)}…`)
  const reviewLines = ALL_POSTS.filter((p) => p.tag === 'Boat review').map((p) => `- [${p.title}](/blog/${p.slug}) — ${p.excerpt.slice(0, 90)}…`)

  const landingSection = full
    ? `## Charter & rental landing pages (by location and boat type)\n\n${LANDING_PAGES.map((p) => `- [${p.h1 || p.title}](/${p.slug}) — ${(p.metaDescription || '').slice(0, 100)}`).join('\n')}`
    : `## Charter & rental guides\n\n${LANDING_PAGES.length}+ location × boat-type guides (e.g. /boat-rental-marbella, /yacht-charter-puerto-banus, /catamaran-charter-marbella).\nFull machine-readable list: /llms-full.txt · /sitemap.xml`

  return `# BoatHire24 — Boat & Yacht Charter Marketplace

> Find and book verified boats, yachts, catamarans, and sailing boats worldwide. Licensed skippers, instant booking, secure payments.

## About

BoatHire24 is an online marketplace for boat charter in Marbella, Spain and beyond. All bookings include a licensed skipper, fuel, and drinks. Instant confirmation available on selected vessels.

**Platform:** boathire24.com
**Headquarters:** Marbella, Spain
**Service area:** Marbella, Ibiza, Miami and 45+ destinations globally
**Payment:** Stripe (card, Apple Pay, Google Pay) — funds held in escrow until charter day
**Pricing:** All-inclusive — listing price is the final price guests pay (no fees added at checkout). Platform takes 15% commission; hosts receive 85% as their payout.

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
- All listed prices are all-inclusive — no service fees or surcharges added at checkout

## Editorial content — Charter guides

${editorialLines.join('\n')}

## Boat reviews — Complete Marbella fleet

${reviewLines.join('\n')}

${landingSection}

## Key pages

- /search — Browse and filter all available boats
- /marbella — Marbella destination + fleet overview
- /blog — All charter guides and boat reviews
- /faq — Frequently asked questions (prices, licences, skippers, inclusions, booking)
- /how-it-works — Full platform explainer (renters + hosts)
- /become-a-host — Host onboarding and earnings info
- /llms.txt — This concise index (refreshed live)
- /llms-full.txt — Full index including all ${LANDING_PAGES.length} landing pages
- /sitemap.xml — Full XML sitemap
`
}
