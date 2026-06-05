import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'
import { sendWhatsApp } from '@/lib/whatsapp'
import { stripe } from '@/lib/stripe'

const resend = new Resend(process.env.RESEND_API_KEY)
const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
const FROM = process.env.RESEND_FROM_EMAIL || 'BoatHire24 <info@boathire24.com>'
const SITE = 'https://boathire24.com'
const OPS_INBOX = 'info@boathire24.com' // central boathire24 inbox — copied on every request

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
  await resend.emails.send({
    from: FROM, to: [to, OPS_INBOX].filter(Boolean) as string[], subject: `New booking request — ${f.boatName} · ${f.date}`,
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

/** Visitor asked for a price on an unpriced boat → notify the owner (email + WhatsApp). */
export async function sendHostQuoteRequest(opts: {
  boatId: string; name: string; email?: string; phone?: string; date?: string; guests?: number; message?: string
}) {
  const { data: boatRow } = await admin.from('boats').select('name, host_id').eq('id', opts.boatId).single()
  if (!boatRow) return
  const boat = boatRow as { name: string; host_id: string }
  const contact = [opts.email, opts.phone].filter(Boolean).join(' · ') || '—'
  const when = [opts.date, opts.guests ? `${opts.guests} guests` : ''].filter(Boolean).join(' · ') || '—'

  const hostEmail = await emailOf(boat.host_id)
  await resend.emails.send({
    from: FROM, to: [hostEmail, OPS_INBOX].filter(Boolean) as string[], subject: `💬 Quote request — ${boat.name}`,
    html: shell('💬 New quote request', '#c9a84e', `
      <p>Someone wants a price for your <strong style="color:#f4f4f2">${boat.name}</strong>:</p>
      <table style="width:100%;border-collapse:collapse;margin:14px 0">
        <tr><td style="padding:6px 0;color:#8b94a3">From</td><td style="padding:6px 0;color:#f4f4f2;text-align:right;font-weight:600">${opts.name || '—'}</td></tr>
        <tr><td style="padding:6px 0;color:#8b94a3">Contact</td><td style="padding:6px 0;color:#f4f4f2;text-align:right;font-weight:600">${contact}</td></tr>
        <tr><td style="padding:6px 0;color:#8b94a3">When</td><td style="padding:6px 0;color:#f4f4f2;text-align:right;font-weight:600">${when}</td></tr>
      </table>
      ${opts.message ? `<p style="color:#cfd6df;font-style:italic">&ldquo;${opts.message}&rdquo;</p>` : ''}
      <p style="margin:18px 0 6px">${btn(`${SITE}/host/bookings`, 'Manage in your dashboard →')}</p>
      <p style="color:#8b94a3;font-size:12px;margin-top:14px">Reply to them directly at ${contact}, or open your dashboard to manage all your requests.</p>`),
  }).catch(() => {})

  await sendWhatsApp(await phoneOf(boat.host_id),
    `💬 *Quote request* — ${boat.name}\nFrom: ${opts.name || '—'} (${contact})\nWhen: ${when}${opts.message ? `\n"${opts.message}"` : ''}\nReply to them directly, or manage it: ${SITE}/host/bookings`)
}

/** Guest submitted a price-on-request quote → confirm to the guest (email + WhatsApp). */
export async function sendBookerQuoteReceived(bookingId: string) {
  const ctx = await loadBooking(bookingId)
  if (!ctx?.boat) return
  const f = fmt(ctx.b, ctx.boat.name)
  const to = await emailOf(ctx.b.renter_id)
  const rows = `
    <table style="width:100%;border-collapse:collapse;margin:14px 0">
      <tr><td style="padding:6px 0;color:#8b94a3">Boat</td><td style="padding:6px 0;color:#f4f4f2;text-align:right;font-weight:600">${f.boatName}</td></tr>
      <tr><td style="padding:6px 0;color:#8b94a3">Date</td><td style="padding:6px 0;color:#f4f4f2;text-align:right;font-weight:600">${f.date}</td></tr>
      <tr><td style="padding:6px 0;color:#8b94a3">Guests</td><td style="padding:6px 0;color:#f4f4f2;text-align:right;font-weight:600">${ctx.b.guests_count}</td></tr>
      <tr><td style="padding:6px 0;color:#8b94a3">Price</td><td style="padding:6px 0;color:#c9a84e;text-align:right;font-weight:800">On request</td></tr>
    </table>`
  if (to) await resend.emails.send({
    from: FROM, to, subject: `✅ Request received — ${f.boatName}`,
    html: shell('✅ Your request is in!', '#22c55e', `
      <p>Thanks! We&rsquo;ve sent your request for <strong style="color:#f4f4f2">${f.boatName}</strong> to the owner — they&rsquo;ll get back to you shortly with a price and availability.</p>
      ${rows}
      <p style="margin:18px 0 6px">${btn(`${SITE}/dashboard`, 'View my request →')}</p>
      <p style="color:#8b94a3;font-size:12px;margin-top:14px">Track it anytime under My Trips.</p>`),
  }).catch(() => {})
  await sendWhatsApp(await phoneOf(ctx.b.renter_id),
    `✅ *Request received* — ${f.boatName} · ${f.date} · ${ctx.b.guests_count} guests.\nThe owner will reply with a price + availability. Track it: ${SITE}/dashboard`)
}

/** Request-first booking (priced boat): notify the owner of a date+hours request — no card yet. */
export async function sendHostBookingRequest(opts: {
  boatId: string; guestEmail?: string; guestName?: string; guestPhone?: string
  date: string; time?: string; durationHours?: number | null; guests?: number; total?: number; currency?: string
}) {
  const { data: boatRow } = await admin.from('boats').select('name, host_id').eq('id', opts.boatId).single()
  if (!boatRow) return
  const boat = boatRow as { name: string; host_id: string }
  const money = opts.total != null ? `${opts.currency === 'EUR' ? '€' : (opts.currency || '') + ' '}${opts.total.toLocaleString()}` : '—'
  const dur = opts.durationHours ? `${opts.durationHours}h` : ''
  const dt = new Date(`${opts.date}T${opts.time || '09:00'}:00`)
  const dateStr = isNaN(dt.getTime()) ? opts.date : dt.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
  const contact = [opts.guestEmail, opts.guestPhone].filter(Boolean).join(' · ') || '—'

  const hostEmail = await emailOf(boat.host_id)
  await resend.emails.send({
    from: FROM, to: [hostEmail, OPS_INBOX].filter(Boolean) as string[], subject: `📅 Booking request — ${boat.name} · ${dateStr}`,
    html: shell('📅 New booking request', '#c9a84e', `
      <p>New booking request for <strong style="color:#f4f4f2">${boat.name}</strong> — confirm availability with the guest and send a payment link.</p>
      <table style="width:100%;border-collapse:collapse;margin:14px 0">
        <tr><td style="padding:6px 0;color:#8b94a3">Date</td><td style="padding:6px 0;color:#f4f4f2;text-align:right;font-weight:600">${dateStr}${opts.time ? ` · ${opts.time}` : ''}</td></tr>
        <tr><td style="padding:6px 0;color:#8b94a3">Duration</td><td style="padding:6px 0;color:#f4f4f2;text-align:right;font-weight:600">${dur || '—'}</td></tr>
        <tr><td style="padding:6px 0;color:#8b94a3">Guests</td><td style="padding:6px 0;color:#f4f4f2;text-align:right;font-weight:600">${opts.guests ?? '—'}</td></tr>
        <tr><td style="padding:6px 0;color:#8b94a3">Price</td><td style="padding:6px 0;color:#c9a84e;text-align:right;font-weight:800">${money}</td></tr>
        <tr><td style="padding:6px 0;color:#8b94a3">Guest</td><td style="padding:6px 0;color:#f4f4f2;text-align:right;font-weight:600">${opts.guestName || '—'}</td></tr>
        <tr><td style="padding:6px 0;color:#8b94a3">Contact</td><td style="padding:6px 0;color:#f4f4f2;text-align:right;font-weight:600">${contact}</td></tr>
      </table>
      <p style="margin:18px 0 6px">${btn(`${SITE}/host/bookings`, 'Manage in your dashboard →')}</p>
      <p style="color:#8b94a3;font-size:12px;margin-top:14px">Confirm availability and send the guest a payment link from your dashboard.</p>`),
  }).catch(() => {})

  await sendWhatsApp(await phoneOf(boat.host_id),
    `📅 *Booking request* — ${boat.name}\n${dateStr}${opts.time ? ` ${opts.time}` : ''}${dur ? ` · ${dur}` : ''} · ${opts.guests ?? '?'} guests · ${money}\nGuest: ${opts.guestName || '—'} (${contact})\nConfirm + send a payment link: ${SITE}/host/bookings`)
}

/** Host accepted a request-first booking → send the guest a Stripe payment link to pay. */
export async function sendBookerPaymentLink(bookingId: string, url: string) {
  const ctx = await loadBooking(bookingId)
  if (!ctx?.boat) return
  const f = fmt(ctx.b, ctx.boat.name)
  const to = await emailOf(ctx.b.renter_id)
  if (to) await resend.emails.send({
    from: FROM, to, subject: `✅ ${f.boatName} accepted — complete your payment`,
    html: shell('✅ Your request was accepted!', '#22c55e', `
      <p>Great news — the owner accepted your request for <strong style="color:#f4f4f2">${f.boatName}</strong>. Complete your payment to lock it in:</p>
      ${detailRows(f)}
      <p style="margin:18px 0 6px">${btn(url, 'Pay & confirm →')}</p>
      <p style="color:#8b94a3;font-size:12px;margin-top:14px">Secure Stripe checkout · this finalises your booking.</p>`),
  }).catch(() => {})
  await sendWhatsApp(await phoneOf(ctx.b.renter_id),
    `✅ *${f.boatName}* — the owner accepted your request for ${f.date}! Pay ${f.money} to confirm:\n${url}`)
}
