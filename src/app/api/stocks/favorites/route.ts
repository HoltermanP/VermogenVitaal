import { NextRequest, NextResponse } from "next/server"
import { getClerkUser } from "@/lib/clerk-auth"
import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"

// GET - Haal alle favorieten op voor de gebruiker
export async function GET() {
  try {
    // Probeer gebruiker op te halen, maar vang alle errors op
    let user = null
    try {
      // Voor GET requests hebben we geen request object, maar auth() werkt zonder
      user = await getClerkUser()
    } catch (authError) {
      console.warn("Auth error (non-critical):", authError)
      // Als auth faalt, behandel als niet ingelogd
      return NextResponse.json({ favorites: [] })
    }
    
    if (!user || !user.id) {
      // Geen gebruiker = geen favorieten, maar geen error
      return NextResponse.json({ favorites: [] })
    }

    // Probeer favorieten op te halen
    let favorites = []
    try {
      favorites = await prisma.stockFavorite.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      })
    } catch (dbError) {
      console.error("Database error fetching favorites:", dbError)
      // Bij database error, retourneer lege array
      return NextResponse.json({ favorites: [] })
    }

    return NextResponse.json({ favorites })
  } catch (error) {
    console.error("Unexpected error fetching favorites:", error)
    // Bij een onverwachte error, retourneer lege array in plaats van error
    // Dit voorkomt crashes wanneer de gebruiker niet is ingelogd of database problemen
    return NextResponse.json({ favorites: [] })
  }
}

// POST - Voeg een favoriet toe
export async function POST(request: NextRequest) {
  console.log("POST /api/stocks/favorites - Request ontvangen")
  
  // Debug: log request headers
  if (process.env.NODE_ENV === 'development') {
    const cookieHeader = request.headers.get('cookie')
    console.log("POST /api/stocks/favorites - Cookies present:", !!cookieHeader)
    console.log("POST /api/stocks/favorites - Cookie header:", cookieHeader ? "present" : "missing")
  }
  
  try {
    // Check eerst of Clerk is geconfigureerd
    const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
    const clerkSecretKey = process.env.CLERK_SECRET_KEY
    
    if (!clerkPublishableKey || !clerkSecretKey) {
      console.error("POST /api/stocks/favorites - Clerk niet geconfigureerd")
      return NextResponse.json(
        { error: "Authenticatie niet geconfigureerd" },
        { status: 500 }
      )
    }
    
    // Test direct auth() eerst
    let authResult
    try {
      authResult = await auth()
    } catch (authError) {
      console.error("POST /api/stocks/favorites - Auth error:", authError)
      return NextResponse.json(
        { error: "Niet geautoriseerd. Log in om favorieten toe te voegen." },
        { status: 401 }
      )
    }
    
    console.log("POST /api/stocks/favorites - Direct auth() result:", {
      userId: authResult.userId,
      sessionId: authResult.sessionId,
      orgId: authResult.orgId
    })
    
    // Als auth() geen userId heeft, is de gebruiker niet ingelogd
    if (!authResult.userId) {
      console.log("POST /api/stocks/favorites - Geen userId in auth result")
      return NextResponse.json(
        { error: "Niet geautoriseerd. Log in om favorieten toe te voegen." },
        { status: 401 }
      )
    }
    
    // Probeer gebruiker op te halen, maar vang alle errors op
    let user = null
    try {
      console.log("POST /api/stocks/favorites - Ophalen gebruiker via getClerkUser...")
      // Geef de request door aan getClerkUser zodat cookies kunnen worden gelezen
      user = await getClerkUser(request)
      console.log("POST /api/stocks/favorites - Gebruiker opgehaald:", user ? `ID: ${user.id}` : "null")
    } catch (authError) {
      console.error("Auth error when adding favorite:", authError)
      return NextResponse.json(
        { error: "Niet geautoriseerd. Log in om favorieten toe te voegen." },
        { status: 401 }
      )
    }
    
    if (!user || !user.id) {
      console.log("POST /api/stocks/favorites - Geen gebruiker gevonden in database")
      return NextResponse.json(
        { error: "Niet geautoriseerd. Log in om favorieten toe te voegen." },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { symbol, name, exchange, type } = body

    if (!symbol) {
      return NextResponse.json(
        { error: "Symbol is verplicht" },
        { status: 400 }
      )
    }

    // Als naam niet is opgegeven, gebruik symbol als naam
    const stockName = name || symbol

    // Check of favoriet al bestaat
    let existing = null
    try {
      existing = await prisma.stockFavorite.findUnique({
        where: {
          userId_symbol: {
            userId: user.id,
            symbol: symbol,
          },
        },
      })
    } catch (dbError) {
      console.error("Database error checking existing favorite:", dbError)
      return NextResponse.json(
        { error: "Fout bij controleren favoriet" },
        { status: 500 }
      )
    }

    if (existing) {
      return NextResponse.json(
        { error: "Dit aandeel staat al in je favorieten" },
        { status: 409 }
      )
    }

    // Maak nieuwe favoriet aan
    let favorite = null
    try {
      favorite = await prisma.stockFavorite.create({
        data: {
          userId: user.id,
          symbol,
          name: stockName,
          exchange: exchange || null,
          type: type || null,
        },
      })
    } catch (dbError) {
      console.error("Database error creating favorite:", dbError)
      // Check of het een duplicate error is
      if (dbError && typeof dbError === 'object' && 'code' in dbError && dbError.code === "P2002") {
        return NextResponse.json(
          { error: "Dit aandeel staat al in je favorieten" },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { error: "Fout bij opslaan favoriet" },
        { status: 500 }
      )
    }

    return NextResponse.json({ favorite }, { status: 201 })
  } catch (error) {
    console.error("Unexpected error adding favorite:", error)
    // Check of het een duplicate error is
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
    const user = await getClerkUser(request)
    
    if (!user || !user.id) {
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

