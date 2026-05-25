import Link from 'next/link'
import Image from 'next/image'
import { Star, Users, Ruler, Anchor, Zap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils/pricing'
import type { BoatWithDetails } from '@/types/database'

interface BoatCardProps {
  boat: BoatWithDetails
}

const TYPE_LABELS: Record<string, string> = {
  motor_yacht: 'Motor yacht',
  catamaran: 'Catamaran',
  sailing: 'Sailing boat',
  speedboat: 'Speedboat',
  fishing: 'Fishing boat',
  rib: 'RIB',
  luxury: 'Luxury yacht',
}

export default function BoatCard({ boat }: BoatCardProps) {
  const hero = boat.boat_images.find((i) => i.is_hero) ?? boat.boat_images[0]
  const lowestPrice = boat.boat_pricing.sort((a, b) => a.price - b.price)[0]
  const avgRating = boat.avg_rating ?? 0
  const reviewCount = boat.review_count ?? 0

  return (
    <Link href={`/boats/${boat.slug}`} className="group block">
      <div className="rounded-2xl overflow-hidden border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-200 bg-white">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
          {hero ? (
            <Image
              src={hero.storage_url}
              alt={hero.alt ?? boat.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
              <Anchor className="w-12 h-12 text-slate-300" />
            </div>
          )}
          <div className="absolute top-3 left-3">
            <Badge variant="sea">{TYPE_LABELS[boat.type] ?? boat.type}</Badge>
          </div>
          {boat.instant_book && (
            <div className="absolute top-3 right-3">
              <Badge variant="success"><Zap className="w-3 h-3" /> Instant</Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-slate-900 truncate">{boat.name}</h3>
              <p className="text-sm text-slate-500 truncate mt-0.5">
                {boat.locations.city}, {boat.locations.country}
              </p>
            </div>
            {reviewCount > 0 && (
              <div className="flex items-center gap-1 text-sm shrink-0">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="font-medium">{avgRating.toFixed(1)}</span>
                <span className="text-slate-400">({reviewCount})</span>
              </div>
            )}
          </div>

          {/* Specs */}
          <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {boat.capacity_pax} guests
            </span>
            {boat.length_m && (
              <span className="flex items-center gap-1">
                <Ruler className="w-3.5 h-3.5" />
                {boat.length_m}m
              </span>
            )}
            {boat.includes_skipper && (
              <span className="flex items-center gap-1">
                <Anchor className="w-3.5 h-3.5 text-[#06b6d4]" />
                Skipper incl.
              </span>
            )}
          </div>

          {/* Price */}
          {lowestPrice && (
            <div className="mt-3 pt-3 border-t border-slate-100">
              <span className="font-bold text-slate-900">
                {formatPrice(lowestPrice.price, lowestPrice.currency)}
              </span>
              <span className="text-sm text-slate-500">
                {' '}/ {lowestPrice.duration_hours ? `${lowestPrice.duration_hours}h` : `${lowestPrice.duration_days} day${lowestPrice.duration_days !== 1 ? 's' : ''}`}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
