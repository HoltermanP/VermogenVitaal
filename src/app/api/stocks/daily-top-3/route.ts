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
    WKL: "WKL.AS",
    KPN: "KPN.AS",
    AKZA: "AKZA.AS",
  }

  return dutchSymbols[symbol] || symbol
}

// Populaire stocks om te analyseren (mix van Nederlandse en internationale)
const POPULAR_STOCKS = [
  // Nederlandse stocks
  { symbol: "ASML", name: "ASML Holding" },
  { symbol: "INGA", name: "ING Groep" },
  { symbol: "PHIA", name: "Philips" },
  { symbol: "ADYEN", name: "Adyen" },
  { symbol: "HEIA", name: "Heineken" },
  { symbol: "UNA", name: "Unilever" },
  { symbol: "WKL", name: "Wolters Kluwer" },
  { symbol: "KPN", name: "KPN" },
  { symbol: "AKZA", name: "Akzo Nobel" },
  // Internationale tech stocks
  { symbol: "AAPL", name: "Apple" },
  { symbol: "MSFT", name: "Microsoft" },
  { symbol: "GOOGL", name: "Alphabet" },
  { symbol: "AMZN", name: "Amazon" },
  { symbol: "TSLA", name: "Tesla" },
  { symbol: "NVDA", name: "NVIDIA" },
  { symbol: "META", name: "Meta" },
  // ETF's
  { symbol: "VWRL.AS", name: "Vanguard FTSE All-World" },
  { symbol: "IWDA.AS", name: "iShares Core MSCI World" },
]

type StockQuote = {
  symbol: string
  price: number
  changePercent: number
  volume: number
  previousClose: number
}

