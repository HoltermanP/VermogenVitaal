import { NextRequest, NextResponse } from "next/server"
import { getClerkUser } from "@/lib/clerk-auth"
import { createCheckoutSession, PRICING } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Stripe is not configured" },
        { status: 500 }
      )
    }

    const body = await request.json()
    let { priceId } = body

    if (!priceId) {
      return NextResponse.json(
        { error: "Price ID is required" },
        { status: 400 }
      )
    }

    // Resolve price ID if it's an identifier
    if (priceId === 'premium') {
      priceId = PRICING.PREMIUM.priceId
    }

    // Haal gebruiker op
    const user = await getClerkUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check of dit een Premium subscription is
    const isPremiumSubscription = priceId === PRICING.PREMIUM.priceId

    // Check of gebruiker al een trial heeft gebruikt
    let hasUsedTrial = false
    if (isPremiumSubscription) {
      // Check of gebruiker al een trial heeft gehad (trialEndsAt is niet null en in het verleden)
      const userWithTrial = await prisma.user.findUnique({
        where: { id: user.id },
        select: { trialEndsAt: true, isTrialActive: true }
      })

      if (userWithTrial?.trialEndsAt) {
        // Als trialEndsAt bestaat en in het verleden ligt, heeft gebruiker al een trial gehad
        hasUsedTrial = new Date(userWithTrial.trialEndsAt) < new Date()
      }
    }

    // Haal of maak Stripe customer ID
    let stripeCustomerId: string | undefined
    const payment = await prisma.payment.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })

    if (payment?.stripeCustomerId) {
      stripeCustomerId = payment.stripeCustomerId
    }

    // Maak checkout session
    const session = await createCheckoutSession(
      priceId,
      stripeCustomerId,
      `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      hasUsedTrial
    )

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    })
  } catch (error) {
    console.error("Checkout error:", error)
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    )
  }
}

