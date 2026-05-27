import Link from 'next/link'
import { Search, CreditCard, Anchor, Star, Ship, Shield, ArrowRight, CheckCircle2 } from 'lucide-react'

export const metadata = {
  title: 'How BoatAway Works',
  description: 'The simplest way to book a boat charter or list your vessel. Instant booking, licensed skippers, secure payments.',
}

const RENTER_STEPS = [
  {
    num: '01',
    icon: Search,
    title: 'Search & discover',
    desc: 'Browse boats by destination, date, boat type, and group size. Read verified reviews from real guests.',
  },
  {
    num: '02',
    icon: CreditCard,
    title: 'Book & pay securely',
    desc: 'Choose instant book or send a request. Pay by card — your money is held safely until the day of your trip.',
  },
  {
    num: '03',
    icon: Anchor,
    title: 'Set sail',
    desc: 'Meet your licensed captain at the marina. Skipper, fuel, drinks, and safety gear are all included.',
  },
  {
    num: '04',
    icon: Star,
    title: 'Review your trip',
    desc: 'After your charter, leave an honest review to help future guests find the perfect boat.',
  },
]

const HOST_STEPS = [
  {
    icon: Ship,
    title: 'List your boat',
    desc: 'Create a listing in minutes. Set your own prices, availability, and house rules.',
    badge: 'Free',
  },
  {
    icon: Shield,
    title: 'We handle guests',
    desc: 'BoatAway verifies renters, handles payments, and provides 24/7 support for you and your guests.',
    badge: 'Hands-off',
  },
  {
    icon: CreditCard,
    title: 'Get paid',
    desc: 'Earnings are transferred to your bank account 7 days after each completed charter. You keep 85%.',
    badge: '85% yours',
  },
]

const RENTER_INCLUDES = [
  'Licensed skipper on every boat',
  'Fuel included in all charters',
  'Drinks & light snacks on board',
  'Full insurance coverage',
  'Free cancellation (flexible policy)',
]

export default function HowItWorksPage() {
  return (
    <div style={{ background: '#07101e' }}>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden py-24 px-4 text-center">
        {/* Subtle radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(201,168,78,0.10) 0%, transparent 70%)',
          }}
        />
        <div className="relative max-w-3xl mx-auto">
          <div
            className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-1.5 rounded-full mb-6"
            style={{ background: 'rgba(201,168,78,0.12)', color: '#c9a84e', border: '1px solid rgba(201,168,78,0.25)' }}
          >
            Simple · Secure · Trusted
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-5 leading-tight" style={{ color: '#f4f4f2' }}>
            How <span style={{ color: '#c9a84e' }}>BoatAway</span> works
          </h1>
          <p className="text-lg" style={{ color: 'rgba(244,244,242,0.60)' }}>
            The simplest way to book a verified boat charter — or earn money listing yours.
          </p>
        </div>
      </section>

      {/* ── For Renters ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-24">

        {/* Section label */}
        <div className="flex items-center gap-3 mb-10">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold"
            style={{ background: 'rgba(201,168,78,0.15)', color: '#c9a84e', border: '1px solid rgba(201,168,78,0.25)' }}
          >
            R
          </div>
          <h2 className="text-2xl font-bold" style={{ color: '#f4f4f2' }}>For renters</h2>
        </div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
          {RENTER_STEPS.map((step) => (
            <div
              key={step.num}
              className="relative p-6 rounded-2xl transition-all duration-200 hover:[border-color:rgba(201,168,78,0.35)]"
              style={{
                background: '#0c1828',
                border: '1px solid rgba(201,168,78,0.12)',
              }}
            >
              {/* Large step number (background) */}
              <span
                className="absolute top-4 right-5 text-5xl font-black leading-none select-none"
                style={{ color: 'rgba(201,168,78,0.07)' }}
              >
                {step.num}
              </span>

              {/* Icon */}
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                style={{ background: 'rgba(201,168,78,0.12)' }}
              >
                <step.icon className="w-5 h-5" style={{ color: '#c9a84e' }} />
              </div>

              <h3 className="font-bold text-base mb-2" style={{ color: '#f4f4f2' }}>{step.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(244,244,242,0.55)' }}>{step.desc}</p>
            </div>
          ))}
        </div>

        {/* What's always included */}
        <div
          className="rounded-2xl p-6 mb-10"
          style={{ background: 'rgba(201,168,78,0.06)', border: '1px solid rgba(201,168,78,0.18)' }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#c9a84e' }}>
            Always included — every charter
          </p>
          <div className="flex flex-wrap gap-x-8 gap-y-2">
            {RENTER_INCLUDES.map((item) => (
              <span key={item} className="flex items-center gap-2 text-sm" style={{ color: 'rgba(244,244,242,0.75)' }}>
                <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: '#c9a84e' }} />
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Link
          href="/search"
          className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm font-bold transition-all hover:scale-[1.03]"
          style={{
            background: 'linear-gradient(135deg, #d4b05e 0%, #c9a84e 60%, #b8942e 100%)',
            color: '#07101e',
            boxShadow: '0 6px 24px rgba(201,168,78,0.30)',
          }}
        >
          Find a boat <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      {/* Divider */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(201,168,78,0.25), transparent)' }} />
      </div>

      {/* ── For Hosts ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-24">

        {/* Section label */}
        <div className="flex items-center gap-3 mb-10">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold"
            style={{ background: 'rgba(201,168,78,0.15)', color: '#c9a84e', border: '1px solid rgba(201,168,78,0.25)' }}
          >
            H
          </div>
          <h2 className="text-2xl font-bold" style={{ color: '#f4f4f2' }}>For hosts</h2>
        </div>

        {/* Host steps */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
          {HOST_STEPS.map((step) => (
            <div
              key={step.title}
              className="p-6 rounded-2xl flex flex-col items-start gap-4"
              style={{
                background: '#0c1828',
                border: '1px solid rgba(201,168,78,0.12)',
              }}
            >
              {/* Icon + badge row */}
              <div className="flex items-center justify-between w-full">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(201,168,78,0.12)' }}
                >
                  <step.icon className="w-5 h-5" style={{ color: '#c9a84e' }} />
                </div>
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(201,168,78,0.15)', color: '#c9a84e' }}
                >
                  {step.badge}
                </span>
              </div>

              <div>
                <h3 className="font-bold mb-1.5" style={{ color: '#f4f4f2' }}>{step.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(244,244,242,0.55)' }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Host CTA block */}
        <div
          className="rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6"
          style={{
            background: 'linear-gradient(135deg, #0e1e35 0%, #0c1828 100%)',
            border: '1px solid rgba(201,168,78,0.22)',
          }}
        >
          <div>
            <p className="font-bold text-lg mb-1" style={{ color: '#f4f4f2' }}>Start earning from your boat</p>
            <p className="text-sm" style={{ color: 'rgba(244,244,242,0.55)' }}>
              Free to list · You keep 85% · Payout in 7 days
            </p>
          </div>
          <Link
            href="/become-a-host"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm font-bold whitespace-nowrap transition-all hover:scale-[1.03]"
            style={{
              background: 'linear-gradient(135deg, #d4b05e 0%, #c9a84e 60%, #b8942e 100%)',
              color: '#07101e',
              boxShadow: '0 6px 24px rgba(201,168,78,0.28)',
            }}
          >
            Start hosting <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

    </div>
  )
}
