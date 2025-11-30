import { NextRequest, NextResponse } from "next/server"

// Converteer Nederlandse symbolen naar Yahoo Finance format
function convertSymbol(symbol: string): string {
  const dutchSymbols: Record<string, string> = {
    ASML: "ASML.AS",
    INGA: "INGA.AS",
    PHIA: "PHIA.AS",
    UNA: "UNA.AS",
    RDSA: "RDSA.AS",
    ADYEN: "ADYEN.AS",
    HEIA: "HEIA.AS",
    KPN: "KPN.AS",
    ABN: "ABN.AS",
    AKZA: "AKZA.AS",
    MT: "MT.AS",
    RAND: "RAND.AS",
    WKL: "WKL.AS",
    ASM: "ASM.AS",
    IMCD: "IMCD.AS",
    NN: "NN.AS",
    AALB: "AALB.AS",
    AD: "AD.AS",
    AGN: "AGN.AS",
    ARCAD: "ARCAD.AS",
    BESI: "BESI.AS",
    DSFIRST: "DSFIRST.AS",
    FER: "FER.AS",
    FLOW: "FLOW.AS",
    GTO: "GTO.AS",
    INPST: "INPST.AS",
    JDEP: "JDEP.AS",
    OCI: "OCI.AS",
    REN: "REN.AS",
    SBMO: "SBMO.AS",
    TKWY: "TKWY.AS",
    UBG: "UBG.AS",
    VOPAK: "VOPAK.AS",
  }

  return dutchSymbols[symbol] || symbol
}

// Lijst van populaire Nederlandse aandelen
const POPULAR_STOCKS = [
  "ASML", "INGA", "PHIA", "UNA", "RDSA", "ADYEN", "HEIA", "KPN", 
  "ABN", "AKZA", "MT", "RAND", "WKL", "ASM", "IMCD", "NN", 
  "AALB", "AD", "AGN", "ARCAD", "BESI", "DSFIRST", "FER", "FLOW",
  "GTO", "INPST", "JDEP", "OCI", "REN", "SBMO", "TKWY", "UBG", "VOPAK"
]

type StockChange = {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
}

// Haal quote data op voor een symbool
async function fetchStockQuote(symbol: string): Promise<StockChange | null> {
  try {
    const yahooSymbol = convertSymbol(symbol)
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1m&range=1d`

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()

    if (
      !data.chart ||
      !data.chart.result ||
      data.chart.result.length === 0
    ) {
      return null
    }

    const result = data.chart.result[0]
    const meta = result.meta

    if (!meta || meta.regularMarketPrice === undefined) {
      return null
    }

    const currentPrice = meta.regularMarketPrice
    const previousClose = meta.previousClose || currentPrice
    const change = currentPrice - previousClose
    const changePercent = (change / previousClose) * 100
    const volume = meta.regularMarketVolume || 0
    const name = meta.shortName || symbol

    return {
      symbol,
      name,
      price: currentPrice,
      change,
      changePercent,
      volume,
    }
  } catch (error) {
    console.error(`Error fetching quote for ${symbol}:`, error)
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    // Haal quotes op voor alle populaire aandelen
    const quotePromises = POPULAR_STOCKS.map(symbol => fetchStockQuote(symbol))
    const quotes = await Promise.allSettled(quotePromises)

    // Filter alleen succesvolle quotes
    const validQuotes: StockChange[] = quotes
      .filter((result): result is PromiseFulfilledResult<StockChange> => 
        result.status === "fulfilled" && result.value !== null
      )
      .map(result => result.value)

    // Sorteer op changePercent
    const sortedByChange = [...validQuotes].sort((a, b) => b.changePercent - a.changePercent)

    // Top 5 stijgers
    const gainers = sortedByChange.slice(0, 5)

    // Top 5 dalers
    const losers = sortedByChange.slice(-5).reverse()

    return NextResponse.json({
      gainers,
      losers,
    })
  } catch (error) {
    console.error("Error fetching gainers and losers:", error)
    return NextResponse.json(
      { error: "Fout bij ophalen stijgers en dalers" },
      { status: 500 }
    )
  }
}

