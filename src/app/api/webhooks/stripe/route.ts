import { NextRequest, NextResponse } from "next/server"
import { stripe, getTierFromPriceId } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import Stripe from "stripe"

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("stripe-signature")

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      )
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET is not set")
      return NextResponse.json(
        { error: "Stripe webhook secret not configured" },
        { status: 500 }
      )
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("Stripe is not configured")
      return NextResponse.json(
        { error: "Stripe is not configured" },
        { status: 500 }
      )
    }

    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error("Webhook signature verification failed:", err)
      return NextResponse.json(
        { error: "Webhook signature verification failed" },
        { status: 400 }
      )
    }

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        
        if (session.mode === "subscription" && session.customer) {
          const subscriptionId = session.subscription as string
          const customerId = typeof session.customer === "string" 
            ? session.customer 
            : session.customer.id

          // Haal subscription op om trial end date te krijgen
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)
          const priceId = subscription.items.data[0]?.price.id
          
          if (!priceId) {
            console.error("No price ID found in subscription")
            break
          }

          const tier = getTierFromPriceId(priceId)
          
          // Zoek gebruiker via email uit metadata of customer
          const customer = await stripe.customers.retrieve(customerId)
          const email = customer && !customer.deleted && 'email' in customer ? customer.email : null

          if (!email) {
            console.error("No email found for customer")
            break
          }

          const user = await prisma.user.findUnique({
            where: { email }
          })

          if (!user) {
            console.error(`User not found for email: ${email}`)
            break
          }

          // Update gebruiker met tier en trial informatie
          const trialEnd = subscription.trial_end 
            ? new Date(subscription.trial_end * 1000)
            : null
          const isTrialActive = subscription.status === "trialing"

          await prisma.user.update({
            where: { id: user.id },
            data: {
              tier: tier === "PREMIUM" ? "PREMIUM" : "FREE",
              trialEndsAt: trialEnd,
              isTrialActive: isTrialActive
            }
          })

          // Update of maak payment record
          const existingPayment = await prisma.payment.findFirst({
            where: { 
              userId: user.id,
              subscriptionId: subscriptionId
            }
          })

          if (existingPayment) {
            await prisma.payment.update({
              where: { id: existingPayment.id },
              data: {
                status: "SUCCEEDED",
                tier: tier === "PREMIUM" ? "PREMIUM" : "FREE"
              }
            })
          } else {
            await prisma.payment.create({
              data: {
                userId: user.id,
                stripeCustomerId: customerId,
                subscriptionId: subscriptionId,
                tier: tier === "PREMIUM" ? "PREMIUM" : "FREE",
                status: "SUCCEEDED",
                amount: subscription.items.data[0]?.price.unit_amount || 0,
                currency: subscription.items.data[0]?.price.currency || "eur"
              }
            })
          }
        }
        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id

        const priceId = subscription.items.data[0]?.price.id
        if (!priceId) break

        const tier = getTierFromPriceId(priceId)
        
        // Zoek gebruiker via customer ID
        const payment = await prisma.payment.findFirst({
          where: { stripeCustomerId: customerId },
          include: { user: true }
        })

        if (!payment) {
          console.error(`Payment not found for customer: ${customerId}`)
          break
        }

        const trialEnd = subscription.trial_end
          ? new Date(subscription.trial_end * 1000)
          : null
        const isTrialActive = subscription.status === "trialing"

        // Update gebruiker
        await prisma.user.update({
          where: { id: payment.userId },
          data: {
            tier: tier === "PREMIUM" ? "PREMIUM" : "FREE",
            trialEndsAt: trialEnd,
            isTrialActive: isTrialActive
          }
        })

        // Update payment
        await prisma.payment.updateMany({
          where: { subscriptionId: subscription.id },
          data: {
            tier: tier === "PREMIUM" ? "PREMIUM" : "FREE",
            status: subscription.status === "active" || subscription.status === "trialing" 
              ? "SUCCEEDED" 
              : "FAILED"
          }
        })
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id

        // Zoek gebruiker en zet terug naar FREE
        const payment = await prisma.payment.findFirst({
          where: { stripeCustomerId: customerId },
          include: { user: true }
        })

        if (payment) {
          await prisma.user.update({
            where: { id: payment.userId },
            data: {
              tier: "FREE",
              isTrialActive: false
            }
          })

          await prisma.payment.updateMany({
            where: { subscriptionId: subscription.id },
            data: {
              status: "CANCELED"
            }
          })
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook handler error:", error)
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    )
  }
}
