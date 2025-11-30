import { NextRequest, NextResponse } from "next/server"

function convertSymbol(symbol: string): string {
  const dutchSymbols: Record<string, string> = {
    ASML: "ASML.AS",
    PHIA: "PHIA.AS",
    INGA: "INGA.AS",
    RDSA: "RDSA.AS",
    UNA: "UNA.AS",
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

    // Yahoo Finance API endpoints voor fundamentele data
    const [summaryResponse, keyStatsResponse, financialsResponse] = await Promise.all([
      // Summary endpoint voor algemene bedrijfsinfo
      fetch(
        `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${yahooSymbol}?modules=summaryProfile,assetProfile`,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
        }
      ),
      // Key statistics endpoint voor kentallen
      fetch(
        `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${yahooSymbol}?modules=defaultKeyStatistics,financialData`,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
        }
      ),
      // Financials endpoint voor resultaten
      fetch(
        `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${yahooSymbol}?modules=incomeStatementHistory,balanceSheetHistory,cashflowStatementHistory`,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
        }
      ),
    ])

    const summaryData = summaryResponse.ok ? await summaryResponse.json() : null
    const keyStatsData = keyStatsResponse.ok ? await keyStatsResponse.json() : null
    const financialsData = financialsResponse.ok ? await financialsResponse.json() : null

    const result = summaryData?.quoteSummary?.result?.[0]
    const keyStats = keyStatsData?.quoteSummary?.result?.[0]
    const financials = financialsData?.quoteSummary?.result?.[0]

    // Extract relevante data
    const fundamentals = {
      // Bedrijfsinfo
      companyName: result?.summaryProfile?.longName || result?.summaryProfile?.shortName || symbol,
      sector: result?.summaryProfile?.sector || "N/A",
      industry: result?.summaryProfile?.industry || "N/A",
      description: result?.summaryProfile?.longBusinessSummary || "Geen beschrijving beschikbaar",
      
      // Key Statistics (kentallen)
      marketCap: keyStats?.defaultKeyStatistics?.marketCap?.raw || null,
      enterpriseValue: keyStats?.defaultKeyStatistics?.enterpriseValue?.raw || null,
      trailingPE: keyStats?.defaultKeyStatistics?.trailingPE?.raw || null,
      forwardPE: keyStats?.defaultKeyStatistics?.forwardPE?.raw || null,
      pegRatio: keyStats?.defaultKeyStatistics?.pegRatio?.raw || null,
      priceToBook: keyStats?.defaultKeyStatistics?.priceToBook?.raw || null,
      priceToSales: keyStats?.defaultKeyStatistics?.priceToSalesTrailing12Months?.raw || null,
      enterpriseToRevenue: keyStats?.defaultKeyStatistics?.enterpriseToRevenue?.raw || null,
      enterpriseToEbitda: keyStats?.defaultKeyStatistics?.enterpriseToEbitda?.raw || null,
      profitMargins: keyStats?.defaultKeyStatistics?.profitMargins?.raw || null,
      operatingMargins: keyStats?.defaultKeyStatistics?.operatingMargins?.raw || null,
      ebitdaMargins: keyStats?.defaultKeyStatistics?.ebitdaMargins?.raw || null,
      returnOnAssets: keyStats?.defaultKeyStatistics?.returnOnAssets?.raw || null,
      returnOnEquity: keyStats?.defaultKeyStatistics?.returnOnEquity?.raw || null,
      revenuePerShare: keyStats?.defaultKeyStatistics?.revenuePerShare?.raw || null,
      earningsPerShare: keyStats?.defaultKeyStatistics?.trailingEps?.raw || null,
      forwardEps: keyStats?.defaultKeyStatistics?.forwardEps?.raw || null,
      bookValue: keyStats?.defaultKeyStatistics?.bookValue?.raw || null,
      debtToEquity: keyStats?.defaultKeyStatistics?.debtToEquity?.raw || null,
      currentRatio: keyStats?.defaultKeyStatistics?.currentRatio?.raw || null,
      quickRatio: keyStats?.defaultKeyStatistics?.quickRatio?.raw || null,
      dividendYield: keyStats?.defaultKeyStatistics?.dividendYield?.raw || null,
      payoutRatio: keyStats?.defaultKeyStatistics?.payoutRatio?.raw || null,
      beta: keyStats?.defaultKeyStatistics?.beta?.raw || null,
      fiftyTwoWeekHigh: keyStats?.defaultKeyStatistics?.fiftyTwoWeekHigh?.raw || null,
      fiftyTwoWeekLow: keyStats?.defaultKeyStatistics?.fiftyTwoWeekLow?.raw || null,
      
      // Financial Data
      totalRevenue: keyStats?.financialData?.totalRevenue?.raw || null,
      revenueGrowth: keyStats?.financialData?.revenueGrowth?.raw || null,
      grossProfits: keyStats?.financialData?.grossProfits?.raw || null,
      freeCashflow: keyStats?.financialData?.freeCashflow?.raw || null,
      operatingCashflow: keyStats?.financialData?.operatingCashflow?.raw || null,
      earningsGrowth: keyStats?.financialData?.earningsGrowth?.raw || null,
      targetMeanPrice: keyStats?.financialData?.targetMeanPrice?.raw || null,
      targetHighPrice: keyStats?.financialData?.targetHighPrice?.raw || null,
      targetLowPrice: keyStats?.financialData?.targetLowPrice?.raw || null,
      numberOfAnalystOpinions: keyStats?.financialData?.numberOfAnalystOpinions?.raw || null,
      recommendationMean: keyStats?.financialData?.recommendationMean?.raw || null,
      recommendationKey: keyStats?.financialData?.recommendationKey || null,
      
      // Income Statement (laatste jaar)
      incomeStatement: financials?.incomeStatementHistory?.incomeStatementHistory?.slice(0, 4).map((item: any) => ({
        year: item.endDate?.fmt || "N/A",
        totalRevenue: item.totalRevenue?.raw || null,
        costOfRevenue: item.costOfRevenue?.raw || null,
        grossProfit: item.grossProfit?.raw || null,
        operatingIncome: item.operatingIncome?.raw || null,
        netIncome: item.netIncome?.raw || null,
        ebitda: item.ebitda?.raw || null,
      })) || [],
      
      // Balance Sheet (laatste jaar)
      balanceSheet: financials?.balanceSheetHistory?.balanceSheetStatements?.slice(0, 4).map((item: any) => ({
        year: item.endDate?.fmt || "N/A",
        totalAssets: item.totalAssets?.raw || null,
        totalLiab: item.totalLiab?.raw || null,
        totalStockholderEquity: item.totalStockholderEquity?.raw || null,
        totalCurrentAssets: item.totalCurrentAssets?.raw || null,
        totalCurrentLiabilities: item.totalCurrentLiabilities?.raw || null,
        cash: item.cash?.raw || null,
        longTermDebt: item.longTermDebt?.raw || null,
      })) || [],
      
      // Cash Flow (laatste jaar)
      cashFlow: financials?.cashflowStatementHistory?.cashflowStatements?.slice(0, 4).map((item: any) => ({
        year: item.endDate?.fmt || "N/A",
        totalCashFromOperatingActivities: item.totalCashFromOperatingActivities?.raw || null,
        capitalExpenditures: item.capitalExpenditures?.raw || null,
        dividendsPaid: item.dividendsPaid?.raw || null,
        netBorrowings: item.netBorrowings?.raw || null,
        freeCashFlow: item.totalCashFromOperatingActivities?.raw && item.capitalExpenditures?.raw 
          ? item.totalCashFromOperatingActivities.raw - Math.abs(item.capitalExpenditures.raw)
          : null,
      })) || [],
    }

    return NextResponse.json({ fundamentals })
  } catch (error) {
    console.error("Error fetching fundamentals:", error)
    return NextResponse.json(
      { error: "Fout bij ophalen fundamentele data", fundamentals: null },
      { status: 500 }
    )
  }
}

