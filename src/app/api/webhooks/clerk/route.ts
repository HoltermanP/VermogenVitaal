import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'

// Types voor Clerk webhook events
interface ClerkEmailAddress {
  email_address: string
  id: string
}

interface ClerkUserData {
  id: string
  first_name?: string | null
  last_name?: string | null
  username?: string | null
  email_addresses?: ClerkEmailAddress[]
  primary_email_address?: ClerkEmailAddress
  created_at?: number
}

interface WebhookEvent {
  type: string
  data: ClerkUserData
}

/**
 * OPTIONS handler voor CORS preflight requests
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, svix-id, svix-timestamp, svix-signature',
    },
  })
}

/**
 * GET endpoint om te testen of de webhook route bereikbaar is
 */
export async function GET(request: NextRequest) {
  console.log('🔵 GET /api/webhooks/clerk - Test endpoint called', {
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
  })

  return NextResponse.json({
    success: true,
    message: 'Clerk webhook endpoint is bereikbaar',
    timestamp: new Date().toISOString(),
    path: request.nextUrl.pathname,
    environment: {
      hasWebhookSecret: !!process.env.CLERK_WEBHOOK_SECRET,
      hasClerkSecret: !!process.env.CLERK_SECRET_KEY,
      hasClerkPublishable: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
    },
    webhookUrl: `${request.nextUrl.origin}/api/webhooks/clerk`,
    instructions: {
      step1: 'Ga naar Clerk Dashboard > Webhooks',
      step2: 'Voeg een nieuwe webhook toe of bewerk bestaande',
      step3: `Endpoint URL: ${request.nextUrl.origin}/api/webhooks/clerk`,
      step4: 'Selecteer events: user.created, user.updated, user.deleted',
      step5: 'Kopieer de Signing Secret en voeg toe aan CLERK_WEBHOOK_SECRET in Vercel',
    },
  }, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    },
  })
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  console.log('=== Clerk Webhook Received ===', {
    timestamp: new Date().toISOString(),
    url: request.url,
    method: request.method,
    origin: request.headers.get('origin'),
    userAgent: request.headers.get('user-agent'),
  })

  try {
    // Verkrijg webhook secret van environment variables
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error('❌ CLERK_WEBHOOK_SECRET is not configured')
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
    }
    console.log('✅ Webhook secret found')

    // Verkrijg headers voor webhook verificatie
    const headersList = await headers()
    const svixId = headersList.get('svix-id')
    const svixTimestamp = headersList.get('svix-timestamp')
    const svixSignature = headersList.get('svix-signature')

    console.log('Webhook headers:', {
      hasSvixId: !!svixId,
      hasSvixTimestamp: !!svixTimestamp,
      hasSvixSignature: !!svixSignature,
    })

    if (!svixId || !svixTimestamp || !svixSignature) {
      console.error('❌ Missing required Svix headers', {
        svixId: !!svixId,
        svixTimestamp: !!svixTimestamp,
        svixSignature: !!svixSignature,
      })
      return NextResponse.json({ error: 'Missing webhook headers' }, { status: 400 })
    }

    // Verkrijg request body
    const body = await request.text()
    console.log('Request body received, length:', body.length)

    // Dynamisch importeren van Svix om build problemen te voorkomen
    // @ts-ignore - svix wordt dynamisch geladen tijdens runtime
    const { Webhook } = await import('svix')
    
    // Verificeer webhook met Svix
    const wh = new Webhook(webhookSecret)
    let evt: WebhookEvent

    try {
      evt = wh.verify(body, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      }) as WebhookEvent
      console.log('✅ Webhook verification successful')
    } catch (err) {
      console.error('❌ Webhook verification failed:', {
        error: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
      })
      return NextResponse.json({ error: 'Webhook verification failed' }, { status: 400 })
    }

    // Verwerk het event gebaseerd op type
    const eventType = evt.type
    const data = evt.data

    console.log(`📨 Clerk webhook event: ${eventType}`, {
      userId: data.id,
      email: data.email_addresses?.[0]?.email_address || data.primary_email_address?.email_address,
      firstName: data.first_name,
      lastName: data.last_name,
      username: data.username,
      createdAt: data.created_at,
    })

    let result
    if (eventType === 'user.created') {
      result = await handleUserCreated(data)
    } else if (eventType === 'user.updated') {
      result = await handleUserUpdated(data)
    } else if (eventType === 'user.deleted') {
      result = await handleUserDeleted(data)
    } else {
      console.log(`⚠️ Unhandled event type: ${eventType}`)
      result = { success: true, message: 'Event type not handled' }
    }

    const duration = Date.now() - startTime
    console.log(`✅ Webhook processed successfully in ${duration}ms`, {
      eventType,
      result,
    })

    return NextResponse.json({ success: true, result })
  } catch (error) {
    const duration = Date.now() - startTime
    console.error('❌ Clerk webhook error:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      duration: `${duration}ms`,
    })
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

