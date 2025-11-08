import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
})

export const PRICING = {
  BASIC: {
    priceId: process.env.STRIPE_BASIC_PRICE_ID!,
    amount: 1200, // €12.00 in cents
    currency: 'eur',
    interval: 'month'
  },
  PRO: {
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    amount: 3900, // €39.00 in cents
    currency: 'eur',
    interval: 'month'
  },
  ELITE: {
    priceId: process.env.STRIPE_ELITE_PRICE_ID!,
    amount: 9900, // €99.00 in cents
    currency: 'eur',
    interval: 'month'
  },
  AANGIFTE_CHECK: {
    priceId: process.env.STRIPE_AANGIFTE_CHECK_PRICE_ID!,
    amount: 14900, // €149.00 in cents
    currency: 'eur',
    interval: 'one_time'
  }
} as const

export type PricingTier = keyof typeof PRICING

export async function createCheckoutSession(
  priceId: string,
  customerId?: string,
  successUrl?: string,
  cancelUrl?: string
) {
  const session = await stripe.checkout.sessions.create({
    mode: priceId === PRICING.AANGIFTE_CHECK.priceId ? 'payment' : 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    customer: customerId,
    success_url: successUrl || `${process.env.NEXTAUTH_URL}/dashboard?success=true`,
    cancel_url: cancelUrl || `${process.env.NEXTAUTH_URL}/pricing?canceled=true`,
    metadata: {
      priceId,
    },
  })

  return session
}

export async function createCustomerPortalSession(customerId: string) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXTAUTH_URL}/account`,
  })

  return session
}

export async function getSubscription(customerId: string) {
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: 'active',
    limit: 1,
  })

  return subscriptions.data[0] || null
}

export function getTierFromPriceId(priceId: string): 'FREE' | 'BASIC' | 'PRO' | 'ELITE' {
  if (priceId === PRICING.BASIC.priceId) return 'BASIC'
  if (priceId === PRICING.PRO.priceId) return 'PRO'
  if (priceId === PRICING.ELITE.priceId) return 'ELITE'
  return 'FREE'
}
