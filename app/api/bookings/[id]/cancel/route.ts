import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { stripe } from '@/lib/stripe'

const admin = createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// Guest cancels their own request. Only an un-paid booking (status 'pending' — whether still
// awaiting the owner or accepted-awaiting-payment) can be cancelled here; a confirmed/paid trip
// needs the refund flow, not this. We verify the caller actually owns the booking, release any
// card hold, and mark it cancelled.
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: booking } = await admin
    .from('bookings')
    .select('id, status, renter_id, stripe_payment_intent_id')
    .eq('id', id)
    .single()

  if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if ((booking as { renter_id: string }).renter_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  // Already paid/confirmed (or already cancelled) — bounce back, nothing to do here.
  if (booking.status !== 'pending') {
    return NextResponse.redirect(new URL('/dashboard', _req.url))
  }

  // Release any real card hold (PaymentIntent). A 'cs_' checkout-session id just expires on its own.
  const piId = (booking as { stripe_payment_intent_id: string | null }).stripe_payment_intent_id
  if (piId && piId.startsWith('pi_')) {
    try {
      const pi = await stripe.paymentIntents.retrieve(piId)
      const cancelable = ['requires_capture', 'requires_payment_method', 'requires_confirmation', 'requires_action']
      if (cancelable.includes(pi.status)) await stripe.paymentIntents.cancel(piId)
    } catch { /* ignore — proceed to mark cancelled */ }
  }

  await admin.from('bookings').update({ status: 'cancelled' }).eq('id', id)
  return NextResponse.redirect(new URL('/dashboard', _req.url))
}
