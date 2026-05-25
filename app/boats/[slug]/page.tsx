import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import Gallery from '@/components/listing/Gallery'
import Reviews from '@/components/listing/Reviews'
import AvailabilityCalendar from '@/components/listing/AvailabilityCalendar'
import BookingWidget from '@/components/booking/BookingWidget'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { formatPrice } from '@/lib/utils/pricing'
import { MapPin, Users, Ruler, Anchor, Star, Check, Waves } from 'lucide-react'
import type { BoatWithDetails } from '@/types/database'

const TYPE_LABELS: Record<string, string> = {
  motor_yacht: 'Motor yacht',
  catamaran: 'Catamaran',
  sailing: 'Sailing boat',
  speedboat: 'Speedboat',
  fishing: 'Fishing boat',
  rib: 'RIB',
  luxury: 'Luxury yacht',
}

async function getBoat(slug: string): Promise<BoatWithDetails | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('boats')
    .select(`
      *,
      boat_images(*),
      boat_pricing(*),
      boat_features(*),
      locations(*),
      profiles(id, full_name, avatar_url)
    `)
    .eq('slug', slug)
    .eq('status', 'active')
    .single()

  if (error || !data) return null
  return { ...(data as any), avg_rating: 0, review_count: 0 } as BoatWithDetails
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const boat = await getBoat(slug)
  if (!boat) return { title: 'Boat not found' }
  const lowestPrice = [...boat.boat_pricing].sort((a, b) => a.price - b.price)[0]
  return {
    title: `${boat.name} — ${TYPE_LABELS[boat.type] ?? boat.type} in ${boat.locations.city}`,
    description: boat.tagline ?? boat.description?.slice(0, 160) ?? '',
    openGraph: {
      title: boat.name,
      description: boat.tagline ?? '',
      images: boat.boat_images.find((i) => i.is_hero)
        ? [{ url: boat.boat_images.find((i) => i.is_hero)!.storage_url }]
        : [],
    },
  }
}

