import { NextRequest, NextResponse } from "next/server"
import { getClerkUser } from "@/lib/clerk-auth"
import { createCheckoutSession, PRICING } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("STRIPE_SECRET_KEY is not set in environment")
      return NextResponse.json(
        { error: "Stripe is not configured" },
        { status: 500 }
      )
    }

    if (!process.env.STRIPE_PREMIUM_PRICE_ID) {
      console.error("STRIPE_PREMIUM_PRICE_ID is not set in environment")
      return NextResponse.json(
        { error: "Stripe Premium Price ID is not configured" },
        { status: 500 }
      )
    }

    console.log("Environment check passed:", {
      hasStripeSecret: !!process.env.STRIPE_SECRET_KEY,
      hasPremiumPriceId: !!process.env.STRIPE_PREMIUM_PRICE_ID,
      premiumPriceId: process.env.STRIPE_PREMIUM_PRICE_ID?.substring(0, 10) + "..."
    })

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

    // Log checkout parameters for debugging
    console.log("Creating checkout session with params:", {
      priceId,
      stripeCustomerId,
      hasUsedTrial,
      isPremiumSubscription: isPremiumSubscription,
      successUrl: `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancelUrl: `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`
    })

    // Maak checkout session
    const session = await createCheckoutSession(
      priceId,
      stripeCustomerId,
      `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      hasUsedTrial
    )

    console.log("Checkout session created successfully:", {
      sessionId: session.id,
      url: session.url
    })

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    })
  } catch (error) {
    console.error("Checkout error details:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      type: error instanceof Error ? error.constructor.name : typeof error,
      code: error && typeof error === 'object' && 'code' in error ? (error as { code: unknown }).code : undefined,
      statusCode: error && typeof error === 'object' && 'statusCode' in error ? (error as { statusCode: unknown }).statusCode : undefined,
      requestId: error && typeof error === 'object' && 'requestId' in error ? (error as { requestId: unknown }).requestId : undefined,
      errorType: error && typeof error === 'object' && 'type' in error ? (error as { type: unknown }).type : undefined
    })

    // Meer specifieke foutmeldingen
    let errorMessage = "Failed to create checkout session"
    if (error instanceof Error) {
      if (error.message.includes("Stripe is not configured")) {
        errorMessage = "Stripe is not properly configured. Please check environment variables."
      } else if (error.message.includes("No such price")) {
        errorMessage = "Invalid price ID. Please check your Stripe configuration."
      } else if (error.message.includes("Invalid API Key")) {
        errorMessage = "Invalid Stripe API key. Please check your configuration."
      } else if (error && typeof error === 'object' && 'code' in error && (error as { code: unknown }).code === 'card_declined') {
        errorMessage = "Card was declined. Please try a different payment method."
      } else if (error && typeof error === 'object' && 'code' in error && (error as { code: unknown }).code === 'expired_card') {
        errorMessage = "Card has expired. Please update your payment method."
      } else if (error && typeof error === 'object' && 'code' in error && (error as { code: unknown }).code === 'incorrect_cvc') {
        errorMessage = "Incorrect CVC code. Please check your card details."
      } else if (error && typeof error === 'object' && 'type' in error && (error as { type: unknown }).type === 'StripeConnectionError') {
        errorMessage = "Network error while connecting to Stripe. Please try again."
      } else if (error && typeof error === 'object' && 'type' in error && (error as { type: unknown }).type === 'StripeRateLimitError') {
        errorMessage = "Too many requests. Please wait a moment and try again."
      } else if (error && typeof error === 'object' && 'type' in error && (error as { type: unknown }).type === 'StripeInvalidRequestError') {
        errorMessage = `Invalid request: ${error.message}`
      } else {
        errorMessage = error.message
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

