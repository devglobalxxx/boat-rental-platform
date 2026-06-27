'use client'

import { useEffect, useState } from 'react'
import AddCustomerButton from '@/components/admin/AddCustomerButton'

const gold = '#74cfe8', muted = 'rgba(244,244,242,0.55)', text = '#f4f4f2'
const card = 'rgba(255,255,255,0.03)', border = 'rgba(116,207,232,0.18)'

interface Owner { owner_name: string | null; owner_email: string | null; owner_phone: string | null; owner_website: string | null; notes: string | null }
interface Boat { id: string; name: string; slug: string; status: string; type: string | null; location: string; owner: Owner | null }

const STATUS: Record<string, { c: string; l: string }> = {
  active: { c: '#22c55e', l: 'Active' },
  draft:  { c: '#f59e0b', l: 'Draft' },
  paused: { c: muted, l: 'Paused' },
}

function OwnerEditor({ boat, onSaved }: { boat: Boat; onSaved: (o: Owner) => void }) {
  const [open, setOpen] = useState(false)
  const o = boat.owner
  const [f, setF] = useState<Owner>({
    owner_name: o?.owner_name ?? '', owner_email: o?.owner_email ?? '',
    owner_phone: o?.owner_phone ?? '', owner_website: o?.owner_website ?? '', notes: o?.notes ?? '',
  })
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function save() {
    setBusy(true); setErr(null)
    try {
      const r = await fetch('/api/admin/managed', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boatId: boat.id, ...f }),
      })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error || 'Failed')
      onSaved(j.owner)
      setOpen(false)
    } catch (e) { setErr((e as Error).message) } finally { setBusy(false) }
  }

  const has = o && (o.owner_name || o.owner_email || o.owner_phone)
  const inp = { width: '100%', padding: '8px 10px', borderRadius: 8, background: 'rgba(0,0,0,0.25)', border: `1px solid rgba(255,255,255,0.12)`, color: text, fontSize: 13, marginBottom: 8 } as const

  if (!open) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        {has ? (
          <div style={{ fontSize: 12, color: muted, lineHeight: 1.5 }}>
            <span style={{ color: text, fontWeight: 600 }}>{o!.owner_name || 'Owner'}</span>
            {o!.owner_phone && <> · 📞 {o!.owner_phone}</>}
            {o!.owner_email && <> · ✉ {o!.owner_email}</>}
            {o!.owner_website && <> · 🌐 {o!.owner_website}</>}
          </div>
        ) : (
          <span style={{ fontSize: 12, color: '#f59e0b' }}>⚠ No owner contact yet</span>
        )}
        <button onClick={() => setOpen(true)} style={{ padding: '4px 10px', borderRadius: 6, background: 'rgba(116,207,232,0.12)', border: `1px solid rgba(116,207,232,0.32)`, color: gold, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
          {has ? 'Edit owner' : '+ Add owner contact'}
        </button>
      </div>
    )
  }

  return (
    <div style={{ background: 'rgba(0,0,0,0.20)', border: `1px solid ${border}`, borderRadius: 10, padding: 12, marginTop: 8 }}>
      <input style={inp} placeholder="Owner name" value={f.owner_name ?? ''} onChange={(e) => setF({ ...f, owner_name: e.target.value })} />
      <input style={inp} placeholder="Phone" value={f.owner_phone ?? ''} onChange={(e) => setF({ ...f, owner_phone: e.target.value })} />
      <input style={inp} placeholder="Email" value={f.owner_email ?? ''} onChange={(e) => setF({ ...f, owner_email: e.target.value })} />
      <input style={inp} placeholder="Website (where the boat is listed)" value={f.owner_website ?? ''} onChange={(e) => setF({ ...f, owner_website: e.target.value })} />
      <textarea style={{ ...inp, minHeight: 50, resize: 'vertical' }} placeholder="Notes (commission, availability quirks…)" value={f.notes ?? ''} onChange={(e) => setF({ ...f, notes: e.target.value })} />
      {err && <p style={{ color: '#f87171', fontSize: 12, margin: '0 0 8px' }}>{err}</p>}
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={save} disabled={busy} style={{ padding: '7px 16px', borderRadius: 8, background: gold, color: '#07101e', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', opacity: busy ? 0.6 : 1 }}>{busy ? 'Saving…' : 'Save contact'}</button>
        <button onClick={() => setOpen(false)} style={{ padding: '7px 14px', borderRadius: 8, background: 'transparent', border: '1px solid rgba(255,255,255,0.18)', color: muted, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
      </div>
    </div>
  )
}

export default function ManagedListings({ hostId }: { hostId: string | null }) {
  const [boats, setBoats] = useState<Boat[] | null>(null)
  const [err, setErr] = useState<string | null>(null)

  async function load() {
    try {
      const r = await fetch('/api/admin/managed')
      const j = await r.json()
      if (!r.ok) throw new Error(j.error || 'Failed to load')
      setBoats(j.boats ?? [])
    } catch (e) { setErr((e as Error).message) }
  }
  useEffect(() => { load() }, [])

  if (!hostId) {
    return (
      <div style={{ background: card, borderRadius: 16, border: `1px solid ${border}`, padding: 32, textAlign: 'center' }}>
        <p style={{ color: text, fontWeight: 700, marginBottom: 6 }}>BoatHire24 managed account not set up yet</p>
        <p style={{ color: muted, fontSize: 13 }}>Run the one-off setup script to create the managed host account, then refresh.</p>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <p style={{ color: muted, fontSize: 13, margin: 0, maxWidth: 560, lineHeight: 1.5 }}>
          Boats we list & manage on owners&apos; behalf under the <strong style={{ color: text }}>BoatHire24</strong> account. Owner contacts stay private — used to chase availability when a booking comes in.
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <AddCustomerButton />
          <a href="/admin/leads" style={{ padding: '9px 18px', borderRadius: 99, background: 'transparent', border: `1px solid ${border}`, color: gold, fontSize: 13, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}>🚤 Listing leads</a>
        </div>
      </div>

      {err && <p style={{ color: '#f87171', fontSize: 13 }}>{err}</p>}

      <div style={{ background: card, borderRadius: 16, border: `1px solid ${border}`, overflow: 'hidden' }}>
        {boats === null ? (
          <div style={{ padding: 40, textAlign: 'center', color: muted, fontSize: 14 }}>Loading…</div>
        ) : boats.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: muted, fontSize: 14 }}>No managed boats yet. Add a customer, then import or add their listings from the leads section.</div>
        ) : (
          boats.map((b, i) => {
            const s = STATUS[b.status] ?? STATUS.draft
            return (
              <div key={b.id} style={{ padding: '16px 18px', borderBottom: i < boats.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                  <a href={`/boats/${b.slug}`} target="_blank" rel="noopener" style={{ color: text, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>{b.name}</a>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: 'rgba(255,255,255,0.06)', color: s.c, border: `1px solid rgba(255,255,255,0.12)` }}>{s.l}</span>
                  {b.location && <span style={{ fontSize: 12, color: muted }}>{b.location}</span>}
                  <a href={`/host/listings/${b.id}`} target="_blank" rel="noopener" style={{ marginLeft: 'auto', fontSize: 11, color: gold, textDecoration: 'none', fontWeight: 600 }}>Edit listing →</a>
                </div>
                <OwnerEditor boat={b} onSaved={(o) => setBoats((prev) => prev?.map((x) => x.id === b.id ? { ...x, owner: o } : x) ?? prev)} />
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
