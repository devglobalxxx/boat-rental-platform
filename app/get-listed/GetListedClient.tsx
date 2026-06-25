'use client'

import { useState } from 'react'

const gold = '#74cfe8', text = '#f4f4f2', muted = 'rgba(244,244,242,0.62)'
const border = 'rgba(116,207,232,0.22)'
const bg = '#07101e'

const OPS_WHATSAPP = '37258155779' // contact button — Marbella ops line

const DURATIONS: [string, string][] = [['2h', '2 hours'], ['4h', '4 hours'], ['6h', '6 hours'], ['day', 'Full day']]

// Common country dial codes (Spain first — most operators are Marbella-based).
const DIAL_CODES: [string, string][] = [
  ['🇪🇸', '+34'], ['🇬🇧', '+44'], ['🇪🇪', '+372'], ['🇺🇸', '+1'], ['🇫🇷', '+33'], ['🇩🇪', '+49'],
  ['🇮🇹', '+39'], ['🇳🇱', '+31'], ['🇧🇪', '+32'], ['🇨🇭', '+41'], ['🇦🇹', '+43'], ['🇵🇹', '+351'],
  ['🇮🇪', '+353'], ['🇸🇪', '+46'], ['🇳🇴', '+47'], ['🇩🇰', '+45'], ['🇫🇮', '+358'], ['🇵🇱', '+48'],
  ['🇬🇷', '+30'], ['🇭🇷', '+385'], ['🇲🇹', '+356'], ['🇨🇾', '+357'], ['🇦🇪', '+971'], ['🇸🇦', '+966'],
  ['🇶🇦', '+974'], ['🇹🇷', '+90'], ['🇲🇦', '+212'], ['🇦🇺', '+61'], ['🇧🇷', '+55'], ['🇨🇦', '+1'],
]

interface BoatRow { name: string; url: string; prices: Record<string, string> }

const inp: React.CSSProperties = {
  width: '100%', padding: '13px 15px', borderRadius: 12, background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.12)', color: text, fontSize: 15, outline: 'none',
}
const label: React.CSSProperties = { fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: muted, marginBottom: 6, display: 'block' }
const req = <span style={{ color: gold }}> *</span>

function num(s: string): number | null {
  const m = s.replace(/[ ,.](?=\d{3}\b)/g, '').match(/\d+(?:[.,]\d+)?/)
  return m ? Math.round(parseFloat(m[0].replace(',', '.'))) : null
}
function emptyPrices(): Record<string, string> { return { '2h': '', '4h': '', '6h': '', day: '' } }

