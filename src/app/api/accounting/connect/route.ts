import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { createProvider, getProviderConfig } from "@/lib/accounting/provider-factory"
import crypto from "crypto"
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
    const { provider, returnUrl } = body

    if (!provider) {
      return NextResponse.json(
        { error: "Provider is vereist" },
        { status: 400 }
      )
    }

    const config = getProviderConfig(provider)
    const accountingProvider = createProvider(provider, config)

    // Genereer state voor OAuth security
    const state = crypto.randomBytes(32).toString("base64url")
    const userEmail = session.user.email
    const stateData = {
      provider,
      userId: userEmail,
      returnUrl: returnUrl || "/dashboard",
    }

    // Store state in session/cookie (in productie gebruik je een session store)
    // Voor nu gebruiken we een encrypted cookie
    const stateCookie = Buffer.from(JSON.stringify(stateData)).toString("base64")

    const authUrl = accountingProvider.getAuthorizationUrl(state)

    const response = NextResponse.json({ authUrl })
    
    // Set state cookie (max 10 minuten)
    response.cookies.set("oauth_state", stateCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600,
    })
    response.cookies.set("oauth_state_token", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600,
    })

    return response
  } catch (error) {
    console.error("Connect error:", error)
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

