'use client'

import { useState } from 'react'

const gold = '#74cfe8', text = '#f4f4f2', muted = 'rgba(244,244,242,0.62)'
const border = 'rgba(116,207,232,0.22)'
const bg = '#07101e'

const OPS_WHATSAPP = '37258155779' // contact button — Marbella ops line

const DURATIONS: [string, string][] = [['2h', '2 hours'], ['4h', '4 hours'], ['6h', '6 hours'], ['day', 'Full day']]

// All world dial codes — [flag, country, code]. Alphabetical; Spain is the default.
const DIAL_CODES: [string, string, string][] = [
  ['🇦🇫', 'Afghanistan', '+93'], ['🇦🇱', 'Albania', '+355'], ['🇩🇿', 'Algeria', '+213'], ['🇦🇩', 'Andorra', '+376'],
  ['🇦🇴', 'Angola', '+244'], ['🇦🇬', 'Antigua & Barbuda', '+1'], ['🇦🇷', 'Argentina', '+54'], ['🇦🇲', 'Armenia', '+374'],
  ['🇦🇼', 'Aruba', '+297'], ['🇦🇺', 'Australia', '+61'], ['🇦🇹', 'Austria', '+43'], ['🇦🇿', 'Azerbaijan', '+994'],
  ['🇧🇸', 'Bahamas', '+1'], ['🇧🇭', 'Bahrain', '+973'], ['🇧🇩', 'Bangladesh', '+880'], ['🇧🇧', 'Barbados', '+1'],
  ['🇧🇾', 'Belarus', '+375'], ['🇧🇪', 'Belgium', '+32'], ['🇧🇿', 'Belize', '+501'], ['🇧🇯', 'Benin', '+229'],
  ['🇧🇹', 'Bhutan', '+975'], ['🇧🇴', 'Bolivia', '+591'], ['🇧🇦', 'Bosnia & Herzegovina', '+387'], ['🇧🇼', 'Botswana', '+267'],
  ['🇧🇷', 'Brazil', '+55'], ['🇧🇳', 'Brunei', '+673'], ['🇧🇬', 'Bulgaria', '+359'], ['🇧🇫', 'Burkina Faso', '+226'],
  ['🇧🇮', 'Burundi', '+257'], ['🇰🇭', 'Cambodia', '+855'], ['🇨🇲', 'Cameroon', '+237'], ['🇨🇦', 'Canada', '+1'],
  ['🇨🇻', 'Cape Verde', '+238'], ['🇨🇫', 'Central African Rep.', '+236'], ['🇹🇩', 'Chad', '+235'], ['🇨🇱', 'Chile', '+56'],
  ['🇨🇳', 'China', '+86'], ['🇨🇴', 'Colombia', '+57'], ['🇰🇲', 'Comoros', '+269'], ['🇨🇬', 'Congo', '+242'],
  ['🇨🇩', 'Congo (DRC)', '+243'], ['🇨🇷', 'Costa Rica', '+506'], ['🇨🇮', "Côte d'Ivoire", '+225'], ['🇭🇷', 'Croatia', '+385'],
  ['🇨🇺', 'Cuba', '+53'], ['🇨🇾', 'Cyprus', '+357'], ['🇨🇿', 'Czechia', '+420'], ['🇩🇰', 'Denmark', '+45'],
  ['🇩🇯', 'Djibouti', '+253'], ['🇩🇲', 'Dominica', '+1'], ['🇩🇴', 'Dominican Republic', '+1'], ['🇪🇨', 'Ecuador', '+593'],
  ['🇪🇬', 'Egypt', '+20'], ['🇸🇻', 'El Salvador', '+503'], ['🇬🇶', 'Equatorial Guinea', '+240'], ['🇪🇷', 'Eritrea', '+291'],
  ['🇪🇪', 'Estonia', '+372'], ['🇸🇿', 'Eswatini', '+268'], ['🇪🇹', 'Ethiopia', '+251'], ['🇫🇯', 'Fiji', '+679'],
  ['🇫🇮', 'Finland', '+358'], ['🇫🇷', 'France', '+33'], ['🇬🇦', 'Gabon', '+241'], ['🇬🇲', 'Gambia', '+220'],
  ['🇬🇪', 'Georgia', '+995'], ['🇩🇪', 'Germany', '+49'], ['🇬🇭', 'Ghana', '+233'], ['🇬🇷', 'Greece', '+30'],
  ['🇬🇩', 'Grenada', '+1'], ['🇬🇹', 'Guatemala', '+502'], ['🇬🇳', 'Guinea', '+224'], ['🇬🇼', 'Guinea-Bissau', '+245'],
  ['🇬🇾', 'Guyana', '+592'], ['🇭🇹', 'Haiti', '+509'], ['🇭🇳', 'Honduras', '+504'], ['🇭🇰', 'Hong Kong', '+852'],
  ['🇭🇺', 'Hungary', '+36'], ['🇮🇸', 'Iceland', '+354'], ['🇮🇳', 'India', '+91'], ['🇮🇩', 'Indonesia', '+62'],
  ['🇮🇷', 'Iran', '+98'], ['🇮🇶', 'Iraq', '+964'], ['🇮🇪', 'Ireland', '+353'], ['🇮🇱', 'Israel', '+972'],
  ['🇮🇹', 'Italy', '+39'], ['🇯🇲', 'Jamaica', '+1'], ['🇯🇵', 'Japan', '+81'], ['🇯🇴', 'Jordan', '+962'],
  ['🇰🇿', 'Kazakhstan', '+7'], ['🇰🇪', 'Kenya', '+254'], ['🇰🇮', 'Kiribati', '+686'], ['🇽🇰', 'Kosovo', '+383'],
  ['🇰🇼', 'Kuwait', '+965'], ['🇰🇬', 'Kyrgyzstan', '+996'], ['🇱🇦', 'Laos', '+856'], ['🇱🇻', 'Latvia', '+371'],
  ['🇱🇧', 'Lebanon', '+961'], ['🇱🇸', 'Lesotho', '+266'], ['🇱🇷', 'Liberia', '+231'], ['🇱🇾', 'Libya', '+218'],
  ['🇱🇮', 'Liechtenstein', '+423'], ['🇱🇹', 'Lithuania', '+370'], ['🇱🇺', 'Luxembourg', '+352'], ['🇲🇴', 'Macau', '+853'],
  ['🇲🇬', 'Madagascar', '+261'], ['🇲🇼', 'Malawi', '+265'], ['🇲🇾', 'Malaysia', '+60'], ['🇲🇻', 'Maldives', '+960'],
  ['🇲🇱', 'Mali', '+223'], ['🇲🇹', 'Malta', '+356'], ['🇲🇭', 'Marshall Islands', '+692'], ['🇲🇷', 'Mauritania', '+222'],
  ['🇲🇺', 'Mauritius', '+230'], ['🇲🇽', 'Mexico', '+52'], ['🇫🇲', 'Micronesia', '+691'], ['🇲🇩', 'Moldova', '+373'],
  ['🇲🇨', 'Monaco', '+377'], ['🇲🇳', 'Mongolia', '+976'], ['🇲🇪', 'Montenegro', '+382'], ['🇲🇦', 'Morocco', '+212'],
  ['🇲🇿', 'Mozambique', '+258'], ['🇲🇲', 'Myanmar', '+95'], ['🇳🇦', 'Namibia', '+264'], ['🇳🇷', 'Nauru', '+674'],
  ['🇳🇵', 'Nepal', '+977'], ['🇳🇱', 'Netherlands', '+31'], ['🇳🇿', 'New Zealand', '+64'], ['🇳🇮', 'Nicaragua', '+505'],
  ['🇳🇪', 'Niger', '+227'], ['🇳🇬', 'Nigeria', '+234'], ['🇰🇵', 'North Korea', '+850'], ['🇲🇰', 'North Macedonia', '+389'],
  ['🇳🇴', 'Norway', '+47'], ['🇴🇲', 'Oman', '+968'], ['🇵🇰', 'Pakistan', '+92'], ['🇵🇼', 'Palau', '+680'],
  ['🇵🇸', 'Palestine', '+970'], ['🇵🇦', 'Panama', '+507'], ['🇵🇬', 'Papua New Guinea', '+675'], ['🇵🇾', 'Paraguay', '+595'],
  ['🇵🇪', 'Peru', '+51'], ['🇵🇭', 'Philippines', '+63'], ['🇵🇱', 'Poland', '+48'], ['🇵🇹', 'Portugal', '+351'],
  ['🇶🇦', 'Qatar', '+974'], ['🇷🇴', 'Romania', '+40'], ['🇷🇺', 'Russia', '+7'], ['🇷🇼', 'Rwanda', '+250'],
  ['🇰🇳', 'Saint Kitts & Nevis', '+1'], ['🇱🇨', 'Saint Lucia', '+1'], ['🇻🇨', 'Saint Vincent', '+1'], ['🇼🇸', 'Samoa', '+685'],
  ['🇸🇲', 'San Marino', '+378'], ['🇸🇹', 'São Tomé & Príncipe', '+239'], ['🇸🇦', 'Saudi Arabia', '+966'], ['🇸🇳', 'Senegal', '+221'],
  ['🇷🇸', 'Serbia', '+381'], ['🇸🇨', 'Seychelles', '+248'], ['🇸🇱', 'Sierra Leone', '+232'], ['🇸🇬', 'Singapore', '+65'],
  ['🇸🇰', 'Slovakia', '+421'], ['🇸🇮', 'Slovenia', '+386'], ['🇸🇧', 'Solomon Islands', '+677'], ['🇸🇴', 'Somalia', '+252'],
  ['🇿🇦', 'South Africa', '+27'], ['🇰🇷', 'South Korea', '+82'], ['🇸🇸', 'South Sudan', '+211'], ['🇪🇸', 'Spain', '+34'],
  ['🇱🇰', 'Sri Lanka', '+94'], ['🇸🇩', 'Sudan', '+249'], ['🇸🇷', 'Suriname', '+597'], ['🇸🇪', 'Sweden', '+46'],
  ['🇨🇭', 'Switzerland', '+41'], ['🇸🇾', 'Syria', '+963'], ['🇹🇼', 'Taiwan', '+886'], ['🇹🇯', 'Tajikistan', '+992'],
  ['🇹🇿', 'Tanzania', '+255'], ['🇹🇭', 'Thailand', '+66'], ['🇹🇱', 'Timor-Leste', '+670'], ['🇹🇬', 'Togo', '+228'],
  ['🇹🇴', 'Tonga', '+676'], ['🇹🇹', 'Trinidad & Tobago', '+1'], ['🇹🇳', 'Tunisia', '+216'], ['🇹🇷', 'Turkey', '+90'],
  ['🇹🇲', 'Turkmenistan', '+993'], ['🇹🇻', 'Tuvalu', '+688'], ['🇺🇬', 'Uganda', '+256'], ['🇺🇦', 'Ukraine', '+380'],
  ['🇦🇪', 'United Arab Emirates', '+971'], ['🇬🇧', 'United Kingdom', '+44'], ['🇺🇸', 'United States', '+1'], ['🇺🇾', 'Uruguay', '+598'],
  ['🇺🇿', 'Uzbekistan', '+998'], ['🇻🇺', 'Vanuatu', '+678'], ['🇻🇦', 'Vatican City', '+379'], ['🇻🇪', 'Venezuela', '+58'],
  ['🇻🇳', 'Vietnam', '+84'], ['🇾🇪', 'Yemen', '+967'], ['🇿🇲', 'Zambia', '+260'], ['🇿🇼', 'Zimbabwe', '+263'],
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
                <select value={dial} onChange={(e) => setDial(e.target.value)} aria-label="Country code" style={{ ...inp, width: 116, flexShrink: 0, padding: '13px 6px 13px 10px', appearance: 'auto', colorScheme: 'dark' }}>
                  {DIAL_CODES.map(([flag, name, code], i) => <option key={i} value={code}>{flag} {name} {code}</option>)}
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
