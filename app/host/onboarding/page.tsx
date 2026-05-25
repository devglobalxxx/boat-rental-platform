import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createConnectAccount, createConnectAccountLink } from '@/lib/stripe'
import { Button } from '@/components/ui/button'
import { CheckCircle, ArrowRight, CreditCard, Shield, Banknote } from 'lucide-react'
import { headers } from 'next/headers'

interface Props {
  searchParams: Promise<{ success?: string; refresh?: string }>
}

export default async function HostOnboardingPage({ searchParams }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/host/onboarding')

  const params = await searchParams
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_account_id, full_name')
    .eq('id', user.id)
    .single()

  // If returning from Stripe with success
  if (params.success && profile?.stripe_account_id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="text-center max-w-md">
          <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">You&apos;re all set!</h1>
          <p className="text-slate-500 mb-8">Your Stripe account is connected. You can now receive payouts from bookings.</p>
          <Button asChild variant="sea">
            <Link href="/host/listings/new">Create your first listing <ArrowRight className="w-4 h-4" /></Link>
          </Button>
        </div>
      </div>
    )
  }

  // Get origin for redirect URLs
  const headersList = await headers()
  const origin = headersList.get('x-forwarded-host')
    ? `https://${headersList.get('x-forwarded-host')}`
    : `http://${headersList.get('host') ?? 'localhost:3000'}`

  // Create Stripe Connect account if not yet done
  let stripeAccountId = profile?.stripe_account_id
  if (!stripeAccountId) {
    const account = await createConnectAccount(user.email!)
    stripeAccountId = account.id
    await supabase.from('profiles').update({ stripe_account_id: stripeAccountId }).eq('id', user.id)
  }

  // Generate onboarding link
  const accountLink = await createConnectAccountLink(stripeAccountId, origin)

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Set up payouts</h1>
          <p className="text-slate-500 mt-2">Connect your bank account to receive payments from guests.</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-8 mb-6">
          <div className="space-y-4 mb-8">
            {[
              { icon: CreditCard, title: 'Secure card processing', desc: 'Guests pay by card — you get paid automatically after each booking.' },
              { icon: Banknote, title: 'Direct bank payouts', desc: 'Earnings transferred to your bank 7 days after the charter date.' },
              { icon: Shield, title: 'Stripe-powered security', desc: 'Industry-leading fraud protection and compliance built in.' },
            ].map((item) => (
              <div key={item.title} className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#06b6d4]/10 flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-[#06b6d4]" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 text-sm">{item.title}</div>
                  <div className="text-sm text-slate-500 mt-0.5">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <a href={accountLink.url} className="block w-full py-3 px-6 bg-[#06b6d4] text-white text-center font-semibold rounded-full hover:bg-[#0891b2] transition-colors">
            Set up with Stripe <ArrowRight className="inline w-4 h-4 ml-1" />
          </a>
        </div>

        <p className="text-center text-xs text-slate-400">
          Powered by Stripe Connect. BoatAway keeps 15% of each booking as a platform fee.
        </p>
      </div>
    </div>
  )
}
