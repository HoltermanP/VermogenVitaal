/**
 * Financial Data Aggregator
 * Combineert en valideert financiële data van meerdere bronnen
 * Zorgt ervoor dat er altijd zoveel mogelijk data beschikbaar is
 */

import { fetchEnhancedFinancialData, FinancialData } from './enhanced-financial-data'

// Helper functie om veilig values te extraheren
function extractValue(value: unknown): number | undefined {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const parsed = parseFloat(value)
    return isNaN(parsed) ? undefined : parsed
  }
  if (typeof value === 'object' && value !== null) {
    const obj = value as { fmt?: string; raw?: number }
    if (obj.raw !== undefined) return obj.raw
    if (obj.fmt) {
      const parsed = parseFloat(obj.fmt)
      return isNaN(parsed) ? undefined : parsed
    }
  }
  return undefined
}

// Type definitions voor financial statements
interface FinancialStatement {
  date?: string
  endDate?: string | { fmt?: string; raw?: number }
  fiscalDateEnding?: string
  [key: string]: unknown
}

interface EarningsData {
  fiscalDateEnding?: string
  reportedEPS?: string | number
  [key: string]: unknown
}

interface AggregatedFinancialData {
  // Basis info
  symbol: string
  companyName: string
  sector?: string
  industry?: string
  
  // Yahoo Finance data
  yahooData?: Record<string, unknown>
  
  // Enhanced data
  enhancedData?: FinancialData
  
  // Geaggregeerde cijfers (beste beschikbare waarde)
  marketCap?: number
  revenue?: number
  netIncome?: number
  earningsPerShare?: number
  priceToEarnings?: number
  priceToBook?: number
  returnOnEquity?: number
  returnOnAssets?: number
  debtToEquity?: number
  currentRatio?: number
  profitMargin?: number
  operatingMargin?: number
  
  // Financial statements (gecombineerd van alle bronnen)
  incomeStatements: FinancialStatement[]
  balanceSheets: FinancialStatement[]
  cashFlowStatements: FinancialStatement[]
  
  // Quarterly data
  quarterlyIncome: FinancialStatement[]
  quarterlyBalance: FinancialStatement[]
  quarterlyCashFlow: FinancialStatement[]
  
  // Earnings data
  earningsHistory: EarningsData[]
  earningsTrend: EarningsData[]
  
  // Data kwaliteit indicator
  dataQuality: {
    hasIncomeStatements: boolean
    hasBalanceSheets: boolean
    hasCashFlow: boolean
    hasQuarterlyData: boolean
    hasEarningsData: boolean
    sources: string[]
  }
}

/**
 * Combineer Yahoo Finance data met Enhanced Financial Data
 */
