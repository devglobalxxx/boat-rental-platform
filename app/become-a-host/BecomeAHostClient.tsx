'use client'

import Link from 'next/link'
import { BarChart3, Shield, Zap, Anchor, ArrowRight, CheckCircle2, TrendingUp } from 'lucide-react'

const BENEFITS = [
  {
    icon: BarChart3,
    title: 'Earn on your terms',
    desc: 'Set your own prices, block dates when you need the boat, no minimum commitment.',
    stat: '€2,400',
    statLabel: 'avg. monthly earnings',
  },
  {
    icon: Shield,
    title: 'Protected bookings',
    desc: 'Stripe-powered payments, verified renters, and 24/7 host support on every booking.',
    stat: '100%',
    statLabel: 'payment protection',
  },
  {
    icon: Zap,
    title: 'Get bookings fast',
    desc: 'Instant-book option gets you guests faster. We handle all discovery, marketing, and SEO.',
    stat: '48h',
    statLabel: 'to first booking',
  },
  {
    icon: Anchor,
    title: 'You keep 85%',
    desc: 'BoatAway charges a 15% platform fee — one of the lowest in the yacht charter industry.',
    stat: '85%',
    statLabel: 'of every booking',
  },
]

const STEPS = [
  { num: '01', title: 'Create your listing', desc: 'Add photos, set your prices and availability. Takes about 10 minutes.' },
  { num: '02', title: 'Receive bookings',    desc: 'Guests find you via search. Approve requests or turn on instant book.' },
  { num: '03', title: 'Host the charter',    desc: 'Meet your guests at the marina. BoatAway handles the payments.' },
  { num: '04', title: 'Get paid',            desc: 'Earnings hit your bank account 7 days after each completed charter.' },
]

const INCLUDES = [
  'Verified renter profiles',
  'Stripe payment protection',
  'Free listing — no upfront cost',
  'Full insurance framework',
  '24/7 host support',
  'Your own calendar management',
]

