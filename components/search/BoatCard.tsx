'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Star, Users, Ruler, Anchor, Zap } from 'lucide-react'
import { formatPrice } from '@/lib/utils/pricing'
import type { BoatWithDetails } from '@/types/database'

interface BoatCardProps { boat: BoatWithDetails }

const TYPE_LABELS: Record<string, string> = {
  motor_yacht: 'Motor yacht',
  catamaran:   'Catamaran',
  sailing:     'Sailing boat',
  speedboat:   'Speedboat',
  fishing:     'Fishing boat',
  rib:         'RIB',
  luxury:      'Luxury yacht',
}

export default function BoatCard({ boat }: BoatCardProps) {
  const hero         = boat.boat_images.find((i) => i.is_hero) ?? boat.boat_images[0]
  const lowestPrice  = boat.boat_pricing.sort((a, b) => a.price - b.price)[0]
  const avgRating    = boat.avg_rating ?? 0
  const reviewCount  = boat.review_count ?? 0

  return (
    <Link href={`/boats/${boat.slug}`} className="group block">
      <div
        className="overflow-hidden transition-all duration-250"
        style={{
          background: '#0c1828',
          border: '1px solid rgba(201,168,78,0.18)',
          borderRadius: '14px',
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLDivElement
          el.style.borderColor = 'rgba(201,168,78,0.45)'
          el.style.boxShadow   = '0 24px 56px rgba(0,0,0,0.55)'
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLDivElement
          el.style.borderColor = 'rgba(201,168,78,0.18)'
          el.style.boxShadow   = 'none'
        }}
      >
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden" style={{ background: '#0a1420' }}>
          {hero ? (
            <Image
              src={hero.storage_url}
              alt={hero.alt ?? boat.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-400"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Anchor className="w-12 h-12" style={{ color: 'rgba(201,168,78,0.20)' }} />
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(7,16,30,0.55) 0%, transparent 50%)' }} />

          {/* Type badge */}
          <div className="absolute top-3 left-3">
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ background: '#c9a84e', color: '#07101e' }}
            >
              {TYPE_LABELS[boat.type] ?? boat.type}
            </span>
          </div>

          {/* Instant book */}
          {boat.instant_book && (
            <div className="absolute top-3 right-3">
              <span
                className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(7,16,30,0.80)', border: '1px solid rgba(201,168,78,0.35)', color: '#c9a84e', backdropFilter: 'blur(4px)' }}
              >
                <Zap className="w-3 h-3" /> Instant
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-bold truncate" style={{ color: '#f4f4f2' }}>{boat.name}</h3>
              <p className="text-sm truncate mt-0.5" style={{ color: 'rgba(244,244,242,0.50)' }}>
                {boat.locations.city}, {boat.locations.country}
              </p>
            </div>
            {reviewCount > 0 && (
              <div className="flex items-center gap-1 text-sm shrink-0">
                <Star className="w-3.5 h-3.5 fill-[#c9a84e] text-[#c9a84e]" />
                <span className="font-semibold" style={{ color: '#f4f4f2' }}>{avgRating.toFixed(1)}</span>
                <span style={{ color: 'rgba(244,244,242,0.40)' }}>({reviewCount})</span>
              </div>
            )}
          </div>

          {/* Specs */}
          <div className="flex items-center gap-4 mt-2.5 text-xs" style={{ color: 'rgba(244,244,242,0.50)' }}>
            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{boat.capacity_pax} guests</span>
            {boat.length_m && <span className="flex items-center gap-1"><Ruler className="w-3.5 h-3.5" />{boat.length_m}m</span>}
            {boat.includes_skipper && <span className="flex items-center gap-1" style={{ color: '#c9a84e' }}><Anchor className="w-3.5 h-3.5" />Skipper incl.</span>}
          </div>

          {/* Price */}
          {lowestPrice && (
            <div className="mt-3 pt-3 flex items-baseline gap-1" style={{ borderTop: '1px solid rgba(201,168,78,0.12)' }}>
              <span className="font-bold text-lg" style={{ color: '#c9a84e' }}>
                {formatPrice(lowestPrice.price, lowestPrice.currency)}
              </span>
              <span className="text-sm" style={{ color: 'rgba(244,244,242,0.45)' }}>
                / {lowestPrice.duration_hours ? `${lowestPrice.duration_hours}h` : `${(lowestPrice as any).duration_days} day`}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
