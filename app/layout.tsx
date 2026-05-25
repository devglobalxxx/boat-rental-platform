import type { Metadata } from 'next'
import './globals.css'
import SiteNav from '@/components/nav/SiteNav'

export const metadata: Metadata = {
  title: {
    default: 'BoatAway — Rent Boats & Yachts Worldwide',
    template: '%s | BoatAway',
  },
  description:
    'Find and book boats, yachts, catamarans and sailing boats worldwide. Verified listings, instant booking, secure payments.',
  openGraph: { type: 'website', siteName: 'BoatAway' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="h-full flex flex-col antialiased">
        <SiteNav />
        <main className="flex-1">{children}</main>
        <footer className="bg-[#0f2547] text-white py-12 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="col-span-2 md:col-span-1">
                <span className="text-xl font-bold text-[#06b6d4]">BoatAway</span>
                <p className="mt-2 text-sm text-slate-400">
                  Find and book boats worldwide. Verified listings, secure payments.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Explore</h3>
                <ul className="mt-3 space-y-2 text-sm text-slate-400">
                  <li><a href="/search" className="hover:text-white transition-colors">Search boats</a></li>
                  <li><a href="/marbella" className="hover:text-white transition-colors">Marbella</a></li>
                  <li><a href="/how-it-works" className="hover:text-white transition-colors">How it works</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Host</h3>
                <ul className="mt-3 space-y-2 text-sm text-slate-400">
                  <li><a href="/become-a-host" className="hover:text-white transition-colors">Become a host</a></li>
                  <li><a href="/host" className="hover:text-white transition-colors">Host dashboard</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Company</h3>
                <ul className="mt-3 space-y-2 text-sm text-slate-400">
                  <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                </ul>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-slate-700 text-center text-xs text-slate-500">
              © {new Date().getFullYear()} BoatAway. All rights reserved.
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
