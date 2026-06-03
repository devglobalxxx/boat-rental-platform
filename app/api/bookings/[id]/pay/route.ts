import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

// Guest pays for a request-first booking the host has accepted → fresh Stripe Checkout.
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL(`/login?next=/bookings/${id}`, req.url))

  const { data: b } = await supabase
    .from('bookings')
    .select('id, status, renter_id, total, currency, duration_hours, boats(name)')
    .eq('id', id)
    .single()

  if (!b || (b as { renter_id: string }).renter_id !== user.id) return NextResponse.redirect(new URL('/dashboard', req.url))
  if ((b as { status: string }).status !== 'pending') return NextResponse.redirect(new URL(`/bookings/${id}`, req.url))

  const boatName = (b.boats as { name?: string } | null)?.name ?? 'your charter'
  const dur = (b as { duration_hours: number | null }).duration_hours
  const total = (b as { total: number | null }).total ?? 0
  const currency = ((b as { currency: string | null }).currency ?? 'EUR').toLowerCase()

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{
      price_data: {
        currency,
        product_data: { name: `${boatName}${dur ? ` — ${dur}h charter` : ''}` },
        unit_amount: Math.round(total * 100),
      },
      quantity: 1,
    }],
    payment_intent_data: { metadata: { bookingId: id } },
    metadata: { bookingId: id },
    success_url: `https://boathire24.com/bookings/${id}?paid=1`,
    cancel_url: `https://boathire24.com/bookings/${id}`,
  })

  return NextResponse.redirect(session.url!, 303)
}
