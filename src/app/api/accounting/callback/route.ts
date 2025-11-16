import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createProvider, getProviderConfig } from "@/lib/accounting/provider-factory"
import { encrypt } from "@/lib/accounting/encryption"
import type { Session } from "next-auth"

export async function GET(request: NextRequest) {
  try {
    const session: Session | null = await getServerSession(authOptions)
    if (!session || !session.user || !session.user.email) {
      return NextResponse.redirect(
        new URL("/auth/signin?error=unauthorized", request.url)
      )
    }

    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const error = searchParams.get("error")

    if (error) {
      return NextResponse.redirect(
        new URL(`/dashboard?error=${encodeURIComponent(error)}`, request.url)
      )
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL("/dashboard?error=missing_params", request.url)
      )
    }

    // Verifieer state
    const stateCookie = request.cookies.get("oauth_state")?.value
    const stateToken = request.cookies.get("oauth_state_token")?.value

    if (!stateCookie || stateToken !== state) {
      return NextResponse.redirect(
        new URL("/dashboard?error=invalid_state", request.url)
      )
    }

    const stateData = JSON.parse(
      Buffer.from(stateCookie, "base64").toString()
    )

    // Haal gebruiker op
    const userEmail = session.user.email
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    })

    if (!user) {
      return NextResponse.redirect(
        new URL("/dashboard?error=user_not_found", request.url)
      )
    }

    // Exchange code voor tokens
    const config = getProviderConfig(stateData.provider)
    const accountingProvider = createProvider(stateData.provider, config)

    const authResult = await accountingProvider.exchangeCodeForTokens(code)

    // Sla integratie op in database
    await prisma.accountingIntegration.create({
      data: {
        userId: user.id,
        provider: stateData.provider as any,
        name: `${accountingProvider.displayName} - ${new Date().toLocaleDateString("nl-NL")}`,
        accessToken: encrypt(authResult.accessToken),
        refreshToken: authResult.refreshToken
          ? encrypt(authResult.refreshToken)
          : null,
        expiresAt: authResult.expiresAt || null,
        companyId: authResult.companyId || null,
        isActive: true,
      },
    })

    // Clear cookies
    const response = NextResponse.redirect(
      new URL(stateData.returnUrl || "/dashboard", request.url)
    )
    response.cookies.delete("oauth_state")
    response.cookies.delete("oauth_state_token")

    return response
  } catch (error) {
    console.error("Callback error:", error)
    return NextResponse.redirect(
      new URL(
        `/dashboard?error=${encodeURIComponent(
          error instanceof Error ? error.message : "Onbekende fout"
        )}`,
        request.url
      )
    )
  }
}

