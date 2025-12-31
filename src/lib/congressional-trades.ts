import type { CongressionalTrade } from "@/app/api/stocks/congressional-trades/route"

export type { CongressionalTrade }

export type CongressionalTradesResponse = {
  trades: CongressionalTrade[]
  dataSource?: string
  dataTimestamp?: number
  count?: number
  total?: number
  politician?: string
  warning?: string
  error?: string
}

/**
 * Haal congressional trades op voor een specifieke politicus
 */
export async function fetchCongressionalTrades(
  politician: string = "Nancy Pelosi",
  limit: number = 100
): Promise<CongressionalTradesResponse> {
  try {
    const response = await fetch(
      `/api/stocks/congressional-trades?politician=${encodeURIComponent(politician)}&limit=${limit}`
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error(`[Congressional Trades] HTTP ${response.status}:`, errorData)
      throw new Error(errorData.error || `Failed to fetch congressional trades: ${response.status}`)
    }

    const data = await response.json()
    
    // Check voor warning in response
    if (data.warning) {
      console.warn("[Congressional Trades] Warning:", data.warning)
    }
    
    return {
      trades: data.trades || [],
      dataSource: data.dataSource || "Onbekend",
      dataTimestamp: data.dataTimestamp || Date.now(),
      count: data.count || 0,
      total: data.total || 0,
      politician: data.politician || politician,
      warning: data.warning,
      error: data.error,
    }
  } catch (error) {
    console.error("[Congressional Trades] Error fetching trades:", error)
    // Return lege response in plaats van te crashen
    return {
      trades: [],
      dataSource: "Geen data beschikbaar",
      dataTimestamp: Date.now(),
      count: 0,
      total: 0,
      politician: politician,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * Haal specifiek Nancy Pelosi trades op
 */
export async function fetchPelosiTrades(limit: number = 100): Promise<CongressionalTradesResponse> {
  return fetchCongressionalTrades("Nancy Pelosi", limit)
}

/**
 * Haal trades op voor een specifiek ticker symbool
 */
export async function fetchTradesByTicker(
  ticker: string,
  politician?: string,
  limit: number = 100
): Promise<CongressionalTradesResponse> {
  try {
    const params = new URLSearchParams({
      ticker,
      limit: limit.toString(),
    })
    
    if (politician) {
      params.append("politician", politician)
    }

    const response = await fetch(
      `/api/stocks/congressional-trades?${params.toString()}`
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch trades by ticker: ${response.status}`)
    }

    const data = await response.json()
    return {
      trades: data.trades || [],
      dataSource: data.dataSource || "Onbekend",
      dataTimestamp: data.dataTimestamp || Date.now(),
      count: data.count || 0,
      total: data.total || 0,
      politician: data.politician || politician,
      warning: data.warning,
      error: data.error,
    }
  } catch (error) {
    console.error("Error fetching trades by ticker:", error)
    return {
      trades: [],
      dataSource: "Geen data beschikbaar",
      dataTimestamp: Date.now(),
      count: 0,
      total: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * Parse amount string naar numerieke waarde (bijv. "$1,000,001 - $5,000,000" -> gemiddelde)
 */
export function parseAmount(amount: string): number | null {
  if (!amount || amount === "Unknown") {
    return null
  }

  // Verwijder $ en komma's
  const cleaned = amount.replace(/[$,]/g, "")

  // Check voor range (bijv. "$1,000,001 - $5,000,000")
  const rangeMatch = cleaned.match(/(\d+)\s*-\s*(\d+)/)
  if (rangeMatch) {
    const min = parseInt(rangeMatch[1])
    const max = parseInt(rangeMatch[2])
    return (min + max) / 2 // Return gemiddelde
  }

  // Check voor single value
  const singleMatch = cleaned.match(/(\d+)/)
  if (singleMatch) {
    return parseInt(singleMatch[1])
  }

  return null
}

/**
 * Format amount voor display
 */
export function formatAmount(amount: string | null | undefined): string {
  if (!amount || amount === "Unknown") {
    return "Onbekend"
  }
  return amount
}

/**
 * Format transaction type voor display
 */
export function formatTransactionType(type: string): string {
  const typeMap: Record<string, string> = {
    "Purchase": "Aankoop",
    "Sale": "Verkoop",
    "Exchange": "Wissel",
    "Sale (Full)": "Volledige Verkoop",
    "Sale (Partial)": "Gedeeltelijke Verkoop",
  }

  return typeMap[type] || type
}

