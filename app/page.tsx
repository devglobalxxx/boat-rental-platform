import Link from 'next/link'
import { Anchor, Star, Shield, Zap, Globe, ChevronRight } from 'lucide-react'
import SearchBar from '@/components/search/SearchBar'
import { Button } from '@/components/ui/button'

const FEATURED_LOCATIONS = [
  { slug: 'marbella', name: 'Marbella', country: 'Spain', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', boats: 18 },
  { slug: 'ibiza', name: 'Ibiza', country: 'Spain', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80', boats: 0 },
  { slug: 'mykonos', name: 'Mykonos', country: 'Greece', image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=600&q=80', boats: 0 },
  { slug: 'amalfi', name: 'Amalfi Coast', country: 'Italy', image: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=600&q=80', boats: 0 },
  { slug: 'miami', name: 'Miami', country: 'USA', image: 'https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?w=600&q=80', boats: 0 },
  { slug: 'bali', name: 'Bali', country: 'Indonesia', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80', boats: 0 },
]

const BOAT_TYPES = [
  { type: 'motor_yacht', label: 'Motor Yachts', emoji: '🛥️', desc: 'Luxury and speed' },
  { type: 'catamaran', label: 'Catamarans', emoji: '⛵', desc: 'Stability & space' },
  { type: 'sailing', label: 'Sailing Boats', emoji: '🌊', desc: 'Wind-powered adventure' },
  { type: 'speedboat', label: 'Speedboats', emoji: '💨', desc: 'Thrilling rides' },
  { type: 'fishing', label: 'Fishing Boats', emoji: '🎣', desc: 'Reel in the big catch' },
  { type: 'luxury', label: 'Superyachts', emoji: '✨', desc: 'Ultimate luxury' },
]

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Search & discover',
    desc: 'Browse thousands of verified boats worldwide. Filter by type, size, price, and more.',
  },
  {
    step: '02',
    title: 'Book securely',
    desc: 'Instant book or request to book. Secure Stripe payments — you\'re protected every step.',
  },
  {
    step: '03',
    title: 'Set sail',
    desc: 'Meet your skipper at the marina and enjoy your perfect day on the water.',
  },
]

export default function HomePage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-[#0a1a32]">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1563565279-4b3b5b5b5b5b?w=1600&q=80')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a1a32]/60 via-[#0a1a32]/40 to-[#0a1a32]/80" />

        <div className="relative z-10 text-center max-w-4xl mx-auto px-4 py-24">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-full px-4 py-1.5 text-sm mb-6">
            <Globe className="w-3.5 h-3.5 text-[#06b6d4]" />
            Boats available in 50+ destinations worldwide
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
            Your next adventure
            <br />
            <span className="text-[#06b6d4]">starts at sea</span>
          </h1>

          <p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto">
            Discover and instantly book boats, yachts, and catamarans from verified hosts worldwide.
            Every charter includes a licensed skipper.
          </p>

          {/* Search bar */}
          <SearchBar />

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-6 mt-8 text-white/60 text-sm">
            <span className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-[#06b6d4]" /> Secure payments</span>
            <span className="flex items-center gap-1.5"><Star className="w-4 h-4 text-amber-400" /> Verified listings</span>
            <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-[#06b6d4]" /> Instant book available</span>
          </div>
        </div>
      </section>

      {/* ── Boat types ───────────────────────────────────────────────────────── */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-900">Explore by boat type</h2>
          <p className="text-slate-500 mt-2">From nimble speedboats to superyachts — find the perfect vessel.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {BOAT_TYPES.map((bt) => (
            <Link
              key={bt.type}
              href={`/search?type=${bt.type}`}
              className="group flex flex-col items-center gap-2 p-4 rounded-2xl border border-slate-200 hover:border-[#06b6d4] hover:shadow-sm transition-all text-center"
            >
              <span className="text-3xl">{bt.emoji}</span>
              <span className="font-semibold text-sm text-slate-900 group-hover:text-[#0891b2] transition-colors">{bt.label}</span>
              <span className="text-xs text-slate-400">{bt.desc}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured destinations ─────────────────────────────────────────────── */}
      <section className="py-16 bg-[#fdfaf6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Top destinations</h2>
              <p className="text-slate-500 mt-1">From the Mediterranean to the tropics.</p>
            </div>
            <Link href="/search" className="hidden md:flex items-center gap-1 text-sm font-medium text-[#06b6d4] hover:text-[#0891b2] transition-colors">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {FEATURED_LOCATIONS.map((loc) => (
              <Link
                key={loc.slug}
                href={`/${loc.slug}`}
                className="group relative aspect-[4/3] rounded-2xl overflow-hidden"
              >
                <img
                  src={loc.image}
                  alt={loc.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <div className="font-bold text-lg leading-none">{loc.name}</div>
                  <div className="text-sm text-white/80 mt-0.5">{loc.country}</div>
                  {loc.boats > 0 && (
                    <div className="text-xs text-[#06b6d4] mt-1">{loc.boats} boats available</div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────────── */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900">How BoatAway works</h2>
          <p className="text-slate-500 mt-2">From search to sea in three easy steps.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {HOW_IT_WORKS.map((step) => (
            <div key={step.step} className="text-center">
              <div className="text-5xl font-bold text-[#06b6d4]/20 mb-4">{step.step}</div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Button asChild variant="sea" size="lg">
            <Link href="/how-it-works">Learn more</Link>
          </Button>
        </div>
      </section>

      {/* ── Become a host CTA ────────────────────────────────────────────────── */}
      <section className="py-20 bg-[#0f2547]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Anchor className="w-12 h-12 text-[#06b6d4] mx-auto mb-4" />
          <h2 className="text-4xl font-bold text-white mb-4">Own a boat? Earn with it.</h2>
          <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">
            List your vessel on BoatAway and reach thousands of guests worldwide.
            You set the price, we handle payments and guest support.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="sea" size="lg">
              <Link href="/become-a-host">Start hosting</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 bg-transparent hover:text-white">
              <Link href="/how-it-works#hosts">How hosting works</Link>
            </Button>
          </div>
          <div className="flex justify-center gap-8 mt-10 text-sm text-white/60">
            <span>✓ Free to list</span>
            <span>✓ You keep 85%</span>
            <span>✓ Secure payouts</span>
          </div>
        </div>
      </section>
    </>
  )
}
