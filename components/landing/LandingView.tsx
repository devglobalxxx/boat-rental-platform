import Link from 'next/link'
import { MapPin } from 'lucide-react'
import type { LandingPage } from '@/lib/landing/pages'

const gold = '#74cfe8'
const goldFaint = 'rgba(116,207,232,0.12)'
const goldBorder = 'rgba(116,207,232,0.22)'

export default function LandingView({ page }: { page: LandingPage }) {
  const faqJsonLd = page.faqs?.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: page.faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      }
    : null

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://boathire24.com' },
      { '@type': 'ListItem', position: 2, name: page.h1 || page.title, item: `https://boathire24.com/${page.slug}` },
    ],
  }

  return (
    <div style={{ background: '#07101e', color: '#f4f4f2', minHeight: '100vh' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      {/* ── Hero ── */}
      <section style={{ position: 'relative', height: '340px', overflow: 'hidden' }}>
        {page.heroImage ? (
          <img src={page.heroImage} alt={page.h1} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.42 }} />
        ) : (
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,#0a1a32,#071122)' }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(7,16,30,0.3) 0%, rgba(7,16,30,0.78) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 60% at 50% 100%, rgba(116,207,232,0.10) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 24px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'rgba(244,244,242,0.65)', marginBottom: '14px' }}>
            <MapPin style={{ width: '13px', height: '13px' }} /> Costa del Sol, Spain
          </div>
          <h1 style={{ fontSize: 'clamp(1.9rem, 5vw, 3rem)', fontWeight: 800, color: '#f4f4f2', lineHeight: 1.12, marginBottom: '12px', maxWidth: '780px' }}>
            {page.h1}
          </h1>
        </div>
      </section>

      {/* ── Body ── */}
      <article style={{ maxWidth: '760px', margin: '0 auto', padding: '48px 24px 40px' }}>
        <div
          className="landing-prose"
          style={{ fontSize: '16px', lineHeight: 1.75, color: 'rgba(244,244,242,0.82)' }}
          dangerouslySetInnerHTML={{ __html: page.intro + page.bodyHtml }}
        />

        {page.faqs?.length ? (
          <section style={{ marginTop: '48px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#f4f4f2', marginBottom: '20px' }}>Frequently asked questions</h2>
            {page.faqs.map((f, i) => (
              <details key={i} style={{ borderBottom: '1px solid rgba(116,207,232,0.12)', padding: '14px 0' }}>
                <summary style={{ cursor: 'pointer', fontWeight: 600, color: '#f4f4f2', fontSize: '15px' }}>{f.q}</summary>
                <p style={{ marginTop: '10px', color: 'rgba(244,244,242,0.7)', lineHeight: 1.7, fontSize: '15px' }}>{f.a}</p>
              </details>
            ))}
          </section>
        ) : null}
      </article>

      {/* ── CTA ── */}
      <section style={{ borderTop: '1px solid rgba(116,207,232,0.10)', background: goldFaint }}>
        <div style={{ maxWidth: '760px', margin: '0 auto', padding: '40px 24px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#f4f4f2', marginBottom: '10px' }}>Ready to get on the water?</h2>
          <p style={{ fontSize: '15px', color: 'rgba(244,244,242,0.55)', marginBottom: '24px' }}>Browse verified boats — licensed skipper always included.</p>
          <Link href="/search" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '13px 28px', borderRadius: '99px', background: 'linear-gradient(135deg,#8fdcf0,#74cfe8,#4fb8d6)', color: '#07101e', fontWeight: 700, fontSize: '14px', textDecoration: 'none', border: `1px solid ${goldBorder}` }}>
            Browse all boats
          </Link>
        </div>
      </section>

      {faqJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      )}
    </div>
  )
}
