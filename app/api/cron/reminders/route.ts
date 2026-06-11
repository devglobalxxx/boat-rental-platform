import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendTripReminder, sendPaymentReminder } from '@/lib/email/bookings'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// Hourly reminders cron (secured by CRON_SECRET when set):
//   • Trip reminder    — confirmed bookings starting within the next 24h.
//   • Payment reminder — pending (unpaid) bookings 24h+ old (auto-cancelled at 48h
//     by /api/cron/expire-requests). Each reminder fires at most once via the
//     *_reminder_sent_at flags.
export async function GET(req: NextRequest) {
  if (process.env.CRON_SECRET && req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = Date.now()
  const in24h = new Date(now + 24 * 60 * 60 * 1000).toISOString()
  const nowIso = new Date(now).toISOString()
  const ago24h = new Date(now - 24 * 60 * 60 * 1000).toISOString()
  const ago48h = new Date(now - 48 * 60 * 60 * 1000).toISOString()

  let tripReminders = 0
  let paymentReminders = 0

  // ── Trip reminders: confirmed bookings starting in the next 24h, not yet reminded.
  const { data: upcoming, error: e1 } = await admin
    .from('bookings')
    .select('id')
    .eq('status', 'confirmed')
    .is('trip_reminder_sent_at', null)
    .gt('start_datetime', nowIso)
    .lte('start_datetime', in24h)
  if (e1) return NextResponse.json({ error: e1.message }, { status: 500 })

  for (const b of upcoming ?? []) {
    const id = (b as { id: string }).id
    // Claim first (idempotent even if the send is slow / the run overlaps).
    await admin.from('bookings').update({ trip_reminder_sent_at: new Date().toISOString() }).eq('id', id)
    await sendTripReminder(id)
    tripReminders++
  }

  // ── Payment reminders: pending bookings between 24h and 48h old, not yet reminded.
  const { data: unpaid, error: e2 } = await admin
    .from('bookings')
    .select('id')
    .eq('status', 'pending')
    .is('payment_reminder_sent_at', null)
    .lt('created_at', ago24h)
    .gt('created_at', ago48h)
  if (e2) return NextResponse.json({ error: e2.message }, { status: 500 })

  for (const b of unpaid ?? []) {
    const id = (b as { id: string }).id
    await admin.from('bookings').update({ payment_reminder_sent_at: new Date().toISOString() }).eq('id', id)
    await sendPaymentReminder(id)
    paymentReminders++
  }

  return NextResponse.json({ ok: true, tripReminders, paymentReminders })
}

// deploy: booking reminders cron (7154c3b)
