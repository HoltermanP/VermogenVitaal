import { NextRequest, NextResponse } from "next/server"

// Converteer Nederlandse symbolen naar Yahoo Finance format
function convertSymbol(symbol: string): string {
  const dutchSymbols: Record<string, string> = {
    ASML: "ASML.AS",
    INGA: "INGA.AS",
    PHIA: "PHIA.AS",
    UNA: "UNA.AS",
    RDSA: "RDSA.AS",
  }

  return dutchSymbols[symbol] || symbol
}

// Periode mapping naar Yahoo Finance interval en range
const PERIOD_MAP: Record<
  string,
  { interval: string; range: string }
> = {
  "1D": { interval: "5m", range: "1d" },
  "1W": { interval: "1h", range: "5d" },
  "1M": { interval: "1d", range: "1mo" },
  "3M": { interval: "1d", range: "3mo" },
  "1Y": { interval: "1d", range: "1y" },
  "ALL": { interval: "1d", range: "max" },
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const symbol = searchParams.get("symbol")
    const period = searchParams.get("period") || "1M"

    if (!symbol) {
      return NextResponse.json(
        { error: "Symbol parameter is verplicht" },
        { status: 400 }
      )
    }

    const yahooSymbol = convertSymbol(symbol)
    const config = PERIOD_MAP[period] || PERIOD_MAP["1M"]

    // Yahoo Finance API endpoint
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=${config.interval}&range=${config.range}`

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: "Fout bij ophalen historische data" },
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
        { error: "Geen historische data gevonden" },
        { status: 404 }
      )
    }

    const result = data.chart.result[0]
    const timestamps = result.timestamp || []
    const quotes = result.indicators?.quote?.[0]

    if (!quotes || timestamps.length === 0) {
      return NextResponse.json(
        { error: "Geen koersdata beschikbaar" },
        { status: 404 }
      )
    }

    // Converteer naar array format
    const entries = timestamps
      .map((timestamp: number, idx: number) => {
        const date = new Date(timestamp * 1000)
        return {
          date: date.toISOString(),
          open: quotes.open?.[idx] || null,
          high: quotes.high?.[idx] || null,
          low: quotes.low?.[idx] || null,
          close: quotes.close?.[idx] || null,
          volume: quotes.volume?.[idx] || 0,
        }
      })
      .filter(
        (entry: any) =>
          entry.open !== null &&
          entry.high !== null &&
          entry.low !== null &&
          entry.close !== null
      )
      .sort(
        (a: { date: string }, b: { date: string }) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
      )

    if (entries.length === 0) {
      return NextResponse.json(
        { error: "Geen geldige koersdata gevonden" },
        { status: 404 }
      )
    }

    // Limiteer aantal datapunten voor performance (max 200)
    let filteredEntries = entries
    if (filteredEntries.length > 200) {
      const step = Math.ceil(filteredEntries.length / 200)
      filteredEntries = filteredEntries.filter(
        (_: any, index: number) => index % step === 0
      )
    }

    return NextResponse.json({
      symbol,
      period,
      data: filteredEntries,
    })
  } catch (error) {
    console.error("Error fetching stock history:", error)
    return NextResponse.json(
      { error: "Fout bij ophalen historische data" },
      { status: 500 }
    )
  }
}

