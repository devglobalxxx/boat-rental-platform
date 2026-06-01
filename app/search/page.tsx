import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import BoatCard from '@/components/search/BoatCard'
import Filters from '@/components/search/Filters'
import SearchBar from '@/components/search/SearchBar'
import type { BoatWithDetails } from '@/types/database'
import { MapPin, Ship } from 'lucide-react'

interface SearchPageProps {
  searchParams: Promise<{
    location?: string
    date?: string
    guests?: string
    type?: string
    capacity?: string
    instant?: string
    sort?: string
  }>
}

async function getBoats(params: Awaited<SearchPageProps['searchParams']>): Promise<BoatWithDetails[]> {
  const supabase = await createClient()

  let query = supabase
    .from('boats')
    .select(`
      *,
      boat_images(*),
      boat_pricing(*),
      boat_features(*),
      locations(*),
      profiles(id, full_name, avatar_url, verification_status)
    `)
    .eq('status', 'active')

  if (params.type && params.type !== 'all') {
    query = query.eq('type', params.type as any)
  }
  if (params.instant === '1') {
    query = query.eq('instant_book', true)
  }
  if (params.capacity && params.capacity !== 'any') {
    const min = Number(params.capacity)
    query = query.gte('capacity_pax', min)
    if (min === 1) query = query.lte('capacity_pax', 4)
    else if (min === 5) query = query.lte('capacity_pax', 8)
    else if (min === 9) query = query.lte('capacity_pax', 12)
  }
  if (params.guests) {
    query = query.gte('capacity_pax', Number(params.guests))
  }
  if (params.location) {
    const term = params.location.trim()
    // Match against city, country, OR the location's display name
    const { data: locations } = await supabase
      .from('locations')
      .select('id')
      .or(`city.ilike.%${term}%,country.ilike.%${term}%,name.ilike.%${term}%`)
    if (locations && locations.length > 0) {
      query = query.in('location_id', locations.map((l) => l.id))
    } else {
      // Location was searched but matched nothing — return no boats
      // (previously this fell through and showed ALL boats).
      return []
    }
  }

  const { data, error } = await query.limit(48)
  if (error || !data) return []
  return (data as any[]).map((b) => ({ ...b, avg_rating: 0, review_count: 0 })) as BoatWithDetails[]
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams
  const boats = await getBoats(params)

  const hasFilters = params.location || params.type || params.capacity || params.instant || params.date

  return (
    <div style={{ background: '#07101e', color: '#f4f4f2', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 20px 80px' }}>

        {/* ── Search bar ── */}
        <div style={{ marginBottom: '16px' }}>
          <SearchBar
            defaultLocation={params.location ?? ''}
            defaultDate={params.date ?? ''}
            defaultGuests={Number(params.guests ?? 2)}
            compact
          />
        </div>

        {/* ── Filters ── */}
        <div style={{ marginBottom: '20px' }}>
          <Suspense>
            <Filters />
          </Suspense>
        </div>

        {/* ── Result meta ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {params.location && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: 'rgba(244,244,242,0.50)', background: 'rgba(201,168,78,0.08)', border: '1px solid rgba(201,168,78,0.18)', borderRadius: '99px', padding: '4px 12px' }}>
              <MapPin style={{ width: '12px', height: '12px' }} />
              {params.location}
            </span>
          )}
          {params.date && (
            <span style={{ fontSize: '13px', color: 'rgba(244,244,242,0.40)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '99px', padding: '4px 12px' }}>
              {new Date(params.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          )}
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#c9a84e', marginLeft: 'auto' }}>
            {boats.length} boat{boats.length !== 1 ? 's' : ''} available
          </span>
        </div>

        {/* ── Results ── */}
        {boats.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: '96px', paddingBottom: '96px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(201,168,78,0.10)', border: '1px solid rgba(201,168,78,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <Ship style={{ width: '32px', height: '32px', color: '#c9a84e' }} />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#f4f4f2', marginBottom: '12px' }}>No boats found</h2>
            <p style={{ fontSize: '15px', color: 'rgba(244,244,242,0.45)', maxWidth: '360px', margin: '0 auto 32px', lineHeight: 1.65 }}>
              Try adjusting your filters or searching a different location.
            </p>
            {hasFilters && (
              <a href="/search" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 28px', borderRadius: '99px', background: 'rgba(201,168,78,0.12)', border: '1px solid rgba(201,168,78,0.25)', color: '#c9a84e', fontWeight: 600, fontSize: '14px', textDecoration: 'none' }}>
                Clear all filters
              </a>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
            {boats.map((boat) => (
              <BoatCard key={boat.id} boat={boat} />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
