import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createConnectAccount, createConnectAccountLink } from '@/lib/stripe'
import { CheckCircle, ArrowRight, CreditCard, Shield, Banknote } from 'lucide-react'
import PayoutBadge from '@/components/ui/PayoutBadge'
import { headers } from 'next/headers'

const gold = '#c9a84e'
const card = '#0c1828'
const border = 'rgba(201,168,78,0.15)'
const text = '#f4f4f2'
const muted = 'rgba(244,244,242,0.55)'

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

  if (params.success && profile?.stripe_account_id) {
    return (
      <div style={{ minHeight: '100vh', background: '#07101e', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', color: text }}>
        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          <CheckCircle style={{ width: 64, height: 64, color: '#22c55e', margin: '0 auto 20px' }} />
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: text, marginBottom: '10px' }}>You&apos;re all set!</h1>
          <p style={{ fontSize: '15px', color: muted, marginBottom: '32px', lineHeight: 1.6 }}>Your Stripe account is connected. You can now receive payouts from bookings.</p>
          <Link href="/host/listings/new" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '13px 28px', borderRadius: '99px', background: 'linear-gradient(135deg, #d4b05e 0%, #c9a84e 60%, #b8942e 100%)', color: '#07101e', fontSize: '14px', fontWeight: 700, textDecoration: 'none' }}>
            Create your first listing <ArrowRight style={{ width: 16, height: 16 }} />
          </Link>
        </div>
      </div>
    )
  }

  const headersList = await headers()
  const origin = headersList.get('x-forwarded-host')
    ? `https://${headersList.get('x-forwarded-host')}`
    : `http://${headersList.get('host') ?? 'localhost:3000'}`

  let stripeAccountId = profile?.stripe_account_id
  if (!stripeAccountId) {
    const account = await createConnectAccount(user.email!)
    stripeAccountId = account.id
    await supabase.from('profiles').update({ stripe_account_id: stripeAccountId }).eq('id', user.id)
  }

  const accountLink = await createConnectAccountLink(stripeAccountId, origin)

  const features = [
    { Icon: CreditCard, title: 'Secure card processing', desc: 'Guests pay by card — you get paid automatically after each booking.' },
    { Icon: Banknote,   title: 'Direct bank payouts',    desc: 'Earnings transferred to your bank 7 days after the charter date.' },
    { Icon: Shield,     title: 'Stripe-powered security', desc: 'Industry-leading fraud protection and compliance built in.' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#07101e', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', color: text }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: text, marginBottom: '10px' }}>Set up payouts</h1>
          <p style={{ fontSize: '15px', color: muted }}>Connect your bank account to receive payments from guests.</p>
        </div>

        <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '20px', padding: '28px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '28px' }}>
            {features.map((item) => (
              <div key={item.title} style={{ display: 'flex', gap: '14px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(201,168,78,0.10)', border: '1px solid rgba(201,168,78,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <item.Icon style={{ width: 18, height: 18, color: gold }} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: text, fontSize: '14px', marginBottom: '4px' }}>{item.title}</div>
                  <div style={{ fontSize: '13px', color: muted, lineHeight: 1.5 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <a
            href={accountLink.url}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '14px', borderRadius: '99px', background: 'linear-gradient(135deg, #d4b05e 0%, #c9a84e 60%, #b8942e 100%)', color: '#07101e', fontSize: '15px', fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 18px rgba(201,168,78,0.25)' }}
          >
            Set up with Stripe <ArrowRight style={{ width: 16, height: 16 }} />
          </a>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <PayoutBadge />
        </div>
        <p style={{ textAlign: 'center', fontSize: '12px', color: 'rgba(244,244,242,0.35)' }}>
          Powered by Stripe Connect. BoatHire24 keeps 15% of each booking as a platform fee.
        </p>
      </div>
    </div>
  )
}
