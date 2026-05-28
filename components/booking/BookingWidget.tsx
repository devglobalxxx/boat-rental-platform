'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Users, Zap, Shield } from 'lucide-react'
import { formatPrice, calcFees } from '@/lib/utils/pricing'
import type { BoatWithDetails } from '@/types/database'
import { createClient } from '@/lib/supabase/client'

const gold = '#c9a84e'
const card = '#0c1828'
const border = 'rgba(201,168,78,0.15)'
const goldBorder = 'rgba(201,168,78,0.22)'
const goldFaint = 'rgba(201,168,78,0.10)'
const text = '#f4f4f2'
const muted = 'rgba(244,244,242,0.55)'
const dim = 'rgba(244,244,242,0.35)'
const inputBg = 'rgba(255,255,255,0.05)'
const inputBorder = 'rgba(255,255,255,0.14)'

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
    <div style={{ position: 'sticky', top: '96px', background: card, border: `1px solid ${border}`, borderRadius: '20px', padding: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.40)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          {sortedPricing[0] && (
            <>
              <span style={{ fontSize: '24px', fontWeight: 800, color: text }}>{formatPrice(sortedPricing[0].price, sortedPricing[0].currency)}</span>
              <span style={{ fontSize: '13px', color: muted }}> / {sortedPricing[0]?.duration_hours ? `${sortedPricing[0].duration_hours}h` : 'day'}</span>
            </>
          )}
        </div>
        {boat.instant_book && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '99px', background: 'rgba(34,197,94,0.12)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.30)' }}>
            <Zap style={{ width: 11, height: 11 }} /> Instant book
          </span>
        )}
      </div>

      {/* Duration selector */}
      <div style={{ marginBottom: '18px' }}>
        <label style={{ fontSize: '11px', fontWeight: 700, color: muted, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '10px' }}>Duration</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          {sortedPricing.map((p) => {
            const isSelected = selectedPricing?.id === p.id
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPricingId(p.id)}
                style={{ padding: '9px 8px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, border: `1px solid ${isSelected ? goldBorder : inputBorder}`, background: isSelected ? goldFaint : inputBg, color: isSelected ? gold : muted, cursor: 'pointer', transition: 'all 0.15s', textAlign: 'center' }}
              >
                {p.duration_hours ? `${p.duration_hours}h` : `${(p as any).duration_days}d`}
                <div style={{ fontSize: '11px', color: isSelected ? gold : dim, marginTop: '2px' }}>{formatPrice(p.price, p.currency)}</div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Date */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ fontSize: '11px', fontWeight: 700, color: muted, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
          <Calendar style={{ width: 12, height: 12 }} />Date
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          style={{ width: '100%', height: '42px', borderRadius: '10px', border: `1px solid ${inputBorder}`, background: inputBg, padding: '0 12px', fontSize: '14px', color: text, outline: 'none', transition: 'border-color 0.15s', colorScheme: 'dark', boxSizing: 'border-box' }}
          onFocus={(e) => { e.target.style.borderColor = goldBorder }}
          onBlur={(e) => { e.target.style.borderColor = inputBorder }}
        />
      </div>

      {/* Guests */}
      <div style={{ marginBottom: '18px' }}>
        <label style={{ fontSize: '11px', fontWeight: 700, color: muted, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
          <Users style={{ width: 12, height: 12 }} />Guests (max {boat.capacity_pax})
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', border: `1px solid ${inputBorder}`, borderRadius: '10px', padding: '0 14px', height: '42px', background: inputBg }}>
          <button
            onClick={() => setGuests(Math.max(1, guests - 1))}
            style={{ color: muted, background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', fontWeight: 500, padding: 0, lineHeight: 1 }}
          >
            −
          </button>
          <span style={{ flex: 1, textAlign: 'center', fontSize: '14px', fontWeight: 600, color: text }}>{guests}</span>
          <button
            onClick={() => setGuests(Math.min(boat.capacity_pax, guests + 1))}
            style={{ color: muted, background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', fontWeight: 500, padding: 0, lineHeight: 1 }}
          >
            +
          </button>
        </div>
      </div>

      {/* Price breakdown */}
      {fees && (
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '14px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: muted }}>
            <span>Charter fee</span>
            <span>{formatPrice(fees.subtotal, selectedPricing?.currency)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: dim }}>
            <span>Service fee (15%)</span>
            <span>{formatPrice(fees.serviceFee, selectedPricing?.currency)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 800, color: gold, paddingTop: '8px', borderTop: `1px solid ${border}` }}>
            <span>Total</span>
            <span>{formatPrice(fees.total, selectedPricing?.currency)}</span>
          </div>
        </div>
      )}

      <button
        onClick={handleBook}
        disabled={loading || !date}
        style={{ width: '100%', padding: '14px', borderRadius: '99px', fontSize: '15px', fontWeight: 700, cursor: loading || !date ? 'not-allowed' : 'pointer', background: 'linear-gradient(135deg, #d4b05e 0%, #c9a84e 60%, #b8942e 100%)', color: '#07101e', border: 'none', boxShadow: '0 4px 18px rgba(201,168,78,0.25)', opacity: loading || !date ? 0.6 : 1, transition: 'opacity 0.15s' }}
      >
        {loading ? 'Loading...' : boat.instant_book ? 'Book now' : 'Request to book'}
      </button>

      <p style={{ textAlign: 'center', fontSize: '12px', color: dim, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginTop: '10px' }}>
        <Shield style={{ width: 12, height: 12 }} />
        {boat.instant_book ? "You won't be charged yet" : 'No charge until confirmed'}
      </p>

      {/* Inclusions */}
      {(boat.includes_skipper || boat.includes_fuel || boat.includes_drinks || boat.boat_features.length > 0) && (
        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {boat.includes_skipper && <div style={{ fontSize: '12px', color: muted, display: 'flex', alignItems: 'center', gap: '6px' }}>✓ Licensed skipper included</div>}
          {boat.includes_fuel && <div style={{ fontSize: '12px', color: muted, display: 'flex', alignItems: 'center', gap: '6px' }}>✓ Fuel included</div>}
          {boat.includes_drinks && <div style={{ fontSize: '12px', color: muted, display: 'flex', alignItems: 'center', gap: '6px' }}>✓ Drinks & snacks included</div>}
          {boat.boat_features.slice(0, 2).map((f) => (
            <div key={f.id} style={{ fontSize: '12px', color: muted, display: 'flex', alignItems: 'center', gap: '6px' }}>✓ {f.feature}</div>
          ))}
        </div>
      )}
    </div>
  )
}
