import { NextRequest, NextResponse } from "next/server"
import { getClerkUser } from "@/lib/clerk-auth"
import { prisma } from "@/lib/prisma"

// GET - Haal alle favorieten op voor de gebruiker
export async function GET() {
  try {
    const user = await getClerkUser()
    
    if (!user) {
      return NextResponse.json(
        { error: "Niet geautoriseerd" },
        { status: 401 }
      )
    }

    const favorites = await prisma.stockFavorite.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ favorites })
  } catch (error) {
    console.error("Error fetching favorites:", error)
    return NextResponse.json(
      { error: "Fout bij ophalen favorieten" },
      { status: 500 }
    )
  }
}

// POST - Voeg een favoriet toe
export async function POST(request: NextRequest) {
  try {
    const user = await getClerkUser()
    
    if (!user) {
      return NextResponse.json(
        { error: "Niet geautoriseerd" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { symbol, name, exchange, type } = body

    if (!symbol || !name) {
      return NextResponse.json(
        { error: "Symbol en naam zijn verplicht" },
        { status: 400 }
      )
    }

    // Check of favoriet al bestaat
    const existing = await prisma.stockFavorite.findUnique({
      where: {
        userId_symbol: {
          userId: user.id,
          symbol: symbol,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: "Dit aandeel staat al in je favorieten" },
        { status: 409 }
      )
    }

    const favorite = await prisma.stockFavorite.create({
      data: {
        userId: user.id,
        symbol,
        name,
        exchange: exchange || null,
        type: type || null,
      },
    })

    return NextResponse.json({ favorite }, { status: 201 })
  } catch (error) {
    console.error("Error adding favorite:", error)
    if (error && typeof error === 'object' && 'code' in error && error.code === "P2002") {
      return NextResponse.json(
        { error: "Dit aandeel staat al in je favorieten" },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: "Fout bij toevoegen favoriet" },
      { status: 500 }
    )
  }
}

// DELETE - Verwijder een favoriet
export async function DELETE(request: NextRequest) {
  try {
    const user = await getClerkUser()
    
    if (!user) {
      return NextResponse.json(
        { error: "Niet geautoriseerd" },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const symbol = searchParams.get("symbol")

    if (!symbol) {
      return NextResponse.json(
        { error: "Symbol is verplicht" },
        { status: 400 }
      )
    }

    await prisma.stockFavorite.deleteMany({
      where: {
        userId: user.id,
        symbol: symbol,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting favorite:", error)
    return NextResponse.json(
      { error: "Fout bij verwijderen favoriet" },
      { status: 500 }
    )
  }
}

