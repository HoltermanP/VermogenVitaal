/**
 * Enhanced Financial Data Service
 * Integreert meerdere gratis bronnen voor uitgebreide financiële data:
 * - Financial Modeling Prep API (gratis tier: 250 calls/dag)
 * - SEC EDGAR API (volledig gratis)
 * - Alpha Vantage (al geconfigureerd, gratis tier: 500 calls/dag)
 * - Yahoo Finance (backup)
 */

export interface FinancialData {
  // Basis info
  symbol: string
  companyName: string
  sector?: string
  industry?: string
  
  // Financial Modeling Prep data
  fmpData?: {
    profile?: any
    keyMetrics?: any // TTM data is een object, niet array
    financialRatios?: any // TTM data is een object, niet array
    incomeStatement?: any[]
    balanceSheet?: any[]
    cashFlow?: any[]
    analystEstimates?: any[]
    companyPeers?: string[]
  }
  
  // SEC EDGAR data
  secData?: {
    recentFilings?: any[]
    companyFacts?: any
  }
  
  // Alpha Vantage data
  alphaVantageData?: {
    overview?: any
    earnings?: any
    incomeStatement?: any
    balanceSheet?: any
    cashFlow?: any
  }
}

/**
 * Haal uitgebreide financiële data op van Financial Modeling Prep
 * Gratis tier: 250 calls/dag
 */
async function fetchFinancialModelingPrepData(symbol: string) {
  const apiKey = process.env.FMP_API_KEY || process.env.FINANCIAL_MODELING_PREP_API_KEY
  
  if (!apiKey || apiKey === "your-fmp-api-key") {
    console.log("[FMP] API key niet geconfigureerd, skip FMP data")
    return null
  }

  try {
    // Haal meerdere endpoints parallel op
    const [
      profileRes,
      keyMetricsRes,
      ratiosRes,
      incomeRes,
      balanceRes,
      cashFlowRes,
      estimatesRes,
      peersRes
    ] = await Promise.allSettled([
      // Company profile
      fetch(`https://financialmodelingprep.com/api/v3/profile/${symbol}?apikey=${apiKey}`),
      // Key metrics (TTM)
      fetch(`https://financialmodelingprep.com/api/v3/key-metrics-ttm/${symbol}?apikey=${apiKey}`),
      // Financial ratios (TTM)
      fetch(`https://financialmodelingprep.com/api/v3/ratios-ttm/${symbol}?apikey=${apiKey}`),
      // Income statement (laatste 5 jaar)
      fetch(`https://financialmodelingprep.com/api/v3/income-statement/${symbol}?limit=5&apikey=${apiKey}`),
      // Balance sheet (laatste 5 jaar)
      fetch(`https://financialmodelingprep.com/api/v3/balance-sheet-statement/${symbol}?limit=5&apikey=${apiKey}`),
      // Cash flow (laatste 5 jaar)
      fetch(`https://financialmodelingprep.com/api/v3/cash-flow-statement/${symbol}?limit=5&apikey=${apiKey}`),
      // Analyst estimates
      fetch(`https://financialmodelingprep.com/api/v3/analyst-estimates/${symbol}?limit=5&apikey=${apiKey}`),
      // Company peers
      fetch(`https://financialmodelingprep.com/api/v4/stock_peers?symbol=${symbol}&apikey=${apiKey}`)
    ])

    const profile = profileRes.status === 'fulfilled' && profileRes.value.ok 
      ? await profileRes.value.json().catch(() => null) : null
    const keyMetrics = keyMetricsRes.status === 'fulfilled' && keyMetricsRes.value.ok
      ? await keyMetricsRes.value.json().catch(() => null) : null
    const ratios = ratiosRes.status === 'fulfilled' && ratiosRes.value.ok
      ? await ratiosRes.value.json().catch(() => null) : null
    const income = incomeRes.status === 'fulfilled' && incomeRes.value.ok
      ? await incomeRes.value.json().catch(() => null) : null
    const balance = balanceRes.status === 'fulfilled' && balanceRes.value.ok
      ? await balanceRes.value.json().catch(() => null) : null
    const cashFlow = cashFlowRes.status === 'fulfilled' && cashFlowRes.value.ok
      ? await cashFlowRes.value.json().catch(() => null) : null
    const estimates = estimatesRes.status === 'fulfilled' && estimatesRes.value.ok
      ? await estimatesRes.value.json().catch(() => null) : null
    const peers = peersRes.status === 'fulfilled' && peersRes.value.ok
      ? await peersRes.value.json().catch(() => null) : null

    const result: FinancialData['fmpData'] = {
      profile: Array.isArray(profile) ? profile[0] : profile,
      keyMetrics: Array.isArray(keyMetrics) ? keyMetrics[0] : keyMetrics,
      financialRatios: Array.isArray(ratios) ? ratios[0] : ratios,
      incomeStatement: Array.isArray(income) ? income : undefined,
      balanceSheet: Array.isArray(balance) ? balance : undefined,
      cashFlow: Array.isArray(cashFlow) ? cashFlow : undefined,
      analystEstimates: Array.isArray(estimates) ? estimates : undefined,
      companyPeers: Array.isArray(peers) ? peers.map((p: any) => p.symbol || p) : undefined
    }
    
    return result
  } catch (error) {
    console.error("[FMP] Error fetching data:", error)
    return null
  }
}

