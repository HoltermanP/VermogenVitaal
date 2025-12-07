import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
})

export const PRICING = {
  PREMIUM: {
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID!,
    amount: 1995, // €19.95 in cents
    currency: 'eur',
    interval: 'month',
    trialPeriodDays: 30 // 30 dagen gratis proefperiode
  },
  // Add-ons (one-time payments)
  FISCALE_OPTIMALISATIE_CHECK: {
    priceId: process.env.STRIPE_FISCALE_OPTIMALISATIE_CHECK_PRICE_ID!,
    amount: 9900, // €99.00 in cents
    currency: 'eur',
    interval: 'one_time'
  },
  PREMIUM_DOCUMENT_ANALYSE: {
    priceId: process.env.STRIPE_PREMIUM_DOCUMENT_ANALYSE_PRICE_ID!,
    amount: 4900, // €49.00 in cents
    currency: 'eur',
    interval: 'one_time'
  },
  DUE_DILIGENCE_VASTGOED: {
    priceId: process.env.STRIPE_DUE_DILIGENCE_VASTGOED_PRICE_ID!,
    amount: 29900, // €299.00 in cents
    currency: 'eur',
    interval: 'one_time'
  }
} as const

export type PricingTier = keyof typeof PRICING

export async function createCheckoutSession(
  priceId: string,
  customerId?: string,
  successUrl?: string,
  cancelUrl?: string,
  hasUsedTrial?: boolean // Of de gebruiker al een trial heeft gebruikt
) {
  // Determine if this is a subscription or one-time payment
  const isOneTime = 
    priceId === PRICING.FISCALE_OPTIMALISATIE_CHECK.priceId ||
    priceId === PRICING.PREMIUM_DOCUMENT_ANALYSE.priceId ||
    priceId === PRICING.DUE_DILIGENCE_VASTGOED.priceId

  // Voor Premium subscriptions: voeg trial period toe als gebruiker nog geen trial heeft gebruikt
  const isPremiumSubscription = priceId === PRICING.PREMIUM.priceId && !isOneTime
  const shouldAddTrial = isPremiumSubscription && !hasUsedTrial

  const sessionConfig: Stripe.Checkout.SessionCreateParams = {
    mode: isOneTime ? 'payment' : 'subscription',
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
      type: isOneTime ? 'addon' : 'subscription',
    },
  }

  // Voeg trial period toe voor Premium subscriptions
  if (shouldAddTrial && PRICING.PREMIUM.trialPeriodDays) {
    sessionConfig.subscription_data = {
      trial_period_days: PRICING.PREMIUM.trialPeriodDays,
    }
  }

  const session = await stripe.checkout.sessions.create(sessionConfig)

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

export function getTierFromPriceId(priceId: string): 'FREE' | 'PREMIUM' {
  if (priceId === PRICING.PREMIUM.priceId) return 'PREMIUM'
  return 'FREE'
}
