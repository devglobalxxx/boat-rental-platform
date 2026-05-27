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
    google: 'boathire24-google-verification',
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

        {/* ── Dark Luxury Footer ── */}
        <footer style={{ background: 'linear-gradient(180deg, #070f1c 0%, #050d18 100%)', borderTop: '1px solid rgba(201,168,78,0.12)' }}>
          <div className="container py-16">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-10">

              {/* Brand */}
              <div className="col-span-2">
                <Link href="/" className="inline-flex mb-4">
                  <Logo size={32} />
                </Link>
                <p className="text-sm leading-relaxed mb-5" style={{ color: 'rgba(244,244,242,0.50)' }}>
                  The global marketplace for verified boat charters.
                  Licensed skippers, real prices, instant booking — in
                  48 destinations worldwide.
                </p>
                <div className="flex flex-col gap-2.5">
                  <a
                    href="https://wa.me/34600000000"
                    className="inline-flex items-center gap-2.5 text-xs font-semibold px-4 py-2.5 rounded-full transition-all w-fit hover:border-[rgba(37,211,102,0.55)]"
                    style={{
                      background: 'rgba(37,211,102,0.10)',
                      color: '#5edb8a',
                      border: '1px solid rgba(37,211,102,0.28)',
                    }}
                  >
                    {/* WhatsApp icon */}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    WhatsApp Support
                  </a>
                </div>
              </div>

              {/* Explore */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#c9a84e' }}>Explore</h3>
                <ul className="space-y-2.5">
                  {[
                    { href: '/search', label: 'All boats' },
                    { href: '/marbella', label: 'Marbella' },
                    { href: '/how-it-works', label: 'How it works' },
                    { href: '/blog', label: 'Charter guide' },
                  ].map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-sm transition-colors hover:text-[#c9a84e]" style={{ color: 'rgba(244,244,242,0.50)' }}>
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Host */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#c9a84e' }}>Host</h3>
                <ul className="space-y-2.5">
                  {[
                    { href: '/become-a-host', label: 'List your boat' },
                    { href: '/host', label: 'Host dashboard' },
                    { href: '/host/earnings', label: 'Earnings' },
                    { href: '/host/onboarding', label: 'Stripe setup' },
                  ].map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-sm transition-colors hover:text-[#c9a84e]" style={{ color: 'rgba(244,244,242,0.50)' }}>
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Company */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#c9a84e' }}>Company</h3>
                <ul className="space-y-2.5">
                  {[
                    { href: '/about', label: 'About us' },
                    { href: '/contact', label: 'Contact' },
                    { href: '/privacy', label: 'Privacy policy' },
                    { href: '/terms', label: 'Terms of service' },
                  ].map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-sm transition-colors hover:text-[#c9a84e]" style={{ color: 'rgba(244,244,242,0.50)' }}>
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Legal bar */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="container py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs" style={{ color: 'rgba(244,244,242,0.35)' }}>
                © {new Date().getFullYear()} BoatAway Ltd. All rights reserved. Payments secured by Stripe.
              </p>
              <p className="text-xs" style={{ color: 'rgba(244,244,242,0.25)' }}>
                All charters include a licensed skipper. BoatAway does not operate vessels.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
