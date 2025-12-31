import { NextRequest, NextResponse } from "next/server"
import { getClerkUser } from "@/lib/clerk-auth"
import { prisma } from "@/lib/prisma"

// GET - Haal alle portfolio items op voor de gebruiker
export async function GET(request: NextRequest) {
  try {
    const user = await getClerkUser(request)

    if (!user || !user.id) {
      return NextResponse.json(
        { error: "Niet geautoriseerd. Log in om je portefeuille te bekijken." },
        { status: 401 }
      )
    }

    const portfolio = await prisma.portfolioItem.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ portfolio })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : undefined
    console.error("Error fetching portfolio:", {
      message: errorMessage,
      stack: errorStack,
      timestamp: new Date().toISOString(),
    })
    return NextResponse.json(
      { 
        error: "Fout bij ophalen portefeuille",
        ...(process.env.NODE_ENV === 'development' && { details: errorMessage })
      },
      { status: 500 }
    )
  }
}

// POST - Voeg een portfolio item toe
export async function POST(request: NextRequest) {
  try {
    const user = await getClerkUser(request)
    
    if (!user || !user.id) {
      return NextResponse.json(
        { error: "Niet geautoriseerd. Log in om items toe te voegen." },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { symbol, name, exchange, type, quantity, averagePrice, alertThreshold, alertNotificationType } = body

    if (!symbol || !name || !quantity || quantity <= 0) {
      return NextResponse.json(
        { error: "Symbol, naam en hoeveelheid zijn verplicht. Hoeveelheid moet groter dan 0 zijn." },
        { status: 400 }
      )
    }

    // Check of item al bestaat
    const existing = await prisma.portfolioItem.findUnique({
      where: {
        userId_symbol: {
          userId: user.id,
          symbol: symbol,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: "Dit product staat al in je portefeuille" },
        { status: 409 }
      )
    }

    // Maak nieuw portfolio item aan
    const portfolioItem = await prisma.portfolioItem.create({
      data: {
        userId: user.id,
        symbol,
        name,
        exchange: exchange || null,
        type: type || null,
        quantity: parseFloat(quantity),
        averagePrice: averagePrice ? parseFloat(averagePrice) : null,
        alertThreshold: alertThreshold ? parseFloat(alertThreshold) : null,
        alertEnabled: alertThreshold !== null && alertThreshold !== undefined,
        alertNotificationType: alertNotificationType || 'EMAIL',
      },
    })

    return NextResponse.json({ portfolioItem }, { status: 201 })
  } catch (error) {
    console.error("Error adding portfolio item:", error)
    if (error && typeof error === 'object' && 'code' in error && error.code === "P2002") {
      return NextResponse.json(
        { error: "Dit product staat al in je portefeuille" },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: "Fout bij toevoegen portefeuille item" },
      { status: 500 }
    )
  }
}

