import { NextRequest, NextResponse } from 'next/server'

/**
 * Test endpoint om te controleren of de webhook route bereikbaar is
 * Dit helpt bij het diagnosticeren van webhook problemen
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Clerk webhook endpoint is bereikbaar',
    timestamp: new Date().toISOString(),
    environment: {
      hasWebhookSecret: !!process.env.CLERK_WEBHOOK_SECRET,
      hasClerkSecret: !!process.env.CLERK_SECRET_KEY,
      hasClerkPublishable: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      nodeEnv: process.env.NODE_ENV,
    },
    webhookUrl: `${request.nextUrl.origin}/api/webhooks/clerk`,
  })
}