export function aggregateFinancialData(
  yahooFundamentals: Record<string, unknown>,
  enhancedData: FinancialData | null
): AggregatedFinancialData {
  const result: AggregatedFinancialData = {
    symbol: String(yahooFundamentals?.symbol || enhancedData?.symbol || ''),
    companyName: String(yahooFundamentals?.companyName || enhancedData?.companyName || ''),
    sector: yahooFundamentals?.sector ? String(yahooFundamentals.sector) : enhancedData?.sector,
    industry: yahooFundamentals?.industry ? String(yahooFundamentals.industry) : enhancedData?.industry,
    yahooData: yahooFundamentals,
    enhancedData: enhancedData || undefined,
    incomeStatements: [],
    balanceSheets: [],
    cashFlowStatements: [],
    quarterlyIncome: [],
    quarterlyBalance: [],
    quarterlyCashFlow: [],
    earningsHistory: [],
    earningsTrend: [],
    dataQuality: {
      hasIncomeStatements: false,
      hasBalanceSheets: false,
      hasCashFlow: false,
      hasQuarterlyData: false,
      hasEarningsData: false,
      sources: []
    }
  }

  // Combineer income statements
  if (yahooFundamentals?.incomeStatement && Array.isArray(yahooFundamentals.incomeStatement) && yahooFundamentals.incomeStatement.length > 0) {
    result.incomeStatements.push(...yahooFundamentals.incomeStatement)
    result.dataQuality.hasIncomeStatements = true
    result.dataQuality.sources.push('Yahoo Finance')
  }
  
  if (enhancedData?.fmpData?.incomeStatement && enhancedData.fmpData.incomeStatement.length > 0) {
    // Voeg FMP data toe als het niet al bestaat
    const existingDates = new Set(result.incomeStatements.map((s: FinancialStatement) => {
      const date = (typeof s.endDate === 'object' && s.endDate?.fmt) || (typeof s.endDate === 'object' && s.endDate?.raw) || s.date
      return date
    }))
    
    enhancedData.fmpData.incomeStatement.forEach((statement: FinancialStatement) => {
      const date = statement.date || statement.calendarYear
      if (date !== undefined && date !== null && !existingDates.has(String(date))) {
        result.incomeStatements.push(statement)
      }
    })
    
    if (!result.dataQuality.hasIncomeStatements) {
      result.dataQuality.hasIncomeStatements = true
    }
    if (!result.dataQuality.sources.includes('Financial Modeling Prep')) {
      result.dataQuality.sources.push('Financial Modeling Prep')
    }
  }

  // Combineer balance sheets
  if (yahooFundamentals?.balanceSheet && Array.isArray(yahooFundamentals.balanceSheet) && yahooFundamentals.balanceSheet.length > 0) {
    result.balanceSheets.push(...yahooFundamentals.balanceSheet)
    result.dataQuality.hasBalanceSheets = true
    if (!result.dataQuality.sources.includes('Yahoo Finance')) {
      result.dataQuality.sources.push('Yahoo Finance')
    }
  }
  
  if (enhancedData?.fmpData?.balanceSheet && enhancedData.fmpData.balanceSheet.length > 0) {
    const existingDates = new Set(result.balanceSheets.map((s: FinancialStatement) => {
      const date = (typeof s.endDate === 'object' && s.endDate?.fmt) ? s.endDate.fmt :
                   (typeof s.endDate === 'object' && s.endDate?.raw) ? s.endDate.raw :
                   s.endDate || s.date
      return date
    }))
    
    enhancedData.fmpData.balanceSheet.forEach((sheet: FinancialStatement) => {
      const date = sheet.date || sheet.calendarYear
      if (date !== undefined && date !== null && !existingDates.has(String(date))) {
        result.balanceSheets.push(sheet)
      }
    })
    
    if (!result.dataQuality.hasBalanceSheets) {
      result.dataQuality.hasBalanceSheets = true
    }
    if (!result.dataQuality.sources.includes('Financial Modeling Prep')) {
      result.dataQuality.sources.push('Financial Modeling Prep')
    }
  }

  // Combineer cash flow statements
  if (yahooFundamentals?.cashFlow && Array.isArray(yahooFundamentals.cashFlow) && yahooFundamentals.cashFlow.length > 0) {
    result.cashFlowStatements.push(...yahooFundamentals.cashFlow)
    result.dataQuality.hasCashFlow = true
    if (!result.dataQuality.sources.includes('Yahoo Finance')) {
      result.dataQuality.sources.push('Yahoo Finance')
    }
  }
  
  if (enhancedData?.fmpData?.cashFlow && enhancedData.fmpData.cashFlow.length > 0) {
    const existingDates = new Set(result.cashFlowStatements.map((s: FinancialStatement) => {
      const date = (typeof s.endDate === 'object' && s.endDate?.fmt) ? s.endDate.fmt :
                   (typeof s.endDate === 'object' && s.endDate?.raw) ? s.endDate.raw :
                   s.endDate || s.date
      return date
    }))
    
    enhancedData.fmpData.cashFlow.forEach((flow: FinancialStatement) => {
      const date = flow.date || flow.calendarYear
      if (date !== undefined && date !== null && !existingDates.has(String(date))) {
        result.cashFlowStatements.push(flow)
      }
    })
    
    if (!result.dataQuality.hasCashFlow) {
      result.dataQuality.hasCashFlow = true
    }
    if (!result.dataQuality.sources.includes('Financial Modeling Prep')) {
      result.dataQuality.sources.push('Financial Modeling Prep')
    }
  }

  // Quarterly data
  if (yahooFundamentals?.quarterlyIncome && Array.isArray(yahooFundamentals.quarterlyIncome) && yahooFundamentals.quarterlyIncome.length > 0) {
    result.quarterlyIncome.push(...yahooFundamentals.quarterlyIncome)
    result.dataQuality.hasQuarterlyData = true
  }
  
  if (yahooFundamentals?.quarterlyBalance && Array.isArray(yahooFundamentals.quarterlyBalance) && yahooFundamentals.quarterlyBalance.length > 0) {
    result.quarterlyBalance.push(...yahooFundamentals.quarterlyBalance)
  }
  
  if (yahooFundamentals?.quarterlyCashFlow && Array.isArray(yahooFundamentals.quarterlyCashFlow) && yahooFundamentals.quarterlyCashFlow.length > 0) {
    result.quarterlyCashFlow.push(...yahooFundamentals.quarterlyCashFlow)
  }

  // Earnings data
  if (yahooFundamentals?.earningsHistory && Array.isArray(yahooFundamentals.earningsHistory) && yahooFundamentals.earningsHistory.length > 0) {
    result.earningsHistory.push(...yahooFundamentals.earningsHistory)
    result.dataQuality.hasEarningsData = true
  }
  
  if (enhancedData?.alphaVantageData?.earnings?.annualEarnings) {
    enhancedData.alphaVantageData.earnings.annualEarnings.forEach((earn: EarningsData) => {
      result.earningsHistory.push({
        fiscalDateEnding: earn.fiscalDateEnding,
        reportedEPS: earn.reportedEPS
      })
    })
    if (!result.dataQuality.hasEarningsData) {
      result.dataQuality.hasEarningsData = true
    }
    if (!result.dataQuality.sources.includes('Alpha Vantage')) {
      result.dataQuality.sources.push('Alpha Vantage')
    }
  }
  
  if (yahooFundamentals?.earningsTrend && Array.isArray(yahooFundamentals.earningsTrend) && yahooFundamentals.earningsTrend.length > 0) {
    result.earningsTrend.push(...yahooFundamentals.earningsTrend)
  }

  // Aggregeer key metrics (gebruik beste beschikbare waarde)
  result.marketCap = (typeof yahooFundamentals?.marketCap === 'number' ? yahooFundamentals.marketCap : undefined) ||
                     extractValue(enhancedData?.fmpData?.profile?.mktCap) ||
                     extractValue(enhancedData?.alphaVantageData?.overview?.MarketCapitalization) ||
                     undefined

  result.earningsPerShare = (typeof yahooFundamentals?.earningsPerShare === 'number' ? yahooFundamentals.earningsPerShare : undefined) ||
                            extractValue(enhancedData?.fmpData?.keyMetrics?.peRatio) ||
                            undefined

  result.priceToEarnings = (typeof yahooFundamentals?.trailingPE === 'number' ? yahooFundamentals.trailingPE : undefined) ||
                           extractValue(enhancedData?.fmpData?.keyMetrics?.peRatio) ||
                           extractValue(enhancedData?.alphaVantageData?.overview?.PERatio) ||
                           undefined

  result.priceToBook = (typeof yahooFundamentals?.priceToBook === 'number' ? yahooFundamentals.priceToBook : undefined) ||
                       extractValue(enhancedData?.fmpData?.keyMetrics?.pbRatio) ||
                       extractValue(enhancedData?.alphaVantageData?.overview?.PriceToBookRatio) ||
                       undefined

  result.returnOnEquity = (typeof yahooFundamentals?.returnOnEquity === 'number' ? yahooFundamentals.returnOnEquity : undefined) ||
                          extractValue(enhancedData?.fmpData?.keyMetrics?.roe) ||
                          extractValue(enhancedData?.alphaVantageData?.overview?.ReturnOnEquityTTM) ||
                          undefined

  result.returnOnAssets = (typeof yahooFundamentals?.returnOnAssets === 'number' ? yahooFundamentals.returnOnAssets : undefined) ||
                           extractValue(enhancedData?.fmpData?.keyMetrics?.roa) ||
                           extractValue(enhancedData?.alphaVantageData?.overview?.ReturnOnAssetsTTM) ||
                           undefined

  result.debtToEquity = (typeof yahooFundamentals?.debtToEquity === 'number' ? yahooFundamentals.debtToEquity : undefined) ||
                        extractValue(enhancedData?.fmpData?.keyMetrics?.debtToEquity) ||
                        extractValue(enhancedData?.alphaVantageData?.overview?.DebtToEquity) ||
                        undefined

  result.currentRatio = (typeof yahooFundamentals?.currentRatio === 'number' ? yahooFundamentals.currentRatio : undefined) ||
                        extractValue(enhancedData?.fmpData?.financialRatios?.currentRatio) ||
                        undefined

  result.profitMargin = (typeof yahooFundamentals?.profitMargins === 'number' ? yahooFundamentals.profitMargins : undefined) ||
                        extractValue(enhancedData?.fmpData?.financialRatios?.netProfitMargin) ||
                        extractValue(enhancedData?.alphaVantageData?.overview?.ProfitMargin) ||
                        undefined

  result.operatingMargin = (typeof yahooFundamentals?.operatingMargins === 'number' ? yahooFundamentals.operatingMargins : undefined) ||
                           (typeof enhancedData?.fmpData?.financialRatios?.operatingProfitMargin === 'number' ? enhancedData.fmpData.financialRatios.operatingProfitMargin : undefined) ||
                           undefined

  // Haal revenue en net income uit meest recente income statement
  if (result.incomeStatements.length > 0) {
    const latestIncome = result.incomeStatements[0]
    result.revenue = extractValue(latestIncome.totalRevenue) || extractValue(latestIncome.revenue) || extractValue(latestIncome.totalRevenue)
    result.netIncome = extractValue(latestIncome.netIncome) || extractValue(latestIncome.netIncome)
  }

  // Sorteer statements op datum (nieuwste eerst)
  result.incomeStatements.sort((a: FinancialStatement, b: FinancialStatement) => {
    const getDateString = (stmt: FinancialStatement): string => {
      if (typeof stmt.endDate === 'object' && stmt.endDate !== null && 'fmt' in stmt.endDate) {
        return String(stmt.endDate.fmt || '')
      }
      if (typeof stmt.endDate === 'object' && stmt.endDate !== null && 'raw' in stmt.endDate) {
        return String(stmt.endDate.raw || '')
      }
      return String(stmt.endDate || stmt.date || '')
    }
    const dateA = getDateString(a)
    const dateB = getDateString(b)
    return String(dateB).localeCompare(String(dateA))
  })

  result.balanceSheets.sort((a: FinancialStatement, b: FinancialStatement) => {
    const getDateString = (stmt: FinancialStatement): string => {
      if (typeof stmt.endDate === 'object' && stmt.endDate !== null && 'fmt' in stmt.endDate) {
        return String(stmt.endDate.fmt || '')
      }
      if (typeof stmt.endDate === 'object' && stmt.endDate !== null && 'raw' in stmt.endDate) {
        return String(stmt.endDate.raw || '')
      }
      return String(stmt.endDate || stmt.date || '')
    }
    const dateA = getDateString(a)
    const dateB = getDateString(b)
    return String(dateB).localeCompare(String(dateA))
  })

  result.cashFlowStatements.sort((a: FinancialStatement, b: FinancialStatement) => {
    const getDateString = (stmt: FinancialStatement): string => {
      if (typeof stmt.endDate === 'object' && stmt.endDate !== null && 'fmt' in stmt.endDate) {
        return String(stmt.endDate.fmt || '')
      }
      if (typeof stmt.endDate === 'object' && stmt.endDate !== null && 'raw' in stmt.endDate) {
        return String(stmt.endDate.raw || '')
      }
      return String(stmt.endDate || stmt.date || '')
    }
    const dateA = getDateString(a)
    const dateB = getDateString(b)
    return String(dateB).localeCompare(String(dateA))
  })

  return result
}

