import Stripe from 'stripe'

// Initialize Stripe only if API key is available
// During build, this might not be set, so we handle it gracefully
const stripeSecretKey = process.env.STRIPE_SECRET_KEY

// Use a function to get stripe instance to avoid build-time initialization errors
function createStripeInstance(): Stripe {
  if (!stripeSecretKey) {
    // During build, return a mock object that satisfies TypeScript
    // This will throw at runtime if actually used
    return {} as Stripe
  }
  return new Stripe(stripeSecretKey, {
    apiVersion: '2025-09-30.clover',
  })
}

// Export stripe instance - will be properly initialized at runtime
export const stripe = createStripeInstance()

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
  if (!stripeSecretKey) {
    throw new Error("Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.")
  }

  console.log("createCheckoutSession called with:", {
    priceId,
    customerId,
    hasUsedTrial,
    allPricingIds: {
      premium: PRICING.PREMIUM.priceId,
      fiscaleCheck: PRICING.FISCALE_OPTIMALISATIE_CHECK.priceId,
      documentAnalyse: PRICING.PREMIUM_DOCUMENT_ANALYSE.priceId,
      dueDiligence: PRICING.DUE_DILIGENCE_VASTGOED.priceId
    }
  })

  // Determine if this is a subscription or one-time payment
  const isOneTime =
    priceId === PRICING.FISCALE_OPTIMALISATIE_CHECK.priceId ||
    priceId === PRICING.PREMIUM_DOCUMENT_ANALYSE.priceId ||
    priceId === PRICING.DUE_DILIGENCE_VASTGOED.priceId

  // Voor Premium subscriptions: voeg trial period toe als gebruiker nog geen trial heeft gebruikt
  const isPremiumSubscription = priceId === PRICING.PREMIUM.priceId && !isOneTime
  const shouldAddTrial = isPremiumSubscription && !hasUsedTrial

  console.log("Checkout session config:", {
    isOneTime,
    isPremiumSubscription,
    shouldAddTrial,
    mode: isOneTime ? 'payment' : 'subscription'
  })

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

  console.log("Final session config:", JSON.stringify(sessionConfig, null, 2))

  try {
    const session = await stripe.checkout.sessions.create(sessionConfig)
    console.log("Stripe session created successfully:", {
      id: session.id,
      url: session.url,
      customer: session.customer
    })
    return session
  } catch (error) {
    console.error("Stripe session creation failed:", error)
    throw error
  }
}

export async function createCustomerPortalSession(customerId: string) {
  if (!stripeSecretKey) {
    throw new Error("Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.")
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXTAUTH_URL}/account`,
  })

  return session
}

export async function getSubscription(customerId: string) {
  if (!stripeSecretKey) {
    throw new Error("Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.")
  }

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