/**
 * Haal SEC EDGAR data op (volledig gratis, geen API key nodig)
 */
async function fetchSECData(symbol: string, companyName?: string) {
  try {
    // Zoek eerst CIK (Central Index Key) voor het bedrijf
    // SEC EDGAR gebruikt CIK in plaats van ticker symbol
    let cik: string | null = null
    
    // Probeer CIK te vinden via SEC company tickers endpoint
    try {
      const tickersRes = await fetch('https://www.sec.gov/files/company_tickers.json', {
        headers: {
          'User-Agent': 'TaxWealthHub/1.0 (contact@taxwealthhub.com)',
          'Accept': 'application/json'
        }
      })
      
      if (tickersRes.ok) {
        const tickersData = await tickersRes.json()
        const entry = Object.values(tickersData).find((item: any) => 
          item.ticker === symbol.toUpperCase()
        ) as any
        
        if (entry) {
          cik = String(entry.cik_str).padStart(10, '0')
        }
      }
    } catch (error) {
      console.warn("[SEC] Could not fetch CIK, skipping SEC data")
      return null
    }

    if (!cik) {
      console.log(`[SEC] CIK niet gevonden voor ${symbol}, skip SEC data`)
      return null
    }

    // Haal recente filings op (10-K, 10-Q, 8-K)
    try {
      const filingsRes = await fetch(
        `https://data.sec.gov/submissions/CIK${cik}.json`,
        {
          headers: {
            'User-Agent': 'TaxWealthHub/1.0 (contact@taxwealthhub.com)',
            'Accept': 'application/json'
          }
        }
      )

      if (filingsRes.ok) {
        const filingsData = await filingsRes.json()
        
        // Filter belangrijke filings (10-K, 10-Q, 8-K)
        const recentFilings = (filingsData.filings?.recent || {})
        const forms = recentFilings.form || []
        const dates = recentFilings.filingDate || []
        const descriptions = recentFilings.description || []
        
        const importantFilings = forms
          .map((form: string, idx: number) => ({
            form,
            date: dates[idx],
            description: descriptions[idx] || ''
          }))
          .filter((f: any) => ['10-K', '10-Q', '8-K'].includes(f.form))
          .slice(0, 10) // Laatste 10 belangrijke filings

        return {
          recentFilings: importantFilings,
          cik,
          companyFacts: null // Company facts vereist aparte call, kan later toegevoegd worden
        }
      } else {
        console.warn(`[SEC] Filings fetch failed: ${filingsRes.status}`)
        return null
      }
    } catch (error) {
      console.warn("[SEC] Error fetching filings:", error)
      return null
    }
  } catch (error) {
    console.error("[SEC] Error in SEC data fetch:", error)
    return null
  }
}

/**
 * Haal uitgebreide Alpha Vantage data op
 * Gratis tier: 5 calls/min, 500 calls/dag
 */