/**
 * Format geaggregeerde data voor AI prompt
 */
export function formatAggregatedFinancialData(data: AggregatedFinancialData): string {
  let formatted = `\n=== FINANCIËLE DATA (Geaggregeerd van ${data.dataQuality.sources.join(', ')}) ===\n`

  // Data kwaliteit indicator
  formatted += `\nDATA KWALITEIT:\n`
  formatted += `- Income Statements: ${data.dataQuality.hasIncomeStatements ? `✅ (${data.incomeStatements.length} jaar)` : '❌ Ontbrekend'}\n`
  formatted += `- Balance Sheets: ${data.dataQuality.hasBalanceSheets ? `✅ (${data.balanceSheets.length} jaar)` : '❌ Ontbrekend'}\n`
  formatted += `- Cash Flow Statements: ${data.dataQuality.hasCashFlow ? `✅ (${data.cashFlowStatements.length} jaar)` : '❌ Ontbrekend'}\n`
  formatted += `- Quarterly Data: ${data.dataQuality.hasQuarterlyData ? '✅' : '❌ Ontbrekend'}\n`
  formatted += `- Earnings Data: ${data.dataQuality.hasEarningsData ? `✅ (${data.earningsHistory.length} periodes)` : '❌ Ontbrekend'}\n`

  // Key metrics
  formatted += `\nBELANGRIJKE KENTALLEN:\n`
  if (data.marketCap) {
    formatted += `- Marktkapitalisatie: $${(data.marketCap / 1e9).toFixed(2)}B\n`
  }
  if (data.revenue) {
    formatted += `- Revenue (meest recent): $${(data.revenue / 1e9).toFixed(2)}B\n`
  }
  if (data.netIncome) {
    formatted += `- Netto Inkomen (meest recent): $${(data.netIncome / 1e9).toFixed(2)}B\n`
  }
  if (data.earningsPerShare) {
    formatted += `- Earnings per Share: $${data.earningsPerShare.toFixed(2)}\n`
  }
  if (data.priceToEarnings) {
    formatted += `- P/E Ratio: ${data.priceToEarnings.toFixed(2)}\n`
  }
  if (data.priceToBook) {
    formatted += `- Price to Book: ${data.priceToBook.toFixed(2)}\n`
  }
  if (data.returnOnEquity) {
    formatted += `- Return on Equity: ${(data.returnOnEquity * 100).toFixed(2)}%\n`
  }
  if (data.returnOnAssets) {
    formatted += `- Return on Assets: ${(data.returnOnAssets * 100).toFixed(2)}%\n`
  }
  if (data.debtToEquity) {
    formatted += `- Debt to Equity: ${data.debtToEquity.toFixed(2)}\n`
  }
  if (data.currentRatio) {
    formatted += `- Current Ratio: ${data.currentRatio.toFixed(2)}\n`
  }
  if (data.profitMargin) {
    formatted += `- Profit Margin: ${(data.profitMargin * 100).toFixed(2)}%\n`
  }
  if (data.operatingMargin) {
    formatted += `- Operating Margin: ${(data.operatingMargin * 100).toFixed(2)}%\n`
  }

  // Helper functie voor formatting
  const formatFinancialValue = (value: number | null | undefined, isPercentage = false, isCurrency = false) => {
    if (value === null || value === undefined || isNaN(value)) return 'N/A'
    if (isPercentage) return `${(value * 100).toFixed(2)}%`
    if (isCurrency) {
      if (Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
      if (Math.abs(value) >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
      if (Math.abs(value) >= 1e3) return `$${(value / 1e3).toFixed(2)}K`
      return `$${value.toFixed(2)}`
    }
    return value.toFixed(2)
  }

  // Income statements - GEDETAILLEERD
  if (data.incomeStatements.length > 0) {
    formatted += `\n=== INCOME STATEMENTS (${data.incomeStatements.length} jaar beschikbaar) ===\n`
    data.incomeStatements.slice(0, 10).forEach((stmt: FinancialStatement, idx: number) => {
      const getDateString = (stmt: FinancialStatement): string => {
        if (typeof stmt.endDate === 'object' && stmt.endDate !== null && 'fmt' in stmt.endDate) {
          return String(stmt.endDate.fmt || '')
        }
        if (typeof stmt.endDate === 'object' && stmt.endDate !== null && 'raw' in stmt.endDate) {
          return String(stmt.endDate.raw || '')
        }
        return String(stmt.endDate || stmt.date || stmt.calendarYear || `Jaar ${idx + 1}`)
      }
      const date = getDateString(stmt)
      formatted += `\nJaar ${date}:\n`
      formatted += `- Totale Omzet (Revenue): ${formatFinancialValue(extractValue(stmt.totalRevenue) || extractValue(stmt.revenue) || extractValue(stmt.totalRevenue), false, true)}\n`
      formatted += `- Kosten van Omzet (COGS): ${formatFinancialValue(extractValue(stmt.costOfRevenue) || extractValue(stmt.costOfRevenue) || extractValue(stmt.costOfGoodsSold), false, true)}\n`
      formatted += `- Bruto Winst (Gross Profit): ${formatFinancialValue(extractValue(stmt.grossProfit) || extractValue(stmt.grossProfit), false, true)}\n`
      formatted += `- Research & Development: ${formatFinancialValue(extractValue(stmt.researchDevelopment) || extractValue(stmt.researchAndDevelopment) || extractValue(stmt.researchDevelopment), false, true)}\n`
      formatted += `- Verkoop, Algemeen & Administratief (SG&A): ${formatFinancialValue(extractValue(stmt.sellingGeneralAdministrative) || extractValue(stmt.sellingGeneralAndAdministrative) || extractValue(stmt.sellingGeneralAdministrative), false, true)}\n`
      formatted += `- Operationeel Inkomen (Operating Income): ${formatFinancialValue(extractValue(stmt.operatingIncome) || extractValue(stmt.operatingIncome), false, true)}\n`
      formatted += `- EBITDA: ${formatFinancialValue(extractValue(stmt.ebitda) || extractValue(stmt.ebitda), false, true)}\n`
      formatted += `- Rente Kosten: ${formatFinancialValue(extractValue(stmt.interestExpense) || extractValue(stmt.interestExpense), false, true)}\n`
      formatted += `- Belastingen: ${formatFinancialValue(extractValue(stmt.incomeTaxExpense) || extractValue(stmt.incomeTaxExpense) || extractValue(stmt.taxProvision), false, true)}\n`
      formatted += `- Netto Inkomen (Net Income): ${formatFinancialValue(extractValue(stmt.netIncome) || extractValue(stmt.netIncome), false, true)}\n`
      formatted += `- Netto Inkomen per Aandeel (EPS): ${formatFinancialValue(extractValue(stmt.netIncomeCommonStockholders) || extractValue(stmt.netIncomeCommonStockholders), false, true)}\n`
      
      // Bereken marges als data beschikbaar is
      const revenue = extractValue(stmt.totalRevenue) || extractValue(stmt.revenue) || extractValue(stmt.totalRevenue)
      if (revenue && revenue > 0) {
        const grossProfit = extractValue(stmt.grossProfit) || extractValue(stmt.grossProfit)
        const operatingIncome = extractValue(stmt.operatingIncome) || extractValue(stmt.operatingIncome)
        const netIncome = extractValue(stmt.netIncome) || extractValue(stmt.netIncome)
        
        if (grossProfit) formatted += `- Bruto Winstmarge: ${formatFinancialValue(grossProfit / revenue, true)}\n`
        if (operatingIncome) formatted += `- Operationele Marge: ${formatFinancialValue(operatingIncome / revenue, true)}\n`
        if (netIncome) formatted += `- Netto Winstmarge: ${formatFinancialValue(netIncome / revenue, true)}\n`
      }
    })
  }

  // Balance sheets - GEDETAILLEERD
  if (data.balanceSheets.length > 0) {
    formatted += `\n=== BALANCE SHEETS (${data.balanceSheets.length} jaar beschikbaar) ===\n`
    data.balanceSheets.slice(0, 10).forEach((sheet: FinancialStatement, idx: number) => {
      const getDateString = (stmt: FinancialStatement): string => {
        if (typeof stmt.endDate === 'object' && stmt.endDate !== null && 'fmt' in stmt.endDate) {
          return String(stmt.endDate.fmt || '')
        }
        if (typeof stmt.endDate === 'object' && stmt.endDate !== null && 'raw' in stmt.endDate) {
          return String(stmt.endDate.raw || '')
        }
        return String(stmt.endDate || stmt.date || stmt.calendarYear || `Jaar ${idx + 1}`)
      }
      const date = getDateString(sheet)
      formatted += `\nJaar ${date}:\n`
      formatted += `ACTIVA:\n`
      formatted += `- Cash en Equivalenten: ${formatFinancialValue(extractValue(sheet.cash) || extractValue(sheet.cashAndCashEquivalents), false, true)}\n`
      formatted += `- Kortlopende Investeringen: ${formatFinancialValue(extractValue(sheet.shortTermInvestments), false, true)}\n`
      formatted += `- Vorderingen (Accounts Receivable): ${formatFinancialValue(extractValue(sheet.netReceivables) || extractValue(sheet.accountsReceivable), false, true)}\n`
      formatted += `- Voorraden (Inventory): ${formatFinancialValue(extractValue(sheet.inventory), false, true)}\n`
      formatted += `- Vlottende Activa (Current Assets): ${formatFinancialValue(extractValue(sheet.totalCurrentAssets), false, true)}\n`
      formatted += `- Vaste Activa (Property, Plant & Equipment): ${formatFinancialValue(extractValue(sheet.propertyPlantEquipment) || extractValue(sheet.propertyPlantEquipmentNet), false, true)}\n`
      formatted += `- Goodwill: ${formatFinancialValue(extractValue(sheet.goodWill) || extractValue(sheet.goodwill), false, true)}\n`
      formatted += `- Immateriële Activa (Intangible Assets): ${formatFinancialValue(extractValue(sheet.intangibleAssets), false, true)}\n`
      formatted += `- Totale Activa: ${formatFinancialValue(extractValue(sheet.totalAssets), false, true)}\n`
      
      formatted += `PASSIVA:\n`
      formatted += `- Kortlopende Schulden (Current Liabilities): ${formatFinancialValue(extractValue(sheet.totalCurrentLiabilities), false, true)}\n`
      formatted += `- Langlopende Schuld (Long Term Debt): ${formatFinancialValue(extractValue(sheet.longTermDebt), false, true)}\n`
      formatted += `- Totale Schulden (Total Liabilities): ${formatFinancialValue(extractValue(sheet.totalLiab) || extractValue(sheet.totalLiabilities), false, true)}\n`
      formatted += `- Eigen Vermogen (Stockholders Equity): ${formatFinancialValue(extractValue(sheet.totalStockholderEquity) || extractValue(sheet.commonStock), false, true)}\n`
      formatted += `- Retained Earnings: ${formatFinancialValue(extractValue(sheet.retainedEarnings), false, true)}\n`
      
      // Bereken ratios als data beschikbaar is
      const totalAssets = extractValue(sheet.totalAssets)
      const totalLiabilities = extractValue(sheet.totalLiab) || extractValue(sheet.totalLiabilities)
      const equity = extractValue(sheet.totalStockholderEquity)
      const currentAssets = extractValue(sheet.totalCurrentAssets)
      const currentLiabilities = extractValue(sheet.totalCurrentLiabilities)
      
      if (equity && equity > 0 && totalLiabilities) {
        formatted += `- Debt to Equity Ratio: ${formatFinancialValue(totalLiabilities / equity)}\n`
      }
      if (currentAssets && currentLiabilities && currentLiabilities > 0) {
        formatted += `- Current Ratio: ${formatFinancialValue(currentAssets / currentLiabilities)}\n`
      }
    })
  }

  // Cash flow statements - GEDETAILLEERD
  if (data.cashFlowStatements.length > 0) {
    formatted += `\n=== CASH FLOW STATEMENTS (${data.cashFlowStatements.length} jaar beschikbaar) ===\n`
    data.cashFlowStatements.slice(0, 10).forEach((flow: FinancialStatement, idx: number) => {
      const getDateString = (stmt: FinancialStatement): string => {
        if (typeof stmt.endDate === 'object' && stmt.endDate !== null && 'fmt' in stmt.endDate) {
          return String(stmt.endDate.fmt || '')
        }
        if (typeof stmt.endDate === 'object' && stmt.endDate !== null && 'raw' in stmt.endDate) {
          return String(stmt.endDate.raw || '')
        }
        return String(stmt.endDate || stmt.date || stmt.calendarYear || `Jaar ${idx + 1}`)
      }
      const date = getDateString(flow)
      formatted += `\nJaar ${date}:\n`
      
      const operating = extractValue(flow.totalCashFromOperatingActivities) || extractValue(flow.operatingCashFlow) || extractValue(flow.netCashProvidedByOperatingActivities)
      const capex = extractValue(flow.capitalExpenditures) || extractValue(flow.capitalExpenditure)
      const investing = extractValue(flow.totalCashflowsFromInvestingActivities) || extractValue(flow.investingCashFlow) || extractValue(flow.netCashUsedForInvestingActivites)
      const financing = extractValue(flow.totalCashFromFinancingActivities) || extractValue(flow.financingCashFlow) || extractValue(flow.netCashUsedProvidedByFinancingActivities)
      const dividends = extractValue(flow.dividendsPaid)
      const netBorrowings = extractValue(flow.netBorrowings)
      const freeCashFlow = operating !== undefined && capex !== undefined ? operating - Math.abs(capex) : null
      
      formatted += `OPERATING ACTIVITIES:\n`
      formatted += `- Netto Cash van Operationele Activiteiten: ${formatFinancialValue(operating, false, true)}\n`
      formatted += `- Netto Inkomen: ${formatFinancialValue(extractValue(flow.netIncome), false, true)}\n`
      formatted += `- Depreciatie & Amortisatie: ${formatFinancialValue(extractValue(flow.depreciation) || extractValue(flow.depreciationAndAmortization), false, true)}\n`
      formatted += `- Verandering in Working Capital: ${formatFinancialValue(extractValue(flow.changeInWorkingCapital), false, true)}\n`
      
      formatted += `INVESTING ACTIVITIES:\n`
      formatted += `- Capital Expenditures (CapEx): ${formatFinancialValue(capex, false, true)}\n`
      formatted += `- Netto Cash van Investeringen: ${formatFinancialValue(investing, false, true)}\n`
      
      formatted += `FINANCING ACTIVITIES:\n`
      formatted += `- Dividenden Betaald: ${formatFinancialValue(dividends, false, true)}\n`
      formatted += `- Netto Leningen: ${formatFinancialValue(netBorrowings, false, true)}\n`
      formatted += `- Netto Cash van Financiering: ${formatFinancialValue(financing, false, true)}\n`
      
      formatted += `TOTAAL:\n`
      const changeInCash = extractValue(flow.changeInCash) || (operating !== undefined && investing !== undefined && financing !== undefined ? operating + investing + financing : null)
      formatted += `- Free Cash Flow: ${formatFinancialValue(freeCashFlow, false, true)}\n`
      formatted += `- Netto Verandering in Cash: ${formatFinancialValue(changeInCash, false, true)}\n`
    })
  }

  // Quarterly data - GEDETAILLEERD
  if (data.quarterlyIncome.length > 0) {
    formatted += `\n=== QUARTERLY INCOME STATEMENTS (${data.quarterlyIncome.length} kwartalen) ===\n`
    data.quarterlyIncome.slice(0, 8).forEach((q: FinancialStatement, idx: number) => {
      const getDateString = (stmt: FinancialStatement): string => {
        if (typeof stmt.endDate === 'object' && stmt.endDate !== null && 'fmt' in stmt.endDate) {
          return String(stmt.endDate.fmt || '')
        }
        if (typeof stmt.endDate === 'object' && stmt.endDate !== null && 'raw' in stmt.endDate) {
          return String(stmt.endDate.raw || '')
        }
        return String(stmt.endDate || stmt.date || `Q${idx + 1}`)
      }
      const date = getDateString(q)
      formatted += `\nKwartaal ${date}:\n`
      formatted += `- Totale Omzet: ${formatFinancialValue(extractValue(q.totalRevenue) || extractValue(q.revenue), false, true)}\n`
      formatted += `- Bruto Winst: ${formatFinancialValue(extractValue(q.grossProfit), false, true)}\n`
      formatted += `- Operationeel Inkomen: ${formatFinancialValue(extractValue(q.operatingIncome), false, true)}\n`
      formatted += `- Netto Inkomen: ${formatFinancialValue(extractValue(q.netIncome), false, true)}\n`
      formatted += `- Earnings per Share: ${formatFinancialValue(extractValue(q.netIncomeCommonStockholders), false, true)}\n`
    })
  }

  // Earnings history
  if (data.earningsHistory.length > 0) {
    formatted += `\nEARNINGS GESCHIEDENIS:\n`
    data.earningsHistory.slice(0, 8).forEach((earn: EarningsData) => {
      const date = earn.fiscalDateEnding || (earn as Record<string, unknown>).quarter || (earn as Record<string, unknown>).date || 'N/A'
      const eps = typeof earn.reportedEPS === 'number' || typeof earn.reportedEPS === 'string' 
        ? earn.reportedEPS 
        : extractValue((earn as Record<string, unknown>).actual) || 'N/A'
      const estimate = typeof (earn as Record<string, unknown>).estimatedEPS === 'number' || typeof (earn as Record<string, unknown>).estimatedEPS === 'string'
        ? (earn as Record<string, unknown>).estimatedEPS
        : extractValue((earn as Record<string, unknown>).estimate) || 'N/A'
      formatted += `${date}: Actual EPS ${eps}, Estimate ${estimate}\n`
    })
  }

  return formatted
}

