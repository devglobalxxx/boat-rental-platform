import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Anchor, BarChart3, Shield, Zap } from 'lucide-react'

export const metadata = {
  title: 'Become a Host — Earn Money with Your Boat',
  description: 'List your boat on BoatAway and earn money from verified guests worldwide. Free to list, you keep 85%.',
}

const BENEFITS = [
  { icon: BarChart3, title: 'Earn on your terms', desc: 'Set your own prices, block dates when you need the boat, no minimum commitment.' },
  { icon: Shield, title: 'Protected bookings', desc: 'Stripe-powered payments, verified renters, and 24/7 host support.' },
  { icon: Zap, title: 'Get bookings fast', desc: 'Instant-book option gets you guests faster. We handle the marketing.' },
  { icon: Anchor, title: 'You keep 85%', desc: 'BoatAway charges a 15% platform fee — one of the lowest in the industry.' },
]

export default function BecomeAHostPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-[#0f2547] text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">Turn your boat into income</h1>
          <p className="text-xl text-white/70 mb-8 max-w-xl mx-auto">
            List on BoatAway and reach thousands of guests every month. Free to start, you keep 85% of every booking.
          </p>
          <Button asChild variant="sea" size="lg">
            <Link href="/host/listings/new">Get started — it&apos;s free</Link>
          </Button>
        </div>
      </section>

      {/* Benefits */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Why host on BoatAway?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {BENEFITS.map((b) => (
            <div key={b.title} className="flex gap-4 p-6 bg-white rounded-2xl border border-slate-200 hover:shadow-sm transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-[#06b6d4]/10 flex items-center justify-center shrink-0">
                <b.icon className="w-6 h-6 text-[#06b6d4]" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-1">{b.title}</h3>
                <p className="text-slate-500 text-sm">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#fdfaf6] py-16 text-center px-4">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Ready to start earning?</h2>
        <p className="text-slate-500 mb-8">Create your listing in under 10 minutes. No commitment required.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="sea" size="lg"><Link href="/host/listings/new">List my boat</Link></Button>
          <Button asChild variant="outline" size="lg"><Link href="/how-it-works#hosts">Learn more</Link></Button>
        </div>
      </section>
    </div>
  )
}