type StockHistory = {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

type StockScore = {
  symbol: string
  name: string
  quote: StockQuote
  score: number
  reasons: string[]
}

// Bereken RSI
function calculateRSI(data: StockHistory[], period: number = 14): number {
  if (data.length < period + 1) return 50 // Neutraal als niet genoeg data

  const changes: number[] = []
  for (let i = 1; i < data.length; i++) {
    changes.push(data[i].close - data[i - 1].close)
  }

  const recentChanges = changes.slice(-period)
  const gains = recentChanges.filter(c => c > 0).reduce((sum, c) => sum + c, 0) / period
  const losses = Math.abs(recentChanges.filter(c => c < 0).reduce((sum, c) => sum + c, 0)) / period

  if (losses === 0) return 100
  const rs = gains / losses
  return 100 - (100 / (1 + rs))
}

// Bereken SMA
function calculateSMA(data: StockHistory[], period: number): number {
  if (data.length < period) return data[data.length - 1]?.close || 0
  const recent = data.slice(-period)
  return recent.reduce((sum, item) => sum + item.close, 0) / period
}

// Bereken momentum (prijsverandering over laatste 5 dagen)
function calculateMomentum(data: StockHistory[]): number {
  if (data.length < 6) return 0
  const recent = data.slice(-6)
  const firstPrice = recent[0].close
  const lastPrice = recent[recent.length - 1].close
  return ((lastPrice - firstPrice) / firstPrice) * 100
}

// Bereken korte termijn score voor een stock
async function calculateShortTermScore(
  symbol: string,
  name: string
): Promise<StockScore | null> {
  try {
    const yahooSymbol = convertSymbol(symbol)

    // Haal quote en recente historie op
    const [quoteResponse, historyResponse] = await Promise.allSettled([
      fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1m&range=1d`,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
        }
      ),
      fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1d&range=1mo`,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
        }
      ),
    ])

    if (quoteResponse.status === "rejected" || historyResponse.status === "rejected") {
      return null
    }

    const quoteData = await quoteResponse.value.json()
    const historyData = await historyResponse.value.json()

    if (
      !quoteData.chart?.result?.[0]?.meta ||
      !historyData.chart?.result?.[0]
    ) {
      return null
    }

    const quoteMeta = quoteData.chart.result[0].meta
    const historyResult = historyData.chart.result[0]

    const currentPrice = quoteMeta.regularMarketPrice
    const previousClose = quoteMeta.previousClose || currentPrice
    const changePercent = ((currentPrice - previousClose) / previousClose) * 100
    const volume = quoteMeta.regularMarketVolume || 0

    // Converteer historie data
    const timestamps = historyResult.timestamp || []
    const quotes = historyResult.indicators?.quote?.[0]
    const history: StockHistory[] = timestamps
      .map((timestamp: number, idx: number) => ({
        date: new Date(timestamp * 1000).toISOString(),
        open: quotes?.open?.[idx] || 0,
        high: quotes?.high?.[idx] || 0,
        low: quotes?.low?.[idx] || 0,
        close: quotes?.close?.[idx] || 0,
        volume: quotes?.volume?.[idx] || 0,
      }))
      .filter(
        (h: StockHistory) =>
          h.open > 0 && h.high > 0 && h.low > 0 && h.close > 0
      )
      .sort((a: StockHistory, b: StockHistory) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
      )

    if (history.length < 5) {
      return null // Niet genoeg data
    }

    const quote: StockQuote = {
      symbol,
      price: currentPrice,
      changePercent,
      volume,
      previousClose,
    }

    // Bereken technische indicatoren
    const rsi = calculateRSI(history, 14)
    const sma20 = calculateSMA(history, 20)
    const sma5 = calculateSMA(history, 5)
    const momentum = calculateMomentum(history)

    // Bereken score (0-100) op basis van korte termijn factoren
    let score = 50 // Start met neutrale score
    const reasons: string[] = []

    // 1. Prijsverandering vandaag (max 30 punten)
    if (changePercent > 0) {
      const changeScore = Math.min(changePercent * 2, 30)
      score += changeScore
      if (changePercent > 2) {
        reasons.push(`Sterke stijging vandaag (+${changePercent.toFixed(2)}%)`)
      } else if (changePercent > 0.5) {
        reasons.push(`Positieve beweging vandaag (+${changePercent.toFixed(2)}%)`)
      }
    } else {
      score -= Math.min(Math.abs(changePercent) * 2, 20)
      if (changePercent < -2) {
        reasons.push(`Daling vandaag (${changePercent.toFixed(2)}%)`)
      }
    }

    // 2. Momentum (max 20 punten)
    if (momentum > 0) {
      const momentumScore = Math.min(momentum * 2, 20)
      score += momentumScore
      if (momentum > 3) {
        reasons.push(`Sterk momentum laatste 5 dagen (+${momentum.toFixed(2)}%)`)
      } else if (momentum > 1) {
        reasons.push(`Positief momentum (+${momentum.toFixed(2)}%)`)
      }
    } else {
      score -= Math.min(Math.abs(momentum) * 2, 15)
    }

    // 3. RSI (max 15 punten)
    if (rsi > 50 && rsi < 70) {
      // Gezonde bullish zone
      score += 15
      reasons.push(`RSI in gezonde zone (${rsi.toFixed(1)})`)
    } else if (rsi >= 70 && rsi < 80) {
      // Overbought maar nog niet extreem
      score += 5
      reasons.push(`RSI overbought (${rsi.toFixed(1)}) - voorzichtig`)
    } else if (rsi >= 80) {
      // Te overbought
      score -= 10
      reasons.push(`RSI zeer overbought (${rsi.toFixed(1)}) - risico`)
    } else if (rsi < 30) {
      // Oversold - mogelijk koopkans
      score += 10
      reasons.push(`RSI oversold (${rsi.toFixed(1)}) - mogelijk koopkans`)
    }

    // 4. Moving averages (max 15 punten)
    if (currentPrice > sma5 && sma5 > sma20) {
      // Sterke uptrend
      score += 15
      reasons.push(`Prijs boven beide moving averages - uptrend`)
    } else if (currentPrice > sma20) {
      score += 8
      reasons.push(`Prijs boven 20-dagen gemiddelde`)
    } else {
      score -= 5
    }

    // 5. Volume (max 10 punten)
    if (history.length > 0) {
      const avgVolume =
        history.reduce((sum: number, h: StockHistory) => sum + h.volume, 0) /
        history.length
      if (volume > avgVolume * 1.5) {
        score += 10
        reasons.push(`Hogere volume dan gemiddeld - sterke interesse`)
      } else if (volume > avgVolume * 1.2) {
        score += 5
      }
    }

    // 6. Prijs boven recente high (max 10 punten)
    if (history.length > 0) {
      const recentHigh = Math.max(...history.slice(-5).map((h: StockHistory) => h.high))
      if (currentPrice > recentHigh * 0.98) {
        score += 10
        reasons.push(`Prijs dicht bij recente high`)
      }
    }

    // Normaliseer score tussen 0-100
    score = Math.max(0, Math.min(100, score))

    return {
      symbol,
      name,
      quote,
      score,
      reasons: reasons.slice(0, 5), // Max 5 redenen
    }
  } catch (error) {
    console.error(`Error calculating score for ${symbol}:`, error)
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    // Analyseer alle populaire stocks
    const scores = await Promise.all(
      POPULAR_STOCKS.map((stock) =>
        calculateShortTermScore(stock.symbol, stock.name)
      )
    )

    // Filter null values en sorteer op score
    const validScores = scores
      .filter((s): s is StockScore => s !== null)
      .sort((a, b) => b.score - a.score)

    // Neem top 3
    const top3 = validScores.slice(0, 3)

    // Voeg ranking toe
    const top3WithRanking = top3.map((stock, index) => ({
      ...stock,
      rank: index + 1,
    }))

    return NextResponse.json({
      date: new Date().toISOString().split("T")[0],
      top3: top3WithRanking,
    })
  } catch (error) {
    console.error("Error fetching daily top 3:", error)
    return NextResponse.json(
      { error: "Fout bij ophalen dag-top 3" },
      { status: 500 }
    )
  }
}