async function handleUserCreated(userData: ClerkUserData) {
  console.log('🔄 handleUserCreated: Starting', {
    userId: userData.id,
    emailAddresses: userData.email_addresses?.map((e) => e.email_address),
    primaryEmail: userData.primary_email_address?.email_address,
  })

  try {
    // Haal email op uit de user data
    const email = userData.email_addresses?.[0]?.email_address ||
                  userData.primary_email_address?.email_address

    if (!email) {
      console.error('❌ No email found in user data:', {
        userId: userData.id,
        emailAddresses: userData.email_addresses,
        primaryEmailAddress: userData.primary_email_address,
        fullData: JSON.stringify(userData, null, 2),
      })
      return { success: false, error: 'No email found' }
    }

    console.log(`🔍 Checking if user exists for email: ${email}`)

    // Check of gebruiker al bestaat
    let existingUser
    try {
      existingUser = await prisma.user.findUnique({
        where: { email }
      })
    } catch (dbError) {
      console.error('❌ Database error checking existing user:', {
        error: dbError instanceof Error ? dbError.message : String(dbError),
        email,
      })
      throw dbError
    }

    if (existingUser) {
      console.log(`ℹ️ User already exists for email: ${email}`, {
        userId: existingUser.id,
        name: existingUser.name,
      })
      return { success: true, message: 'User already exists', userId: existingUser.id }
    }

    // Maak gebruiker aan in database
    const userName = userData.first_name && userData.last_name
      ? `${userData.first_name} ${userData.last_name}`
      : userData.first_name || userData.username || email || 'Gebruiker'

    // Nieuwe gebruikers krijgen automatisch een gratis proefmaand van 30 dagen
    const trialEndsAt = new Date()
    trialEndsAt.setDate(trialEndsAt.getDate() + 30)

    console.log(`➕ Creating new user in database:`, {
      email,
      name: userName,
      trialEndsAt: trialEndsAt.toISOString(),
    })

    let newUser
    try {
      newUser = await prisma.user.create({
        data: {
          email,
          name: userName,
          tier: 'FREE',
          trialEndsAt,
          isTrialActive: true,
        },
      })

      console.log(`✅ User created in database via webhook:`, {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        tier: newUser.tier,
        trialEndsAt: newUser.trialEndsAt?.toISOString(),
        isTrialActive: newUser.isTrialActive,
      })

      return { 
        success: true, 
        userId: newUser.id,
        email: newUser.email,
        name: newUser.name,
      }
    } catch (createError) {
      const errorMessage = createError instanceof Error ? createError.message : String(createError)
      const errorCode = createError && typeof createError === 'object' && 'code' in createError 
        ? String(createError.code) 
        : undefined

      console.error('❌ Error creating user in database:', {
        error: errorMessage,
        code: errorCode,
        email,
        userName,
        stack: createError instanceof Error ? createError.stack : undefined,
      })

      // Als het een duplicate key error is, probeer opnieuw te vinden
      if (errorCode === 'P2002') {
        console.log('⚠️ Duplicate key error, trying to find user again')
        try {
          const foundUser = await prisma.user.findUnique({
            where: { email }
          })
          if (foundUser) {
            console.log(`✅ User found after duplicate error:`, {
              id: foundUser.id,
              email: foundUser.email,
            })
            return { 
              success: true, 
              message: 'User found after duplicate error',
              userId: foundUser.id,
            }
          }
        } catch (findError) {
          console.error('❌ Error finding user after duplicate:', findError)
        }
      }

      throw createError
    }
  } catch (error) {
    console.error('❌ Error handling user.created:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      userData: {
        id: userData.id,
        email: userData.email_addresses?.[0]?.email_address,
      },
    })
    throw error
  }
}

async function handleUserUpdated(userData: ClerkUserData) {
  console.log('🔄 handleUserUpdated: Starting', {
    userId: userData.id,
    email: userData.email_addresses?.[0]?.email_address,
  })

  try {
    const email = userData.email_addresses?.[0]?.email_address ||
                  userData.primary_email_address?.email_address

    if (!email) {
      console.error('❌ No email found in user update data:', {
        userId: userData.id,
        emailAddresses: userData.email_addresses,
      })
      return { success: false, error: 'No email found' }
    }

    // Vind gebruiker in database
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (!existingUser) {
      console.log(`⚠️ User not found for update: ${email}`)
      return { success: false, message: 'User not found' }
    }

    // Update gebruikersnaam als deze is veranderd
    const newName = userData.first_name && userData.last_name
      ? `${userData.first_name} ${userData.last_name}`
      : userData.first_name || userData.username || email

    if (existingUser.name !== newName) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { name: newName },
      })

      console.log(`✅ User updated via webhook:`, {
        id: existingUser.id,
        email,
        oldName: existingUser.name,
        newName,
      })
      return { success: true, userId: existingUser.id, updated: true }
    }

    return { success: true, userId: existingUser.id, updated: false }
  } catch (error) {
    console.error('❌ Error handling user.updated:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    throw error
  }
}

async function handleUserDeleted(userData: ClerkUserData) {
  console.log('🔄 handleUserDeleted: Starting', {
    userId: userData.id,
    email: userData.email_addresses?.[0]?.email_address,
  })

  try {
    // Voor nu loggen we alleen - we verwijderen geen gebruikers uit de database
    // Dit kan later worden geïmplementeerd als dat gewenst is
    console.log(`ℹ️ User deleted webhook received for user:`, {
      id: userData.id,
      email: userData.email_addresses?.[0]?.email_address,
    })

    // Optioneel: gebruiker soft-delete markeren of volledig verwijderen
    // Dit hangt af van je business logic
    return { success: true, message: 'User deletion logged' }
  } catch (error) {
    console.error('❌ Error handling user.deleted:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    throw error
  }
}

// Route configuratie voor Next.js
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
