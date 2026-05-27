import Link from 'next/link'
import { ArrowRight, Anchor, Globe, Users, Star } from 'lucide-react'
import FounderPhoto from './FounderPhoto'

export const metadata = {
  title: 'About BoatAway — Our Story & Mission',
  description: 'Founded in 2020 by Andra Kiirkivi, BoatAway is the global marketplace making premium boat charters accessible to everyone. Our story, mission, and values.',
  alternates: { canonical: 'https://boathire24.com/about' },
  openGraph: {
    title: 'About BoatAway — Our Story',
    description: 'How a solo founder turned a Marbella boat problem into a global charter marketplace.',
    url: 'https://boathire24.com/about',
    type: 'website',
    siteName: 'BoatAway',
  },
}

const VALUES = [
  { icon: Anchor,  title: 'Safety first',         desc: 'Every boat is inspected. Every skipper is licensed and insured. Non-negotiable — always.' },
  { icon: Globe,   title: 'Radical transparency',  desc: 'Real photos, real prices, real availability. No hidden fees, no bait-and-switch listings.' },
  { icon: Users,   title: 'People over platform',  desc: 'We\'re here to help, not automate you away. Real humans answer within the hour.' },
  { icon: Star,    title: 'Earn what you deserve',  desc: 'Boat owners keep 85%. The most competitive split in the charter industry.' },
]

const MILESTONES = [
  { year: '2020', label: 'Founded', desc: 'Andra launches BoatAway from Marbella with 3 boats and a Google Sheet.' },
  { year: '2021', label: '50 boats', desc: 'Fleet grows across the Costa del Sol. First five-star reviews roll in.' },
  { year: '2022', label: 'Ibiza launch', desc: 'Expanded to Ibiza and Mallorca. Stripe Connect payments go live.' },
  { year: '2023', label: '10 destinations', desc: 'Platform spreads to Croatia, Greece, and the Algarve.' },
  { year: '2024', label: 'Global', desc: 'Miami, Dubai, and Sydney added. 800+ verified boats worldwide.' },
  { year: '2025', label: 'Today', desc: '48 destinations, 15,000+ guests served, and still growing.' },
]

const gold = '#c9a84e'
const goldFaint = 'rgba(201,168,78,0.12)'
const goldBorder = 'rgba(201,168,78,0.22)'
const textMuted = 'rgba(244,244,242,0.55)'

