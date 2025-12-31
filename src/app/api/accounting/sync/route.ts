import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createProvider, getProviderConfig } from "@/lib/accounting/provider-factory"
import { decrypt, encrypt } from "@/lib/accounting/encryption"
import type { Session } from "next-auth"

export async function POST(request: NextRequest) {
  try {
    const session: Session | null = await getServerSession(authOptions)
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json(
        { error: "Niet geautoriseerd" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { integrationId, startDate, endDate } = body

    if (!integrationId) {
      return NextResponse.json(
        { error: "Integration ID is vereist" },
        { status: 400 }
      )
    }

    // Haal gebruiker op
    const userEmail = session.user.email
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Gebruiker niet gevonden" },
        { status: 404 }
      )
    }

    // Haal integratie op
    const integration = await prisma.accountingIntegration.findFirst({
      where: {
        id: integrationId,
        userId: user.id,
        isActive: true,
      },
    })

    if (!integration) {
      return NextResponse.json(
        { error: "Integratie niet gevonden" },
        { status: 404 }
      )
    }

    // Decrypt tokens of API keys
    let accessToken: string
    const config = getProviderConfig(integration.provider)
    
    // Voor API key providers (zoals e-Boekhouden REST API), gebruik API key als Bearer token
    if (integration.apiKey) {
      accessToken = decrypt(integration.apiKey)
      // Alleen secret decrypten als het bestaat (niet nodig voor e-Boekhouden REST API)
      if (integration.apiSecret) {
        config.apiSecret = decrypt(integration.apiSecret)
      }
      config.apiKey = accessToken
    } else if (integration.accessToken) {
      accessToken = decrypt(integration.accessToken)
    } else {
      return NextResponse.json(
        { error: "Geen access token of API key gevonden" },
        { status: 400 }
      )
    }

    const accountingProvider = createProvider(integration.provider, config)

    // Check of token nog geldig is (skip voor API key providers die geen validateToken ondersteunen)
    try {
      const isValid = await accountingProvider.validateToken(accessToken)

      if (!isValid && integration.refreshToken) {
        // Probeer token te refreshen
        try {
          const refreshToken = decrypt(integration.refreshToken)
          const authResult = await accountingProvider.refreshAccessToken(refreshToken)

          // Update integratie met nieuwe tokens
          await prisma.accountingIntegration.update({
            where: { id: integration.id },
            data: {
              accessToken: encrypt(authResult.accessToken),
              refreshToken: authResult.refreshToken
                ? encrypt(authResult.refreshToken)
                : integration.refreshToken,
              expiresAt: authResult.expiresAt || null,
            },
          })

          accessToken = authResult.accessToken
        } catch {
          return NextResponse.json(
            {
              error: "Token is verlopen en kon niet worden ververst. Verbind opnieuw.",
            },
            { status: 401 }
          )
        }
      }
    } catch (validateError) {
      // Als validateToken niet ondersteund wordt (bijv. API key providers), ga door
      console.log("Token validation skipped:", validateError)
    }

    // Haal transacties op
    const syncResult = await accountingProvider.sync(accessToken, {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit: 1000,
    })

    // Update lastSyncAt
    await prisma.accountingIntegration.update({
      where: { id: integration.id },
      data: {
        lastSyncAt: new Date(),
      },
    })

    return NextResponse.json({
      success: syncResult.success,
      transactions: syncResult.transactions,
      count: syncResult.count,
      error: syncResult.error,
    })
  } catch (error) {
    console.error("Sync error:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Fout bij synchroniseren",
      },
      { status: 500 }
    )
  }
}

