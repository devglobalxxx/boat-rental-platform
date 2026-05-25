import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import BoatCard from '@/components/search/BoatCard'
import SearchBar from '@/components/search/SearchBar'
import { MapPin, Anchor } from 'lucide-react'
import type { BoatWithDetails, LocationRow } from '@/types/database'

interface Props {
  params: Promise<{ location: string }>
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

  if (!loc) return { title: 'Location not found' }
  return {
    title: `Boat Rental ${loc.city} — Yachts & Catamarans`,
    description: loc.description ?? `Find and book boats in ${loc.city}, ${loc.country}. Motor yachts, catamarans, sailing boats and more.`,
  }
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

  if (!loc) notFound()

  const { data: rawBoats } = await supabase
    .from('boats')
    .select(`
      *,
      boat_images(*),
      boat_pricing(*),
      boat_features(*),
      locations(*),
      profiles(id, full_name, avatar_url)
    `)
    .eq('location_id', loc!.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  const boats: BoatWithDetails[] = ((rawBoats ?? []) as any[]).map((b) => ({
    ...b,
    avg_rating: 0,
    review_count: 0,
  })) as BoatWithDetails[]

  return (
    <div>
      {/* Hero */}
      <div className="relative h-64 sm:h-80 bg-[#0a1a32] overflow-hidden">
        {loc.image_url && (
          <img src={loc.image_url} alt={loc.name} className="w-full h-full object-cover opacity-50" />
        )}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4">
          <div className="flex items-center gap-2 text-white/70 text-sm mb-2">
            <MapPin className="w-4 h-4" /> {loc.country}
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold">Boat Rental {loc.city}</h1>
          <p className="mt-3 text-white/70 max-w-xl">
            {loc.description ?? `Discover ${boats.length} verified boats in ${loc.city}. Instant book, skipper included.`}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="mb-8">
          <SearchBar defaultLocation={loc.city} />
        </div>

        {/* Boats */}
        {boats.length === 0 ? (
          <div className="text-center py-20">
            <Anchor className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Coming soon to {loc.city}</h2>
            <p className="text-slate-500">We&apos;re onboarding boats in this destination. Check back soon!</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">
                {boats.length} boat{boats.length !== 1 ? 's' : ''} in {loc.city}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {boats.map((boat) => (
                <BoatCard key={boat.id} boat={boat} />
              ))}
            </div>
          </>
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
