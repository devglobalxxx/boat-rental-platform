import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { sendHostQuoteRequest, sendBookerQuoteReceived } from '@/lib/email/bookings'
import { parseISO, addHours } from 'date-fns'

const admin = createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// Logged-in guest asks for a price on an unpriced boat. We already know who they are,
// so there's no name/email field: we save the request (it shows in My Trips), notify the
// owner (email + WhatsApp), and email the guest an immediate confirmation. No card taken.
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { boatId, date, time, hours, guests, message } = await req.json()
    if (!boatId) return NextResponse.json({ error: 'Missing boat' }, { status: 400 })

    const { data: boatRow } = await admin.from('boats').select('id, name, min_hours').eq('id', boatId).single()
    if (!boatRow) return NextResponse.json({ error: 'Boat not found' }, { status: 404 })
    const dur = Number(hours) > 0 ? Number(hours) : ((boatRow as { min_hours: number | null }).min_hours || 4)

    const t = typeof time === 'string' && /^\d{2}:\d{2}$/.test(time) ? time : '09:00'
    let start = new Date()
    if (date) { try { const p = parseISO(`${String(date)}T${t}:00`); if (!isNaN(p.getTime())) start = p } catch { /* keep now */ } }

    const note = 'Price on request — quote' + (message ? ` · ${String(message).slice(0, 800)}` : '')
    const { data: booking, error } = await admin.from('bookings').insert({
      boat_id: boatId,
      renter_id: user.id,
      start_datetime: start.toISOString(),
      end_datetime: addHours(start, dur).toISOString(),
      duration_hours: dur,
      guests_count: Number(guests) || 1,
      // CHECK constraints require subtotal/total > 0; these are placeholders — a quote
      // has no price. It's identified everywhere by the "Price on request" special_requests
      // marker (see isQuote helpers), so the €1 is never shown.
      subtotal: 1, service_fee: 0, total: 1, currency: 'EUR',
      status: 'pending',
      special_requests: note,
    }).select('id').single()
    if (error || !booking) return NextResponse.json({ error: 'Could not create request' }, { status: 500 })

    const meta = (user.user_metadata as Record<string, unknown>) || {}
    const name = (meta.full_name as string) || user.email?.split('@')[0] || 'Guest'
    try {
      await sendHostQuoteRequest({
        boatId,
        name,
        email: user.email || undefined,
        phone: (meta.phone as string) || undefined,
        date: date ? String(date) : undefined,
        guests: Number(guests) || undefined,
        message: [`Preferred start ${t} · ${dur}h`, message ? String(message) : null].filter(Boolean).join(' — ').slice(0, 1000),
      })
      await sendBookerQuoteReceived((booking as { id: string }).id)
    } catch { /* best-effort notifications — never fail the request on these */ }

    return NextResponse.json({ ok: true, bookingId: (booking as { id: string }).id })
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
