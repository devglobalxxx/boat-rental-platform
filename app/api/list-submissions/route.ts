import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

export const runtime = 'nodejs'

const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.RESEND_FROM_EMAIL || 'BoatHire24 <info@boathire24.com>'

type BoatIn = { name?: string; url?: string; price?: string }

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))

  const contact_name = String(body?.contact_name ?? '').trim().slice(0, 120)
  const company = String(body?.company ?? '').trim().slice(0, 160) || null
  const website = String(body?.website ?? '').trim().slice(0, 300)
  const email = String(body?.email ?? '').trim().slice(0, 160)
  const phone = String(body?.phone ?? '').trim().slice(0, 60) || null
  const note = String(body?.note ?? '').trim().slice(0, 2000) || null
  const source = String(body?.source ?? '').trim().slice(0, 120) || null

  const boats = (Array.isArray(body?.boats) ? body.boats : [])
    .map((b: BoatIn) => ({
      name: String(b?.name ?? '').trim().slice(0, 160),
      url: String(b?.url ?? '').trim().slice(0, 400),
      price: String(b?.price ?? '').trim().slice(0, 80),
    }))
    .filter((b: BoatIn) => b.name || b.url)
    .slice(0, 60)

  // Need at least a way to reach them + something to work with.
  if (!email && !phone) return NextResponse.json({ error: 'Please add an email or phone so we can reach you.' }, { status: 400 })
  if (!website && boats.length === 0) return NextResponse.json({ error: 'Add your website or at least one boat.' }, { status: 400 })

  const { data, error } = await admin
    .from('listing_submissions')
    .insert({ contact_name, company, website: website || null, email: email || null, phone, boats, note, source })
    .select('id').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Notify ops (non-blocking).
  const boatRows = boats.length
    ? boats.map((b: BoatIn) => `<tr><td style="padding:4px 10px 4px 0;color:#f4f4f2">${esc(b.name || '—')}</td><td style="padding:4px 10px;color:#8b94a3">${esc(b.url || '')}</td><td style="padding:4px 0;color:#74cfe8;text-align:right">${esc(b.price || '')}</td></tr>`).join('')
    : '<tr><td style="color:#8b94a3">No individual boats listed — see website.</td></tr>'
  resend.emails.send({
    from: FROM, to: 'info@boathire24.com',
    subject: `🚤 New listing lead: ${company || contact_name || website || email}`,
    html: `<div style="font-family:-apple-system,Segoe UI,sans-serif;background:#07101e;color:#cfd6df;padding:24px">
      <h2 style="color:#74cfe8;margin:0 0 12px">New boats-to-list submission</h2>
      <p><strong style="color:#f4f4f2">${esc(contact_name || '—')}</strong>${company ? ` · ${esc(company)}` : ''}</p>
      <p>🌐 ${esc(website || '—')}<br>✉ ${esc(email || '—')}${phone ? `<br>📞 ${esc(phone)}` : ''}</p>
      ${note ? `<p style="color:#8b94a3">${esc(note)}</p>` : ''}
      <table style="width:100%;border-collapse:collapse;margin-top:12px;font-size:13px">${boatRows}</table>
      <p style="color:#8b94a3;font-size:12px;margin-top:16px">Review in the admin → BoatHire24 managed leads. Add 15% on top of their price when listing.</p>
    </div>`,
  }).catch(() => {})

  return NextResponse.json({ ok: true, id: data.id })
}

function esc(s: string) {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string))
}
