import type { Metadata } from 'next'
import './globals.css'
import SiteNav from '@/components/nav/SiteNav'
import Link from 'next/link'
import Logo from '@/components/ui/Logo'

export const metadata: Metadata = {
  metadataBase: new URL('https://boathire24.com'),
  title: {
    default: 'BoatAway — Rent Boats & Yachts Worldwide',
    template: '%s | BoatAway',
  },
  description:
    'Find and book verified boats, yachts, catamarans and sailing boats worldwide. Licensed skippers, instant booking, secure payments. No surprises.',
  keywords: ['boat rental', 'yacht charter', 'boat hire', 'Marbella', 'Ibiza', 'Miami'],
  authors: [{ name: 'BoatAway', url: 'https://boathire24.com' }],
  creator: 'BoatAway',
  publisher: 'BoatAway',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    type: 'website',
    siteName: 'BoatAway',
    locale: 'en_GB',
    images: [{
      url: 'https://images.unsplash.com/photo-1528154291023-a6525fabe5b4?w=1200&q=80',
      width: 1200,
      height: 630,
      alt: 'Luxury yacht charter — BoatAway',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@boataway',
    creator: '@boataway',
    images: ['https://images.unsplash.com/photo-1528154291023-a6525fabe5b4?w=1200&q=80'],
  },
  verification: {
    google: [
      'X2eUUZ7APRJWlW1WksThzh6ylZRQstup7K7PLNHJpY0',
      'QSfSombLmS6Op_4Kz1ypx07X70NuivcXYeoTkoAKLNQ',
    ],
  },
  alternates: {
    types: {
      'application/rss+xml': 'https://boathire24.com/blog/rss.xml',
    },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full flex flex-col antialiased" style={{ background: '#07101e' }}>
        <SiteNav />
        <main className="flex-1">{children}</main>

        {/* ── Footer ── */}
        <footer style={{ background: 'linear-gradient(180deg, #070f1c 0%, #040c16 100%)', borderTop: '1px solid rgba(201,168,78,0.15)' }}>

          {/* ── CTA strip ── */}
          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="container" style={{ paddingTop: '52px', paddingBottom: '52px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', textAlign: 'center' }}>
                <p style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#c9a84e' }}>Ready to cast off?</p>
                <h2 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 800, color: '#f4f4f2', lineHeight: 1.15, maxWidth: '560px' }}>
                  Book your charter in&nbsp;<span style={{ color: '#c9a84e' }}>under 5 minutes.</span>
                </h2>
                <p style={{ fontSize: '15px', color: 'rgba(244,244,242,0.50)', maxWidth: '420px', lineHeight: 1.6 }}>
                  Browse 200+ verified boats across 48 destinations. Instant confirmation, licensed skippers, secure payments.
                </p>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <Link href="/search" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#c9a84e', color: '#07101c', fontWeight: 700, fontSize: '14px', padding: '13px 26px', borderRadius: '50px', textDecoration: 'none' }}>
                    Browse All Boats
                  </Link>
                  <Link href="/become-a-host" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'transparent', color: 'rgba(244,244,242,0.75)', fontWeight: 600, fontSize: '14px', padding: '13px 26px', borderRadius: '50px', border: '1px solid rgba(255,255,255,0.18)', textDecoration: 'none' }}>
                    List Your Boat
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* ── Main footer grid ── */}
          <div className="container" style={{ paddingTop: '60px', paddingBottom: '60px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '40px' }}>

              {/* Brand */}
              <div style={{ gridColumn: 'span 2' }}>
                <Link href="/" style={{ display: 'inline-flex', marginBottom: '16px' }}>
                  <Logo size={32} />
                </Link>
                <p style={{ fontSize: '13px', lineHeight: '1.7', color: 'rgba(244,244,242,0.48)', marginBottom: '24px', maxWidth: '260px' }}>
                  The global marketplace for verified boat charters. Licensed skippers, transparent prices, instant booking.
                </p>

                {/* Contact chips */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                  <a href="https://wa.me/34600000000" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: 600, padding: '10px 16px', borderRadius: '50px', background: 'rgba(37,211,102,0.10)', color: '#5edb8a', border: '1px solid rgba(37,211,102,0.25)', textDecoration: 'none', width: 'fit-content' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    WhatsApp · 08:00–22:00
                  </a>
                  <a href="mailto:info@boathire24.com" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: 600, padding: '10px 16px', borderRadius: '50px', background: 'rgba(201,168,78,0.08)', color: '#c9a84e', border: '1px solid rgba(201,168,78,0.22)', textDecoration: 'none', width: 'fit-content' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                    </svg>
                    info@boathire24.com
                  </a>
                </div>

                {/* Trust badges */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {['🔒 Secure payments', '⭐ 4.9 rating', '✅ Verified boats'].map((badge) => (
                    <span key={badge} style={{ fontSize: '11px', color: 'rgba(244,244,242,0.40)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '50px', padding: '5px 10px' }}>
                      {badge}
                    </span>
                  ))}
                </div>
              </div>

              {/* Explore */}
              <div>
                <h3 style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#c9a84e', marginBottom: '20px' }}>Explore</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '13px' }}>
                  {[
                    { href: '/search', label: 'All boats' },
                    { href: '/marbella', label: 'Marbella' },
                    { href: '/how-it-works', label: 'How it works' },
                    { href: '/blog', label: 'Charter guide' },
                    { href: '/search?type=luxury', label: 'Luxury yachts' },
                  ].map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} style={{ fontSize: '13px', color: 'rgba(244,244,242,0.50)', textDecoration: 'none', transition: 'color 0.15s' }} className="hover:text-[#c9a84e]">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Host */}
              <div>
                <h3 style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#c9a84e', marginBottom: '20px' }}>For Hosts</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '13px' }}>
                  {[
                    { href: '/become-a-host', label: 'List your boat' },
                    { href: '/host', label: 'Host dashboard' },
                    { href: '/host/calendar', label: 'Manage calendar' },
                    { href: '/host/earnings', label: 'Earnings & payouts' },
                    { href: '/host/onboarding', label: 'Stripe setup' },
                  ].map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} style={{ fontSize: '13px', color: 'rgba(244,244,242,0.50)', textDecoration: 'none', transition: 'color 0.15s' }} className="hover:text-[#c9a84e]">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Company */}
              <div>
                <h3 style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#c9a84e', marginBottom: '20px' }}>Company</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '13px' }}>
                  {[
                    { href: '/about', label: 'About us' },
                    { href: '/contact', label: 'Contact' },
                    { href: '/blog', label: 'Blog' },
                    { href: '/privacy', label: 'Privacy policy' },
                    { href: '/terms', label: 'Terms of service' },
                  ].map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} style={{ fontSize: '13px', color: 'rgba(244,244,242,0.50)', textDecoration: 'none', transition: 'color 0.15s' }} className="hover:text-[#c9a84e]">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* ── Legal bar ── */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="container" style={{ paddingTop: '20px', paddingBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {[
                  { href: '/terms', label: 'Terms' },
                  { href: '/privacy', label: 'Privacy' },
                  { href: '/cookies', label: 'Cookies' },
                  { href: '/contact', label: 'Support' },
                ].map((l) => (
                  <Link key={l.href} href={l.href} style={{ fontSize: '11px', color: 'rgba(244,244,242,0.30)', textDecoration: 'none' }} className="hover:text-[#c9a84e]">
                    {l.label}
                  </Link>
                ))}
              </div>
              <p style={{ fontSize: '11px', color: 'rgba(244,244,242,0.25)', textAlign: 'center' }}>
                © {new Date().getFullYear()} BoatAway Ltd. All rights reserved. · Payments secured by Stripe · All charters include a licensed skipper
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