export default function BecomeAHostClient() {
  return (
    <div style={{ background: '#07101e' }}>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden py-28 px-4">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 90% 60% at 60% 0%, rgba(201,168,78,0.12) 0%, transparent 65%)' }}
        />
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.025]"
          style={{
            backgroundImage: 'linear-gradient(rgba(201,168,78,1) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,78,1) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }}
        />

        <div className="relative max-w-5xl mx-auto">
          <div className="max-w-2xl">
            <div
              className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-1.5 rounded-full mb-7"
              style={{ background: 'rgba(201,168,78,0.12)', color: '#c9a84e', border: '1px solid rgba(201,168,78,0.25)' }}
            >
              <TrendingUp className="w-3.5 h-3.5" /> Earn from your boat today
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6" style={{ color: '#f4f4f2' }}>
              Turn your boat into{' '}
              <span style={{ color: '#c9a84e' }}>consistent income</span>
            </h1>

            <p className="text-lg leading-relaxed mb-10" style={{ color: 'rgba(244,244,242,0.60)' }}>
              List on BoatAway and reach thousands of verified guests every month.
              Free to start — you keep 85% of every booking.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/host/listings/new"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-base font-bold transition-all hover:scale-[1.03]"
                style={{
                  background: 'linear-gradient(135deg, #d4b05e 0%, #c9a84e 60%, #b8942e 100%)',
                  color: '#07101e',
                  boxShadow: '0 8px 32px rgba(201,168,78,0.32)',
                }}
              >
                List my boat — it&apos;s free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-base font-semibold transition-all"
                style={{ border: '1px solid rgba(201,168,78,0.30)', color: 'rgba(244,244,242,0.80)', background: 'transparent' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#c9a84e' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,168,78,0.30)' }}
              >
                See how it works
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <div
        className="border-y"
        style={{ borderColor: 'rgba(201,168,78,0.12)', background: 'rgba(201,168,78,0.04)' }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { value: '17',     label: 'Boats listed' },
            { value: '€2.4k', label: 'Avg. monthly earn' },
            { value: '85%',   label: 'Payout rate' },
            { value: '7 days',label: 'To get paid' },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-2xl font-bold" style={{ color: '#c9a84e' }}>{s.value}</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(244,244,242,0.45)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Benefits ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold mb-3" style={{ color: '#f4f4f2' }}>Why host on BoatAway?</h2>
          <p className="text-base" style={{ color: 'rgba(244,244,242,0.50)' }}>
            Everything you need to run a professional charter operation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {BENEFITS.map((b) => (
            <div
              key={b.title}
              className="p-6 rounded-2xl flex gap-5 transition-all duration-200"
              style={{ background: '#0c1828', border: '1px solid rgba(201,168,78,0.12)' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,168,78,0.30)' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,168,78,0.12)' }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'rgba(201,168,78,0.12)' }}
              >
                <b.icon className="w-5 h-5" style={{ color: '#c9a84e' }} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h3 className="font-bold" style={{ color: '#f4f4f2' }}>{b.title}</h3>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold" style={{ color: '#c9a84e' }}>{b.stat}</p>
                    <p className="text-xs" style={{ color: 'rgba(244,244,242,0.35)' }}>{b.statLabel}</p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(244,244,242,0.55)' }}>{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4-step process ── */}
      <section
        className="py-20 px-4"
        style={{ background: 'rgba(201,168,78,0.04)', borderTop: '1px solid rgba(201,168,78,0.10)', borderBottom: '1px solid rgba(201,168,78,0.10)' }}
      >
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12" style={{ color: '#f4f4f2' }}>
            From listing to payout in 4 steps
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step, i) => (
              <div key={step.num} className="relative">
                {i < STEPS.length - 1 && (
                  <div
                    className="hidden lg:block absolute top-5 left-full w-full h-px z-0"
                    style={{ background: 'rgba(201,168,78,0.15)' }}
                  />
                )}
                <div className="relative z-10">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mb-4"
                    style={{ background: 'rgba(201,168,78,0.15)', color: '#c9a84e', border: '1px solid rgba(201,168,78,0.30)' }}
                  >
                    {step.num}
                  </div>
                  <h3 className="font-bold mb-1.5" style={{ color: '#f4f4f2' }}>{step.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(244,244,242,0.50)' }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA block ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-20">
        <div
          className="rounded-2xl p-8 sm:p-10"
          style={{
            background: 'linear-gradient(135deg, #0e1e35 0%, #0c1828 100%)',
            border: '1px solid rgba(201,168,78,0.22)',
          }}
        >
          <div className="flex flex-col lg:flex-row items-start gap-10">
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#c9a84e' }}>
                Platform includes — for every host
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {INCLUDES.map((item) => (
                  <span key={item} className="flex items-center gap-2.5 text-sm" style={{ color: 'rgba(244,244,242,0.75)' }}>
                    <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: '#c9a84e' }} />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="lg:text-right shrink-0">
              <p className="font-bold text-lg mb-1.5" style={{ color: '#f4f4f2' }}>Ready to start earning?</p>
              <p className="text-sm mb-6" style={{ color: 'rgba(244,244,242,0.50)' }}>
                Create your listing in under 10 minutes.
              </p>
              <Link
                href="/host/listings/new"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm font-bold transition-all hover:scale-[1.03]"
                style={{
                  background: 'linear-gradient(135deg, #d4b05e 0%, #c9a84e 60%, #b8942e 100%)',
                  color: '#07101e',
                  boxShadow: '0 6px 24px rgba(201,168,78,0.28)',
                }}
              >
                List my boat <ArrowRight className="w-4 h-4" />
              </Link>
              <p className="text-xs mt-3" style={{ color: 'rgba(244,244,242,0.35)' }}>
                Free to list · No commitment
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
