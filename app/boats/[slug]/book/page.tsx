'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { formatPrice, calcFees } from '@/lib/utils/pricing'
import { Shield, ArrowLeft, Calendar, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface BookingMeta {
  boatName: string
  boatSlug: string
  heroUrl?: string
  price: number
  currency: string
  duration: string
  date: string
  guests: number
  pricingId: string
  clientSecret?: string
  bookingId?: string
}

function CheckoutForm({ meta, onSuccess }: { meta: BookingMeta; onSuccess: (id: string) => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fees = calcFees(meta.price)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return
    setLoading(true)
    setError(null)

    const { error: submitErr } = await elements.submit()
    if (submitErr) { setError(submitErr.message ?? 'Payment failed'); setLoading(false); return }

    const { error: confirmErr, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/bookings/${meta.bookingId}?confirmed=1`,
      },
      redirect: 'if_required',
    })

    if (confirmErr) {
      setError(confirmErr.message ?? 'Payment failed')
      setLoading(false)
    } else if (paymentIntent?.status === 'succeeded' && meta.bookingId) {
      onSuccess(meta.bookingId)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
        <div className="flex justify-between text-slate-700">
          <span>Charter fee</span>
          <span>{formatPrice(fees.subtotal, meta.currency)}</span>
        </div>
        <div className="flex justify-between text-slate-500">
          <span>Service fee (15%)</span>
          <span>{formatPrice(fees.serviceFee, meta.currency)}</span>
        </div>
        <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-slate-200">
          <span>Total due today</span>
          <span>{formatPrice(fees.total, meta.currency)}</span>
        </div>
      </div>

      <PaymentElement />

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}

      <Button type="submit" variant="sea" size="lg" className="w-full" disabled={loading || !stripe}>
        {loading ? 'Processing…' : `Pay ${formatPrice(fees.total, meta.currency)}`}
      </Button>

      <p className="text-center text-xs text-slate-400 flex items-center justify-center gap-1">
        <Shield className="w-3.5 h-3.5" /> Secured by Stripe — your card details are never stored
      </p>
    </form>
  )
}

export default function BookPage() {
  const { slug } = useParams<{ slug: string }>()
  const params = useSearchParams()
  const router = useRouter()
  const supabase = createClient()

  const [meta, setMeta] = useState<BookingMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push(`/login?next=/boats/${slug}/book?${params.toString()}`); return }

      const date = params.get('date') ?? ''
      const pricingId = params.get('pricing_id') ?? ''
      const guests = Number(params.get('guests') ?? 1)

      // Fetch boat + pricing
      const { data: boat } = await supabase
        .from('boats')
        .select('id, name, slug, boat_images(storage_url, is_hero), boat_pricing(*), profiles(stripe_account_id)')
        .eq('slug', slug)
        .single()

      if (!boat) { setError('Boat not found'); setLoading(false); return }

      const pricing = (boat.boat_pricing as any[]).find((p: any) => p.id === pricingId) ?? (boat.boat_pricing as any[])[0]
      if (!pricing) { setError('Pricing not found'); setLoading(false); return }

      const hero = (boat.boat_images as any[]).find((i: any) => i.is_hero) ?? (boat.boat_images as any[])[0]

      // Create booking + payment intent
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boatId: boat.id, pricingId: pricing.id, date, guests }),
      })

      if (!res.ok) { setError('Could not create booking'); setLoading(false); return }
      const { clientSecret, bookingId } = await res.json()

      setMeta({
        boatName: boat.name,
        boatSlug: slug,
        heroUrl: hero?.storage_url,
        price: pricing.price,
        currency: pricing.currency ?? 'EUR',
        duration: pricing.duration_hours ? `${pricing.duration_hours}h` : `${pricing.duration_days} day(s)`,
        date,
        guests,
        pricingId: pricing.id,
        clientSecret,
        bookingId,
      })
      setLoading(false)
    }
    init()
  }, [slug, params])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-500">Loading checkout…</div>
      </div>
    )
  }

  if (error || !meta?.clientSecret) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error ?? 'Something went wrong'}</p>
          <Button onClick={() => router.back()}>Go back</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <h1 className="text-2xl font-bold text-slate-900 mb-6">Confirm your booking</h1>

      {/* Booking summary */}
      <div className="flex gap-4 p-4 bg-slate-50 rounded-2xl mb-8">
        {meta.heroUrl && (
          <img src={meta.heroUrl} alt={meta.boatName} className="w-20 h-20 rounded-xl object-cover shrink-0" />
        )}
        <div>
          <div className="font-bold text-slate-900">{meta.boatName}</div>
          <div className="flex items-center gap-3 mt-1.5 text-sm text-slate-500">
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {meta.date}</span>
            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {meta.guests} guests</span>
          </div>
          <div className="text-sm text-slate-500 mt-1">Duration: {meta.duration}</div>
        </div>
      </div>

      {/* Stripe Elements */}
      <Elements
        stripe={stripePromise}
        options={{
          clientSecret: meta.clientSecret,
          appearance: {
            theme: 'stripe',
            variables: { colorPrimary: '#06b6d4', borderRadius: '8px' },
          },
        }}
      >
        <CheckoutForm
          meta={meta}
          onSuccess={(id) => router.push(`/bookings/${id}?confirmed=1`)}
        />
      </Elements>
    </div>
  )
}
