import { NextRequest, NextResponse } from "next/server"

// Yahoo Finance search/autocomplete endpoint
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("q")

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: "Zoekterm moet minimaal 2 tekens bevatten" },
        { status: 400 }
      )
    }

    // Yahoo Finance autocomplete endpoint
    const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=20&newsCount=0`

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: "Fout bij zoeken" },
        { status: response.status }
      )
    }

    const data = await response.json()

    if (!data.quotes || data.quotes.length === 0) {
      return NextResponse.json({ results: [] })
    }

    // Format results
    const results = data.quotes
      .filter((quote: { quoteType?: string }) => quote.quoteType === "EQUITY" || quote.quoteType === "ETF")
      .map((quote: { symbol: string; longname?: string; shortname?: string; exchange?: string; quoteType?: string; market?: string }) => ({
        symbol: quote.symbol,
        name: quote.longname || quote.shortname || quote.symbol,
        exchange: quote.exchange,
        type: quote.quoteType === "ETF" ? "ETF" : "STOCK",
        market: quote.market,
      }))

    return NextResponse.json({ results })
  } catch (error) {
    console.error("Error searching stocks:", error)
    return NextResponse.json(
      { error: "Fout bij zoeken naar aandelen" },
      { status: 500 }
    )
  }
}

