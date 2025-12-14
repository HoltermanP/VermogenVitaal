import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { fetchStockNews } from "@/lib/news-service"
import { fetchEnhancedStockNews, formatEnhancedNews } from "@/lib/enhanced-news-service"
import { fetchEnhancedFinancialData, formatEnhancedFinancialData } from "@/lib/enhanced-financial-data"
import { fetchSocialSentiment, formatSocialSentiment } from "@/lib/social-sentiment-service"
import { aggregateFinancialData, formatAggregatedFinancialData } from "@/lib/financial-data-aggregator"
import { prisma } from "@/lib/prisma"
import { getClerkUser } from "@/lib/clerk-auth"
import { auth } from "@clerk/nextjs/server"
import { getOrCreateAnonymousSessionId } from "@/lib/anonymous-session"

const FREE_TIER_AI_CALL_LIMIT = 10
const ANONYMOUS_SESSION_DURATION_HOURS = 24 // 24 uur tijdslimiet voor anonieme gebruikers

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

// Haal stock quote op
async function fetchQuote(symbol: string) {
  const yahooSymbol = convertSymbol(symbol)
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1d&range=1y`
  
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
  })

  if (!response.ok) return null

  const data = await response.json()
  const result = data.chart?.result?.[0]
  if (!result) return null

  const meta = result.meta
  const currentPrice = meta?.regularMarketPrice
  const previousClose = meta?.previousClose || currentPrice
  const change = currentPrice - previousClose
  const changePercent = (change / previousClose) * 100

  return {
    symbol,
    price: currentPrice,
    previousClose,
    change,
    changePercent,
    volume: meta?.regularMarketVolume || 0,
    marketCap: meta?.marketCap || null,
  }
}

// Haal fundamentals op - uitgebreide versie met meer financiele modules
async function fetchFundamentals(symbol: string) {
  const yahooSymbol = convertSymbol(symbol)
  
  // Haal meer modules op voor uitgebreide financiele data
  const [summaryResponse, keyStatsResponse, financialsResponse, earningsResponse, calendarResponse] = await Promise.all([
    // Summary voor algemene bedrijfsinfo
    fetch(
      `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${yahooSymbol}?modules=summaryProfile,assetProfile`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      }
    ),
    // Key statistics voor kentallen
    fetch(
      `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${yahooSymbol}?modules=defaultKeyStatistics,financialData`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      }
    ),
    // Financials voor resultaten (meer jaren)
    fetch(
      `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${yahooSymbol}?modules=incomeStatementHistory,balanceSheetHistory,cashflowStatementHistory,incomeStatementHistoryQuarterly,balanceSheetHistoryQuarterly,cashflowStatementHistoryQuarterly`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      }
    ),
    // Earnings data voor geschiedenis en verwachtingen
    fetch(
      `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${yahooSymbol}?modules=earningsHistory,earningsTrend,earnings`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      }
    ),
    // Calendar events voor belangrijke datums
    fetch(
      `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${yahooSymbol}?modules=calendarEvents`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      }
    ),
  ])

  const summaryData = summaryResponse.ok ? await summaryResponse.json().catch(() => null) : null
  const keyStatsData = keyStatsResponse.ok ? await keyStatsResponse.json().catch(() => null) : null
  const financialsData = financialsResponse.ok ? await financialsResponse.json().catch(() => null) : null
  const earningsData = earningsResponse.ok ? await earningsResponse.json().catch(() => null) : null
  const calendarData = calendarResponse.ok ? await calendarResponse.json().catch(() => null) : null

  const result = summaryData?.quoteSummary?.result?.[0]
  const keyStats = keyStatsData?.quoteSummary?.result?.[0]
  const financials = financialsData?.quoteSummary?.result?.[0]
  const earnings = earningsData?.quoteSummary?.result?.[0]
  const calendar = calendarData?.quoteSummary?.result?.[0]

  // Haal meer jaren op (tot 10 jaar als beschikbaar)
  const incomeStatements = financials?.incomeStatementHistory?.incomeStatementHistory || []
  const balanceSheets = financials?.balanceSheetHistory?.balanceSheetStatements || []
  const cashFlows = financials?.cashflowStatementHistory?.cashflowStatements || []
  
  // Voeg quarterly data toe als beschikbaar
  const quarterlyIncome = financials?.incomeStatementHistoryQuarterly?.incomeStatementHistory || []
  const quarterlyBalance = financials?.balanceSheetHistoryQuarterly?.balanceSheetStatements || []
  const quarterlyCashFlow = financials?.cashflowStatementHistoryQuarterly?.cashflowStatements || []

  return {
    // Bedrijfsinfo
    companyName: result?.summaryProfile?.longName || result?.summaryProfile?.shortName || symbol,
    sector: result?.summaryProfile?.sector || "N/A",
    industry: result?.summaryProfile?.industry || "N/A",
    description: result?.summaryProfile?.longBusinessSummary || "Geen beschrijving beschikbaar",
    website: result?.summaryProfile?.website || null,
    employees: result?.summaryProfile?.fullTimeEmployees || null,
    address: result?.summaryProfile?.address1 || null,
    city: result?.summaryProfile?.city || null,
    country: result?.summaryProfile?.country || null,
    
    // Valuatie kentallen
    marketCap: keyStats?.defaultKeyStatistics?.marketCap?.raw || null,
    enterpriseValue: keyStats?.defaultKeyStatistics?.enterpriseValue?.raw || null,
    trailingPE: keyStats?.defaultKeyStatistics?.trailingPE?.raw || null,
    forwardPE: keyStats?.defaultKeyStatistics?.forwardPE?.raw || null,
    pegRatio: keyStats?.defaultKeyStatistics?.pegRatio?.raw || null,
    priceToBook: keyStats?.defaultKeyStatistics?.priceToBook?.raw || null,
    priceToSales: keyStats?.defaultKeyStatistics?.priceToSalesTrailing12Months?.raw || null,
    enterpriseToRevenue: keyStats?.defaultKeyStatistics?.enterpriseToRevenue?.raw || null,
    enterpriseToEbitda: keyStats?.defaultKeyStatistics?.enterpriseToEbitda?.raw || null,
    
    // Winstgevendheid
    profitMargins: keyStats?.defaultKeyStatistics?.profitMargins?.raw || null,
    operatingMargins: keyStats?.defaultKeyStatistics?.operatingMargins?.raw || null,
    ebitdaMargins: keyStats?.defaultKeyStatistics?.ebitdaMargins?.raw || null,
    returnOnAssets: keyStats?.defaultKeyStatistics?.returnOnAssets?.raw || null,
    returnOnEquity: keyStats?.defaultKeyStatistics?.returnOnEquity?.raw || null,
    
    // Financiële gezondheid
    debtToEquity: keyStats?.defaultKeyStatistics?.debtToEquity?.raw || null,
    currentRatio: keyStats?.defaultKeyStatistics?.currentRatio?.raw || null,
    quickRatio: keyStats?.defaultKeyStatistics?.quickRatio?.raw || null,
    beta: keyStats?.defaultKeyStatistics?.beta?.raw || null,
    
    // Resultaten per aandeel
    earningsPerShare: keyStats?.defaultKeyStatistics?.trailingEps?.raw || null,
    forwardEps: keyStats?.defaultKeyStatistics?.forwardEps?.raw || null,
    revenuePerShare: keyStats?.defaultKeyStatistics?.revenuePerShare?.raw || null,
    bookValue: keyStats?.defaultKeyStatistics?.bookValue?.raw || null,
    
    // Dividend
    dividendYield: keyStats?.defaultKeyStatistics?.dividendYield?.raw || null,
    payoutRatio: keyStats?.defaultKeyStatistics?.payoutRatio?.raw || null,
    dividendRate: keyStats?.defaultKeyStatistics?.dividendRate?.raw || null,
    
    // Groei
    revenueGrowth: keyStats?.financialData?.revenueGrowth?.raw || null,
    earningsGrowth: keyStats?.financialData?.earningsGrowth?.raw || null,
    earningsQuarterlyGrowth: keyStats?.defaultKeyStatistics?.earningsQuarterlyGrowth?.raw || null,
    
    // Analyst verwachtingen
    targetMeanPrice: keyStats?.financialData?.targetMeanPrice?.raw || null,
    targetHighPrice: keyStats?.financialData?.targetHighPrice?.raw || null,
    targetLowPrice: keyStats?.financialData?.targetLowPrice?.raw || null,
    recommendationKey: keyStats?.financialData?.recommendationKey || null,
    numberOfAnalystOpinions: keyStats?.financialData?.numberOfAnalystOpinions || null,
    
    // Cashflow
    freeCashflow: keyStats?.defaultKeyStatistics?.freeCashflow?.raw || null,
    operatingCashflow: keyStats?.defaultKeyStatistics?.operatingCashflow?.raw || null,
    
    // Financiële statements (meer jaren)
    incomeStatement: incomeStatements.slice(0, 10), // Tot 10 jaar
    balanceSheet: balanceSheets.slice(0, 10), // Tot 10 jaar
    cashFlow: cashFlows.slice(0, 10), // Tot 10 jaar
    
    // Quarterly data (laatste 8 kwartalen)
    quarterlyIncome: quarterlyIncome.slice(0, 8),
    quarterlyBalance: quarterlyBalance.slice(0, 8),
    quarterlyCashFlow: quarterlyCashFlow.slice(0, 8),
    
    // Earnings data
    earningsHistory: earnings?.earningsHistory?.history || [],
    earningsTrend: earnings?.earningsTrend?.trend || [],
    earningsData: earnings?.earnings || null,
    
    // Calendar events
    exDividendDate: calendar?.calendarEvents?.exDividendDate || null,
    dividendDate: calendar?.calendarEvents?.dividendDate || null,
    earningsDate: calendar?.calendarEvents?.earnings?.earningsDate || null,
  }
}

// Genereer default scores op basis van beschikbare data (verbeterde versie die meer factoren meeneemt)
function generateDefaultScores(
  fundamentals: Record<string, unknown> | null,
  quote: { price?: number; changePercent?: number } | null,
  history: Array<{ date: string; close: number }>,
  aggregatedFinancialData?: Record<string, unknown>,
  enhancedNews?: Record<string, unknown>,
  socialSentiment?: Record<string, unknown>
): {
  overallScore: number
  shortTerm: { score: number; prediction: string; timeframe: string; keyFactors: string[] }
  mediumTerm: { score: number; prediction: string; timeframe: string; keyFactors: string[] }
  longTerm: { score: number; prediction: string; timeframe: string; keyFactors: string[] }
} {
  let baseScore = 50 // Start met neutrale score
  const keyFactors: { short: string[]; medium: string[]; long: string[] } = {
    short: [],
    medium: [],
    long: []
  }
  
  // Analyseer fundamentals
  if (fundamentals) {
    const pe = fundamentals.trailingPE as number
    const roe = fundamentals.returnOnEquity as number
    const revenueGrowth = fundamentals.revenueGrowth as number
    const profitMargins = fundamentals.profitMargins as number
    const debtToEquity = fundamentals.debtToEquity as number
    const currentRatio = fundamentals.currentRatio as number
    
    if (pe && pe > 0 && pe < 25) {
      baseScore += 8
      keyFactors.medium.push(`Gezonde P/E ratio van ${pe.toFixed(1)}`)
    }
    if (pe && pe >= 25 && pe < 40) {
      baseScore += 2
      keyFactors.medium.push(`Hoge maar acceptabele P/E ratio van ${pe.toFixed(1)}`)
    }
    if (pe && pe >= 40) {
      baseScore -= 5
      keyFactors.medium.push(`Zeer hoge P/E ratio van ${pe.toFixed(1)}`)
    }
    
    if (roe && roe > 0.15) {
      baseScore += 10
      keyFactors.long.push(`Uitstekende ROE van ${(roe * 100).toFixed(1)}%`)
    } else if (roe && roe > 0.10) {
      baseScore += 5
      keyFactors.long.push(`Goede ROE van ${(roe * 100).toFixed(1)}%`)
    }
    
    if (revenueGrowth && revenueGrowth > 0.1) {
      baseScore += 8
      keyFactors.medium.push(`Sterke revenue groei van ${(revenueGrowth * 100).toFixed(1)}%`)
    } else if (revenueGrowth && revenueGrowth > 0.05) {
      baseScore += 4
      keyFactors.medium.push(`Matige revenue groei van ${(revenueGrowth * 100).toFixed(1)}%`)
    }
    
    if (profitMargins && profitMargins > 0.1) {
      baseScore += 8
      keyFactors.medium.push(`Sterke winstmarge van ${(profitMargins * 100).toFixed(1)}%`)
    }
    
    if (debtToEquity && debtToEquity < 1) {
      baseScore += 5
      keyFactors.long.push(`Lage schuldpositie (D/E: ${debtToEquity.toFixed(2)})`)
    } else if (debtToEquity && debtToEquity > 2) {
      baseScore -= 5
      keyFactors.long.push(`Hoge schuldpositie (D/E: ${debtToEquity.toFixed(2)})`)
    }
    
    if (currentRatio && currentRatio > 1.5) {
      baseScore += 3
      keyFactors.medium.push(`Goede liquiditeit (Current Ratio: ${currentRatio.toFixed(2)})`)
    }
  }
  
  // Analyseer technische factoren (vooral relevant voor short term)
  if (quote && history.length > 0) {
    const recentChange = quote.changePercent || 0
    const recentPrices = history.slice(-30).map(h => h.close)
    const avgRecentPrice = recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length
    const currentPrice = quote.price || 0
    
    if (recentChange > 5) {
      baseScore += 3
      keyFactors.short.push(`Sterke recente prijsstijging van ${recentChange.toFixed(1)}%`)
    } else if (recentChange < -5) {
      baseScore -= 3
      keyFactors.short.push(`Recente prijsdaling van ${recentChange.toFixed(1)}%`)
    }
    
    if (currentPrice > avgRecentPrice * 1.05) {
      keyFactors.short.push(`Prijs boven recent gemiddelde`)
    }
  }
  
  // Analyseer social sentiment (vooral relevant voor short term)
  if (socialSentiment) {
    const sentimentScore = Number(socialSentiment.sentimentScore) || 0
    if (sentimentScore > 0.2) {
      baseScore += 2
      keyFactors.short.push(`Positief social media sentiment`)
    } else if (sentimentScore < -0.2) {
      baseScore -= 2
      keyFactors.short.push(`Negatief social media sentiment`)
    }
  }
  
  // Analyseer nieuws (relevant voor alle termijnen)
  if (enhancedNews) {
    const totalNews = (Array.isArray(enhancedNews.companyNews) ? enhancedNews.companyNews.length : 0) + (Array.isArray(enhancedNews.analystNews) ? enhancedNews.analystNews.length : 0)
    if (totalNews > 15) {
      keyFactors.short.push(`Actieve nieuwsstroom (${totalNews} artikelen)`)
    }
    if (Array.isArray(enhancedNews.analystNews) && enhancedNews.analystNews.length > 5) {
      keyFactors.medium.push(`Sterke analyst coverage`)
    }
  }
  
  // Analyseer financiële data kwaliteit
  if (aggregatedFinancialData) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dataQuality = aggregatedFinancialData.dataQuality as any
    if (dataQuality?.hasIncomeStatements && dataQuality?.hasBalanceSheets && dataQuality?.hasCashFlow) {
      baseScore += 3
      keyFactors.long.push(`Complete financiële data beschikbaar`)
    }
    if (dataQuality?.hasQuarterlyData) {
      keyFactors.short.push(`Quarterly data beschikbaar voor trend analyse`)
    }
  }
  
  // Normaliseer score tussen 0-100
  baseScore = Math.max(0, Math.min(100, baseScore))
  
  // Bepaal termijn-specifieke scores met significante verschillen
  // Short term: meer gewicht op technische factoren, recente ontwikkelingen, sentiment
  // Start met lagere base voor short term (technische factoren zijn volatieler)
  let shortScore = baseScore - 5 // Start lager omdat short term volatieler is
  if (quote && quote.changePercent) {
    shortScore += quote.changePercent > 0 ? 8 : -8 // Grotere impact voor short term
  }
  if (socialSentiment) {
    shortScore += (Number(socialSentiment.sentimentScore) || 0) * 10 // Grotere impact sentiment
  }
  // Technische momentum analyse
  if (history.length > 0 && quote) {
    const recentPrices = history.slice(-20).map(h => h.close)
    const olderPrices = history.slice(-60, -20).map(h => h.close)
    if (recentPrices.length > 0 && olderPrices.length > 0) {
      const recentAvg = recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length
      const olderAvg = olderPrices.reduce((a, b) => a + b, 0) / olderPrices.length
      const momentum = (recentAvg - olderAvg) / olderAvg
      shortScore += momentum > 0.05 ? 6 : momentum < -0.05 ? -6 : 0
    }
  }
  shortScore = Math.max(0, Math.min(100, shortScore))
  
  // Medium term: meer gewicht op fundamentals, groei trends
  // Start met base score (fundamentals zijn belangrijk voor medium term)
  let mediumScore = baseScore
  if (fundamentals) {
    const revenueGrowth = fundamentals.revenueGrowth as number
    const profitMargins = fundamentals.profitMargins as number
    const earningsGrowth = fundamentals.earningsGrowth as number
    if (revenueGrowth && revenueGrowth > 0.1) mediumScore += 8
    if (revenueGrowth && revenueGrowth > 0.2) mediumScore += 5 // Extra bonus voor zeer sterke groei
    if (profitMargins && profitMargins > 0.15) mediumScore += 6
    if (earningsGrowth && earningsGrowth > 0.15) mediumScore += 7
    // Negatieve groei heeft grote impact op medium term
    if (revenueGrowth && revenueGrowth < -0.1) mediumScore -= 10
  }
  // News impact voor medium term
  if (enhancedNews) {
    const analystNews = Array.isArray(enhancedNews.analystNews) ? enhancedNews.analystNews.length : 0
    if (analystNews > 5) mediumScore += 3
  }
  mediumScore = Math.max(0, Math.min(100, mediumScore))
  
  // Long term: meer gewicht op fundamentale sterkte, concurrentiepositie
  // Start met hogere base voor long term (fundamentale sterkte telt meer)
  let longScore = baseScore + 3 // Start hoger omdat fundamentals belangrijker zijn voor long term
  if (fundamentals) {
    const roe = fundamentals.returnOnEquity as number
    const debtToEquity = fundamentals.debtToEquity as number
    const returnOnAssets = fundamentals.returnOnAssets as number
    if (roe && roe > 0.15) longScore += 8
    if (roe && roe > 0.25) longScore += 5 // Extra bonus voor uitstekende ROE
    if (debtToEquity && debtToEquity < 1) longScore += 6
    if (debtToEquity && debtToEquity < 0.5) longScore += 4 // Extra bonus voor zeer lage schuld
    if (returnOnAssets && returnOnAssets > 0.1) longScore += 5
    // Hoge schuld heeft grote negatieve impact op long term
    if (debtToEquity && debtToEquity > 2) longScore -= 8
  }
  // Financiële data kwaliteit telt meer voor long term
  if (aggregatedFinancialData) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dataQuality = aggregatedFinancialData.dataQuality as any
    if (dataQuality?.hasIncomeStatements && dataQuality?.hasBalanceSheets && dataQuality?.hasCashFlow) {
      longScore += 5
    }
  }
  longScore = Math.max(0, Math.min(100, longScore))
  
  // Zorg voor minimum verschillen tussen termijnen (minimaal 3 punten verschil)
  const scores = [shortScore, mediumScore, longScore].sort((a, b) => a - b)
  if (scores[2] - scores[0] < 3) {
    // Als verschil te klein is, pas aan:
    // Short term: -2, Medium: 0, Long: +2
    shortScore = Math.max(0, Math.min(100, shortScore - 2))
    longScore = Math.max(0, Math.min(100, longScore + 2))
  }
  
  // Voeg default key factors toe als er geen zijn
  if (keyFactors.short.length === 0) {
    keyFactors.short.push("Technische indicatoren", "Recente prijsbeweging", "Marktsentiment")
  }
  if (keyFactors.medium.length === 0) {
    keyFactors.medium.push("Fundamentele gezondheid", "Sector trends", "Bedrijfsresultaten")
  }
  if (keyFactors.long.length === 0) {
    keyFactors.long.push("Marktpositie", "Innovatie", "Duurzame business model")
  }
  
  return {
    overallScore: baseScore,
    shortTerm: {
      score: shortScore,
      prediction: `Analyse op basis van technische indicatoren, recente ontwikkelingen en marktsentiment. Score: ${shortScore}/100`,
      timeframe: "1-3 maanden",
      keyFactors: keyFactors.short
    },
    mediumTerm: {
      score: mediumScore,
      prediction: `Analyse op basis van fundamentele factoren, groei trends en sector ontwikkelingen. Score: ${mediumScore}/100`,
      timeframe: "3-12 maanden",
      keyFactors: keyFactors.medium
    },
    longTerm: {
      score: longScore,
      prediction: `Analyse op basis van duurzame groei, concurrentiepositie en financiële sterkte. Score: ${longScore}/100`,
      timeframe: "1-5 jaar",
      keyFactors: keyFactors.long
    }
  }
}

// Haal historische data op
async function fetchHistory(symbol: string) {
  const yahooSymbol = convertSymbol(symbol)
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1d&range=1y`
  
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
  })

  if (!response.ok) return []

  const data = await response.json()
  const result = data.chart?.result?.[0]
  if (!result) return []

  const timestamps = result.timestamp || []
  const quotes = result.indicators?.quote?.[0]

  if (!quotes || !timestamps.length) return []

  return timestamps.map((ts: number, idx: number) => ({
    date: new Date(ts * 1000).toISOString().split("T")[0],
    open: quotes.open?.[idx] || 0,
    high: quotes.high?.[idx] || 0,
    low: quotes.low?.[idx] || 0,
    close: quotes.close?.[idx] || 0,
    volume: quotes.volume?.[idx] || 0,
  }))
}

