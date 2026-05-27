import type { Metadata } from 'next'
import './globals.css'
import SiteNav from '@/components/nav/SiteNav'
import Link from 'next/link'
import Logo from '@/components/ui/Logo'

export const metadata: Metadata = {
  title: {
    default: 'BoatAway — Rent Boats & Yachts Worldwide',
    template: '%s | BoatAway',
  },
  description:
    'Find and book verified boats, yachts, catamarans and sailing boats worldwide. Licensed skippers, instant booking, secure payments. No surprises.',
  keywords: ['boat rental', 'yacht charter', 'boat hire', 'Marbella', 'Ibiza', 'Miami'],
  openGraph: {
    type: 'website',
    siteName: 'BoatAway',
    images: [{ url: 'https://images.unsplash.com/photo-1528154291023-a6525fabe5b4?w=1200&q=80' }],
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
                <div className="flex gap-3">
                  <a
                    href="https://wa.me/34600000000"
                    className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full transition-all"
                    style={{ background: '#25d366', color: '#fff' }}
                  >
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