export default async function BoatDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const boat = await getBoat(slug)
  if (!boat) notFound()

  // Get reviews
  const { data: reviewsRaw } = await supabase
    .from('reviews')
    .select('*, profiles(full_name, avatar_url)')
    .eq('boat_id', boat.id)
    .eq('type', 'renter_review')
    .order('created_at', { ascending: false })
    .limit(12)
  const reviews = reviewsRaw as any[] | null

  // Get blocked/booked availability
  const { data: unavailabilityRaw } = await supabase
    .from('availability')
    .select('date, status')
    .eq('boat_id', boat.id)
    .in('status', ['blocked', 'booked'])
  const unavailability = unavailabilityRaw as { date: string; status: string }[] | null

  const blockedDates = (unavailability ?? []).map((a) => a.date)
  const avgRating = reviews && reviews.length > 0
    ? reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length
    : 0

  const sortedPricing = [...boat.boat_pricing].sort((a, b) => (a.duration_hours ?? 0) - (b.duration_hours ?? 0))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-slate-500 mb-4 flex items-center gap-1.5">
        <a href="/" className="hover:text-slate-700">Home</a>
        <span>/</span>
        <a href={`/${boat.locations.slug}`} className="hover:text-slate-700">{boat.locations.city}</a>
        <span>/</span>
        <span className="text-slate-900">{boat.name}</span>
      </nav>

      {/* Title row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{boat.name}</h1>
          {boat.tagline && <p className="text-slate-500 mt-1">{boat.tagline}</p>}
          <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
            {reviews && reviews.length > 0 && (
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-medium text-slate-900">{avgRating.toFixed(1)}</span>
                <span>({reviews.length} reviews)</span>
              </span>
            )}
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-[#06b6d4]" />
              {boat.locations.city}, {boat.locations.country}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="sea">{TYPE_LABELS[boat.type] ?? boat.type}</Badge>
          {boat.instant_book && <Badge variant="success">Instant book</Badge>}
        </div>
      </div>

      {/* Gallery */}
      <div className="mb-8">
        <Gallery images={boat.boat_images} boatName={boat.name} />
      </div>

      {/* Main content + sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          {/* Quick specs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-slate-50 rounded-xl">
              <Users className="w-6 h-6 text-[#06b6d4] mx-auto mb-1" />
              <div className="font-bold text-slate-900">{boat.capacity_pax}</div>
              <div className="text-xs text-slate-500">Guests</div>
            </div>
            {boat.length_m && (
              <div className="text-center p-4 bg-slate-50 rounded-xl">
                <Ruler className="w-6 h-6 text-[#06b6d4] mx-auto mb-1" />
                <div className="font-bold text-slate-900">{boat.length_m}m</div>
                <div className="text-xs text-slate-500">Length</div>
              </div>
            )}
            {boat.cabins && (
              <div className="text-center p-4 bg-slate-50 rounded-xl">
                <Anchor className="w-6 h-6 text-[#06b6d4] mx-auto mb-1" />
                <div className="font-bold text-slate-900">{boat.cabins}</div>
                <div className="text-xs text-slate-500">Cabins</div>
              </div>
            )}
            {boat.model_year && (
              <div className="text-center p-4 bg-slate-50 rounded-xl">
                <Waves className="w-6 h-6 text-[#06b6d4] mx-auto mb-1" />
                <div className="font-bold text-slate-900">{boat.model_year}</div>
                <div className="text-xs text-slate-500">Model year</div>
              </div>
            )}
          </div>

          {/* Inclusions */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4">What&apos;s included</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {boat.includes_skipper && (
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" /> Licensed skipper
                </div>
              )}
              {boat.includes_fuel && (
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" /> Fuel
                </div>
              )}
              {boat.includes_drinks && (
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" /> Drinks & snacks
                </div>
              )}
              {boat.boat_features.map((f) => (
                <div key={f.id} className="flex items-center gap-2 text-sm text-slate-700">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" /> {f.feature}
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Description */}
          {boat.description && (
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-3">About this boat</h2>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line">{boat.description}</p>
            </div>
          )}

          <Separator />

          {/* Pricing table */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Pricing</h2>
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left p-3 font-semibold text-slate-700">Duration</th>
                    <th className="text-right p-3 font-semibold text-slate-700">Price</th>
                    <th className="text-right p-3 font-semibold text-slate-700">Per hour</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedPricing.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 text-slate-700">
                        {p.duration_hours ? `${p.duration_hours} hours` : `${p.duration_days} day${p.duration_days !== 1 ? 's' : ''}`}
                      </td>
                      <td className="p-3 text-right font-semibold text-slate-900">
                        {formatPrice(p.price, p.currency)}
                      </td>
                      <td className="p-3 text-right text-slate-500">
                        {p.duration_hours ? formatPrice(Math.round(p.price / p.duration_hours), p.currency) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-slate-500 mt-2">All prices include a 15% platform service fee at checkout.</p>
          </div>

          <Separator />

          {/* Availability */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Availability</h2>
            <AvailabilityCalendar blockedDates={blockedDates} mode="view" />
          </div>

          <Separator />

          {/* Reviews */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-6">Reviews</h2>
            <Reviews reviews={(reviews as any) ?? []} avgRating={avgRating} />
          </div>

          {/* Host */}
          <Separator />
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Hosted by</h2>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#06b6d4] flex items-center justify-center text-white text-xl font-bold">
                {boat.profiles.full_name?.[0]?.toUpperCase() ?? 'H'}
              </div>
              <div>
                <div className="font-semibold text-slate-900">{boat.profiles.full_name ?? 'Host'}</div>
                <div className="text-sm text-slate-500">Verified host</div>
              </div>
            </div>
          </div>
        </div>

        {/* Booking widget */}
        <div>
          <BookingWidget boat={{ ...boat, avg_rating: avgRating, review_count: reviews?.length ?? 0 }} blockedDates={blockedDates} />
        </div>
      </div>

      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: boat.name,
            description: boat.description,
            image: boat.boat_images.find((i) => i.is_hero)?.storage_url,
            offers: sortedPricing.map((p) => ({
              '@type': 'Offer',
              price: p.price,
              priceCurrency: p.currency,
              availability: 'https://schema.org/InStock',
            })),
            ...(reviews && reviews.length > 0 ? {
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: avgRating.toFixed(1),
                reviewCount: reviews.length,
              },
            } : {}),
          }),
        }}
      />
    </div>
  )
}
