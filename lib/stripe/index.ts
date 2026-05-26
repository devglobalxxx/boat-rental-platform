import Stripe from 'stripe'

// Lazy singleton — only instantiated at runtime when a key is present,
// not during Next.js static build analysis.
let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) throw new Error('STRIPE_SECRET_KEY environment variable is not set')
    _stripe = new Stripe(key, {
      apiVersion: '2026-04-22.dahlia' as any,
      typescript: true,
    })
  }
  return _stripe
}

// Keep `stripe` as a named export for backwards compatibility
// (Proxy forwards every property access to the lazy instance)
export const stripe: Stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as any)[prop]
  },
})

export const PLATFORM_FEE_PERCENT = Number(process.env.PLATFORM_FEE_PERCENT ?? 15)

export async function createPaymentIntent({
  amount,
  currency,
  connectedAccountId,
  bookingId,
  customerId,
}: {
  amount: number
  currency: string
  connectedAccountId: string
  bookingId: string
  customerId?: string
}) {
  const applicationFeeAmount = Math.round(amount * (PLATFORM_FEE_PERCENT / 100))
  return stripe.paymentIntents.create({
    amount: amount * 100, // cents
    currency: currency.toLowerCase(),
    application_fee_amount: applicationFeeAmount * 100,
    transfer_data: { destination: connectedAccountId },
    metadata: { bookingId },
    ...(customerId ? { customer: customerId } : {}),
  })
}

export async function createConnectAccountLink(accountId: string, origin: string) {
  return stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${origin}/host/onboarding?refresh=1`,
    return_url: `${origin}/host/onboarding?success=1`,
    type: 'account_onboarding',
  })
}

export async function createConnectAccount(email: string) {
  return stripe.accounts.create({
    type: 'express',
    email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
  })
}
