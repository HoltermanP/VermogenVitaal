import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createProvider, getProviderConfig } from "@/lib/accounting/provider-factory"
import { encrypt } from "@/lib/accounting/encryption"

export async function POST(request: NextRequest) {
  try {
    // In Next.js 15, getServerSession kan headers nodig hebben
    let session: any = null
    try {
      session = await getServerSession(authOptions)
    } catch (error) {
      console.log('Session check failed, using development fallback:', error)
    }
    
    let userEmail = session?.user?.email
    
    // Development fallback: als er geen sessie is, gebruik test email
    if (!userEmail && (process.env.NODE_ENV === 'development' || !process.env.NEXTAUTH_SECRET)) {
      userEmail = 'test@example.com'
      console.log('Development mode: using test email for authentication')
    }
    
    if (!userEmail) {
      return NextResponse.json(
        { error: "Niet geautoriseerd. Log in om een koppeling te maken." },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { provider, apiKey, apiSecret, name } = body

    if (!provider || !apiKey) {
      return NextResponse.json(
        { error: "Provider en API key zijn vereist" },
        { status: 400 }
      )
    }

    // Voor e-Boekhouden REST API: alleen API key nodig (Bearer token)
    // Voor andere providers kan een secret nodig zijn
    const finalApiSecret = provider === "E_BOEKHOUDEN" ? null : (apiSecret || null)
    
    if (!finalApiSecret && provider !== "E_BOEKHOUDEN") {
      return NextResponse.json(
        { error: "API secret is vereist voor deze provider" },
        { status: 400 }
      )
    }

    // Check eerst of database beschikbaar is
    const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NEXTAUTH_SECRET
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let user: any = null
    
    // Probeer database connectie te testen
    let dbAvailable = false
    try {
      await prisma.$queryRaw`SELECT 1`
      dbAvailable = true
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (dbError: any) {
      console.log('Database not available:', dbError.message)
      dbAvailable = false
    }
    
    if (dbAvailable) {
      try {
        user = await prisma.user.findUnique({
          where: { email: userEmail },
        })

        // In development mode, maak gebruiker aan als deze niet bestaat
        if (!user && isDevelopment) {
          try {
            user = await prisma.user.create({
              data: {
                email: userEmail,
                name: 'Test Gebruiker',
                role: 'USER',
                tier: 'FREE'
              }
            })
            console.log('Development mode: created test user')
          } catch (createError) {
            console.error('Failed to create user:', createError)
            // Fallback naar mock user
            user = { id: 'dev-user-id', email: userEmail } as { id: string; email: string }
            console.log('Development mode: using mock user (create failed)')
          }
        }
      } catch (dbError) {
        console.error('Database query error:', dbError)
        dbAvailable = false
      }
    }
    
    // Als database niet beschikbaar is, gebruik mock user in development
    if (!user && !dbAvailable && isDevelopment) {
      user = { id: 'dev-user-id', email: userEmail } as { id: string; email: string }
      console.log('Development mode: using mock user (database unavailable)')
    }
    
    if (!user && !isDevelopment) {
      return NextResponse.json(
        { error: "Database niet beschikbaar en niet in development mode" },
        { status: 503 }
      )
    }
    
    if (!user) {
      return NextResponse.json(
        { error: "Gebruiker niet gevonden" },
        { status: 404 }
      )
    }

    // Valideer API credentials
    const config = getProviderConfig(provider)
    config.apiKey = apiKey
    if (finalApiSecret) {
      config.apiSecret = finalApiSecret
    }

    const accountingProvider = createProvider(provider, config)

    // Test of credentials geldig zijn (maar niet te strikt - laat gebruiker het proberen)
    try {
      const isValid = await accountingProvider.validateToken(apiKey)
      
      // Voor e-Boekhouden: als validatie faalt, laat het toch toe (validatie gebeurt bij eerste sync)
      if (!isValid && provider !== "E_BOEKHOUDEN") {
        return NextResponse.json(
          { error: "API credentials zijn ongeldig" },
          { status: 401 }
        )
      }
    } catch (validationError) {
      console.log("Validation error (allowing connection anyway):", validationError)
      // Voor e-Boekhouden: laat de koppeling toe zelfs als validatie faalt
      // De echte validatie gebeurt bij de eerste sync
      if (provider !== "E_BOEKHOUDEN") {
        return NextResponse.json(
          { error: "API credentials validatie mislukt" },
          { status: 401 }
        )
      }
    }

    // Sla integratie op (of gebruik mock ID in development zonder database)
    let integrationId = 'dev-integration-id'
    let integrationName = name || `${accountingProvider.displayName} - ${new Date().toLocaleDateString("nl-NL")}`
    
    if (dbAvailable) {
      try {
        const integration = await prisma.accountingIntegration.create({
          data: {
            userId: user.id,
            provider: provider as any,
            name: integrationName,
            apiKey: encrypt(apiKey),
            apiSecret: finalApiSecret ? encrypt(finalApiSecret) : null,
            isActive: true,
          },
        })
        integrationId = integration.id
      } catch (dbError) {
        console.error('Failed to create integration in database:', dbError)
        dbAvailable = false
      }
    }
    
    if (!dbAvailable && !isDevelopment) {
      return NextResponse.json(
        { error: "Database niet beschikbaar. Controleer je database connectie." },
        { status: 503 }
      )
    }
    
    if (!dbAvailable) {
      console.log('Development mode: continuing without database storage')
      // Genereer een unieke ID voor development
      integrationId = `dev-integration-${Date.now()}`
    }

    return NextResponse.json({
      success: true,
      integration: {
        id: integrationId,
        provider: provider,
        name: integrationName,
      },
    })
  } catch (error) {
    console.error("Connect API key error:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Fout bij verbinden met boekhoudpakket",
      },
      { status: 500 }
    )
  }
}

