import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import BoatCard from '@/components/search/BoatCard'
import Filters from '@/components/search/Filters'
import SearchBar from '@/components/search/SearchBar'
import type { BoatWithDetails } from '@/types/database'
import { MapPin } from 'lucide-react'

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
      profiles(id, full_name, avatar_url)
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
    // Search by location city/name
    const { data: locations } = await supabase
      .from('locations')
      .select('id')
      .ilike('city', `%${params.location}%`)
    if (locations && locations.length > 0) {
      query = query.in('location_id', locations.map((l) => l.id))
    }
  }

  const { data, error } = await query.limit(48)
  if (error || !data) return []

  // Add avg_rating and review_count (simplified — no join yet)
  return (data as any[]).map((b) => ({ ...b, avg_rating: 0, review_count: 0 })) as BoatWithDetails[]
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams
  const boats = await getBoats(params)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Search bar */}
      <div className="mb-6">
        <SearchBar
          defaultLocation={params.location ?? ''}
          defaultDate={params.date ?? ''}
          defaultGuests={Number(params.guests ?? 2)}
          compact
        />
      </div>

      {/* Filters */}
      <div className="mb-6">
        <Suspense>
          <Filters />
        </Suspense>
      </div>

      {/* Result count */}
      <div className="flex items-center gap-2 mb-6 text-sm text-slate-500">
        {params.location && (
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {params.location}
          </span>
        )}
        <span className="font-medium text-slate-900">{boats.length} boat{boats.length !== 1 ? 's' : ''}</span>
        {params.date && <span>on {new Date(params.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>}
      </div>

      {/* Results */}
      {boats.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">⚓</div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">No boats found</h2>
          <p className="text-slate-500">Try adjusting your filters or searching a different location.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {boats.map((boat) => (
            <BoatCard key={boat.id} boat={boat} />
          ))}
        </div>
      )}
    </div>
  )
}
