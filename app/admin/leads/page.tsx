import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Listing leads | BoatHire24' }
export const dynamic = 'force-dynamic'

const text = '#f4f4f2', muted = 'rgba(244,244,242,0.55)', gold = '#74cfe8'
const card = 'rgba(255,255,255,0.03)', border = 'rgba(116,207,232,0.18)'

type Boat = { name?: string; url?: string; price?: string }
type Sub = {
  id: string; contact_name: string | null; company: string | null; website: string | null
  email: string | null; phone: string | null; boats: Boat[]; note: string | null
  source: string | null; status: string; created_at: string
}

export default async function LeadsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/admin/leads')
  const admin = createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { data: me } = await admin.from('profiles').select('is_admin').eq('id', user.id).single()
  if (!me?.is_admin) redirect('/')

  const { data } = await admin
    .from('listing_submissions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(300)
  const subs = (data ?? []) as Sub[]

  const { data: managed } = await admin.from('profiles').select('id').eq('is_managed_account', true).maybeSingle()
  const importHref = managed?.id ? `/host/fleet/website?host=${managed.id}` : '/host/fleet/website'

  return (
    <div style={{ background: '#07101e', minHeight: '100vh', color: text, fontFamily: '-apple-system,Segoe UI,sans-serif' }}>
      <div style={{ maxWidth: 920, margin: '0 auto', padding: '48px 20px 80px' }}>
        <a href="/admin" style={{ color: muted, fontSize: 13, textDecoration: 'none' }}>← Admin</a>
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: '12px 0 4px' }}>🚤 Listing leads <span style={{ color: gold }}>({subs.length})</span></h1>
        <p style={{ color: muted, fontSize: 14, margin: '0 0 26px' }}>Operators who submitted their fleet via <a href="/get-listed" style={{ color: gold }}>/get-listed</a>. Import their boats under the BoatHire24 managed account and add 15% on top of each price.</p>

        {subs.length === 0 ? (
          <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 14, padding: 40, textAlign: 'center', color: muted }}>No submissions yet.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {subs.map((s) => (
              <div key={s.id} style={{ background: card, border: `1px solid ${border}`, borderRadius: 14, padding: '16px 18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>{s.company || s.contact_name || '—'}</span>
                    {s.company && s.contact_name && <span style={{ color: muted, fontSize: 13 }}> · {s.contact_name}</span>}
                  </div>
                  <span style={{ fontSize: 11, color: muted }}>{new Date(s.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}{s.source ? ` · ${s.source}` : ''}</span>
                </div>
                <div style={{ fontSize: 13, color: muted, marginBottom: 10, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                  {s.website && <a href={s.website.startsWith('http') ? s.website : `https://${s.website}`} target="_blank" rel="noopener" style={{ color: gold }}>🌐 {s.website}</a>}
                  {s.email && <a href={`mailto:${s.email}`} style={{ color: gold }}>✉ {s.email}</a>}
                  {s.phone && <span>📞 {s.phone}</span>}
                </div>
                {s.note && <p style={{ fontSize: 13, color: muted, margin: '0 0 10px', fontStyle: 'italic' }}>{s.note}</p>}
                {Array.isArray(s.boats) && s.boats.length > 0 && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 10 }}>
                    {s.boats.map((b, i) => {
                      const m = b.price ? b.price.replace(/[ ,.](?=\d{3}\b)/g, '').match(/\d+(?:[.,]\d+)?/) : null
                      const p = m ? Math.round(parseFloat(m[0].replace(',', '.'))) : NaN
                      return (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 13, padding: '3px 0' }}>
                          <span style={{ color: text }}>{b.name || '—'} {b.url && <a href={b.url.startsWith('http') ? b.url : `https://${b.url}`} target="_blank" rel="noopener" style={{ color: gold, fontSize: 12 }}>↗</a>}</span>
                          <span style={{ color: muted, whiteSpace: 'nowrap' }}>{b.price || ''}{!isNaN(p) && p > 0 ? ` → renter €${Math.round(p * 1.15).toLocaleString()}` : ''}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
                <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                  <a href={importHref} target="_blank" rel="noopener" style={{ fontSize: 12, fontWeight: 700, color: gold, textDecoration: 'none', border: `1px solid ${border}`, borderRadius: 8, padding: '6px 12px' }}>Import their site →</a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
