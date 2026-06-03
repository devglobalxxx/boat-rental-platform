import { NextRequest, NextResponse } from 'next/server'
import { sendHostQuoteRequest } from '@/lib/email/bookings'

// Public: a visitor asks for a price on an unpriced boat → notify the owner (email + WhatsApp).
export async function POST(req: NextRequest) {
  try {
    const { boatId, name, email, phone, date, guests, message } = await req.json()
    if (!boatId || !name || (!email && !phone)) {
      return NextResponse.json({ error: 'Missing boat, name, or contact' }, { status: 400 })
    }
    await sendHostQuoteRequest({
      boatId,
      name: String(name).slice(0, 120),
      email: email ? String(email).slice(0, 160) : undefined,
      phone: phone ? String(phone).slice(0, 40) : undefined,
      date: date ? String(date).slice(0, 40) : undefined,
      guests: guests ? Number(guests) || undefined : undefined,
      message: message ? String(message).slice(0, 1000) : undefined,
    })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
