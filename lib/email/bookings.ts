import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'
import { sendWhatsApp } from '@/lib/whatsapp'
import { stripe } from '@/lib/stripe'

const resend = new Resend(process.env.RESEND_API_KEY)
const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
const FROM = process.env.RESEND_FROM_EMAIL || 'BoatHire24 <info@boathire24.com>'
const SITE = 'https://boathire24.com'

async function emailOf(userId: string): Promise<string | null> {
  try { const { data } = await admin.auth.admin.getUserById(userId); return data.user?.email ?? null } catch { return null }
}

// Reads phone from auth user_metadata (set on the Settings page — no schema
// change needed). Returns null if absent, so WhatsApp simply no-ops until a
// number (and Twilio creds) are in place.
async function phoneOf(userId: string): Promise<string | null> {
  try { const { data } = await admin.auth.admin.getUserById(userId); return ((data.user?.user_metadata as any)?.phone as string | undefined)?.trim() || null } catch { return null }
}

type B = {
  id: string; renter_id: string; boat_id: string; start_datetime: string; end_datetime: string
  guests_count: number; total: number; currency: string; duration_hours: number | null
  stripe_payment_intent_id: string | null
}

async function loadBooking(bookingId: string) {
  const { data: b } = await admin.from('bookings')
    .select('id, renter_id, boat_id, start_datetime, end_datetime, guests_count, total, currency, duration_hours, stripe_payment_intent_id')
    .eq('id', bookingId).single()
  if (!b) return null
  const { data: boat } = await admin.from('boats').select('name, host_id').eq('id', (b as B).boat_id).single()
  return { b: b as B, boat: boat as { name: string; host_id: string } | null }
}

function fmt(b: B, boatName: string) {
  const d = new Date(b.start_datetime)
  const date = d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  const dur = b.duration_hours ? `${b.duration_hours}h` : ''
  const money = `${b.currency === 'EUR' ? '€' : b.currency + ' '}${b.total.toLocaleString()}`
  return { boatName, date, time, dur, money }
}

const shell = (heading: string, accent: string, inner: string) => `
  <div style="background:#07101e;padding:32px 16px;font-family:-apple-system,Segoe UI,sans-serif">
    <div style="max-width:480px;margin:0 auto;background:#0c1828;border:1px solid rgba(201,168,78,0.25);border-radius:16px;overflow:hidden">
      <div style="padding:22px 26px;border-bottom:1px solid rgba(201,168,78,0.15)"><span style="color:${accent};font-weight:800;font-size:18px">${heading}</span></div>
      <div style="padding:24px 26px;color:#cfd6df;font-size:14px;line-height:1.65">${inner}</div>
    </div>
  </div>`

const detailRows = (f: ReturnType<typeof fmt>) => `
  <table style="width:100%;border-collapse:collapse;margin:14px 0">
    <tr><td style="padding:6px 0;color:#8b94a3">Boat</td><td style="padding:6px 0;color:#f4f4f2;text-align:right;font-weight:600">${f.boatName}</td></tr>
    <tr><td style="padding:6px 0;color:#8b94a3">Date</td><td style="padding:6px 0;color:#f4f4f2;text-align:right;font-weight:600">${f.date}</td></tr>
    <tr><td style="padding:6px 0;color:#8b94a3">Time</td><td style="padding:6px 0;color:#f4f4f2;text-align:right;font-weight:600">${f.time}${f.dur ? ` · ${f.dur}` : ''}</td></tr>
    <tr><td style="padding:6px 0;color:#8b94a3">Total</td><td style="padding:6px 0;color:#c9a84e;text-align:right;font-weight:800">${f.money}</td></tr>
  </table>`

const btn = (href: string, label: string) =>
  `<a href="${href}" style="display:inline-block;background:linear-gradient(135deg,#d4b05e,#c9a84e,#b8942e);color:#07101e;font-weight:800;text-decoration:none;padding:12px 26px;border-radius:99px;font-size:14px">${label}</a>`

