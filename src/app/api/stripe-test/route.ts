import { NextResponse } from "next/server"
import { stripe, PRICING } from "@/lib/stripe"

export async function GET() {
  try {
    // Check environment variables
    const envCheck = {
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? "Set" : "Not set",
      STRIPE_PREMIUM_PRICE_ID: process.env.STRIPE_PREMIUM_PRICE_ID ? "Set" : "Not set",
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? "Set" : "Not set",
    }

    // Test Stripe connection
    let stripeTest = "Not tested"
    try {
      // Try to retrieve account info (this will fail if API key is wrong)
      const account = await stripe.accounts.retrieve()
      stripeTest = "Connected successfully"
    } catch (error: any) {
      stripeTest = `Failed: ${error.message}`
    }

    // Test Price retrieval
    let priceTest = "Not tested"
    try {
      if (PRICING.PREMIUM.priceId) {
        const price = await stripe.prices.retrieve(PRICING.PREMIUM.priceId)
        priceTest = `Found: ${price.nickname || price.id} - ${price.unit_amount} ${price.currency}`
      } else {
        priceTest = "Price ID not configured"
      }
    } catch (error: any) {
      priceTest = `Failed: ${error.message}`
    }

    return NextResponse.json({
      environment: envCheck,
      stripeConnection: stripeTest,
      priceRetrieval: priceTest,
      pricing: {
        premium: PRICING.PREMIUM.priceId,
        fiscaleCheck: PRICING.FISCALE_OPTIMALISATIE_CHECK.priceId,
        documentAnalyse: PRICING.PREMIUM_DOCUMENT_ANALYSE.priceId,
        dueDiligence: PRICING.DUE_DILIGENCE_VASTGOED.priceId
      }
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