async function fetchAlphaVantageData(symbol: string) {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY
  
  if (!apiKey || apiKey === "demo") {
    console.log("[AlphaVantage] API key niet geconfigureerd of demo, skip Alpha Vantage data")
    return null
  }

  try {
    // Haal overview op (company information, financials)
    const overviewRes = await fetch(
      `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${apiKey}`
    )

    if (!overviewRes.ok) {
      return null
    }

    const overview = await overviewRes.json().catch(() => null)
    
    // Check voor API limit error
    if (overview && overview.Note) {
      console.warn("[AlphaVantage] API limit bereikt")
      return null
    }

    // Haal earnings data op (parallel)
    const earningsRes = await fetch(
      `https://www.alphavantage.co/query?function=EARNINGS&symbol=${symbol}&apikey=${apiKey}`
    )

    let earnings = null
    if (earningsRes.ok) {
      earnings = await earningsRes.json().catch(() => null)
      if (earnings && earnings.Note) {
        earnings = null // API limit
      }
    }

    return {
      overview,
      earnings
    }
  } catch (error) {
    console.error("[AlphaVantage] Error fetching data:", error)
    return null
  }
}

/**
 * Hoofdfunctie: Haal uitgebreide financiële data op van alle beschikbare bronnen
 */
export async function fetchEnhancedFinancialData(
  symbol: string,
  companyName?: string
): Promise<FinancialData> {
  console.log(`[EnhancedFinancial] Fetching data for ${symbol}...`)

  // Haal data parallel op van alle bronnen
  const [fmpData, secData, alphaVantageData] = await Promise.all([
    fetchFinancialModelingPrepData(symbol),
    fetchSECData(symbol, companyName),
    fetchAlphaVantageData(symbol)
  ])

  // Combineer data
  const result: FinancialData = {
    symbol,
    companyName: companyName || symbol,
    fmpData: fmpData || undefined,
    secData: secData || undefined,
    alphaVantageData: alphaVantageData || undefined
  }

  // Extract sector/industry van eerste beschikbare bron
  if (fmpData?.profile) {
    result.sector = fmpData.profile.sector
    result.industry = fmpData.profile.industry
    result.companyName = fmpData.profile.companyName || companyName || symbol
  } else if (alphaVantageData?.overview) {
    result.sector = alphaVantageData.overview.Sector
    result.industry = alphaVantageData.overview.Industry
    result.companyName = alphaVantageData.overview.Name || companyName || symbol
  }

  console.log(`[EnhancedFinancial] ✅ Data fetched for ${symbol}`)
  return result
}

/**
 * Format enhanced financial data voor gebruik in AI prompts
 */
