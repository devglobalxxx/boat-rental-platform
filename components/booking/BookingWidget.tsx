'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Users, Zap, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatPrice, calcFees } from '@/lib/utils/pricing'
import type { BoatWithDetails } from '@/types/database'
import { createClient } from '@/lib/supabase/client'

interface BookingWidgetProps {
  boat: BoatWithDetails
  blockedDates?: string[]
}

export default function BookingWidget({ boat, blockedDates = [] }: BookingWidgetProps) {
  const [date, setDate] = useState('')
  const [selectedPricingId, setSelectedPricingId] = useState<string>('')
  const [guests, setGuests] = useState(1)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const sortedPricing = [...boat.boat_pricing].sort((a, b) => (a.duration_hours ?? 0) - (b.duration_hours ?? 0))
  const selectedPricing = sortedPricing.find((p) => p.id === selectedPricingId) ?? sortedPricing[0]
  const fees = selectedPricing ? calcFees(selectedPricing.price) : null

  async function handleBook() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push(`/login?next=/boats/${boat.slug}/book`)
      return
    }
    if (!date || !selectedPricing) return
    setLoading(true)
    const params = new URLSearchParams({
      date,
      pricing_id: selectedPricing.id,
      guests: String(guests),
    })
    router.push(`/boats/${boat.slug}/book?${params.toString()}`)
  }

  return (
    <div className="sticky top-24 bg-white border border-slate-200 rounded-2xl p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          {sortedPricing[0] && (
            <span className="text-2xl font-bold text-slate-900">
              {formatPrice(sortedPricing[0].price, sortedPricing[0].currency)}
            </span>
          )}
          <span className="text-sm text-slate-500"> / {sortedPricing[0]?.duration_hours ? `${sortedPricing[0].duration_hours}h` : 'day'}</span>
        </div>
        {boat.instant_book && (
          <Badge variant="success"><Zap className="w-3 h-3" /> Instant book</Badge>
        )}
      </div>

      {/* Duration selector */}
      <div className="mb-4">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Duration</label>
        <div className="grid grid-cols-3 gap-2">
          {sortedPricing.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPricingId(p.id)}
              className={`py-2 px-3 rounded-xl text-sm font-medium border transition-all ${
                (selectedPricing?.id === p.id)
                  ? 'border-[#06b6d4] bg-[#06b6d4]/10 text-[#0891b2]'
                  : 'border-slate-200 text-slate-700 hover:border-slate-300'
              }`}
            >
              {p.duration_hours ? `${p.duration_hours}h` : `${p.duration_days}d`}
              <div className="text-xs text-slate-500 mt-0.5">{formatPrice(p.price, p.currency)}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Date */}
      <div className="mb-4">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">
          <Calendar className="w-3.5 h-3.5 inline mr-1" />Date
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#06b6d4]"
        />
      </div>

      {/* Guests */}
      <div className="mb-4">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">
          <Users className="w-3.5 h-3.5 inline mr-1" />Guests (max {boat.capacity_pax})
        </label>
        <div className="flex items-center gap-3 border border-slate-200 rounded-lg px-4 h-10">
          <button
            onClick={() => setGuests(Math.max(1, guests - 1))}
            className="text-slate-400 hover:text-slate-700 text-lg font-medium"
          >
            −
          </button>
          <span className="flex-1 text-center text-sm font-medium">{guests}</span>
          <button
            onClick={() => setGuests(Math.min(boat.capacity_pax, guests + 1))}
            className="text-slate-400 hover:text-slate-700 text-lg font-medium"
          >
            +
          </button>
        </div>
      </div>

      {/* Price breakdown */}
      {fees && (
        <div className="bg-slate-50 rounded-xl p-4 mb-4 space-y-2 text-sm">
          <div className="flex justify-between text-slate-700">
            <span>Charter fee</span>
            <span>{formatPrice(fees.subtotal, selectedPricing?.currency)}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Service fee (15%)</span>
            <span>{formatPrice(fees.serviceFee, selectedPricing?.currency)}</span>
          </div>
          <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-slate-200">
            <span>Total</span>
            <span>{formatPrice(fees.total, selectedPricing?.currency)}</span>
          </div>
        </div>
      )}

      <Button
        onClick={handleBook}
        variant="sea"
        size="lg"
        className="w-full"
        disabled={loading || !date}
      >
        {loading ? 'Loading...' : boat.instant_book ? 'Book now' : 'Request to book'}
      </Button>

      <p className="text-center text-xs text-slate-400 mt-3 flex items-center justify-center gap-1">
        <Shield className="w-3.5 h-3.5" />
        {boat.instant_book ? "You won't be charged yet" : 'No charge until confirmed'}
      </p>

      {/* Inclusions */}
      <div className="mt-4 pt-4 border-t border-slate-100 space-y-1">
        {boat.includes_skipper && <div className="text-xs text-slate-500 flex items-center gap-1.5">✓ Licensed skipper included</div>}
        {boat.includes_fuel && <div className="text-xs text-slate-500 flex items-center gap-1.5">✓ Fuel included</div>}
        {boat.includes_drinks && <div className="text-xs text-slate-500 flex items-center gap-1.5">✓ Drinks & snacks included</div>}
        {boat.boat_features.slice(0, 2).map((f) => (
          <div key={f.id} className="text-xs text-slate-500 flex items-center gap-1.5">✓ {f.feature}</div>
        ))}
      </div>
    </div>
  )
}