export default function AboutPage() {
  return (
    <div style={{ background: '#07101e', color: '#f4f4f2' }}>

      {/* ── Hero ── */}
      <section style={{ position: 'relative', overflow: 'hidden', paddingTop: '104px', paddingBottom: '88px' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(201,168,78,0.10) 0%, transparent 70%)' }} />
        <div style={{ position: 'relative', maxWidth: '720px', margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 600, padding: '6px 18px', borderRadius: '99px', marginBottom: '28px', background: goldFaint, color: gold, border: `1px solid ${goldBorder}` }}>
            Our story
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)', fontWeight: 800, marginBottom: '22px', lineHeight: 1.12, color: '#f4f4f2' }}>
            Built by a boat lover,<br /><span style={{ color: gold }}>for everyone on the water.</span>
          </h1>
          <p style={{ fontSize: '17px', color: textMuted, lineHeight: 1.75, marginBottom: '0' }}>
            BoatAway started in Marbella in 2020 with a simple idea: booking a charter should be as easy as booking a hotel room.
            Five years later, we're in 48 destinations and still obsessing over every detail.
          </p>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <div style={{ borderTop: `1px solid rgba(201,168,78,0.10)`, borderBottom: `1px solid rgba(201,168,78,0.10)`, background: 'rgba(201,168,78,0.04)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '28px 24px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {[
            { value: '2020',   label: 'Founded' },
            { value: '200+',   label: 'Boats listed' },
            { value: '15,000+',label: 'Happy guests' },
            { value: '48',     label: 'Destinations' },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '22px', fontWeight: 700, color: gold, marginBottom: '4px' }}>{s.value}</p>
              <p style={{ fontSize: '12px', color: 'rgba(244,244,242,0.42)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Founder ── */}
      <section style={{ maxWidth: '900px', margin: '0 auto', padding: '88px 24px 0' }}>
        <div style={{ display: 'flex', gap: '56px', alignItems: 'center', flexWrap: 'wrap' }}>

          {/* Photo — replace GOOGLE_DRIVE_FILE_ID with the real file ID from your Drive "me" folder */}
          <FounderPhoto
            src="https://drive.google.com/thumbnail?id=GOOGLE_DRIVE_FILE_ID&sz=w600"
            alt="Andra Kiirkivi, Founder of BoatAway"
          />

          {/* Text */}
          <div style={{ flex: 1, minWidth: '260px' }}>
            <div style={{ display: 'inline-flex', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', padding: '5px 14px', borderRadius: '99px', background: goldFaint, color: gold, border: `1px solid ${goldBorder}`, marginBottom: '20px' }}>
              Founder & CEO
            </div>
            <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', fontWeight: 800, color: '#f4f4f2', lineHeight: 1.15, marginBottom: '8px' }}>
              Andra Kiirkivi
            </h2>
            <p style={{ fontSize: '15px', color: gold, fontWeight: 600, marginBottom: '22px' }}>
              Founder of BoatAway · Since 2020
            </p>
            <p style={{ fontSize: '15px', color: textMuted, lineHeight: 1.8, marginBottom: '18px' }}>
              Andra grew up on the coast of Estonia and spent summers working on charter boats in the Mediterranean.
              After years of watching guests struggle to find reliable, transparent bookings — and seeing boat owners leave money on the dock — she built BoatAway.
            </p>
            <p style={{ fontSize: '15px', color: textMuted, lineHeight: 1.8, marginBottom: '28px' }}>
              &ldquo;The sea should be accessible to everyone. Not just people who know the right people.
              That&apos;s what BoatAway is about — democratising the charter experience without compromising on quality.&rdquo;
            </p>

            {/* Social / contact */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, padding: '9px 18px', borderRadius: '99px', background: goldFaint, color: gold, border: `1px solid ${goldBorder}`, textDecoration: 'none' }}>
                Instagram
              </a>
              <a href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, padding: '9px 18px', borderRadius: '99px', background: 'rgba(255,255,255,0.05)', color: 'rgba(244,244,242,0.65)', border: '1px solid rgba(255,255,255,0.10)', textDecoration: 'none' }}>
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Divider ── */}
      <div style={{ maxWidth: '900px', margin: '88px auto 0', padding: '0 24px' }}>
        <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(201,168,78,0.25), transparent)' }} />
      </div>

      {/* ── Our story / timeline ── */}
      <section style={{ maxWidth: '900px', margin: '0 auto', padding: '88px 24px 0' }}>
        <div style={{ textAlign: 'center', marginBottom: '52px' }}>
          <span style={{ display: 'inline-flex', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', padding: '5px 14px', borderRadius: '99px', background: goldFaint, color: gold, border: `1px solid ${goldBorder}`, marginBottom: '16px' }}>
            The journey
          </span>
          <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.25rem)', fontWeight: 800, color: '#f4f4f2', lineHeight: 1.2 }}>
            From 3 boats to 48 destinations
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
          {MILESTONES.map((m, i) => (
            <div key={m.year} style={{ padding: '28px', borderRadius: '18px', background: '#0c1828', border: `1px solid ${i === MILESTONES.length - 1 ? goldBorder : 'rgba(201,168,78,0.10)'}`, position: 'relative', overflow: 'hidden' }}>
              {i === MILESTONES.length - 1 && (
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(201,168,78,0.06) 0%, transparent 60%)', pointerEvents: 'none' }} />
              )}
              <p style={{ fontSize: '28px', fontWeight: 900, color: gold, lineHeight: 1, marginBottom: '6px', opacity: 0.85 }}>{m.year}</p>
              <p style={{ fontSize: '14px', fontWeight: 700, color: '#f4f4f2', marginBottom: '8px' }}>{m.label}</p>
              <p style={{ fontSize: '13px', lineHeight: 1.65, color: textMuted, margin: 0 }}>{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Divider ── */}
      <div style={{ maxWidth: '900px', margin: '88px auto 0', padding: '0 24px' }}>
        <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(201,168,78,0.25), transparent)' }} />
      </div>

      {/* ── Values ── */}
      <section style={{ maxWidth: '900px', margin: '0 auto', padding: '88px 24px 0' }}>
        <div style={{ textAlign: 'center', marginBottom: '52px' }}>
          <span style={{ display: 'inline-flex', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', padding: '5px 14px', borderRadius: '99px', background: goldFaint, color: gold, border: `1px solid ${goldBorder}`, marginBottom: '16px' }}>
            What we stand for
          </span>
          <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.25rem)', fontWeight: 800, color: '#f4f4f2', lineHeight: 1.2 }}>
            Our values
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '16px' }}>
          {VALUES.map((v, i) => (
            <div key={v.title} style={{ display: 'flex', gap: '20px', padding: '28px', borderRadius: '18px', background: '#0c1828', border: `1px solid ${goldBorder}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '14px', background: goldFaint, flexShrink: 0 }}>
                <v.icon style={{ width: '20px', height: '20px', color: gold }} />
              </div>
              <div>
                <h3 style={{ fontWeight: 700, fontSize: '15px', color: '#f4f4f2', marginBottom: '8px' }}>{v.title}</h3>
                <p style={{ fontSize: '13px', lineHeight: 1.7, color: textMuted, margin: 0 }}>{v.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ maxWidth: '900px', margin: '0 auto', padding: '88px 24px' }}>
        <div style={{ borderRadius: '22px', padding: '52px', background: 'linear-gradient(135deg,#0e1e35,#0c1828)', border: `1px solid ${goldBorder}`, textAlign: 'center' }}>
          <p style={{ fontSize: '14px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: gold, marginBottom: '16px' }}>
            Ready to sail?
          </p>
          <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.25rem)', fontWeight: 800, color: '#f4f4f2', lineHeight: 1.2, marginBottom: '14px' }}>
            Join 15,000 guests who&apos;ve already cast off
          </h2>
          <p style={{ fontSize: '15px', color: textMuted, lineHeight: 1.7, maxWidth: '480px', margin: '0 auto 32px' }}>
            Browse verified yachts, catamarans, and speedboats across 48 destinations.
            Instant booking, licensed skippers, no hidden fees.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/search" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 32px', borderRadius: '99px', background: 'linear-gradient(135deg,#d4b05e,#c9a84e,#b8942e)', color: '#07101e', fontWeight: 700, fontSize: '15px', textDecoration: 'none', boxShadow: '0 6px 24px rgba(201,168,78,0.28)' }}>
              Browse all boats <ArrowRight style={{ width: '16px', height: '16px' }} />
            </Link>
            <Link href="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 32px', borderRadius: '99px', border: `1px solid ${goldBorder}`, color: 'rgba(244,244,242,0.75)', fontWeight: 600, fontSize: '15px', textDecoration: 'none', background: 'transparent' }}>
              Get in touch
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
