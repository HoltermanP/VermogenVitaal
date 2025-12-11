import { NextRequest, NextResponse } from "next/server"
import { getClerkUser } from "@/lib/clerk-auth"
import { prisma } from "@/lib/prisma"

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

// Haal historische prijsdata op voor een symbool
async function getStockHistory(symbol: string, period: string = "1Y") {
  const yahooSymbol = convertSymbol(symbol)
  
  const periodMap: Record<string, { interval: string; range: string }> = {
    "1M": { interval: "1d", range: "1mo" },
    "3M": { interval: "1d", range: "3mo" },
    "6M": { interval: "1d", range: "6mo" },
    "1Y": { interval: "1d", range: "1y" },
    "ALL": { interval: "1d", range: "max" },
  }

  const config = periodMap[period] || periodMap["1Y"]
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=${config.interval}&range=${config.range}`

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()

    if (!data.chart?.result?.[0]) {
      return null
    }

    const result = data.chart.result[0]
    const timestamps = result.timestamp || []
    const quotes = result.indicators?.quote?.[0]

    if (!quotes || timestamps.length === 0) {
      return null
    }

    // Converteer naar map van datum -> prijs
    const priceMap: Record<string, number> = {}
    timestamps.forEach((timestamp: number, idx: number) => {
      const date = new Date(timestamp * 1000)
      const dateKey = date.toISOString().split('T')[0] // YYYY-MM-DD format
      const closePrice = quotes.close?.[idx]
      
      if (closePrice !== null && closePrice !== undefined) {
        priceMap[dateKey] = closePrice
      }
    })

    return priceMap
  } catch (error) {
    console.error(`Error fetching history for ${symbol}:`, error)
    return null
  }
}

// GET - Haal historische portfolio waarden op
export async function GET(request: NextRequest) {
  try {
    const user = await getClerkUser()
    
    if (!user || !user.id) {
      return NextResponse.json(
        { error: "Niet geautoriseerd" },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const period = searchParams.get("period") || "1Y"

    // Haal portfolio items op
    const portfolio = await prisma.portfolioItem.findMany({
      where: { userId: user.id },
    })

    if (portfolio.length === 0) {
      return NextResponse.json({
        data: [],
        totalValue: [],
        totalReturn: [],
      })
    }

    // Haal historische prijzen op voor alle symbolen
    const historyPromises = portfolio.map(async (item) => {
      const history = await getStockHistory(item.symbol, period)
      return { symbol: item.symbol, history, item }
    })

    const histories = await Promise.all(historyPromises)

    // Verzamel alle unieke datums
    const allDates = new Set<string>()
    histories.forEach(({ history }) => {
      if (history) {
        Object.keys(history).forEach((date) => allDates.add(date))
      }
    })

    const sortedDates = Array.from(allDates).sort()

    if (sortedDates.length === 0) {
      return NextResponse.json({
        data: [],
        totalValue: [],
        totalReturn: [],
      })
    }

    // Bereken totale waarde en rendement voor elke datum
    const totalValueData: Array<{ date: string; value: number }> = []
    const totalReturnData: Array<{ date: string; return: number; returnPercent: number }> = []

    sortedDates.forEach((date) => {
      let totalValue = 0
      let totalCostBasis = 0

      histories.forEach(({ history, item }) => {
        if (history && history[date] !== undefined) {
          const price = history[date]
          const value = price * item.quantity
          totalValue += value

          if (item.averagePrice) {
            const costBasis = item.averagePrice * item.quantity
            totalCostBasis += costBasis
          }
        }
      })

      if (totalValue > 0) {
        totalValueData.push({
          date,
          value: totalValue,
        })

        if (totalCostBasis > 0) {
          const totalReturn = totalValue - totalCostBasis
          const totalReturnPercent = (totalReturn / totalCostBasis) * 100
          totalReturnData.push({
            date,
            return: totalReturn,
            returnPercent: totalReturnPercent,
          })
        }
      }
    })

    return NextResponse.json({
      data: totalValueData,
      totalValue: totalValueData,
      totalReturn: totalReturnData,
    })
  } catch (error) {
    console.error("Error fetching portfolio history:", error)
    return NextResponse.json(
      { error: "Fout bij ophalen historische portfolio data" },
      { status: 500 }
    )
  }
}














