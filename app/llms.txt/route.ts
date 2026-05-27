import { NextResponse } from 'next/server'

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

  const body = `# BoatAway — Boat & Yacht Charter Marketplace

> Find and book verified boats, yachts, catamarans, and sailing boats worldwide. Licensed skippers, instant booking, secure payments.

## About

BoatAway is an online marketplace for boat charter in Marbella, Spain and beyond. All bookings include a licensed skipper, fuel, and drinks. Instant confirmation available on selected vessels.

## Fleet (Marbella / Puerto Banús)

${fleetLines.join('\n')}

## Locations

- Marbella, Spain (Puerto Banús marina) — ${fleet.length} vessel${fleet.length !== 1 ? 's' : ''} available

## How booking works

1. Search by location, date, and guest count
2. Choose duration (2–8 hours or full day)
3. Instant book or request-to-book
4. Secure payment via Stripe
5. Meet your licensed skipper at Puerto Banús marina

## Pricing

Boats start from €230/2h (entry-level speedboats) to €4,719/day (superyachts).
A 15% service fee applies. All prices include skipper, fuel, and drinks.

## Links

- /search — Browse all available boats
- /marbella — Marbella fleet page
- /blog — Charter guides and destination articles
- /how-it-works — Platform overview
- /llms.txt — This file (machine-readable fleet index)
`

  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}