export function formatEnhancedFinancialData(data: FinancialData): string {
  let formatted = `\n=== UITGEBREIDE FINANCIËLE DATA ===\n`

  // Financial Modeling Prep data
  if (data.fmpData) {
    formatted += `\n--- Financial Modeling Prep Data ---\n`
    
    if (data.fmpData.profile) {
      const p = data.fmpData.profile
      formatted += `Bedrijfsprofiel:\n`
      formatted += `- Bedrijfsnaam: ${p.companyName || 'N/A'}\n`
      formatted += `- Sector: ${p.sector || 'N/A'}\n`
      formatted += `- Industrie: ${p.industry || 'N/A'}\n`
      formatted += `- Website: ${p.website || 'N/A'}\n`
      formatted += `- Beschrijving: ${p.description || 'N/A'}\n`
      formatted += `- Aantal werknemers: ${p.fullTimeEmployees?.toLocaleString() || 'N/A'}\n`
      formatted += `- Marktkapitalisatie: $${(p.mktCap / 1e9).toFixed(2)}B\n`
    }

    if (data.fmpData.keyMetrics) {
      const km = Array.isArray(data.fmpData.keyMetrics) ? data.fmpData.keyMetrics[0] : data.fmpData.keyMetrics
      if (km && typeof km === 'object') {
        formatted += `\nKey Metrics (TTM):\n`
        formatted += `- P/E Ratio: ${km.peRatio || 'N/A'}\n`
        formatted += `- Price to Book: ${km.pbRatio || 'N/A'}\n`
        formatted += `- EV/Revenue: ${km.evToRevenue || 'N/A'}\n`
        formatted += `- EV/EBITDA: ${km.evToEbitda || 'N/A'}\n`
        formatted += `- ROE: ${((km.roe || 0) * 100).toFixed(2)}%\n`
        formatted += `- ROA: ${((km.roa || 0) * 100).toFixed(2)}%\n`
        formatted += `- Debt to Equity: ${km.debtToEquity || 'N/A'}\n`
      }
    }

    if (data.fmpData.financialRatios) {
      const ratios = Array.isArray(data.fmpData.financialRatios) ? data.fmpData.financialRatios[0] : data.fmpData.financialRatios
      if (ratios && typeof ratios === 'object') {
        formatted += `\nFinancial Ratios (TTM):\n`
        formatted += `- Current Ratio: ${ratios.currentRatio || 'N/A'}\n`
        formatted += `- Quick Ratio: ${ratios.quickRatio || 'N/A'}\n`
        formatted += `- Gross Profit Margin: ${((ratios.grossProfitMargin || 0) * 100).toFixed(2)}%\n`
        formatted += `- Operating Profit Margin: ${((ratios.operatingProfitMargin || 0) * 100).toFixed(2)}%\n`
        formatted += `- Net Profit Margin: ${((ratios.netProfitMargin || 0) * 100).toFixed(2)}%\n`
      }
    }

    if (data.fmpData.companyPeers && data.fmpData.companyPeers.length > 0) {
      formatted += `\nVergelijkbare bedrijven (Peers): ${data.fmpData.companyPeers.join(', ')}\n`
    }

    if (data.fmpData.analystEstimates && data.fmpData.analystEstimates.length > 0) {
      formatted += `\nAnalyst Estimates:\n`
      data.fmpData.analystEstimates.slice(0, 5).forEach((est: any, idx: number) => {
        formatted += `Q${idx + 1} ${est.date || 'N/A'}: Revenue ${est.revenueEstimated || 'N/A'}, EPS ${est.epsEstimated || 'N/A'}\n`
      })
    }
  }

  // SEC EDGAR data
  if (data.secData && data.secData.recentFilings) {
    formatted += `\n--- SEC EDGAR Filings ---\n`
    formatted += `Recente belangrijke filings:\n`
    data.secData.recentFilings.forEach((filing: any) => {
      formatted += `- ${filing.form} (${filing.date}): ${filing.description || 'Geen beschrijving'}\n`
    })
  }

  // Alpha Vantage data
  if (data.alphaVantageData) {
    formatted += `\n--- Alpha Vantage Data ---\n`
    
    if (data.alphaVantageData.overview) {
      const ov = data.alphaVantageData.overview
      formatted += `Company Overview:\n`
      formatted += `- Beschrijving: ${ov.Description || 'N/A'}\n`
      formatted += `- Sector: ${ov.Sector || 'N/A'}\n`
      formatted += `- Industrie: ${ov.Industry || 'N/A'}\n`
      formatted += `- Market Cap: ${ov.MarketCapitalization || 'N/A'}\n`
      formatted += `- P/E Ratio: ${ov.PERatio || 'N/A'}\n`
      formatted += `- PEG Ratio: ${ov.PEGRatio || 'N/A'}\n`
      formatted += `- Dividend Yield: ${ov.DividendYield || 'N/A'}\n`
      formatted += `- 52 Week High: ${ov['52WeekHigh'] || 'N/A'}\n`
      formatted += `- 52 Week Low: ${ov['52WeekLow'] || 'N/A'}\n`
    }

    if (data.alphaVantageData.earnings) {
      formatted += `\nEarnings Data:\n`
      if (data.alphaVantageData.earnings.annualEarnings) {
        formatted += `Jaarlijkse Earnings:\n`
        data.alphaVantageData.earnings.annualEarnings.slice(0, 5).forEach((earn: any) => {
          formatted += `- ${earn.fiscalDateEnding}: EPS ${earn.reportedEPS}\n`
        })
      }
    }
  }

  return formatted
}

