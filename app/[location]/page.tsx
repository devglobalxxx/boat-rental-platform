import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import BoatCard from '@/components/search/BoatCard'
import SearchBar from '@/components/search/SearchBar'
import { MapPin, Anchor, Ship } from 'lucide-react'
import type { BoatWithDetails, LocationRow } from '@/types/database'
import { getLandingPage, getLandingSlugs } from '@/lib/landing/pages'
import { hasEs } from '@/lib/landing/pages-es'
import LandingView from '@/components/landing/LandingView'

interface Props {
  params: Promise<{ location: string }>
}

// Pre-render the keyword landing pages at build; Supabase locations still resolve on-demand.
export async function generateStaticParams() {
  return getLandingSlugs().map((location) => ({ location }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { location } = await params
  const supabase = await createClient()
  const { data: locRaw } = await supabase
    .from('locations')
    .select('name, city, country, description')
    .eq('slug', location)
    .single()
  const loc = locRaw as Pick<LocationRow, 'name' | 'city' | 'country' | 'description'> | null
  if (loc) {
    return {
      title: `Boat Rental ${loc.city} — Yachts & Catamarans | BoatHire24`,
      description: loc.description ?? `Find and book boats in ${loc.city}, ${loc.country}. Motor yachts, catamarans, sailing boats and more.`,
    }
  }
  const lp = getLandingPage(location)
  if (lp) {
    return {
      title: lp.title,
      description: lp.metaDescription,
      alternates: {
        canonical: `https://boathire24.com/${lp.slug}`,
        ...(hasEs(lp.slug) ? {
          languages: {
            'en': `https://boathire24.com/${lp.slug}`,
            'es-ES': `https://boathire24.com/es/${lp.slug}`,
            'x-default': `https://boathire24.com/${lp.slug}`,
          },
        } : {}),
      },
      openGraph: {
        title: lp.title,
        description: lp.metaDescription,
        type: 'article',
        siteName: 'BoatHire24',
        ...(lp.heroImage ? { images: [{ url: lp.heroImage }] } : {}),
      },
      twitter: {
        card: 'summary_large_image',
        title: lp.title,
        description: lp.metaDescription,
        ...(lp.heroImage ? { images: [lp.heroImage] } : {}),
      },
    }
  }
  return { title: 'Page not found' }
}

export default async function LocationPage({ params }: Props) {
  const { location } = await params
  const supabase = await createClient()

  const { data: locDataRaw } = await supabase
    .from('locations')
    .select('*')
    .eq('slug', location)
    .single()
  const loc = locDataRaw as LocationRow | null
  if (!loc) {
    const lp = getLandingPage(location)
    if (lp) return <LandingView page={lp} />
    notFound()
  }

  const { data: rawBoats } = await supabase
    .from('boats')
    .select(`*, boat_images(*), boat_pricing(*), boat_features(*), locations(*), profiles(id, full_name, avatar_url)`)
    .eq('location_id', loc!.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  const boats: BoatWithDetails[] = ((rawBoats ?? []) as any[]).map((b) => ({
    ...b,
    avg_rating: 0,
    review_count: 0,
  })) as BoatWithDetails[]

  const gold = '#c9a84e'
  const goldFaint = 'rgba(201,168,78,0.12)'
  const goldBorder = 'rgba(201,168,78,0.22)'

  return (
    <div style={{ background: '#07101e', color: '#f4f4f2', minHeight: '100vh' }}>

      {/* ── Hero ── */}
      <section style={{ position: 'relative', height: '380px', overflow: 'hidden' }}>
        {loc.image_url ? (
          <img src={loc.image_url} alt={loc.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.45 }} />
        ) : (
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,#0a1a32,#071122)' }} />
        )}
        {/* Gradient overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(7,16,30,0.3) 0%, rgba(7,16,30,0.75) 100%)' }} />
        {/* Gold radial glow */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 60% at 50% 100%, rgba(201,168,78,0.10) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 24px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'rgba(244,244,242,0.65)', marginBottom: '14px' }}>
            <MapPin style={{ width: '13px', height: '13px' }} /> {loc.country}
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)', fontWeight: 800, color: '#f4f4f2', lineHeight: 1.1, marginBottom: '14px' }}>
            Boat Rental <span style={{ color: gold }}>{loc.city}</span>
          </h1>
          <p style={{ fontSize: '16px', color: 'rgba(244,244,242,0.62)', maxWidth: '540px', lineHeight: 1.65 }}>
            {loc.description ?? `Discover ${boats.length} verified boats in ${loc.city}. Instant book, licensed skipper included.`}
          </p>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <div style={{ borderBottom: '1px solid rgba(201,168,78,0.10)', background: 'rgba(201,168,78,0.04)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 24px', display: 'flex', gap: '36px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { value: `${boats.length}`, label: 'boats available' },
            { value: 'From €300', label: 'per half-day' },
            { value: '✓ Skipper', label: 'always included' },
            { value: 'Instant', label: 'confirmation' },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '16px', fontWeight: 700, color: gold, marginBottom: '2px' }}>{s.value}</p>
              <p style={{ fontSize: '12px', color: 'rgba(244,244,242,0.42)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Search + Results ── */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px 96px' }}>

        {/* Search bar */}
        <div style={{ marginBottom: '44px' }}>
          <SearchBar defaultLocation={loc.city} />
        </div>

        {/* Results header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#f4f4f2' }}>
            {boats.length > 0 ? (
              <>{boats.length} boat{boats.length !== 1 ? 's' : ''} in {loc.city}</>
            ) : (
              <>Coming soon to {loc.city}</>
            )}
          </h2>
          {boats.length > 0 && (
            <span style={{ fontSize: '13px', color: 'rgba(244,244,242,0.40)', background: goldFaint, border: `1px solid ${goldBorder}`, borderRadius: '99px', padding: '4px 14px' }}>
              All include licensed skipper
            </span>
          )}
        </div>

        {/* Boats grid or empty state */}
        {boats.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: '80px', paddingBottom: '80px' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: goldFaint, border: `1px solid ${goldBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <Ship style={{ width: '28px', height: '28px', color: gold }} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#f4f4f2', marginBottom: '10px' }}>
              Coming soon to {loc.city}
            </h3>
            <p style={{ fontSize: '15px', color: 'rgba(244,244,242,0.45)', maxWidth: '360px', margin: '0 auto 28px', lineHeight: 1.6 }}>
              We&apos;re onboarding boats in this destination. Check back soon — or explore another location.
            </p>
            <a href="/search" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '13px 28px', borderRadius: '99px', background: 'linear-gradient(135deg,#d4b05e,#c9a84e,#b8942e)', color: '#07101e', fontWeight: 700, fontSize: '14px', textDecoration: 'none' }}>
              Browse all destinations
            </a>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
            {boats.map((boat) => (
              <BoatCard key={boat.id} boat={boat} />
            ))}
          </div>
        )}
      </div>

      {/* Schema.org */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'TouristDestination',
            name: `Boat Rental ${loc.city}`,
            description: loc.description,
            geo: { '@type': 'GeoCoordinates', latitude: loc.lat, longitude: loc.lng },
          }),
        }}
      />
    </div>
  )
}
