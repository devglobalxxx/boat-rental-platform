'use client'

import { useState } from 'react'

const gold = '#74cfe8', muted = 'rgba(244,244,242,0.55)', text = '#f4f4f2'
const border = 'rgba(116,207,232,0.18)'

export interface LeadBoat { id: string; name: string; status: string; slug: string }
const STATUS: Record<string, string> = { active: '#22c55e', draft: '#f59e0b', paused: muted }

export default function LeadBoats({ boats }: { boats: LeadBoat[] }) {
  const [open, setOpen] = useState(false)
  if (!boats.length) return null

  return (
    <div style={{ marginTop: 10 }}>
      <button onClick={() => setOpen((o) => !o)} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 14px', borderRadius: 99, background: 'rgba(116,207,232,0.12)', border: `1px solid ${border}`, color: gold, fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>
        🛥 {boats.length} boat{boats.length === 1 ? '' : 's'} listed {open ? '▴' : '▾'}
      </button>
      {open && (
        <div style={{ marginTop: 8, border: `1px solid ${border}`, borderRadius: 10, overflow: 'hidden' }}>
          {boats.map((b, i) => {
            const c = STATUS[b.status] ?? muted
            return (
              <div key={b.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '9px 14px', borderBottom: i < boats.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
                  <a href={`/boats/${b.slug}`} target="_blank" rel="noopener" style={{ color: text, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>{b.name}</a>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: 'rgba(255,255,255,0.06)', color: c, border: '1px solid rgba(255,255,255,0.12)' }}>{b.status}</span>
                </div>
                <a href={`/host/listings/${b.id}`} style={{ fontSize: 11.5, color: gold, textDecoration: 'none', fontWeight: 600, whiteSpace: 'nowrap' }}>Edit →</a>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
