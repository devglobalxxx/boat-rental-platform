import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Search, CreditCard, Anchor, Star, Ship, Shield } from 'lucide-react'

export const metadata = {
  title: 'How BoatAway Works',
  description: 'Learn how to find, book, and enjoy a boat charter through BoatAway.',
}

const RENTER_STEPS = [
  { icon: Search, title: 'Search & discover', desc: 'Browse boats by destination, date, boat type, and group size. Read reviews from verified guests.' },
  { icon: CreditCard, title: 'Book & pay securely', desc: 'Choose instant book or send a request. Pay by card — your money is held safely until the day of your trip.' },
  { icon: Anchor, title: 'Set sail', desc: 'Meet your captain at the marina. Your skipper, fuel, and safety gear are all included.' },
  { icon: Star, title: 'Review your trip', desc: 'After your charter, leave an honest review to help future guests.' },
]

const HOST_STEPS = [
  { icon: Ship, title: 'List your boat', desc: 'Create a listing in minutes. Set your own prices, availability, and house rules.' },
  { icon: Shield, title: 'We handle guests', desc: 'BoatAway verifies renters, handles payments, and provides 24/7 support.' },
  { icon: CreditCard, title: 'Get paid', desc: 'Earnings are transferred to your bank account 7 days after each completed charter.' },
]

export default function HowItWorksPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">How BoatAway works</h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto">
          The simplest way to book a boat or earn money from yours.
        </p>
      </div>

      {/* For renters */}
      <section className="mb-20">
        <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
          <span className="w-8 h-8 bg-[#06b6d4]/10 rounded-lg flex items-center justify-center text-[#06b6d4] text-sm font-bold">R</span>
          For renters
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {RENTER_STEPS.map((step, i) => (
            <div key={step.title} className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#0f2547] flex items-center justify-center text-white text-sm font-bold shrink-0">
                {i + 1}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-1">{step.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8">
          <Button asChild variant="sea" size="lg">
            <Link href="/search">Find a boat</Link>
          </Button>
        </div>
      </section>

      {/* For hosts */}
      <section className="bg-[#fdfaf6] rounded-3xl p-8 sm:p-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
          <span className="w-8 h-8 bg-[#06b6d4]/10 rounded-lg flex items-center justify-center text-[#06b6d4] text-sm font-bold">H</span>
          For hosts
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
          {HOST_STEPS.map((step, i) => (
            <div key={step.title} className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#0f2547] flex items-center justify-center mx-auto mb-3">
                <step.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-slate-900 mb-1">{step.title}</h3>
              <p className="text-slate-500 text-sm">{step.desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center space-y-2">
          <Button asChild variant="default" size="lg">
            <Link href="/become-a-host">Start hosting</Link>
          </Button>
          <div className="text-xs text-slate-400 mt-2">Free to list · You keep 85%</div>
        </div>
      </section>
    </div>
  )
}
