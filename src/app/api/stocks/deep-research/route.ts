import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { fetchStockNews } from "@/lib/news-service"
import { prisma } from "@/lib/prisma"
import { getClerkUser } from "@/lib/clerk-auth"

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

// Genereer default scores op basis van beschikbare data
function generateDefaultScores(
  fundamentals: Record<string, unknown> | null,
  quote: { price?: number; changePercent?: number } | null,
  history: Array<{ date: string; close: number }>
): {
  overallScore: number
  shortTerm: { score: number; prediction: string; timeframe: string; keyFactors: string[] }
  mediumTerm: { score: number; prediction: string; timeframe: string; keyFactors: string[] }
  longTerm: { score: number; prediction: string; timeframe: string; keyFactors: string[] }
} {
  let score = 50 // Start met neutrale score
  
  // Analyseer fundamentals
  if (fundamentals) {
    const pe = fundamentals.trailingPE as number
    const roe = fundamentals.returnOnEquity as number
    const revenueGrowth = fundamentals.revenueGrowth as number
    const profitMargins = fundamentals.profitMargins as number
    const debtToEquity = fundamentals.debtToEquity as number
    
    if (pe && pe > 0 && pe < 25) score += 10
    if (pe && pe >= 25) score -= 5
    if (roe && roe > 0.15) score += 10
    if (revenueGrowth && revenueGrowth > 0.1) score += 10
    if (profitMargins && profitMargins > 0.1) score += 10
    if (debtToEquity && debtToEquity < 1) score += 5
  }
  
  // Analyseer prijs performance
  if (quote && quote.changePercent) {
    if (quote.changePercent > 5) score += 5
    if (quote.changePercent < -5) score -= 5
  }
  
  // Normaliseer score tussen 0-100
  score = Math.max(0, Math.min(100, score))
  
  const shortScore = Math.max(0, Math.min(100, score - 5))
  const mediumScore = Math.max(0, Math.min(100, score + 3))
  const longScore = Math.max(0, Math.min(100, score + 8))
  
  return {
    overallScore: score,
    shortTerm: {
      score: shortScore,
      prediction: "Analyse op basis van beschikbare data - technische indicatoren en recente ontwikkelingen",
      timeframe: "1-3 maanden",
      keyFactors: ["Technische setup", "Recente prijsbeweging", "Marktsentiment"]
    },
    mediumTerm: {
      score: mediumScore,
      prediction: "Analyse op basis van fundamentele factoren en sector trends",
      timeframe: "3-12 maanden",
      keyFactors: ["Fundamentele gezondheid", "Sector trends", "Bedrijfsresultaten"]
    },
    longTerm: {
      score: longScore,
      prediction: "Analyse op basis van duurzame groei en concurrentiepositie",
      timeframe: "1-5 jaar",
      keyFactors: ["Marktpositie", "Innovatie", "Duurzaamheid"]
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
    // Haal gebruiker op via getClerkUser (sync met database)
    let user = null
    try {
      user = await getClerkUser(request)
    } catch (authError) {
      console.error("Error in getClerkUser():", authError)
      const errorMessage = authError instanceof Error ? authError.message : "Authenticatie fout"
      return NextResponse.json(
        { error: errorMessage },
        { status: 401 }
      )
    }
    
    if (!user || !user.id) {
      return NextResponse.json(
        { error: "Niet geautoriseerd. Log in om een Deep Research rapport te genereren." },
        { status: 401 }
      )
    }
    
    const userId = user.id

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
    } catch (dbError) {
      console.error("Database error:", dbError)
      const errorMessage = dbError instanceof Error ? dbError.message : "Onbekende database fout"
      const errorCode = dbError && typeof dbError === 'object' && 'code' in dbError ? String(dbError.code) : undefined
      
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

    return NextResponse.json({
      reportId: report.id,
      status: "GENERATING",
      message: "Rapport wordt gegenereerd...",
    })
  } catch (error) {
    // Catch-all voor onverwachte errors - zorg altijd voor JSON response
    console.error("Unexpected error in deep research API:", error)
    
    const errorMessage = error instanceof Error ? error.message : "Interne server fout"
    const errorStack = error instanceof Error ? error.stack : undefined
    const errorName = error instanceof Error ? error.name : error?.constructor?.name || "Unknown"
    
    console.error("Error details:", {
      name: errorName,
      message: errorMessage,
      stack: errorStack,
    })
    
    // Zorg altijd voor een geldige JSON response
    try {
      return NextResponse.json(
        { 
          error: errorMessage,
          ...(process.env.NODE_ENV === 'development' && { 
            details: errorStack,
            errorName: errorName
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

async function generateReport(
  reportId: string,
  symbol: string,
  name: string,
  openaiApiKey: string
) {
  try {
    // Haal alle data op
    const [quote, fundamentals, history, newsData] = await Promise.all([
      fetchQuote(symbol),
      fetchFundamentals(symbol),
      fetchHistory(symbol),
      fetchStockNews(symbol, undefined, undefined, undefined, 20).catch(() => ({
        companyNews: [],
        sectorNews: [],
        marketNews: [],
      })),
    ])

    // Bereken technische indicatoren
    const calculateSMA = (data: any[], period: number) => {
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

INCOME STATEMENT (Jaarlijks - ${fundamentals.incomeStatement?.length || 0} jaar):
${formatIncomeStatement(fundamentals.incomeStatement || [])}

BALANCE SHEET (Jaarlijks - ${fundamentals.balanceSheet?.length || 0} jaar):
${formatBalanceSheet(fundamentals.balanceSheet || [])}

CASHFLOW STATEMENT (Jaarlijks - ${fundamentals.cashFlow?.length || 0} jaar):
${formatCashFlow(fundamentals.cashFlow || [])}

${fundamentals.quarterlyIncome && fundamentals.quarterlyIncome.length > 0 ? `
QUARTERLY INCOME STATEMENT (Laatste ${fundamentals.quarterlyIncome.length} kwartalen):
${formatIncomeStatement(fundamentals.quarterlyIncome)}
` : ''}

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
` : 'Geen fundamentele data beschikbaar'

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

    const newsText = `
RECENT NIEUWS:
BEDRIJFSNIEUWS:
${formatNews((newsData.companyNews || []) as Array<Record<string, unknown>>, 'bedrijfs')}

SECTORNIEUWS:
${formatNews((newsData.sectorNews || []) as Array<Record<string, unknown>>, 'sector')}

MARKTONTWIKKELINGEN:
${formatNews((newsData.marketNews || []) as Array<Record<string, unknown>>, 'markt')}
`

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

De scores moeten tussen 0-100 zijn, waarbij:
- 0-40: Slecht/Zeer Risicovol
- 41-60: Neutraal/Gemiddeld
- 61-75: Goed/Positief
- 76-85: Zeer Goed/Zeer Positief
- 86-100: Uitstekend/Exceptioneel

De voorspellingen moeten concreet en onderbouwd zijn op basis van de beschikbare data.

AANDEEL: ${symbol} (${name})
${fundamentalsText}
${technicalText}
${newsText}

BELANGRIJKE INSTRUCTIES:
- Gebruik ALLE beschikbare financiele data die hierboven is gegeven
- Analyseer de volledige geschiedenis van income statements, balance sheets en cashflow statements
- Vergelijk trends over meerdere jaren om patronen te identificeren
- Gebruik de quarterly data om recente ontwikkelingen te analyseren
- Als bepaalde financiele cijfers ontbreken, vermeld dit expliciet en leg uit wat dit betekent
- Maak gebruik van alle beschikbare kentallen (P/E, P/B, PEG, ROE, ROA, marges, etc.)
- Analyseer de earnings geschiedenis en trends
- Gebruik de analyst verwachtingen en vergelijk deze met historische prestaties

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

3. FINANCIËLE ANALYSE (UITGEBREID)
   - Winstgevendheid en marges (analyseer trends over meerdere jaren)
   - Groeitrends (revenue, earnings, cashflow groei over tijd)
   - Financiële gezondheid (schuldpositie, liquiditeit, solvabiliteit)
   - Cashflow analyse (operating, investing, financing cashflows)
   - Analyse van income statements (identificeer trends, sterke/zwakke punten)
   - Analyse van balance sheets (activa structuur, schulden, eigen vermogen)
   - Analyse van cashflow statements (free cashflow trends, capex, dividend policy)
   - Quarterly trends (analyseer recente kwartaalresultaten als beschikbaar)
   - Vergelijking met sectorgenoten (waar mogelijk)
   - Efficiency metrics (ROE, ROA, asset turnover, etc.)

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
   - Recente bedrijfsontwikkelingen
   - Sector trends
   - Marktomstandigheden
   - Impact op toekomstige prestaties
   - Belangrijke datums (earnings, dividends)

8. CONCLUSIE EN AANBEVELING
   - Samenvatting van belangrijkste bevindingen
   - Investeringsaanbeveling (Kopen/Houden/Verkopen) met onderbouwing
   - Geschiktheid voor verschillende beleggersprofielen
   - Belangrijkste aandachtspunten
   - Risico-waarschuwingen

STIJL:
- Professioneel en objectief
- Gebruik concrete cijfers en data uit de beschikbare financiele statements
- Verwijs naar specifieke jaren/kwartalen wanneer je trends bespreekt
- Wees eerlijk over risico's en onzekerheden
- Geef praktische inzichten gebaseerd op de data
- Structureer duidelijk met kopjes
- Geschreven in het Nederlands
- Als financiele data ontbreekt, vermeld dit en leg uit wat dit betekent voor de analyse

FORMAT:
Het rapport moet minimaal 3000 woorden bevatten en alle secties grondig uitwerken. Gebruik markdown formatting voor structuur. Zorg ervoor dat je alle beschikbare financiele data gebruikt en analyseert.`

    const openai = new OpenAI({ apiKey: openaiApiKey })

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Je bent een ervaren financieel analist met diepgaande kennis van aandelenanalyse, bedrijfsfinanciën, technische analyse en marktdynamiek. Je schrijft uitgebreide, professionele onderzoeksrapporten die geschikt zijn voor serieuze beleggers."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000,
    })

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
      scores = generateDefaultScores(fundamentals, quote, history)
    }

    // Als er geen scores zijn, genereer default scores
    if (!scores) {
      scores = generateDefaultScores(fundamentals, quote, history)
    }

    // Sla het rapport op
    // Converteer data naar JSON-serialiseerbare formaten voor Prisma
    await prisma.deepResearchReport.update({
      where: { id: reportId },
      data: {
        status: "COMPLETED",
        report: {
          content: contentWithoutScores,
          quote: quote ? JSON.parse(JSON.stringify(quote)) : null,
          fundamentals: fundamentals ? JSON.parse(JSON.stringify(fundamentals)) : null,
          history: history.slice(-365).map((h: { date: string; open: number; high: number; low: number; close: number; volume: number }) => JSON.parse(JSON.stringify(h))), // Laatste jaar voor grafieken
          news: JSON.parse(JSON.stringify(newsData)),
          scores: scores,
          generatedAt: new Date().toISOString(),
        },
        pdfUrl: `/api/stocks/deep-research/${reportId}/download`,
      },
    })
  } catch (error) {
    console.error("Error generating report:", error)
    await prisma.deepResearchReport.update({
      where: { id: reportId },
      data: {
        status: "FAILED",
        error: error instanceof Error ? error.message : "Onbekende fout",
      },
    })
    throw error
  }
}

// GET endpoint om rapport status op te halen
export async function GET(request: NextRequest) {
  try {
    // Haal gebruiker op via getClerkUser (sync met database)
    let user = null
    try {
      user = await getClerkUser(request)
    } catch (authError) {
      console.error("Error in getClerkUser():", authError)
      return NextResponse.json(
        { error: "Authenticatie fout" },
        { status: 401 }
      )
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