export default function GetListedClient({ source }: { source?: string }) {
  const [contact_name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [website, setWebsite] = useState('')
  const [email, setEmail] = useState('')
  const [dial, setDial] = useState('+34')
  const [waNumber, setWaNumber] = useState('')
  const [note, setNote] = useState('')
  const [boats, setBoats] = useState<BoatRow[]>([{ name: '', url: '', prices: emptyPrices() }])
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  function setBoat(i: number, patch: Partial<BoatRow>) { setBoats((b) => b.map((x, j) => (j === i ? { ...x, ...patch } : x))) }
  function setBoatPrice(i: number, key: string, val: string) {
    setBoats((b) => b.map((x, j) => (j === i ? { ...x, prices: { ...x.prices, [key]: val } } : x)))
  }
  function addBoat() { setBoats((b) => [...b, { name: '', url: '', prices: emptyPrices() }]) }
  function removeBoat(i: number) { setBoats((b) => b.filter((_, j) => j !== i)) }

  async function submit() {
    setErr(null)
    if (!contact_name.trim()) return setErr('Please add your name.')
    if (!email.trim() || !/.+@.+\..+/.test(email)) return setErr('Please add a valid email.')
    if (!website.trim()) return setErr('Please add your website.')
    if (!waNumber.trim()) return setErr('Please add your WhatsApp number.')
    setBusy(true)
    try {
      const r = await fetch('/api/list-submissions', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact_name, company, website, email, phone: `${dial} ${waNumber.trim()}`, note, source, boats }),
      })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error || 'Something went wrong')
      setDone(true)
    } catch (e) { setErr((e as Error).message) } finally { setBusy(false) }
  }

  if (done) {
    return (
      <div style={{ background: bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: '-apple-system,Segoe UI,sans-serif' }}>
        <div style={{ maxWidth: 460, textAlign: 'center' }}>
          <div style={{ fontSize: 52, marginBottom: 14 }}>🚤</div>
          <h1 style={{ color: text, fontSize: 26, fontWeight: 800, margin: '0 0 10px' }}>Thanks — we&apos;ve got your boats.</h1>
          <p style={{ color: muted, fontSize: 15, lineHeight: 1.6 }}>
            Our team will review your fleet and get you listed on BoatHire24 within 1–2 business days. We&apos;ll reach out at <strong style={{ color: text }}>{email}</strong> to confirm details. Your prices stay exactly as they are — we add our 15% commission on top.
          </p>
          <a href={`https://wa.me/${OPS_WHATSAPP}`} target="_blank" rel="noopener" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 22, padding: '12px 22px', borderRadius: 99, background: '#25d366', color: '#fff', fontWeight: 700, textDecoration: 'none' }}>💬 Message us on WhatsApp</a>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: bg, minHeight: '100vh', color: text, fontFamily: '-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '56px 20px 90px' }}>
        <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: gold, background: 'rgba(116,207,232,0.10)', border: `1px solid ${border}`, padding: '5px 14px', borderRadius: 99, marginBottom: 18 }}>For boat owners & charter operators</span>
        <h1 style={{ fontSize: 38, fontWeight: 800, lineHeight: 1.12, letterSpacing: '-0.02em', margin: '0 0 14px' }}>
          Get your boats in front of <span style={{ color: gold }}>thousands more renters</span> — at zero cost to you.
        </h1>
        <p style={{ fontSize: 17, color: muted, lineHeight: 1.6, margin: '0 0 12px', maxWidth: 600 }}>
          Send us your website and the boats you charter. We list them on BoatHire24, market them, and bring you bookings.
          You keep <strong style={{ color: text }}>100% of your price</strong> — paid by the renter.
        </p>
        <p style={{ fontSize: 17, color: text, lineHeight: 1.6, margin: '0 0 28px', maxWidth: 600, fontWeight: 700 }}>
          We add a <span style={{ color: gold }}>15% commission on top of your price</span> — so you always receive exactly what you charge today.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12, marginBottom: 38 }}>
          {[
            ['💶', 'You keep your price', 'We add 15% on top — you receive exactly what you charge today.'],
            ['🆓', 'Free to list', 'No setup fee, no monthly cost. We only earn when you get a booking.'],
            ['📈', 'More reach', 'Your fleet shown to renters searching across 48 destinations.'],
          ].map(([icon, t, d]) => (
            <div key={t} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${border}`, borderRadius: 14, padding: '16px 16px' }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{t}</div>
              <div style={{ color: muted, fontSize: 12.5, lineHeight: 1.45 }}>{d}</div>
            </div>
          ))}
        </div>

        <div style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${border}`, borderRadius: 18, padding: '26px 22px' }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 18px' }}>Submit your fleet</h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div><label style={label}>Your name{req}</label><input style={inp} value={contact_name} onChange={(e) => setName(e.target.value)} placeholder="Jane Smith" /></div>
            <div><label style={label}>Company (optional)</label><input style={inp} value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Marbella Charters SL" /></div>
          </div>
          <div style={{ marginBottom: 14 }}><label style={label}>Your website{req}</label><input style={inp} value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://yourcharters.com" /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 22 }}>
            <div><label style={label}>Email{req}</label><input style={inp} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" /></div>
            <div>
              <label style={label}>WhatsApp{req}</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <select value={dial} onChange={(e) => setDial(e.target.value)} aria-label="Country code" style={{ ...inp, width: 'auto', flexShrink: 0, paddingRight: 8, appearance: 'auto', colorScheme: 'dark' }}>
                  {DIAL_CODES.map(([flag, code], i) => <option key={i} value={code}>{flag} {code}</option>)}
                </select>
                <input style={{ ...inp, flex: 1 }} value={waNumber} onChange={(e) => setWaNumber(e.target.value)} placeholder="600 000 000" />
              </div>
            </div>
          </div>

          <label style={label}>Your boats</label>
          <p style={{ color: muted, fontSize: 12.5, margin: '0 0 12px', lineHeight: 1.5 }}>Add each boat with a link to its page on your site and your prices per duration. We&apos;ll pull the full specs &amp; photos from there.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {boats.map((b, i) => (
              <div key={i} style={{ background: 'rgba(0,0,0,0.22)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 12 }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <input style={{ ...inp, flex: 1.3 }} value={b.name} onChange={(e) => setBoat(i, { name: e.target.value })} placeholder="Boat name (e.g. Azimut 55)" />
                  {boats.length > 1 && <button onClick={() => removeBoat(i)} aria-label="Remove boat" style={{ flexShrink: 0, width: 44, borderRadius: 10, background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: muted, fontSize: 18, cursor: 'pointer' }}>×</button>}
                </div>
                <input style={{ ...inp, marginBottom: 10 }} value={b.url} onChange={(e) => setBoat(i, { url: e.target.value })} placeholder="Link to this boat on your site" />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {DURATIONS.map(([key, lbl]) => {
                    const p = num(b.prices[key] || '')
                    return (
                      <div key={key}>
                        <div style={{ fontSize: 10.5, fontWeight: 700, color: muted, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>{lbl}</div>
                        <input style={{ ...inp, padding: '10px 10px', fontSize: 14 }} value={b.prices[key] || ''} onChange={(e) => setBoatPrice(i, key, e.target.value)} placeholder="€" />
                        {p != null && <div style={{ fontSize: 10.5, color: gold, marginTop: 3 }}>renter €{Math.round(p * 1.15).toLocaleString()}</div>}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          <button onClick={addBoat} style={{ marginTop: 12, padding: '9px 16px', borderRadius: 10, background: 'transparent', border: `1px dashed ${border}`, color: gold, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>+ Add another boat</button>

          <div style={{ marginTop: 18, marginBottom: 18 }}>
            <label style={label}>Anything else? (optional)</label>
            <textarea style={{ ...inp, minHeight: 70, resize: 'vertical' }} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Seasons, availability, special terms…" />
          </div>

          {err && <p style={{ color: '#f87171', fontSize: 13, margin: '0 0 12px' }}>{err}</p>}

          <button onClick={submit} disabled={busy} style={{ width: '100%', padding: '15px', borderRadius: 12, background: 'linear-gradient(135deg,#8fdcf0,#74cfe8,#4fb8d6)', color: '#07101e', border: 'none', fontSize: 16, fontWeight: 800, cursor: 'pointer', opacity: busy ? 0.6 : 1 }}>
            {busy ? 'Sending…' : 'Submit my boats →'}
          </button>
          <p style={{ color: 'rgba(244,244,242,0.4)', fontSize: 12, textAlign: 'center', margin: '12px 0 0' }}>
            No commitment. We review your fleet and get back to you within 1–2 business days.
          </p>
        </div>

        {/* Questions / contact */}
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 8px' }}>Have more questions?</h3>
          <p style={{ color: muted, fontSize: 14, margin: '0 0 18px' }}>Talk to us directly — we&apos;re happy to walk you through how it works.</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href={`https://wa.me/${OPS_WHATSAPP}`} target="_blank" rel="noopener" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 22px', borderRadius: 99, background: '#25d366', color: '#fff', fontWeight: 700, textDecoration: 'none' }}>💬 WhatsApp us</a>
            <a href="mailto:info@boathire24.com" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 22px', borderRadius: 99, background: 'transparent', border: `1px solid ${border}`, color: gold, fontWeight: 700, textDecoration: 'none' }}>✉ Email us</a>
          </div>
        </div>
      </div>
    </div>
  )
}
