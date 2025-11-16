import { NextRequest, NextResponse } from "next/server"

// Yahoo Finance API voor realtime koersen (gratis, ~15 min vertraging)
// Converteer Nederlandse symbolen naar Yahoo Finance format
function convertSymbol(symbol: string): string {
  // Nederlandse beurs symbolen (Amsterdam Exchange)
  const dutchSymbols: Record<string, string> = {
    ASML: "ASML.AS",
    INGA: "INGA.AS",
    PHIA: "PHIA.AS",
    UNA: "UNA.AS",
    RDSA: "RDSA.AS",
  }

  return dutchSymbols[symbol] || symbol
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const symbol = searchParams.get("symbol")

    if (!symbol) {
      return NextResponse.json(
        { error: "Symbol parameter is verplicht" },
        { status: 400 }
      )
    }

    const yahooSymbol = convertSymbol(symbol)

    // Yahoo Finance API endpoint voor realtime quote
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1m&range=1d`

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: "Fout bij ophalen koersdata" },
        { status: response.status }
      )
    }

    const data = await response.json()

    if (
      !data.chart ||
      !data.chart.result ||
      data.chart.result.length === 0
    ) {
      return NextResponse.json(
        { error: "Geen data gevonden voor dit symbool" },
        { status: 404 }
      )
    }

    const result = data.chart.result[0]
    const meta = result.meta

    if (!meta || meta.regularMarketPrice === undefined) {
      return NextResponse.json(
        { error: "Geen koersdata beschikbaar" },
        { status: 404 }
      )
    }

    const currentPrice = meta.regularMarketPrice
    const previousClose = meta.previousClose || currentPrice
    const change = currentPrice - previousClose
    const changePercent = (change / previousClose) * 100

    // Haal intraday data op voor open, high, low van vandaag
    const quotes = result.indicators?.quote?.[0]
    const timestamps = result.timestamp || []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let todayOpen = currentPrice
    let todayHigh = currentPrice
    let todayLow = currentPrice
    let todayVolume = meta.regularMarketVolume || 0

    if (quotes && timestamps.length > 0) {
      const todayData = timestamps
        .map((ts: number, idx: number) => ({
          timestamp: ts * 1000,
          open: quotes.open?.[idx],
          high: quotes.high?.[idx],
          low: quotes.low?.[idx],
          volume: quotes.volume?.[idx] || 0,
        }))
        .filter(
          (item: { timestamp: string }) => new Date(item.timestamp).getTime() >= today.getTime()
        )

      if (todayData.length > 0) {
        todayOpen = todayData[0].open || currentPrice
        todayHigh = Math.max(...todayData.map((d: { high?: number }) => d.high || 0))
        todayLow = Math.min(
          ...todayData.map((d: { low?: number }) => (d.low || currentPrice) > 0 ? d.low : currentPrice)
        )
        todayVolume = todayData.reduce(
          (sum: number, d: { volume?: number }) => sum + (d.volume || 0),
          0
        )
      }
    }

    const latestTradingDay = new Date(meta.regularMarketTime * 1000)

    return NextResponse.json({
      symbol: symbol,
      open: todayOpen,
      high: todayHigh,
      low: todayLow,
      price: currentPrice,
      volume: todayVolume,
      latestTradingDay: latestTradingDay.toISOString().split("T")[0],
      previousClose: previousClose,
      change: change,
      changePercent: changePercent,
    })
  } catch (error) {
    console.error("Error fetching stock quote:", error)
    return NextResponse.json(
      { error: "Fout bij ophalen beurskoers" },
      { status: 500 }
    )
  }
}