export async function POST(request: NextRequest) {
  // Wrapper om ervoor te zorgen dat we altijd JSON teruggeven
  try {
    // Check Clerk configuratie eerst
    const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
    const clerkSecretKey = process.env.CLERK_SECRET_KEY
    
    if (!clerkPublishableKey || !clerkSecretKey) {
      console.error("Deep Research API: Clerk environment variables niet geconfigureerd")
      return NextResponse.json(
        { error: "Authenticatie niet geconfigureerd" },
        { status: 500 }
      )
    }
    
    // Gebruik getClerkUser als primaire authenticatie methode (robuuster voor productie)
    // Dit sync ook automatisch met de database
    let user = null
    let authResult = null
    
    try {
      user = await getClerkUser(request)
      
      // Als getClerkUser geen user teruggeeft, probeer auth() als fallback
      if (!user || !user.id) {
        try {
          authResult = await auth()
          if (authResult?.userId) {
            // We hebben een Clerk userId maar geen database user
            // Probeer handmatig gebruiker aan te maken
            const { currentUser } = await import("@clerk/nextjs/server")
            const clerkUser = await currentUser()
            
            if (clerkUser) {
              const email = clerkUser.emailAddresses?.[0]?.emailAddress || 
                           clerkUser.primaryEmailAddress?.emailAddress ||
                           clerkUser.externalAccounts?.find(ea => ea.provider === 'oauth_google')?.emailAddress
              
              if (email) {
                console.log("Deep Research API: Attempting manual user creation", { email })
                const newUser = await prisma.user.create({
                  data: {
                    email,
                    name: clerkUser.firstName && clerkUser.lastName
                      ? `${clerkUser.firstName} ${clerkUser.lastName}`
                      : clerkUser.firstName || clerkUser.username || email,
                  },
                })
                
                user = {
                  id: newUser.id,
                  email: newUser.email,
                  name: newUser.name,
                  tier: newUser.tier,
                  role: newUser.role,
                  clerkId: authResult.userId,
                }
                
                console.log("Deep Research API: User created manually", { userId: user.id })
              }
            }
          }
        } catch (authError) {
          console.error("Deep Research API: auth() fallback failed", {
            error: authError instanceof Error ? authError.message : String(authError),
            url: request.url,
          })
        }
      }
    } catch (authError) {
      const errorMessage = authError instanceof Error ? authError.message : "Authenticatie fout"
      console.error("Error in getClerkUser():", {
        message: errorMessage,
        url: request?.url,
      })
      
      // Probeer auth() als laatste redmiddel
      try {
        authResult = await auth()
      } catch (fallbackError) {
        console.error("Deep Research API: All auth methods failed", {
          getClerkUserError: errorMessage,
          authError: fallbackError instanceof Error ? fallbackError.message : String(fallbackError),
          url: request.url,
        })
      }
    }
    
    // Ondersteun anonieme gebruikers
    let userId: string | null = null
    let sessionId: string | null = null

    let dbUser = null
    if (user && user.id) {
      // Ingelogde gebruiker
      userId = user.id

      // Haal gebruiker op uit database met tier informatie
      dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { tier: true, trialEndsAt: true, isTrialActive: true, id: true }
      })

      if (dbUser) {
        // Check premium status wordt later gebruikt voor AI call limieten
      }

      // Voor trial gebruikers: controleer of trial nog actief is
      if (dbUser?.isTrialActive && dbUser?.trialEndsAt) {
        const now = new Date()
        if (now > dbUser.trialEndsAt) {
          // Trial is verlopen, update database
          await prisma.user.update({
            where: { id: dbUser.id },
            data: { isTrialActive: false }
          })
          // Trial is verlopen - gebruiker heeft geen premium rechten meer
        }
      }
    } else {
      // Anonieme gebruiker - gebruik sessie ID
      sessionId = await getOrCreateAnonymousSessionId(request)
    }

    // Check AI call limiet voor FREE tier, trial gebruikers, of anonieme gebruikers
    // Alleen echte PREMIUM gebruikers (betaald) krijgen onbeperkte toegang
    const isPaidPremium = dbUser?.tier === "PREMIUM"
    if (!isPaidPremium) {
      const whereClause = userId
        ? {
            userId: userId,
            endpoint: "deep-research",
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Laatste 30 dagen voor ingelogde gebruikers
            }
          }
        : {
            sessionId: sessionId,
            endpoint: "deep-research",
            createdAt: {
              gte: new Date(Date.now() - ANONYMOUS_SESSION_DURATION_HOURS * 60 * 60 * 1000) // 24 uur voor anonieme gebruikers
            }
          }

      const aiCallCount = await prisma.aiCall.count({
        where: whereClause
      })

      if (aiCallCount >= FREE_TIER_AI_CALL_LIMIT) {
        const response = NextResponse.json(
          {
            error: "AI_LIMIT_REACHED",
            message: userId
              ? (dbUser?.isTrialActive
                ? "Je hebt je limiet van 10 AI aanroepen tijdens je gratis proefmaand bereikt. Upgrade naar Premium voor onbeperkte AI aanroepen."
                : "Je hebt je limiet van 10 gratis AI aanroepen bereikt. Upgrade naar Premium voor onbeperkte AI aanroepen.")
              : "Je hebt je limiet van 10 gratis AI aanroepen bereikt. Maak een account aan en upgrade naar Premium voor onbeperkte AI aanroepen.",
            limit: FREE_TIER_AI_CALL_LIMIT,
            used: aiCallCount
          },
          { status: 403 }
        )

        if (sessionId && !userId) {
          response.cookies.set("anonymous_session_id", sessionId, {
            path: "/",
            maxAge: ANONYMOUS_SESSION_DURATION_HOURS * 60 * 60, // 24 uur
            sameSite: "lax",
            httpOnly: true
          })
        }

        return response
      }
    }

    // Voor anonieme gebruikers: maak een tijdelijke gebruiker aan of gebruik een speciale "guest" gebruiker
    // Voor nu: anonieme gebruikers moeten inloggen om deep research te gebruiken
    // Dit is complexer omdat deep research rapporten gekoppeld zijn aan gebruikers
    if (!userId) {
      const remainingCalls = sessionId 
        ? FREE_TIER_AI_CALL_LIMIT - (await prisma.aiCall.count({ 
            where: { 
              sessionId: sessionId, 
              endpoint: "deep-research",
              createdAt: {
                gte: new Date(Date.now() - ANONYMOUS_SESSION_DURATION_HOURS * 60 * 60 * 1000)
              }
            } 
          }))
        : FREE_TIER_AI_CALL_LIMIT
      return NextResponse.json(
        { 
          error: "ACCOUNT_REQUIRED",
          message: `Voor Deep Research rapporten moet je een account aanmaken. Je hebt nog ${remainingCalls} gratis AI aanroepen over.`,
        },
        { status: 403 }
      )
    }

    // JSON parsing met error handling
    let body: { symbol?: string; name?: string; exchange?: string; type?: string }
    try {
      body = await request.json()
    } catch (jsonError) {
      console.error("Error parsing JSON:", jsonError)
      const errorMessage = jsonError instanceof Error ? jsonError.message : "Ongeldige JSON in request body"
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      )
    }

    const { symbol, name, exchange, type } = body

    if (!symbol) {
      return NextResponse.json(
        { error: "Symbol is verplicht" },
        { status: 400 }
      )
    }

    const openaiApiKey = process.env.OPENAI_API_KEY
    if (!openaiApiKey) {
      console.error("OPENAI_API_KEY niet geconfigureerd")
      return NextResponse.json(
        { error: "OpenAI API key niet geconfigureerd" },
        { status: 500 }
      )
    }

    // Database connectie testen
    try {
      await prisma.$queryRaw`SELECT 1`
    } catch (dbError) {
      console.error("Database connection error:", dbError)
      const errorMessage = dbError instanceof Error ? dbError.message : "Onbekende database fout"
      return NextResponse.json(
        { 
          error: "Database fout",
          details: errorMessage,
        },
        { status: 500 }
      )
    }

    // Controleer eerst of er een recent rapport bestaat voor dit symbool
    // We beschouwen een rapport als "recent" als het binnen de laatste 7 dagen is gemaakt
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    try {
      const existingReport = await prisma.deepResearchReport.findFirst({
        where: {
          userId,
          symbol,
          status: "COMPLETED",
          createdAt: {
            gte: sevenDaysAgo,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      })

      if (existingReport) {
        // Er bestaat al een recent rapport, geef dit terug
        return NextResponse.json({
          reportId: existingReport.id,
          status: "EXISTING",
          message: "Er bestaat al een recent rapport voor dit aandeel",
          createdAt: existingReport.createdAt.toISOString(),
          existingReport: {
            id: existingReport.id,
            symbol: existingReport.symbol,
            name: existingReport.name,
            exchange: existingReport.exchange,
            type: existingReport.type,
            status: existingReport.status,
            pdfUrl: existingReport.pdfUrl,
            createdAt: existingReport.createdAt.toISOString(),
            updatedAt: existingReport.updatedAt.toISOString(),
          },
        })
      }
    } catch (checkError) {
      console.error("Error checking for existing report:", checkError)
      // Ga door met het maken van een nieuw rapport als de check faalt
    }

    // Geen recent rapport gevonden, maak een nieuw rapport aan
    let report
    try {
      console.log("Deep Research API: Creating new report", {
        userId,
        symbol,
        name: name || symbol,
        exchange: exchange || null,
        type: type || null,
      })
      
      report = await prisma.deepResearchReport.create({
        data: {
          userId,
          symbol,
          name: name || symbol,
          exchange: exchange || null,
          type: type || null,
          status: "GENERATING",
          report: {},
        },
      })

      // Registreer AI aanroep
      await prisma.aiCall.create({
        data: {
          userId: userId || undefined,
          sessionId: sessionId || undefined,
          endpoint: "deep-research"
        }
      })
      
      console.log("Deep Research API: Report created successfully", {
        reportId: report.id,
        userId: report.userId,
        symbol: report.symbol,
      })
    } catch (dbError) {
      const errorMessage = dbError instanceof Error ? dbError.message : "Onbekende database fout"
      const errorCode = dbError && typeof dbError === 'object' && 'code' in dbError ? String(dbError.code) : undefined
      const errorStack = dbError instanceof Error ? dbError.stack : undefined
      
      console.error("Deep Research API: Database error creating report:", {
        error: errorMessage,
        code: errorCode,
        stack: errorStack,
        userId,
        symbol,
      })
      
      return NextResponse.json(
        { 
          error: "Database fout bij aanmaken rapport",
          details: errorMessage,
          ...(errorCode && { code: errorCode })
        },
        { status: 500 }
      )
    }

    // Start async generatie (in productie zou je dit in een background job doen)
    generateReport(report.id, symbol, name || symbol, openaiApiKey).catch((error) => {
      console.error("Error generating report:", error)
      prisma.deepResearchReport.update({
        where: { id: report.id },
        data: {
          status: "FAILED",
          error: error instanceof Error ? error.message : "Onbekende fout",
        },
      }).catch((updateError) => {
        console.error("Error updating report status to FAILED:", updateError)
      })
    })

    const jsonResponse = NextResponse.json({
      reportId: report.id,
      status: "GENERATING",
      message: "Rapport wordt gegenereerd...",
    })

    // Stel cookie in voor anonieme gebruikers (als die er zijn)
    if (sessionId && !userId) {
      jsonResponse.cookies.set("anonymous_session_id", sessionId, {
        path: "/",
        maxAge: ANONYMOUS_SESSION_DURATION_HOURS * 60 * 60, // 24 uur
        sameSite: "lax",
        httpOnly: true
      })
    }

    return jsonResponse
  } catch (error) {
    // Catch-all voor onverwachte errors - zorg altijd voor JSON response
    const errorMessage = error instanceof Error ? error.message : "Interne server fout"
    const errorStack = error instanceof Error ? error.stack : undefined
    const errorName = error instanceof Error ? error.name : error?.constructor?.name || "Unknown"
    
    // Log uitgebreide error informatie voor debugging
    console.error("Unexpected error in deep research API:", {
      name: errorName,
      message: errorMessage,
      stack: errorStack,
      // Log ook de error zelf voor meer context
      error: error,
    })
    
    // Zorg altijd voor een geldige JSON response
    try {
      return NextResponse.json(
        { 
          error: "Interne server fout bij genereren rapport",
          ...((process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV === 'production') && { 
            details: errorMessage,
            errorName: errorName,
            ...(process.env.NODE_ENV === 'development' && { stack: errorStack })
          })
        },
        { status: 500 }
      )
    } catch (jsonError) {
      // Als zelfs NextResponse.json faalt, log en return een simpele response
      console.error("Critical: Could not create JSON response:", jsonError)
      return new NextResponse(
        JSON.stringify({ error: "Kritieke server fout" }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
  }
}

// Helper functie om progress bij te werken
async function updateProgress(reportId: string, percentage: number, message: string) {
  try {
    await prisma.deepResearchReport.update({
      where: { id: reportId },
      data: {
        progressPercentage: percentage,
        progressMessage: message,
      },
    })
  } catch (error) {
    console.error("Error updating progress:", error)
  }
}

// Helper functie om te checken of report gecanceld is
async function isCancelled(reportId: string): Promise<boolean> {
  try {
    const report = await prisma.deepResearchReport.findUnique({
      where: { id: reportId },
      select: { status: true },
    })
    return report?.status === "CANCELLED"
  } catch (error) {
    console.error("Error checking cancellation status:", error)
    return false
  }
}

async function generateReport(
  reportId: string,
  symbol: string,
  name: string,
  openaiApiKey: string
) {
  try {
    await updateProgress(reportId, 5, "Data ophalen van verschillende bronnen...")
    
    // Check of gecanceld
    if (await isCancelled(reportId)) {
      console.log(`Report ${reportId} was gecanceld, stop generatie`)
      return
    }

    // Haal alle data op (inclusief nieuwe enhanced services)
    await updateProgress(reportId, 10, "Yahoo Finance data ophalen...")
    const [quote, fundamentals, history, newsData, enhancedFinancialData, enhancedNews, socialSentiment] = await Promise.all([
      fetchQuote(symbol),
      fetchFundamentals(symbol),
      fetchHistory(symbol),
      // Fallback naar oude news service als enhanced faalt
      fetchStockNews(symbol, undefined, undefined, undefined, 20).catch(() => ({
        companyNews: [],
        sectorNews: [],
        marketNews: [],
      })),
      // Nieuwe enhanced financial data
      fetchEnhancedFinancialData(symbol, name).catch((error) => {
        console.error("[DeepResearch] Error fetching enhanced financial data:", error)
        return null
      }),
      // Nieuwe enhanced news (gebruik sector/industry van fundamentals als beschikbaar)
      (async () => {
        try {
          const yahooSymbol = convertSymbol(symbol)
          const summaryRes = await fetch(
            `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${yahooSymbol}?modules=summaryProfile`,
            { headers: { "User-Agent": "Mozilla/5.0" } }
          )
          const summaryData = summaryRes.ok ? await summaryRes.json().catch(() => null) : null
          const sector = summaryData?.quoteSummary?.result?.[0]?.summaryProfile?.sector
          const industry = summaryData?.quoteSummary?.result?.[0]?.summaryProfile?.industry
          
          return await fetchEnhancedStockNews(symbol, name, sector, industry, 25)
        } catch (error) {
          console.error("[DeepResearch] Error fetching enhanced news:", error)
          return { companyNews: [], sectorNews: [], marketNews: [], analystNews: [] }
        }
      })(),
      // Social sentiment
      fetchSocialSentiment(symbol, name, 30).catch((error) => {
        console.error("[DeepResearch] Error fetching social sentiment:", error)
        return null
      }),
    ])

    // Check of gecanceld
    if (await isCancelled(reportId)) {
      console.log(`Report ${reportId} was gecanceld tijdens data ophalen`)
      return
    }

    await updateProgress(reportId, 30, "Financiële data aggregeren en analyseren...")

    // Aggregeer financiële data van alle bronnen
    const aggregatedFinancialData = aggregateFinancialData(fundamentals, enhancedFinancialData)
    console.log(`[DeepResearch] Data kwaliteit:`, aggregatedFinancialData.dataQuality)

    // Bereken technische indicatoren
    const calculateSMA = (data: Array<{ close: number }>, period: number) => {
      const sma: number[] = []
      for (let i = 0; i < data.length; i++) {
        if (i < period - 1) {
          sma.push(NaN)
        } else {
          const sum = data.slice(i - period + 1, i + 1).reduce((acc, item) => acc + item.close, 0)
          sma.push(sum / period)
        }
      }
      return sma
    }

    // Check of gecanceld
    if (await isCancelled(reportId)) {
      console.log(`Report ${reportId} was gecanceld tijdens data verwerking`)
      return
    }

    await updateProgress(reportId, 40, "Technische indicatoren berekenen...")

    const sma50 = calculateSMA(history, 50)
    const sma200 = calculateSMA(history, 200)
    const currentSMA50 = sma50[sma50.length - 1]
    const currentSMA200 = sma200[sma200.length - 1]

    // Format uitgebreide data voor prompt
    const formatFinancialValue = (value: number | null | undefined, isPercentage = false, isCurrency = false) => {
      if (value === null || value === undefined) return 'N/A'
      if (isPercentage) return `${(value * 100).toFixed(2)}%`
      if (isCurrency) {
        if (Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
        if (Math.abs(value) >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
        if (Math.abs(value) >= 1e3) return `$${(value / 1e3).toFixed(2)}K`
        return `$${value.toFixed(2)}`
      }
      return value.toFixed(2)
    }

    // Format functies voor toekomstig gebruik (momenteel niet gebruikt)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const formatIncomeStatement = (statements: Array<Record<string, unknown>>) => {
      if (!statements || statements.length === 0) return 'Geen data beschikbaar'
      return statements.map((item, idx) => {
        const endDate = item.endDate as Record<string, unknown> | undefined
        const year = endDate?.fmt || endDate?.raw || `Jaar ${idx + 1}`
        return `
Jaar ${year}:
- Totale Omzet: ${formatFinancialValue(item.totalRevenue as number, false, true)}
- Kosten van Omzet: ${formatFinancialValue(item.costOfRevenue as number, false, true)}
- Bruto Winst: ${formatFinancialValue(item.grossProfit as number, false, true)}
- Operationeel Inkomen: ${formatFinancialValue(item.operatingIncome as number, false, true)}
- Netto Inkomen: ${formatFinancialValue(item.netIncome as number, false, true)}
- EBITDA: ${formatFinancialValue(item.ebitda as number, false, true)}
- Research & Development: ${formatFinancialValue(item.researchDevelopment as number, false, true)}
- Verkoop, Algemeen & Administratief: ${formatFinancialValue(item.sellingGeneralAdministrative as number, false, true)}`
      }).join('\n')
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const formatBalanceSheet = (sheets: Array<Record<string, unknown>>) => {
      if (!sheets || sheets.length === 0) return 'Geen data beschikbaar'
      return sheets.map((item, idx) => {
        const endDate = item.endDate as Record<string, unknown> | undefined
        const year = endDate?.fmt || endDate?.raw || `Jaar ${idx + 1}`
        return `
Jaar ${year}:
- Totale Activa: ${formatFinancialValue(item.totalAssets as number, false, true)}
- Totale Passiva: ${formatFinancialValue(item.totalLiab as number, false, true)}
- Eigen Vermogen: ${formatFinancialValue(item.totalStockholderEquity as number, false, true)}
- Vlottende Activa: ${formatFinancialValue(item.totalCurrentAssets as number, false, true)}
- Kortlopende Schulden: ${formatFinancialValue(item.totalCurrentLiabilities as number, false, true)}
- Cash en Equivalenten: ${formatFinancialValue(item.cash as number, false, true)}
- Langlopende Schuld: ${formatFinancialValue(item.longTermDebt as number, false, true)}
- Goodwill: ${formatFinancialValue(item.goodWill as number, false, true)}
- Intangible Assets: ${formatFinancialValue(item.intangibleAssets as number, false, true)}`
      }).join('\n')
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const formatCashFlow = (flows: Array<Record<string, unknown>>) => {
      if (!flows || flows.length === 0) return 'Geen data beschikbaar'
      return flows.map((item, idx) => {
        const endDate = item.endDate as Record<string, unknown> | undefined
        const year = endDate?.fmt || endDate?.raw || `Jaar ${idx + 1}`
        const operating = item.totalCashFromOperatingActivities as number
        const capex = item.capitalExpenditures as number
        const freeCashFlow = operating && capex ? operating - Math.abs(capex) : null
        return `
Jaar ${year}:
- Operating Cashflow: ${formatFinancialValue(operating, false, true)}
- Capital Expenditures: ${formatFinancialValue(capex, false, true)}
- Free Cashflow: ${formatFinancialValue(freeCashFlow, false, true)}
- Dividenden Betaald: ${formatFinancialValue(item.dividendsPaid as number, false, true)}
- Netto Leningen: ${formatFinancialValue(item.netBorrowings as number, false, true)}
- Investing Cashflow: ${formatFinancialValue(item.totalCashflowsFromInvestingActivities as number, false, true)}
- Financing Cashflow: ${formatFinancialValue(item.totalCashFromFinancingActivities as number, false, true)}`
      }).join('\n')
    }

    // Gebruik geaggregeerde financiële data (combineert alle bronnen) - dit bevat GEDETAILLEERDE statements
    const aggregatedFinancialText = formatAggregatedFinancialData(aggregatedFinancialData)
    
    // Voeg ook aanvullende Yahoo Finance fundamentals toe voor extra context
    // (de gedetailleerde statements zitten al in aggregatedFinancialText)
    const fundamentalsText = fundamentals ? `
BEDRIJFSINFORMATIE:
- Bedrijfsnaam: ${fundamentals.companyName}
- Sector: ${fundamentals.sector}
- Industrie: ${fundamentals.industry}
- Website: ${fundamentals.website || 'N/A'}
- Aantal Medewerkers: ${fundamentals.employees?.toLocaleString() || 'N/A'}
- Locatie: ${fundamentals.city ? `${fundamentals.city}, ${fundamentals.country || ''}` : 'N/A'}
- Beschrijving: ${fundamentals.description}

VALUATIE KENTALLEN:
- Marktkapitalisatie: ${formatFinancialValue(fundamentals.marketCap, false, true)}
- Enterprise Value: ${formatFinancialValue(fundamentals.enterpriseValue, false, true)}
- P/E Ratio (Trailing): ${formatFinancialValue(fundamentals.trailingPE)}
- P/E Ratio (Forward): ${formatFinancialValue(fundamentals.forwardPE)}
- PEG Ratio: ${formatFinancialValue(fundamentals.pegRatio)}
- Price to Book: ${formatFinancialValue(fundamentals.priceToBook)}
- Price to Sales: ${formatFinancialValue(fundamentals.priceToSales)}
- Enterprise Value/Revenue: ${formatFinancialValue(fundamentals.enterpriseToRevenue)}
- Enterprise Value/EBITDA: ${formatFinancialValue(fundamentals.enterpriseToEbitda)}

WINSTGEVENDHEID:
- Winstmarge: ${formatFinancialValue(fundamentals.profitMargins, true)}
- Operationele Marge: ${formatFinancialValue(fundamentals.operatingMargins, true)}
- EBITDA Marge: ${formatFinancialValue(fundamentals.ebitdaMargins, true)}
- Return on Assets (ROA): ${formatFinancialValue(fundamentals.returnOnAssets, true)}
- Return on Equity (ROE): ${formatFinancialValue(fundamentals.returnOnEquity, true)}

FINANCIËLE GEZONDHEID:
- Debt to Equity: ${formatFinancialValue(fundamentals.debtToEquity)}
- Current Ratio: ${formatFinancialValue(fundamentals.currentRatio)}
- Quick Ratio: ${formatFinancialValue(fundamentals.quickRatio)}
- Beta: ${formatFinancialValue(fundamentals.beta)}
- Free Cashflow: ${formatFinancialValue(fundamentals.freeCashflow, false, true)}
- Operating Cashflow: ${formatFinancialValue(fundamentals.operatingCashflow, false, true)}

RESULTATEN PER AANDEEL:
- Earnings per Share (EPS): ${formatFinancialValue(fundamentals.earningsPerShare, false, true)}
- Forward EPS: ${formatFinancialValue(fundamentals.forwardEps, false, true)}
- Revenue per Share: ${formatFinancialValue(fundamentals.revenuePerShare, false, true)}
- Book Value: ${formatFinancialValue(fundamentals.bookValue, false, true)}

DIVIDEND:
- Dividend Yield: ${formatFinancialValue(fundamentals.dividendYield, true)}
- Payout Ratio: ${formatFinancialValue(fundamentals.payoutRatio, true)}
- Dividend Rate: ${formatFinancialValue(fundamentals.dividendRate, false, true)}

GROEI:
- Revenue Groei: ${formatFinancialValue(fundamentals.revenueGrowth, true)}
- Earnings Groei: ${formatFinancialValue(fundamentals.earningsGrowth, true)}
- Earnings Quarterly Groei: ${formatFinancialValue(fundamentals.earningsQuarterlyGrowth, true)}

ANALYST VERWACHTINGEN:
- Target Mean Price: ${formatFinancialValue(fundamentals.targetMeanPrice, false, true)}
- Target High Price: ${formatFinancialValue(fundamentals.targetHighPrice, false, true)}
- Target Low Price: ${formatFinancialValue(fundamentals.targetLowPrice, false, true)}
- Aanbeveling: ${fundamentals.recommendationKey || 'N/A'}
- Aantal Analisten: ${fundamentals.numberOfAnalystOpinions || 'N/A'}

${fundamentals.earningsHistory && fundamentals.earningsHistory.length > 0 ? `
EARNINGS GESCHIEDENIS:
${fundamentals.earningsHistory.slice(0, 8).map((item: Record<string, unknown>) => {
  const actual = item.actual as Record<string, unknown> | undefined
  const estimate = item.estimate as Record<string, unknown> | undefined
  const actualValue = actual?.raw as number | undefined
  const estimateValue = estimate?.raw as number | undefined
  return `- ${item.quarter || 'N/A'}: Actual ${formatFinancialValue(actualValue, false, true)}, Estimate ${formatFinancialValue(estimateValue, false, true)}`
}).join('\n')}
` : ''}

${fundamentals.earningsDate ? `
BELANGRIJKE DATUMS:
- Volgende Earnings Datum: ${fundamentals.earningsDate}
- Ex-Dividend Datum: ${fundamentals.exDividendDate || 'N/A'}
- Dividend Datum: ${fundamentals.dividendDate || 'N/A'}
` : ''}
` : ''

    const formatNews = (articles: Array<Record<string, unknown>>, category: string) => {
      if (!articles || articles.length === 0) return `Geen ${category} nieuws beschikbaar`
      return articles.slice(0, 10).map((article, idx) => {
        const title = article.title as string || 'Geen titel'
        const description = article.description as string || ''
        const source = article.source as string || 'Onbekende bron'
        const publishedAt = article.publishedAt as string | number | Date
        const dateStr = publishedAt ? new Date(publishedAt).toLocaleDateString('nl-NL') : 'Onbekende datum'
        return `${idx + 1}. ${title}${description ? ` - ${description}` : ''} (${source}, ${dateStr})`
      }).join('\n')
    }

    // Gebruik enhanced news als beschikbaar, anders fallback naar oude news
    const newsText = enhancedNews && (enhancedNews.companyNews.length > 0 || enhancedNews.marketNews.length > 0)
      ? formatEnhancedNews(enhancedNews)
      : `
RECENT NIEUWS:
BEDRIJFSNIEUWS:
${formatNews((newsData.companyNews || []) as Array<Record<string, unknown>>, 'bedrijfs')}

SECTORNIEUWS:
${formatNews((newsData.sectorNews || []) as Array<Record<string, unknown>>, 'sector')}

MARKTONTWIKKELINGEN:
${formatNews((newsData.marketNews || []) as Array<Record<string, unknown>>, 'markt')}
`

    // Voeg enhanced financial data details toe als beschikbaar (voor extra context)
    const enhancedFinancialText = enhancedFinancialData 
      ? formatEnhancedFinancialData(enhancedFinancialData)
      : ''

    // Voeg social sentiment toe als beschikbaar
    const socialSentimentText = socialSentiment
      ? formatSocialSentiment(socialSentiment)
      : ''

    const technicalText = quote ? `
TECHNISCHE DATA:
- Huidige Prijs: $${quote.price?.toFixed(2) || 'N/A'}
- Verandering: ${quote.changePercent?.toFixed(2) || 'N/A'}%
- Volume: ${quote.volume?.toLocaleString() || 'N/A'}
- SMA 50: ${currentSMA50 ? `$${currentSMA50.toFixed(2)}` : 'N/A'}
- SMA 200: ${currentSMA200 ? `$${currentSMA200.toFixed(2)}` : 'N/A'}
` : 'Geen technische data beschikbaar'

    const prompt = `Je bent een ervaren financieel analist gespecialiseerd in diepgaande aandelenanalyse. Maak een compleet, professioneel onderzoeksrapport voor het volgende aandeel/beleggingsproduct.

BELANGRIJK: Je moet aan het einde van je rapport een speciaal JSON gedeelte toevoegen met scores en voorspellingen. Dit moet exact in het volgende formaat zijn:

<ANALYSIS_SCORES>
{
  "overallScore": 75,
  "shortTerm": {
    "score": 70,
    "prediction": "Positief - Sterke technische setup en positieve earnings verwachtingen",
    "timeframe": "1-3 maanden",
    "keyFactors": ["Sterke revenue groei", "Positieve analyst verwachtingen", "Goede technische indicatoren"]
  },
  "mediumTerm": {
    "score": 78,
    "prediction": "Zeer positief - Fundamentale verbetering en sector groei",
    "timeframe": "3-12 maanden",
    "keyFactors": ["Verbeterende winstgevendheid", "Sector trends", "Sterke cashflow"]
  },
  "longTerm": {
    "score": 82,
    "prediction": "Uitstekend - Sterke concurrentiepositie en duurzame groei",
    "timeframe": "1-5 jaar",
    "keyFactors": ["Marktleiderspositie", "Innovatie", "Duurzame business model"]
  }
}
</ANALYSIS_SCORES>

KRITIEK VOOR SCORE BEPALING:
De scores moeten gebaseerd zijn op de VOLLEDIGE analyse die je hebt uitgevoerd, inclusief:

VOOR SHORT TERM (1-3 maanden):
- Technische analyse: prijs trends, SMA's, support/resistance niveaus, momentum
- Recente nieuws en ontwikkelingen: earnings releases, product launches, management changes
- Social sentiment: Reddit discussies, retail investor sentiment
- Korte termijn fundamentals: quarterly results, recent earnings beats/misses
- Analyst verwachtingen: upcoming earnings, target prices
- Marktomstandigheden: sector trends, macro-economische factoren
- Risico factoren: operationele risico's, marktvolatiliteit

VOOR MEDIUM TERM (3-12 maanden):
- Financiële gezondheid: winstgevendheid trends, cash flow generatie, schuldpositie
- Groei trends: revenue groei, earnings groei, market share expansie
- Sector ontwikkelingen: sector trends, concurrentie dynamiek
- Strategische initiatieven: nieuwe producten, markt expansie, partnerships
- Analyst consensus: target prices, recommendations, earnings estimates
- Nieuws en ontwikkelingen: bedrijfsstrategie, sector trends
- Risico analyse: financiële risico's, sector risico's

VOOR LONG TERM (1-5 jaar):
- Fundamentale sterkte: concurrentiepositie, marktleiderschap, business model duurzaamheid
- Financiële trends: multi-jaar revenue/earnings trends, cash flow generatie capaciteit
- Strategische positie: innovatie capaciteit, markt positie, sector groei potentieel
- Duurzaamheid: business model duurzaamheid, ESG factoren, lange termijn groei drivers
- Risico's: structurele risico's, disruptie risico's, macro-economische trends

De scores moeten tussen 0-100 zijn, waarbij:
- 0-40: Slecht/Zeer Risicovol
- 41-60: Neutraal/Gemiddeld
- 61-75: Goed/Positief
- 76-85: Zeer Goed/Zeer Positief
- 86-100: Uitstekend/Exceptioneel

BELANGRIJK VOOR SCORE BEPALING: 
- Baseer elke score op ALLE relevante factoren uit je VOLLEDIGE analyse in alle secties:
  * EXECUTIVE SUMMARY: belangrijkste conclusies en highlights
  * BEDRIJFSANALYSE: concurrentiepositie, marktpositie, strategische richting
  * FINANCIËLE ANALYSE: winstgevendheid, groei trends, financiële gezondheid, cash flow
  * VALUATIE ANALYSE: huidige waardering, fair value, analyst verwachtingen
  * TECHNISCHE ANALYSE: prijs trends, technische indicatoren, support/resistance
  * RISICO ANALYSE: alle geïdentificeerde risico's (bedrijf, sector, macro)
  * NIEUWS EN ONTWIKKELINGEN: recente ontwikkelingen, sector trends, social sentiment
  * CONCLUSIE: samenvatting van bevindingen

- KRITIEK: De scores voor shortTerm, mediumTerm en longTerm moeten SIGNIFICANT verschillen (minimaal 3-5 punten verschil, vaak 5-15 punten)
  * Dit is essentieel omdat verschillende factoren belangrijk zijn voor verschillende termijnen
  * Als alle scores hetzelfde zijn, betekent dit dat je niet goed hebt geanalyseerd welke factoren belangrijk zijn voor welk termijn
  * Voorbeelden van goede score verschillen:
    - Sterke fundamentals maar zwakke technische setup: shortTerm=55, mediumTerm=72, longTerm=80
    - Sterke technische setup maar twijfelachtige fundamentals: shortTerm=75, mediumTerm=60, longTerm=55
    - Goede groei maar hoge waardering: shortTerm=65, mediumTerm=70, longTerm=68
    - Sterke fundamentals en goede technische setup: shortTerm=78, mediumTerm=82, longTerm=85

- Weeg verschillende factoren afhankelijk van het tijdshorizon:
  * SHORT TERM (1-3 maanden): 
    - 60% gewicht: technische factoren (prijs trends, momentum, support/resistance), recente nieuws, sentiment
    - 30% gewicht: korte termijn fundamentals (recente earnings, guidance updates)
    - 10% gewicht: lange termijn fundamentals
    - Score kan significant afwijken van medium/long term als technische setup sterk verschilt van fundamentals
  
  * MEDIUM TERM (3-12 maanden):
    - 50% gewicht: financiële gezondheid, groei trends, sector ontwikkelingen
    - 30% gewicht: analyst verwachtingen, earnings estimates, guidance
    - 15% gewicht: technische factoren (trends, niet dagelijkse volatiliteit)
    - 5% gewicht: lange termijn fundamentals
  
  * LONG TERM (1-5 jaar):
    - 60% gewicht: fundamentale sterkte, concurrentiepositie, duurzaamheid, strategische positie
    - 25% gewicht: financiële trends over meerdere jaren, cash flow generatie capaciteit
    - 10% gewicht: sector groei potentieel, markt trends
    - 5% gewicht: korte termijn factoren (technische setup, recente nieuws)
    - Score moet vooral reflecteren of het bedrijf duurzaam kan groeien en concurreren

- Geef concrete onderbouwing in de keyFactors op basis van je volledige analyse:
  * Verwijs naar specifieke cijfers uit je financiële analyse
  * Verwijs naar trends en patronen die je hebt geïdentificeerd
  * Verwijs naar risico's en kansen die je hebt geanalyseerd
  * Verwijs naar nieuws en ontwikkelingen die relevant zijn
  * Gebruik concrete voorbeelden uit je analyse
  * Leg uit WAAROM de score voor dit termijn verschilt van andere termijnen

- De voorspellingen moeten concreet en onderbouwd zijn op basis van ALLE beschikbare data en je volledige analyse
- Gebruik concrete cijfers en trends uit je analyse om de scores te onderbouwen
- De scores moeten een accurate reflectie zijn van je volledige analyse, niet alleen van enkele metrics
- Als je scores te dicht bij elkaar liggen (< 3 punten verschil), heroverweeg dan welke factoren het belangrijkst zijn voor elk termijn

AANDEEL: ${symbol} (${name})

${aggregatedFinancialText}

${fundamentalsText}

${enhancedFinancialText}

${technicalText}

${newsText}

${socialSentimentText}

BELANGRIJKE INSTRUCTIES:
- Gebruik ALLE beschikbare financiele data die hierboven is gegeven. De data is geaggregeerd van meerdere bronnen (Yahoo Finance, Financial Modeling Prep, SEC EDGAR, Alpha Vantage)
- De DATA KWALITEIT sectie toont welke financiële statements beschikbaar zijn. Gebruik deze informatie om te bepalen welke analyses mogelijk zijn
- Als income statements beschikbaar zijn: analyseer de volledige geschiedenis, identificeer trends, bereken groeicijfers, analyseer marges
- Als balance sheets beschikbaar zijn: analyseer financiële gezondheid, schuldpositie, liquiditeit, solvabiliteit
- Als cash flow statements beschikbaar zijn: analyseer free cash flow trends, capex, dividend policy, cash generatie
- Gebruik quarterly data om recente ontwikkelingen en trends te analyseren
- Maak gebruik van ALLE beschikbare kentallen (P/E, P/B, PEG, ROE, ROA, marges, etc.) die in de data staan
- Analyseer de earnings geschiedenis en trends waar beschikbaar
- Gebruik de analyst verwachtingen en vergelijk deze met historische prestaties
- Gebruik de uitgebreide nieuwsdata inclusief analyst inzichten van Seeking Alpha en andere financiële bronnen
- Analyseer het social media sentiment (Reddit discussies) om marktsentiment te begrijpen
- Verwijs naar SEC filings als deze beschikbaar zijn voor extra transparantie
- Gebruik peer vergelijkingen (company peers) waar beschikbaar om relatieve waardering te analyseren

KRITIEK - ZOEK ACTIEF NAAR ONTBREKENDE INFORMATIE:
- Als specifieke financiële gegevens ontbreken, gebruik je ALGEMENE KENNIS over het bedrijf en de sector om deze informatie te vinden of af te leiden
- Gebruik beschikbare kentallen om ontbrekende cijfers te schatten (bijv. als revenue bekend is maar net income ontbreekt, gebruik de profit margin om net income te schatten)
- Als balance sheet data ontbreken maar income statements wel beschikbaar zijn, gebruik trends en sector gemiddelden om financiële gezondheid in te schatten
- Als cash flow data ontbreken, bereken free cash flow uit beschikbare income statement en balance sheet data waar mogelijk
- Gebruik sector gemiddelden en peer vergelijkingen om ontbrekende metrics in te schatten
- Als bedrijfsinformatie (aantal medewerkers, locaties) ontbreken, gebruik je algemene kennis over het bedrijf uit nieuwsartikelen en beschrijvingen
- Als analyst verwachtingen ontbreken, gebruik trends uit earnings geschiedenis en sector ontwikkelingen om verwachtingen te formuleren
- Gebruik nieuwsartikelen en social media discussies om ontbrekende context te vinden
- Als bepaalde data echt niet beschikbaar is, gebruik alternatieve metrics of vergelijkbare bedrijven om inzichten te geven
- VERVANG "data ontbreekt" statements met: "Op basis van beschikbare data en sector trends kan worden geschat dat..." of "Gebaseerd op algemene kennis over [bedrijf] en vergelijking met sectorgenoten..."
- Wees proactief: in plaats van te zeggen wat ontbreekt, geef je inzichten op basis van wat beschikbaar is en wat algemeen bekend is over het bedrijf

OPDRACHT:
Maak een uitgebreid onderzoeksrapport met de volgende secties:

1. EXECUTIVE SUMMARY
   - Korte samenvatting van het bedrijf/product
   - Belangrijkste conclusies en aanbeveling
   - Risico-niveau en geschiktheid voor verschillende beleggers
   - Belangrijkste financiele highlights

2. BEDRIJFSANALYSE
   - Bedrijfsmodel en activiteiten (gebruik de bedrijfsbeschrijving)
   - Concurrentiepositie
   - Sector en marktpositie
   - Strategische richting
   - Bedrijfsstructuur (aantal medewerkers, locatie, etc.)
   
   BELANGRIJK: Als bedrijfsinformatie zoals aantal medewerkers of locaties ontbreekt in de data:
   - Gebruik je algemene kennis over het bedrijf om deze informatie te vinden (bijv. Apple heeft ongeveer 164.000 medewerkers wereldwijd)
   - Gebruik nieuwsartikelen en beschrijvingen om bedrijfsinformatie te vinden
   - Gebruik sector gemiddelden om context te geven
   - ZEG NIET "aantal medewerkers ontbreekt" - gebruik in plaats daarvan je algemene kennis of geef een schatting op basis van bedrijfsgrootte

3. FINANCIËLE ANALYSE (UITGEBREID)
   Gebruik ALLE beschikbare financiële data uit de geaggregeerde data sectie hierboven.
   
   KRITIEK: Je moet ACTIEF financiële details van het bedrijf opzoeken:
   - Gebruik je uitgebreide kennis over duizenden beursgenoteerde bedrijven om financiële details te vinden
   - Je hebt kennis van revenue, earnings, cash flow, balance sheet items voor grote bedrijven over meerdere jaren
   - Als bepaalde data ontbreekt in de beschikbare data, ZOEK JE ACTIEF in je kennis naar deze informatie
   - Gebruik sector gemiddelden, trends en beschikbare metrics om de analyse compleet te maken
   - ZEG NIET "data ontbreekt" of "gebrek aan data" - geef in plaats daarvan concrete financiële cijfers uit je kennis
   - Geef altijd concrete cijfers: revenue, net income, cash, debt, equity, etc. uit je kennis van het bedrijf
   
   Als income statements beschikbaar zijn:
   - Analyseer winstgevendheid en marges (trends over meerdere jaren)
   - Identificeer groeitrends in revenue en earnings
   - Analyseer kostenstructuur en efficiency
   - Bereken en analyseer marges (gross, operating, net)
   - Identificeer sterke en zwakke punten in de resultaten
   
   Als income statements ONTBREKEN maar andere data wel beschikbaar is:
   - ZOEK ACTIEF naar financiële details: gebruik je uitgebreide kennis over het bedrijf om revenue, earnings, kostenstructuur te vinden
   - Gebruik beschikbare kentallen (P/E, ROE, profit margin) om revenue en earnings trends te schatten
   - Gebruik je algemene kennis over het bedrijf om historische resultaten te vinden (bijv. Apple's revenue in 2023 was $383 miljard, in 2022 was $394 miljard, in 2021 was $365 miljard)
   - Gebruik je kennis over kostenstructuur: R&D kosten, SG&A kosten, COGS voor het specifieke bedrijf
   - Gebruik sector gemiddelden en peer vergelijkingen om context te geven
   - Gebruik nieuwsartikelen over earnings releases om recente resultaten te vinden
   - Geef concrete financiële cijfers uit je kennis, bijvoorbeeld: "Apple Inc. rapporteerde in 2023 een revenue van $383 miljard, een stijging van X% ten opzichte van 2022"
   - Analyseer trends over meerdere jaren op basis van je kennis van het bedrijf
   
   Als balance sheets beschikbaar zijn:
   - Analyseer financiële gezondheid (schuldpositie, liquiditeit, solvabiliteit)
   - Evalueer activa structuur en efficiency
   - Analyseer schuldenpositie en eigen vermogen
   - Bereken efficiency metrics (ROE, ROA, asset turnover)
   
   Als balance sheets ONTBREKEN maar andere data wel beschikbaar is:
   - ZOEK ACTIEF naar balance sheet details: gebruik je kennis over het bedrijf om totale activa, passiva, equity, cash positie te vinden
   - Gebruik beschikbare ratios (debt to equity, current ratio) om financiële gezondheid in te schatten
   - Gebruik ROA en ROE om activa en equity te schatten waar mogelijk
   - Gebruik je kennis over het bedrijf: bijv. Apple heeft historisch een sterke cash positie (rond $166 miljard in 2023)
   - Gebruik sector gemiddelden om context te geven
   - Geef concrete balance sheet cijfers uit je kennis, bijvoorbeeld: "Apple Inc. had eind 2023 totale activa van $352 miljard, waarvan $166 miljard in cash en equivalenten"
   - Analyseer schuldpositie op basis van je kennis: totale schulden, langlopende schulden, kortlopende schulden
   
   Als cash flow statements beschikbaar zijn:
   - Analyseer cashflow trends (operating, investing, financing)
   - Evalueer free cashflow generatie
   - Analyseer capex en investeringsbeleid
   - Evalueer dividend policy en cash distributie
   
   Als cash flow statements ONTBREKEN maar andere data wel beschikbaar is:
   - ZOEK ACTIEF naar cash flow details: gebruik je kennis over het bedrijf om operating cash flow, free cash flow, capex te vinden
   - Bereken free cash flow uit beschikbare net income en schattingen van capex
   - Gebruik je kennis over het bedrijf: bijv. Apple genereerde in 2023 $99 miljard free cash flow
   - Gebruik dividend yield en payout ratio om cash generatie in te schatten
   - Gebruik trends uit income statements om cashflow patronen te identificeren
   - Gebruik sector gemiddelden voor capex ratios
   - Geef concrete cash flow cijfers uit je kennis, bijvoorbeeld: "Apple Inc. genereerde in 2023 $110 miljard operating cash flow en $99 miljard free cash flow na capex van $11 miljard"
   - Analyseer cash generatie trends over meerdere jaren op basis van je kennis
   
   Als quarterly data beschikbaar is:
   - Analyseer recente kwartaalresultaten en trends
   - Identificeer seizoenspatronen
   - Vergelijk kwartaal-op-kwartaal groei
   
   Gebruik alle beschikbare kentallen (P/E, P/B, PEG, ROE, ROA, marges, etc.) voor een complete analyse.
   Vergelijk waar mogelijk met sectorgenoten (peers) als deze informatie beschikbaar is.
   Gebruik je algemene kennis over het bedrijf en de sector om ontbrekende informatie te vinden of af te leiden.

4. VALUATIE ANALYSE
   - Huidige waardering (P/E, P/B, PEG, EV/Revenue, EV/EBITDA, etc.)
   - Fair value schatting (gebruik meerdere methoden)
   - Vergelijking met historische waarderingen
   - Analyst verwachtingen (target prices, recommendations)
   - Dividend analyse (yield, payout ratio, sustainability)

5. TECHNISCHE ANALYSE
   - Prijsontwikkeling en trends
   - Belangrijke support en resistance niveaus
   - Technische indicatoren (SMA 50/200, etc.)
   - Koersdoelen

6. RISICO ANALYSE
   - Bedrijfsspecifieke risico's (financiele gezondheid, operationele risico's)
   - Sector- en marktrisico's
   - Macro-economische risico's
   - Operationele risico's
   - Financiele risico's (schulden, liquiditeit, cashflow)

7. NIEUWS EN ONTWIKKELINGEN
   - Recente bedrijfsontwikkelingen (gebruik uitgebreide nieuwsbronnen)
   - Sector trends en ontwikkelingen
   - Marktomstandigheden en macro-economische factoren
   - Analyst inzichten en aanbevelingen (van Seeking Alpha, InvestorPlace, etc.)
   - Impact op toekomstige prestaties
   - Belangrijke datums (earnings, dividends)
   - Social media sentiment en retail investor sentiment (Reddit discussies)
   - SEC filings en regelgevende ontwikkelingen

8. CONCLUSIE EN SAMENVATTING
   - Samenvatting van belangrijkste bevindingen
   - Algemene informatie over de investeringsmogelijkheid (geen persoonlijk advies)
   - Geschiktheid voor verschillende beleggersprofielen (informatief)
   - Belangrijkste aandachtspunten
   - Risico-waarschuwingen

STIJL:
- Professioneel en objectief
- Gebruik concrete cijfers en data uit de beschikbare financiele statements
- Verwijs naar specifieke jaren/kwartalen wanneer je trends bespreekt
- Wees eerlijk over risico's en onzekerheden, maar wees proactief in het vinden van alternatieve informatie
- Geef praktische inzichten gebaseerd op de data EN algemene kennis over het bedrijf
- Structureer duidelijk met kopjes
- Geschreven in het Nederlands
- Als specifieke financiele data ontbreekt in de beschikbare data:
  * ZOEK ACTIEF in je uitgebreide kennis naar financiële details van het bedrijf
  * Gebruik je kennis over het bedrijf om concrete financiële cijfers te vinden: revenue, earnings, cash flow, balance sheet items over meerdere jaren
  * Geef concrete cijfers uit je kennis: "Apple Inc. rapporteerde in 2023 een revenue van $383 miljard, net income van $97 miljard, en had $166 miljard in cash"
  * Analyseer trends over meerdere jaren op basis van je kennis: "Revenue groeide van $365 miljard in 2021 naar $394 miljard in 2022 en $383 miljard in 2023"
  * Maak schattingen op basis van beschikbare data en sector gemiddelden waar je kennis niet beschikbaar is
  * Gebruik trends en patronen om ontbrekende informatie af te leiden
  * Vergelijk met sectorgenoten om context te geven
  * VERVANG "data ontbreekt" statements met concrete financiële cijfers uit je kennis
  * Wees constructief: geef altijd concrete financiële inzichten met cijfers, zelfs als niet alle data beschikbaar is

FORMAT:
Het rapport moet minimaal 3000 woorden bevatten en alle secties grondig uitwerken. Gebruik markdown formatting voor structuur. Zorg ervoor dat je alle beschikbare financiele data gebruikt en analyseert.

BELANGRIJKSTE INSTRUCTIE VOOR FINANCIËLE DETAILS:
- ZOEK ACTIEF naar financiële details van het bedrijf in je uitgebreide kennis
- Geef altijd concrete financiële cijfers: revenue, earnings, cash, debt, equity, etc. uit je kennis
- Analyseer trends over meerdere jaren op basis van je kennis van het bedrijf
- Gebruik je kennis over duizenden beursgenoteerde bedrijven om ontbrekende informatie te vinden
- VERVANG alle "data ontbreekt" statements met concrete financiële cijfers uit je kennis
- Wees proactief: geef altijd waardevolle financiële inzichten met concrete cijfers

BELANGRIJKSTE INSTRUCTIE VOOR SCORE BEPALING:
- KRITIEK: De scores voor shortTerm, mediumTerm en longTerm moeten SIGNIFICANT verschillen (minimaal 3-5 punten, vaak 5-15 punten verschil)
  * Als alle scores hetzelfde zijn, heb je niet goed geanalyseerd welke factoren belangrijk zijn voor welk termijn
  * Verschillende termijnen hebben verschillende drivers - reflecteer dit in de scores

- De scores (shortTerm, mediumTerm, longTerm) moeten gebaseerd zijn op je VOLLEDIGE analyse
- Gebruik informatie uit ALLE secties van je rapport om de scores te bepalen:
  * Financiële analyse: winstgevendheid, groei, gezondheid, cash flow trends
  * Technische analyse: prijs trends, momentum, support/resistance
  * Nieuws en ontwikkelingen: recente gebeurtenissen, sector trends
  * Social sentiment: marktsentiment, retail investor sentiment
  * Risico analyse: geïdentificeerde risico's en kansen
  * Valuatie analyse: huidige waardering vs fair value
  * Bedrijfsanalyse: concurrentiepositie, marktpositie

- Weeg factoren SIGNIFICANT verschillend per termijn:
  * SHORT TERM (1-3 maanden): 
    - 60% gewicht: technische factoren (prijs trends, momentum, support/resistance), recente ontwikkelingen, sentiment
    - 30% gewicht: korte termijn fundamentals (recente earnings, guidance)
    - 10% gewicht: lange termijn fundamentals
    - Als technische setup sterk afwijkt van fundamentals, kan score significant verschillen (bijv. sterke techniek maar zwakke fundamentals: 75 vs 60)
  
  * MEDIUM TERM (3-12 maanden):
    - 50% gewicht: financiële gezondheid, groei trends, sector ontwikkelingen
    - 30% gewicht: analyst verwachtingen, earnings estimates, guidance
    - 15% gewicht: technische factoren (trends, niet dagelijkse volatiliteit)
    - 5% gewicht: lange termijn fundamentals
    - Score moet vooral reflecteren of bedrijf kan groeien in komende 6-12 maanden
  
  * LONG TERM (1-5 jaar):
    - 60% gewicht: fundamentale sterkte, concurrentiepositie, duurzaamheid, strategische positie
    - 25% gewicht: financiële trends over meerdere jaren, cash flow generatie capaciteit
    - 10% gewicht: sector groei potentieel, markt trends
    - 5% gewicht: korte termijn factoren
    - Score moet vooral reflecteren of bedrijf duurzaam kan groeien en concurreren over 3-5 jaar

- Geef in keyFactors specifieke voorbeelden uit je analyse die de score onderbouwen
- Leg in keyFactors uit WAAROM de score voor dit termijn verschilt van andere termijnen
- De scores moeten logisch consistent zijn met je volledige analyse en conclusies
- Als je denkt dat alle termijnen dezelfde score verdienen, heroverweeg dan welke factoren het belangrijkst zijn voor elk termijn`

    // Check of gecanceld
    if (await isCancelled(reportId)) {
      console.log(`Report ${reportId} was gecanceld voor AI generatie`)
      return
    }

    await updateProgress(reportId, 60, "AI rapport genereren...")

    const openai = new OpenAI({ apiKey: openaiApiKey })

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Je bent een ervaren financieel analist met diepgaande kennis van aandelenanalyse, bedrijfsfinanciën, technische analyse en marktdynamiek. Je hebt uitgebreide kennis van duizenden beursgenoteerde bedrijven, hun financiële geschiedenis, sector trends en marktdynamiek.

BELANGRIJK: Je moet ACTIEF zoeken naar ontbrekende financiële informatie:
- Gebruik je uitgebreide kennis over bedrijven om ontbrekende financiële gegevens te vinden
- Je kent de financiële geschiedenis van grote bedrijven (bijv. Apple's revenue, earnings, cash flow over meerdere jaren)
- Als specifieke financiële data ontbreekt, gebruik beschikbare metrics om deze te schatten EN gebruik je algemene kennis
- Gebruik sector gemiddelden en peer vergelijkingen om context te geven
- Gebruik nieuwsartikelen en beschrijvingen om bedrijfsinformatie te vinden
- Maak schattingen op basis van trends en patronen in beschikbare data
- VERVANG "data ontbreekt" statements met concrete financiële cijfers uit je kennis
- Wees proactief: geef altijd waardevolle financiële inzichten met concrete cijfers

VOORBEELDEN van financiële kennis die je hebt:
- Apple Inc. (AAPL): Revenue 2023: $383 miljard, Net Income: $97 miljard, Cash: $166 miljard, Employees: ~164.000
- Microsoft (MSFT): Revenue 2023: $211 miljard, Net Income: $72 miljard, Cash: $111 miljard
- Google/Alphabet (GOOGL): Revenue 2023: $307 miljard, Net Income: $74 miljard
- En duizenden andere bedrijven met hun financiële geschiedenis

Je schrijft uitgebreide, professionele onderzoeksrapporten die geschikt zijn voor serieuze beleggers.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000,
    })

    // Check of gecanceld
    if (await isCancelled(reportId)) {
      console.log(`Report ${reportId} was gecanceld tijdens AI generatie`)
      return
    }

    await updateProgress(reportId, 85, "Rapport verwerken en opslaan...")

    const reportContent = response.choices[0]?.message?.content || ""

    if (!reportContent) {
      throw new Error("OpenAI gaf geen geldige response terug")
    }

    // Extraheer scores en voorspellingen uit de response
    let scores = null
    let contentWithoutScores = reportContent
    
    try {
      const scoresMatch = reportContent.match(/<ANALYSIS_SCORES>([\s\S]*?)<\/ANALYSIS_SCORES>/)
      if (scoresMatch && scoresMatch[1]) {
        scores = JSON.parse(scoresMatch[1].trim())
        // Verwijder het scores gedeelte uit de content
        contentWithoutScores = reportContent.replace(/<ANALYSIS_SCORES>[\s\S]*?<\/ANALYSIS_SCORES>/, '').trim()
      }
    } catch (parseError) {
      console.error("Error parsing scores from report:", parseError)
      // Als parsing faalt, genereer default scores op basis van fundamentals
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      scores = generateDefaultScores(fundamentals, quote, history, aggregatedFinancialData as unknown as Record<string, unknown>, enhancedNews, socialSentiment as any)
    }

    // Als er geen scores zijn, genereer default scores
    if (!scores) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      scores = generateDefaultScores(fundamentals, quote, history, aggregatedFinancialData as unknown as Record<string, unknown>, enhancedNews, socialSentiment as any)
    }

    // Check of gecanceld voordat we opslaan
    if (await isCancelled(reportId)) {
      console.log(`Report ${reportId} was gecanceld voordat opslaan`)
      return
    }

    await updateProgress(reportId, 95, "Rapport finaliseren...")

    // Sla het rapport op
    // Converteer data naar JSON-serialiseerbare formaten voor Prisma
    await prisma.deepResearchReport.update({
      where: { id: reportId },
      data: {
        status: "COMPLETED",
        progressPercentage: 100,
        progressMessage: "Voltooid",
        report: {
          content: contentWithoutScores,
          quote: quote ? JSON.parse(JSON.stringify(quote)) : null,
          fundamentals: fundamentals ? JSON.parse(JSON.stringify(fundamentals)) : null,
          history: history.slice(-365).map((h: { date: string; open: number; high: number; low: number; close: number; volume: number }) => JSON.parse(JSON.stringify(h))), // Laatste jaar voor grafieken
          news: JSON.parse(JSON.stringify(newsData)),
          // Nieuwe enhanced data
          enhancedFinancialData: enhancedFinancialData ? JSON.parse(JSON.stringify(enhancedFinancialData)) : null,
          enhancedNews: enhancedNews ? JSON.parse(JSON.stringify(enhancedNews)) : null,
          socialSentiment: socialSentiment ? JSON.parse(JSON.stringify(socialSentiment)) : null,
          // Geaggregeerde financiële data (combineert alle bronnen)
          aggregatedFinancialData: JSON.parse(JSON.stringify(aggregatedFinancialData)),
          scores: scores,
          generatedAt: new Date().toISOString(),
        },
        pdfUrl: `/api/stocks/deep-research/${reportId}/download`,
      },
    })
  } catch (error) {
    console.error("Error generating report:", error)
    
    // Check of het gecanceld was - dan niet als FAILED markeren
    const report = await prisma.deepResearchReport.findUnique({
      where: { id: reportId },
      select: { status: true },
    })
    
    if (report?.status !== "CANCELLED") {
      await prisma.deepResearchReport.update({
        where: { id: reportId },
        data: {
          status: "FAILED",
          error: error instanceof Error ? error.message : "Onbekende fout",
          progressMessage: "Generatie mislukt",
        },
      })
    }
  }
}

// GET endpoint om rapport status op te halen
export async function GET(request: NextRequest) {
  try {
    // Check Clerk configuratie eerst
    const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
    const clerkSecretKey = process.env.CLERK_SECRET_KEY
    
    if (!clerkPublishableKey || !clerkSecretKey) {
      console.error("Deep Research API GET: Clerk environment variables niet geconfigureerd")
      return NextResponse.json(
        { error: "Authenticatie niet geconfigureerd" },
        { status: 500 }
      )
    }
    
    // Haal gebruiker op via getClerkUser (sync met database)
    let user = null
    try {
      user = await getClerkUser(request)
      
      // Als getClerkUser geen user teruggeeft, probeer auth() als fallback
      if (!user || !user.id) {
        try {
          const authResult = await auth()
          if (authResult?.userId) {
            // We hebben een Clerk userId maar geen database user
            const { currentUser } = await import("@clerk/nextjs/server")
            const clerkUser = await currentUser()
            
            if (clerkUser) {
              const email = clerkUser.emailAddresses?.[0]?.emailAddress || 
                           clerkUser.primaryEmailAddress?.emailAddress ||
                           clerkUser.externalAccounts?.find(ea => ea.provider === 'oauth_google')?.emailAddress
              
              if (email) {
                const newUser = await prisma.user.create({
                  data: {
                    email,
                    name: clerkUser.firstName && clerkUser.lastName
                      ? `${clerkUser.firstName} ${clerkUser.lastName}`
                      : clerkUser.firstName || clerkUser.username || email,
                  },
                })
                
                user = {
                  id: newUser.id,
                  email: newUser.email,
                  name: newUser.name,
                  tier: newUser.tier,
                  role: newUser.role,
                  clerkId: authResult.userId,
                }
              }
            }
          }
        } catch (authError) {
          console.error("Deep Research API GET: auth() fallback failed", authError)
        }
      }
    } catch (authError) {
      console.error("Error in getClerkUser():", authError)
      // Probeer auth() als laatste redmiddel
      try {
        const authResult = await auth()
        if (!authResult?.userId) {
          return NextResponse.json(
            { error: "Authenticatie fout" },
            { status: 401 }
          )
        }
      } catch {
        return NextResponse.json(
          { error: "Authenticatie fout" },
          { status: 401 }
        )
      }
    }
    
    if (!user || !user.id) {
      return NextResponse.json(
        { error: "Niet geautoriseerd" },
        { status: 401 }
      )
    }
    
    const userId = user.id

    const searchParams = request.nextUrl.searchParams
    const reportId = searchParams.get("reportId")

    if (reportId) {
      // Haal specifiek rapport op
      const report = await prisma.deepResearchReport.findFirst({
        where: {
          id: reportId,
          userId,
        },
      })

      if (!report) {
        return NextResponse.json(
          { error: "Rapport niet gevonden" },
          { status: 404 }
        )
      }

      return NextResponse.json(report)
    } else {
      // Haal alle rapporten van gebruiker op
      const reports = await prisma.deepResearchReport.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 50,
      })

      return NextResponse.json({ reports })
    }
  } catch (error) {
    console.error("Error fetching reports:", error)
    return NextResponse.json(
      { error: "Interne server fout" },
      { status: 500 }
    )
  }
}