/** Booker authorized a hold → ask the host to approve. */
export async function sendHostNewRequest(bookingId: string) {
  const ctx = await loadBooking(bookingId)
  if (!ctx?.boat) return
  // Fire once, only for a genuinely authorized hold. Idempotent across both the
  // client trigger and the Stripe webhook, via a flag on the PaymentIntent.
  const piId = ctx.b.stripe_payment_intent_id
  if (piId) {
    try {
      const pi = await stripe.paymentIntents.retrieve(piId)
      if (pi.status !== 'requires_capture') return            // not an authorized request (yet)
      if ((pi.metadata as Record<string, string>)?.host_notified === '1') return // already notified
      await stripe.paymentIntents.update(piId, { metadata: { host_notified: '1' } })
    } catch { /* if Stripe is unreachable, still notify rather than drop it */ }
  }
  const f = fmt(ctx.b, ctx.boat.name)
  const to = await emailOf(ctx.boat.host_id)
  if (to) await resend.emails.send({
    from: FROM, to, subject: `New booking request — ${f.boatName} · ${f.date}`,
    html: shell('📅 New booking request', '#c9a84e', `
      <p>You have a new booking request. The guest's card is <strong style="color:#f4f4f2">held (not charged)</strong> — approve within <strong>24h</strong> and they're charged; decline and the hold is released automatically.</p>
      ${detailRows(f)}
      <p style="margin:18px 0 6px">${btn(`${SITE}/host/bookings`, 'Review & approve →')}</p>
      <p style="color:#8b94a3;font-size:12px;margin-top:14px">Open your host dashboard to approve or decline.</p>`),
  }).catch(() => {})
  await sendWhatsApp(await phoneOf(ctx.boat.host_id),
    `🚤 *New booking request* on BoatHire24\n${f.boatName} · ${f.date} ${f.time}${f.dur ? ` (${f.dur})` : ''} · ${ctx.b.guests_count} guests · ${f.money}\nCard is *held, not charged* — approve within 24h:\n${SITE}/host/bookings`)
}

/** Host approved & payment captured (or instant book) → tell the guest. */
export async function sendBookerConfirmed(bookingId: string) {
  const ctx = await loadBooking(bookingId)
  if (!ctx?.boat) return
  const f = fmt(ctx.b, ctx.boat.name)
  const to = await emailOf(ctx.b.renter_id)
  if (to) await resend.emails.send({
    from: FROM, to, subject: `Confirmed! Your ${f.boatName} on ${f.date} 🎉`,
    html: shell('🎉 Booking confirmed', '#22c55e', `
      <p>Great news — your booking is <strong style="color:#22c55e">confirmed</strong> and your payment has been processed.</p>
      ${detailRows(f)}
      <p style="margin:18px 0 6px">${btn(`${SITE}/dashboard`, 'View my trip →')}</p>
      <p style="color:#8b94a3;font-size:12px;margin-top:14px">See you on the water!</p>`),
  }).catch(() => {})
  await sendWhatsApp(await phoneOf(ctx.b.renter_id),
    `🎉 *Booking confirmed!* Your ${f.boatName} on ${f.date} ${f.time} is locked in — ${f.money} charged.\nView your trip: ${SITE}/dashboard\nSee you on the water!`)
}

/** Host declined / request expired → tell the guest (no charge). */
export async function sendBookerDeclined(bookingId: string) {
  const ctx = await loadBooking(bookingId)
  if (!ctx?.boat) return
  const f = fmt(ctx.b, ctx.boat.name)
  const to = await emailOf(ctx.b.renter_id)
  if (to) await resend.emails.send({
    from: FROM, to, subject: `Update on your ${f.boatName} request`,
    html: shell('Request not available', '#f59e0b', `
      <p>Unfortunately the <strong style="color:#f4f4f2">${f.boatName}</strong> isn't available for ${f.date}, so this request couldn't be confirmed. <strong style="color:#22c55e">You have not been charged</strong> — the card hold has been released.</p>
      <p style="margin:18px 0 6px">${btn(`${SITE}/search`, 'Find another boat →')}</p>`),
  }).catch(() => {})
  await sendWhatsApp(await phoneOf(ctx.b.renter_id),
    `Update: your ${f.boatName} request for ${f.date} couldn't be confirmed. *You have not been charged* — the hold was released.\nFind another boat: ${SITE}/search`)
}
