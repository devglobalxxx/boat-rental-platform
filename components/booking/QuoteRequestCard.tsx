'use client'

import { useState } from 'react'

const card = '#0c1828'
const text = '#f4f4f2'
const muted = 'rgba(244,244,242,0.55)'
const dim = 'rgba(244,244,242,0.35)'

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: '10px',
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.14)',
  color: text, fontSize: '13px', outline: 'none', boxSizing: 'border-box',
}

export default function QuoteRequestCard({ boatId, boatName }: { boatId: string; boatName: string }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [date, setDate] = useState('')
  const [guests, setGuests] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || (!email.trim() && !phone.trim())) {
      setErr('Please add your name and an email or phone so the owner can reply.')
      return
    }
    setSending(true); setErr(null)
    const res = await fetch('/api/quote-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ boatId, name: name.trim(), email: email.trim(), phone: phone.trim(), date, guests, message: message.trim() }),
    })
    setSending(false)
    if (!res.ok) { setErr('Could not send — please try again.'); return }
    setSent(true)
  }

  if (sent) {
    return (
      <div style={{ background: card, border: '1px solid rgba(34,197,94,0.30)', borderRadius: '20px', padding: '28px', textAlign: 'center' }}>
        <div style={{ fontSize: '40px', marginBottom: '8px' }}>✅</div>
        <div style={{ fontSize: '18px', fontWeight: 800, color: '#22c55e', marginBottom: '6px' }}>Request sent!</div>
        <p style={{ fontSize: '14px', color: muted, lineHeight: 1.6 }}>The owner of the {boatName} has been notified and will get back to you with a price and availability.</p>
      </div>
    )
  }

  return (
    <div style={{ background: card, border: '1px solid rgba(201,168,78,0.18)', borderRadius: '20px', padding: '24px' }}>
      <div style={{ fontSize: '20px', fontWeight: 800, color: text, marginBottom: '4px' }}>Price on request</div>
      <p style={{ fontSize: '13px', color: muted, lineHeight: 1.55, marginBottom: '16px' }}>Tell the owner your plans and they&apos;ll send you a quote — no payment now.</p>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input style={inputStyle} placeholder="Your name *" value={name} onChange={(e) => setName(e.target.value)} />
        <input style={inputStyle} type="email" placeholder="Email *" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input style={inputStyle} type="tel" placeholder="Phone / WhatsApp (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <div style={{ display: 'flex', gap: '10px' }}>
          <input style={inputStyle} type="date" value={date} min={new Date().toISOString().split('T')[0]} onChange={(e) => setDate(e.target.value)} />
          <input style={{ ...inputStyle, maxWidth: '110px' }} type="number" min={1} placeholder="Guests" value={guests} onChange={(e) => setGuests(e.target.value)} />
        </div>
        <textarea style={{ ...inputStyle, minHeight: '58px', resize: 'vertical' }} placeholder="Anything else? (optional)" value={message} onChange={(e) => setMessage(e.target.value)} />
        {err && <div style={{ fontSize: '12px', color: '#f87171' }}>{err}</div>}
        <button type="submit" disabled={sending} style={{ width: '100%', padding: '13px', borderRadius: '99px', background: 'linear-gradient(135deg, #d4b05e 0%, #c9a84e 60%, #b8942e 100%)', color: '#07101e', fontSize: '15px', fontWeight: 700, border: 'none', cursor: sending ? 'wait' : 'pointer', opacity: sending ? 0.7 : 1 }}>
          {sending ? 'Sending…' : 'Request a quote'}
        </button>
        <p style={{ fontSize: '11px', color: dim, textAlign: 'center', margin: 0 }}>Sent straight to the owner by email + WhatsApp</p>
      </form>
    </div>
  )
}
