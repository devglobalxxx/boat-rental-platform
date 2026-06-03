import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: booking } = await supabase
    .from('bookings')
    .select('id, status, stripe_payment_intent_id, boats(host_id)')
    .eq('id', id)
    .single()

  if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if ((booking.boats as any)?.host_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  if (booking.status !== 'pending') {
    return NextResponse.json({ error: 'Booking is not pending' }, { status: 400 })
  }

  // Approve = capture the held payment. (The webhook then books the date + emails the guest.)
  const piId = (booking as any).stripe_payment_intent_id as string | null
  if (piId) {
    try {
      const pi = await stripe.paymentIntents.retrieve(piId)
      if (pi.status === 'requires_capture') await stripe.paymentIntents.capture(piId)
    } catch (e: any) {
      return NextResponse.json({ error: `Could not capture payment: ${e?.message ?? 'Stripe error'}` }, { status: 500 })
    }
  }

  await supabase.from('bookings').update({ status: 'confirmed' }).eq('id', id)
  return NextResponse.redirect(new URL('/host/bookings', _req.url))
}
