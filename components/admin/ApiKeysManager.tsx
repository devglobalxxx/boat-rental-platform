'use client'

import { useEffect, useState } from 'react'

interface Host { id: string; name: string; email: string }
interface Key { id: string; key: string; host_id: string; label: string | null; active: boolean; created_at: string; last_used_at: string | null; profiles?: { full_name?: string } | null }

const gold = '#c9a84e', muted = 'rgba(244,244,242,0.55)', text = '#f4f4f2'
const card = 'rgba(255,255,255,0.03)', border = 'rgba(201,168,78,0.15)'
const inputS: React.CSSProperties = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 8, color: text, padding: '8px 12px', fontSize: 13 }
const btn: React.CSSProperties = { padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none' }

export default function ApiKeysManager({ hosts, defaultHostId }: { hosts: Host[]; defaultHostId?: string }) {
  const [keys, setKeys] = useState<Key[]>([])
  const [hostId, setHostId] = useState(defaultHostId || hosts[0]?.id || '')
  const [label, setLabel] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [justCreated, setJustCreated] = useState<string | null>(null)

  async function load() {
    const r = await fetch('/api/admin/api-keys')
    const j = await r.json().catch(() => ({}))
    setKeys(j.keys ?? [])
  }
  useEffect(() => { load() }, [])

  async function generate() {
    if (!hostId) return
    setBusy(true); setErr(null); setJustCreated(null)
    try {
      const r = await fetch('/api/admin/api-keys', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ hostId, label }) })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error || 'Failed')
      setJustCreated(j.key.key)
      setLabel('')
      await load()
    } catch (e) { setErr((e as Error).message) } finally { setBusy(false) }
  }

  async function revoke(id: string, active: boolean) {
    await fetch('/api/admin/api-keys', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, active }) })
    load()
  }
  async function remove(id: string) {
    await fetch('/api/admin/api-keys', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, delete: true }) })
    load()
  }

  return (
    <div style={{ background: card, borderRadius: 16, border: `1px solid ${border}`, padding: 20 }}>
      <p style={{ fontSize: 13, color: muted, marginTop: 0, marginBottom: 14, lineHeight: 1.6 }}>
        Generate a key to share a host&apos;s whole fleet via the partner API. Holders call{' '}
        <code style={{ color: gold }}>GET /api/v1/boats</code> with <code style={{ color: gold }}>Authorization: Bearer &lt;key&gt;</code> to get every active boat (specs, photos, pricing) as JSON.
      </p>

      {/* Generate */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
        <select value={hostId} onChange={(e) => setHostId(e.target.value)} style={{ ...inputS, minWidth: 200 }}>
          {hosts.map((h) => <option key={h.id} value={h.id}>{h.name || h.email}</option>)}
        </select>
        <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Label (e.g. Acme Travel)" style={{ ...inputS, flex: 1, minWidth: 160 }} />
        <button onClick={generate} disabled={busy} style={{ ...btn, background: gold, color: '#07101e', opacity: busy ? 0.6 : 1 }}>{busy ? 'Generating…' : '+ Generate key'}</button>
      </div>
      {err && <p style={{ color: '#f87171', fontSize: 13 }}>{err}</p>}
      {justCreated && (
        <div style={{ background: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 10, padding: '12px 14px', marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: '#22c55e', fontWeight: 700, marginBottom: 6 }}>New key — copy it now (full key won&apos;t be shown again in lists):</div>
          <code style={{ display: 'block', wordBreak: 'break-all', color: text, fontSize: 13 }}>{justCreated}</code>
        </div>
      )}

      {/* List */}
      {keys.length === 0 ? (
        <p style={{ color: muted, fontSize: 13 }}>No keys yet.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, minWidth: 620 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                {['Label', 'Host', 'Key', 'Last used', 'Status', ''].map((h, i, a) => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: i === a.length - 1 ? 'right' : 'left', color: muted, fontSize: 11, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {keys.map((k) => (
                <tr key={k.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', opacity: k.active ? 1 : 0.5 }}>
                  <td style={{ padding: '10px 12px', color: text, fontWeight: 600 }}>{k.label || '—'}</td>
                  <td style={{ padding: '10px 12px', color: muted }}>{k.profiles?.full_name || '—'}</td>
                  <td style={{ padding: '10px 12px', color: muted, fontFamily: 'monospace' }}>{k.key.slice(0, 12)}…{k.key.slice(-4)}</td>
                  <td style={{ padding: '10px 12px', color: muted, whiteSpace: 'nowrap' }}>{k.last_used_at ? new Date(k.last_used_at).toLocaleDateString('en-GB') : 'never'}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: k.active ? 'rgba(34,197,94,0.14)' : 'rgba(248,113,113,0.14)', color: k.active ? '#22c55e' : '#f87171' }}>{k.active ? 'Active' : 'Revoked'}</span>
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button onClick={() => revoke(k.id, !k.active)} style={{ ...btn, background: 'transparent', border: '1px solid rgba(255,255,255,0.18)', color: muted, padding: '5px 10px', fontSize: 11, marginRight: 6 }}>{k.active ? 'Revoke' : 'Reactivate'}</button>
                    <button onClick={() => remove(k.id)} style={{ ...btn, background: 'rgba(248,113,113,0.12)', color: '#f87171', padding: '5px 10px', fontSize: 11 }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
