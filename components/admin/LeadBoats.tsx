'use client'

import { useState } from 'react'

const gold = '#74cfe8', muted = 'rgba(244,244,242,0.55)', text = '#f4f4f2'
const border = 'rgba(116,207,232,0.18)'

export interface LeadBoat { id: string; name: string; status: string; slug: string }
const STATUS_COLOR: Record<string, string> = { active: '#22c55e', draft: '#f59e0b', paused: muted }

function BoatRow({ boat, last }: { boat: LeadBoat; last: boolean }) {
  const [status, setStatus] = useState(boat.status)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(false)
  const isActive = status === 'active'

  async function toggle() {
    setBusy(true); setErr(false)
    const next = isActive ? 'draft' : 'active'
    try {
      const r = await fetch('/api/admin/boat-status', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boatId: boat.id, status: next }),
      })
      if (!r.ok) throw new Error()
      setStatus(next)
    } catch { setErr(true) } finally { setBusy(false) }
  }

  const c = STATUS_COLOR[status] ?? muted
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '9px 14px', borderBottom: last ? 'none' : '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
        <a href={`/boats/${boat.slug}`} target="_blank" rel="noopener" style={{ color: text, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>{boat.name}</a>
        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: 'rgba(255,255,255,0.06)', color: c, border: '1px solid rgba(255,255,255,0.12)' }}>{status}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <button onClick={toggle} disabled={busy}
          style={{ fontSize: 11.5, fontWeight: 700, cursor: 'pointer', borderRadius: 8, padding: '5px 12px', opacity: busy ? 0.6 : 1,
            background: isActive ? 'transparent' : '#22c55e',
            color: isActive ? muted : '#07101e',
            border: isActive ? '1px solid rgba(255,255,255,0.18)' : 'none' }}>
          {busy ? '…' : isActive ? 'Unpublish' : err ? 'Retry' : 'Publish'}
        </button>
        <a href={`/boats/${boat.slug}`} target="_blank" rel="noopener" style={{ fontSize: 11.5, color: muted, textDecoration: 'none', fontWeight: 600, whiteSpace: 'nowrap' }}>Preview ↗</a>
        <a href={`/host/listings/${boat.id}`} style={{ fontSize: 11.5, color: gold, textDecoration: 'none', fontWeight: 600, whiteSpace: 'nowrap' }}>Edit →</a>
      </div>
    </div>
  )
}

export default function LeadBoats({ boats, label, defaultOpen = false }: { boats: LeadBoat[]; label?: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  if (!boats.length) return null

  return (
    <div style={{ marginTop: 10 }}>
      <button onClick={() => setOpen((o) => !o)} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 14px', borderRadius: 99, background: 'rgba(116,207,232,0.12)', border: `1px solid ${border}`, color: gold, fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>
        🛥 {label ?? `${boats.length} boat${boats.length === 1 ? '' : 's'} listed`} {open ? '▴' : '▾'}
      </button>
      {open && (
        <div style={{ marginTop: 8, border: `1px solid ${border}`, borderRadius: 10, overflow: 'hidden' }}>
          {boats.map((b, i) => <BoatRow key={b.id} boat={b} last={i === boats.length - 1} />)}
        </div>
      )}
    </div>
  )
}
