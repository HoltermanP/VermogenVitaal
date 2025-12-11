import { NextRequest, NextResponse } from "next/server"

export type CongressionalTrade = {
  representative: string
  party: string
  state: string
  district?: string
  ticker: string
  company: string
  transactionType: string
  amount: string
  transactionDate: string
  disclosureDate: string
  owner?: string
  assetDescription?: string
}

// Cache voor de data (5 minuten)
let cachedData: CongressionalTrade[] | null = null
let cacheTimestamp: number = 0
let cachedDataSource: string | null = null
const CACHE_DURATION = 5 * 60 * 1000 // 5 minuten

// Functie om cache te legen (voor testing)
export function clearCache() {
  cachedData = null
  cacheTimestamp = 0
  cachedDataSource = null
}

type FetchResult = {
  trades: CongressionalTrade[]
  dataSource: string
  dataTimestamp: number
}

// Raw trade data interface voor verschillende data bronnen
interface RawTradeData {
  representative?: string
  politician?: string
  name?: string
  Representative?: string
  politician_name?: string
  politicianName?: string
  party?: string
  partyName?: string
  stateName?: string
  Party?: string
  state?: string
  State?: string
  district?: string
  District?: string
  ticker?: string
  symbol?: string
  Ticker?: string
  Symbol?: string
  stock_symbol?: string
  stockSymbol?: string
  issuer_ticker?: string
  issuer_name?: string
  company?: string
  stockName?: string
  Company?: string
  StockName?: string
  stock_name?: string
  company_name?: string
  companyName?: string
  transaction_type?: string
  transactionType?: string
  TransactionType?: string
  type?: string
  Transaction?: string
  Type?: string
  action?: string
  amount?: string
  Amount?: string
  value?: string
  Value?: string
  amountRange?: string
  amount_range?: string
  transaction_amount?: string
  transactionAmount?: string
  transaction_date?: string
  transactionDate?: string
  TransactionDate?: string
  tradedDate?: string
  traded_date?: string
  date?: string
  Date?: string
  disclosure_date?: string
  disclosureDate?: string
  DisclosureDate?: string
  filedDate?: string
  FiledDate?: string
  filed_date?: string
  publicationDate?: string
  publication_date?: string
  owner?: string
  Owner?: string
  owner_type?: string
  asset_description?: string
  assetDescription?: string
  AssetDescription?: string
  description?: string
  Description?: string
}

async function fetchAllTrades(politician: string = "Nancy Pelosi"): Promise<FetchResult> {
  // Check cache
  const now = Date.now()
  if (cachedData && cachedDataSource && (now - cacheTimestamp) < CACHE_DURATION) {
    return {
      trades: cachedData,
      dataSource: cachedDataSource,
      dataTimestamp: cacheTimestamp,
    }
  }

  // Probeer verschillende data bronnen
  const poliApiKey = process.env.POLIAPI_API_KEY
  const rapidApiKey = process.env.RAPIDAPI_KEY
  const rapidApiHost = process.env.RAPIDAPI_HOST || "politician-trade-tracker1.p.rapidapi.com"
  const encodedPolitician = encodeURIComponent(politician)
  
  // PROBEER EERST GITHUB REPOSITORIES (GRATIS, OPEN SOURCE) - PRIMAIRE BRON
  const githubEndpoints = [
    {
      url: "https://raw.githubusercontent.com/washingtonpost/data-congressional-trading/main/all_transactions.json",
      name: "Washington Post GitHub Repository",
    },
    {
      url: "https://raw.githubusercontent.com/unusualwhales/congress-trading/main/data/all_transactions.json",
      name: "Unusual Whales GitHub Repository",
    },
    {
      url: "https://raw.githubusercontent.com/QuiverQuant/congressional-trading-data/main/data/all_transactions.json",
      name: "Quiver Quantitative GitHub Repository",
    },
    {
      url: "https://raw.githubusercontent.com/congressional-trading/congressional-trading-data/main/all_transactions.json",
      name: "Congressional Trading Data GitHub",
    },
    {
      url: "https://raw.githubusercontent.com/opensecrets/congressional-trading/main/data/all_transactions.json",
      name: "OpenSecrets GitHub Repository",
    },
    {
      url: "https://raw.githubusercontent.com/unitedstates/congress-legislators/main/data/all_transactions.json",
      name: "United States Congress Legislators GitHub",
    },
    {
      url: "https://raw.githubusercontent.com/govtrack/us-congress-legislators/main/data/trades.json",
      name: "GovTrack Congressional Trades",
    },
    {
      url: "https://raw.githubusercontent.com/congressional-stock-watcher/data/main/all_transactions.json",
      name: "Congressional Stock Watcher GitHub",
    },
    {
      url: "https://raw.githubusercontent.com/pelosi-tracker/data/main/trades.json",
      name: "Pelosi Tracker GitHub",
    },
    {
      url: "https://raw.githubusercontent.com/congress-trades/data/main/all_transactions.json",
      name: "Congress Trades GitHub",
    },
    {
      url: "https://raw.githubusercontent.com/stock-watcher/congressional-trades/main/data/all_transactions.json",
      name: "Stock Watcher Congressional Trades",
    },
    {
      url: "https://raw.githubusercontent.com/public-disclosure/congressional-trading/main/all_transactions.json",
      name: "Public Disclosure Congressional Trading",
    },
  ]

  for (const githubEndpoint of githubEndpoints) {
    try {
      console.log(`[Congressional Trades] 🔄 Trying GitHub: ${githubEndpoint.name} (${githubEndpoint.url})`)
      
      const response = await fetch(githubEndpoint.url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Accept": "application/json",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(10000), // 10 seconden timeout
      })

      if (!response.ok) {
        console.warn(`[Congressional Trades] ⚠️ GitHub ${githubEndpoint.name} returned ${response.status} ${response.statusText}`)
        if (response.status === 404) {
          console.warn(`[Congressional Trades] ⚠️ Repository niet gevonden: ${githubEndpoint.url}`)
        }
        continue // Probeer volgende GitHub repository
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        console.warn(`[Congressional Trades] ⚠️ GitHub ${githubEndpoint.name} returned unexpected content-type: ${contentType}`)
        continue
      }

      const data = await response.json()
      
      if (!Array.isArray(data)) {
        console.warn(`[Congressional Trades] ⚠️ GitHub ${githubEndpoint.name} data is not an array, got: ${typeof data}`)
        continue
      }

      console.log(`[Congressional Trades] 📊 Processing ${data.length} total trades from ${githubEndpoint.name}`)
      
      const trades = (data as RawTradeData[])
        .filter((trade) => {
          const repName = (trade.representative || trade.politician || trade.name || trade.Representative || trade.politician_name || "").toLowerCase()
          const searchName = politician.toLowerCase()
          return repName.includes(searchName) || searchName.includes(repName.split(" ")[0])
        })
        .map((trade) => ({
          representative: trade.representative || trade.politician || trade.name || trade.Representative || trade.politician_name || politician,
          party: trade.party || trade.Party || "D",
          state: trade.state || trade.State || "CA",
          district: trade.district || trade.District,
          ticker: trade.ticker || trade.symbol || trade.Ticker || trade.Symbol || trade.stock_symbol || "",
          company: trade.company || trade.stockName || trade.Company || trade.StockName || trade.stock_name || "",
          transactionType: trade.transactionType || trade.type || trade.action || trade.Transaction || trade.Type || "Unknown",
          amount: trade.amount || trade.value || trade.amountRange || trade.Amount || trade.Value || "Unknown",
          transactionDate: trade.transactionDate || trade.tradedDate || trade.date || trade.TransactionDate || trade.Date || "",
          disclosureDate: trade.disclosureDate || trade.filedDate || trade.publicationDate || trade.DisclosureDate || trade.FiledDate || "",
          owner: trade.owner || trade.Owner,
          assetDescription: trade.description || trade.assetDescription || trade.Description || trade.AssetDescription,
        }))
        .filter((trade: CongressionalTrade) => trade.ticker && trade.ticker !== "")

      if (trades.length > 0) {
        console.log(`[Congressional Trades] ✅ Successfully fetched ${trades.length} trades for ${politician} from ${githubEndpoint.name}`)
        cachedData = trades
        cachedDataSource = githubEndpoint.name
        cacheTimestamp = now
        return {
          trades: trades,
          dataSource: githubEndpoint.name,
          dataTimestamp: now,
        }
      } else {
        console.warn(`[Congressional Trades] ⚠️ No trades found for ${politician} in ${githubEndpoint.name} (filtered from ${data.length} total trades)`)
      }
    } catch (error) {
      console.error(`[Congressional Trades] ❌ GitHub ${githubEndpoint.name} error:`, error)
      continue // Probeer volgende GitHub repository
    }
  }
  
  console.log(`[Congressional Trades] ⚠️ Alle GitHub repositories gefaald, probeer andere gratis bronnen...`)

  // NIEUWE GRATIS BRON: House Stock Watcher alternatieve endpoints
  const houseStockWatcherEndpoints = [
    "https://housestockwatcher.com/api/trades",
    "https://api.housestockwatcher.com/trades",
    "https://housestockwatcher.com/api/all-transactions",
    "https://housestockwatcher.com/api/v1/trades",
    "https://housestockwatcher.com/api/v1/all-transactions",
    "https://www.housestockwatcher.com/api/trades",
  ]

  for (const endpoint of houseStockWatcherEndpoints) {
    try {
      console.log(`[Congressional Trades] 🔄 Trying House Stock Watcher: ${endpoint}`)
      
      const response = await fetch(endpoint, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Accept": "application/json",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      })

      if (response.ok) {
        const contentType = response.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json()
          
          let trades: RawTradeData[] = []
          if (Array.isArray(data)) {
            trades = data as RawTradeData[]
          } else if (data.trades && Array.isArray(data.trades)) {
            trades = data.trades as RawTradeData[]
          } else if (data.transactions && Array.isArray(data.transactions)) {
            trades = data.transactions as RawTradeData[]
          }
          
          const filteredTrades = trades
            .filter((trade) => {
              const repName = (trade.representative || trade.politician || trade.name || "").toLowerCase()
              return repName.includes(politician.toLowerCase()) || politician.toLowerCase().includes(repName.split(" ")[0])
            })
            .map((trade) => ({
              representative: trade.representative || trade.politician || trade.name || politician,
              party: trade.party || "D",
              state: trade.state || "CA",
              district: trade.district,
              ticker: trade.ticker || trade.symbol || "",
              company: trade.company || trade.stockName || "",
              transactionType: trade.transactionType || trade.type || "Unknown",
              amount: trade.amount || trade.value || "Unknown",
              transactionDate: trade.transactionDate || trade.date || "",
              disclosureDate: trade.disclosureDate || trade.filedDate || "",
              owner: trade.owner,
              assetDescription: trade.description || trade.assetDescription,
            }))
            .filter((trade: CongressionalTrade) => trade.ticker && trade.ticker !== "")

          if (filteredTrades.length > 0) {
            console.log(`[Congressional Trades] ✅ Successfully fetched ${filteredTrades.length} trades from House Stock Watcher`)
            cachedData = filteredTrades
            cachedDataSource = `House Stock Watcher (${endpoint})`
            cacheTimestamp = now
            return {
              trades: filteredTrades,
              dataSource: `House Stock Watcher (${endpoint})`,
              dataTimestamp: now,
            }
          }
        }
      }
    } catch (error) {
      console.warn(`[Congressional Trades] ⚠️ House Stock Watcher ${endpoint} error:`, error)
      continue
    }
  }

  // NIEUWE GRATIS BRON: Unusual Whales Public API endpoints
  const unusualWhalesEndpoints = [
    `https://unusualwhales.com/api/congressional-trades?politician=${encodedPolitician}`,
    `https://api.unusualwhales.com/v1/congressional-trades?politician=${encodedPolitician}`,
    `https://unusualwhales.com/api/v1/trades?politician=${encodedPolitician}`,
    `https://unusualwhales.com/api/trades?name=${encodedPolitician}`,
  ]

  for (const endpoint of unusualWhalesEndpoints) {
    try {
      console.log(`[Congressional Trades] 🔄 Trying Unusual Whales API: ${endpoint}`)
      
      const response = await fetch(endpoint, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Accept": "application/json",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      })

      if (response.ok) {
        const contentType = response.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json()
          
          let trades: RawTradeData[] = []
          if (Array.isArray(data)) {
            trades = data
          } else if (data.trades && Array.isArray(data.trades)) {
            trades = data.trades
          } else if (data.data && Array.isArray(data.data)) {
            trades = data.data
          } else if (data.results && Array.isArray(data.results)) {
            trades = data.results
          }
          
          if (trades.length > 0) {
            const transformedTrades = trades
              .map((trade) => ({
                representative: trade.politician || trade.representative || trade.name || trade.politician_name || politician,
                party: trade.party || "D",
                state: trade.state || "CA",
                district: trade.district,
                ticker: trade.ticker || trade.symbol || trade.stock_symbol || "",
                company: trade.company || trade.stock_name || trade.company_name || "",
                transactionType: trade.transaction_type || trade.transactionType || trade.type || "Unknown",
                amount: trade.amount || trade.value || trade.amount_range || "Unknown",
                transactionDate: trade.transaction_date || trade.transactionDate || trade.date || "",
                disclosureDate: trade.disclosure_date || trade.disclosureDate || trade.filed_date || "",
                owner: trade.owner,
                assetDescription: trade.description || trade.asset_description,
              }))
              .filter((trade: CongressionalTrade) => trade.ticker && trade.ticker !== "")

            if (transformedTrades.length > 0) {
              console.log(`[Congressional Trades] ✅ Successfully fetched ${transformedTrades.length} trades from Unusual Whales`)
              cachedData = transformedTrades
              cachedDataSource = "Unusual Whales Public API"
              cacheTimestamp = now
              return {
                trades: transformedTrades,
                dataSource: "Unusual Whales Public API",
                dataTimestamp: now,
              }
            }
          }
        }
      }
    } catch (error) {
      console.warn(`[Congressional Trades] ⚠️ Unusual Whales API ${endpoint} error:`, error)
      continue
    }
  }

  // NIEUWE GRATIS BRON: Quiver Quantitative Public API (gratis tier)
  const quiverEndpoints = [
    `https://api.quiverquant.com/beta/congresstrading/${encodedPolitician}`,
    `https://api.quiverquant.com/beta/congresstrading?politician=${encodedPolitician}`,
    `https://api.quiverquant.com/v1/congresstrading/${encodedPolitician}`,
  ]

  for (const endpoint of quiverEndpoints) {
    try {
      console.log(`[Congressional Trades] 🔄 Trying Quiver Quantitative API: ${endpoint}`)
      
      const response = await fetch(endpoint, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Accept": "application/json",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      })

      if (response.ok) {
        const contentType = response.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json()
          
          let trades: RawTradeData[] = []
          if (Array.isArray(data)) {
            trades = data
          } else if (data.trades && Array.isArray(data.trades)) {
            trades = data.trades
          } else if (data.data && Array.isArray(data.data)) {
            trades = data.data
          }
          
          if (trades.length > 0) {
            const transformedTrades = trades
              .map((trade) => ({
                representative: trade.Representative || trade.politician || trade.representative || trade.name || politician,
                party: trade.Party || trade.party || "D",
                state: trade.State || trade.state || "CA",
                district: trade.District || trade.district,
                ticker: trade.Ticker || trade.ticker || trade.symbol || "",
                company: trade.Company || trade.company || trade.stockName || "",
                transactionType: trade.Transaction || trade.transactionType || trade.type || "Unknown",
                amount: trade.Amount || trade.amount || trade.value || "Unknown",
                transactionDate: trade.TransactionDate || trade.transactionDate || trade.date || "",
                disclosureDate: trade.DisclosureDate || trade.disclosureDate || trade.filedDate || "",
                owner: trade.Owner || trade.owner,
                assetDescription: trade.Description || trade.description || trade.assetDescription,
              }))
              .filter((trade: CongressionalTrade) => trade.ticker && trade.ticker !== "")

            if (transformedTrades.length > 0) {
              console.log(`[Congressional Trades] ✅ Successfully fetched ${transformedTrades.length} trades from Quiver Quantitative`)
              cachedData = transformedTrades
              cachedDataSource = "Quiver Quantitative Public API"
              cacheTimestamp = now
              return {
                trades: transformedTrades,
                dataSource: "Quiver Quantitative Public API",
                dataTimestamp: now,
              }
            }
          }
        }
      }
    } catch (error) {
      console.warn(`[Congressional Trades] ⚠️ Quiver Quantitative API ${endpoint} error:`, error)
      continue
    }
  }

  // NIEUWE GRATIS BRON: Pelosi Tracker Public API
  const pelosiTrackerEndpoints = [
    `https://pelositracker.app/api/trades?politician=${encodedPolitician}`,
    `https://pelositracker.app/api/v1/trades?name=${encodedPolitician}`,
    `https://api.pelositracker.app/trades?politician=${encodedPolitician}`,
  ]

  for (const endpoint of pelosiTrackerEndpoints) {
    try {
      console.log(`[Congressional Trades] 🔄 Trying Pelosi Tracker API: ${endpoint}`)
      
      const response = await fetch(endpoint, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Accept": "application/json",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      })

      if (response.ok) {
        const contentType = response.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json()
          
          let trades: RawTradeData[] = []
          if (Array.isArray(data)) {
            trades = data
          } else if (data.trades && Array.isArray(data.trades)) {
            trades = data.trades
          } else if (data.data && Array.isArray(data.data)) {
            trades = data.data
          }
          
          if (trades.length > 0) {
            const transformedTrades = trades
              .map((trade) => ({
                representative: trade.politician || trade.representative || trade.name || politician,
                party: trade.party || "D",
                state: trade.state || "CA",
                district: trade.district,
                ticker: trade.ticker || trade.symbol || "",
                company: trade.company || trade.stockName || "",
                transactionType: trade.transactionType || trade.type || "Unknown",
                amount: trade.amount || trade.value || "Unknown",
                transactionDate: trade.transactionDate || trade.date || "",
                disclosureDate: trade.disclosureDate || trade.filedDate || "",
                owner: trade.owner,
                assetDescription: trade.description || trade.assetDescription,
              }))
              .filter((trade: CongressionalTrade) => trade.ticker && trade.ticker !== "")

            if (transformedTrades.length > 0) {
              console.log(`[Congressional Trades] ✅ Successfully fetched ${transformedTrades.length} trades from Pelosi Tracker API`)
              cachedData = transformedTrades
              cachedDataSource = "Pelosi Tracker Public API"
              cacheTimestamp = now
              return {
                trades: transformedTrades,
                dataSource: "Pelosi Tracker Public API",
                dataTimestamp: now,
              }
            }
          }
        }
      }
    } catch (error) {
      console.warn(`[Congressional Trades] ⚠️ Pelosi Tracker API ${endpoint} error:`, error)
      continue
    }
  }

  // Probeer scraping van CapitolTrades (voor individuele trades) - VOOR RapidAPI
  try {
    const capitolTrades = await scrapeCapitolTrades(politician)
    if (capitolTrades.length > 0) {
      console.log(`[Congressional Trades] ✅ Scraped ${capitolTrades.length} trades from CapitolTrades`)
      cachedData = capitolTrades
      cachedDataSource = "CapitolTrades (Scraping)"
      cacheTimestamp = now
      return {
        trades: capitolTrades,
        dataSource: "CapitolTrades (Scraping)",
        dataTimestamp: now,
      }
    }
  } catch (error) {
    console.warn(`[Congressional Trades] ⚠️ CapitolTrades scraping failed:`, error)
  }

  // Probeer RapidAPI endpoints voor individuele trades
  if (rapidApiKey) {
    // Probeer eerst /get_profile voor specifieke politicus (geeft individuele trades)
    try {
      const rapidApiUrl = `https://${rapidApiHost}/get_profile?name=${encodedPolitician}`
      console.log(`[Congressional Trades] 🔄 Trying RapidAPI /get_profile: ${rapidApiUrl}`)
      
      const response = await fetch(rapidApiUrl, {
        headers: {
          "X-RapidAPI-Key": rapidApiKey,
          "X-RapidAPI-Host": rapidApiHost,
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Accept": "application/json",
        },
        cache: "no-store",
      })

      if (response.ok) {
        const contentType = response.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json()
          
          // Transform RapidAPI profile data naar trades formaat
          let trades: RawTradeData[] = []
          
          // Probeer verschillende data structuren
          if (data.trades && Array.isArray(data.trades)) {
            trades = data.trades as RawTradeData[]
          } else if (data.transactions && Array.isArray(data.transactions)) {
            trades = data.transactions as RawTradeData[]
          } else if (data.recentTrades && Array.isArray(data.recentTrades)) {
            trades = data.recentTrades as RawTradeData[]
          } else if (Array.isArray(data)) {
            trades = data as RawTradeData[]
          } else if (data.data && Array.isArray(data.data)) {
            trades = data.data as RawTradeData[]
          }
          
          if (trades.length > 0) {
            const transformedTrades = trades
              .map((trade) => ({
                representative: trade.representative || trade.politician || trade.name || trade.Representative || politician,
                party: trade.party || trade.Party || data.party || data.Party || "D",
                state: trade.state || trade.State || data.state || data.State || "CA",
                district: trade.district || trade.District || data.district,
                ticker: trade.ticker || trade.symbol || trade.Ticker || trade.Symbol || trade.stock_symbol || "",
                company: trade.company || trade.stockName || trade.Company || trade.StockName || trade.stock_name || "",
                transactionType: trade.transactionType || trade.type || trade.action || trade.Transaction || trade.Type || trade.transaction_type || "Unknown",
                amount: trade.amount || trade.value || trade.amountRange || trade.Amount || trade.Value || trade.transaction_amount || "Unknown",
                transactionDate: trade.transactionDate || trade.tradedDate || trade.date || trade.TransactionDate || trade.Date || trade.transaction_date || "",
                disclosureDate: trade.disclosureDate || trade.filedDate || trade.publicationDate || trade.DisclosureDate || trade.FiledDate || trade.disclosure_date || "",
                owner: trade.owner || trade.Owner,
                assetDescription: trade.description || trade.assetDescription || trade.Description || trade.AssetDescription,
              }))
              .filter((trade: CongressionalTrade) => trade.ticker && trade.ticker !== "")

            if (transformedTrades.length > 0) {
              console.log(`[Congressional Trades] ✅ Successfully fetched ${transformedTrades.length} trades from RapidAPI /get_profile`)
              cachedData = transformedTrades
              cachedDataSource = "RapidAPI Politician Trade Tracker"
              cacheTimestamp = now
              return {
                trades: transformedTrades,
                dataSource: "RapidAPI Politician Trade Tracker",
                dataTimestamp: now,
              }
            }
          }
        }
      } else {
        const errorText = await response.text().catch(() => "")
        console.warn(`[Congressional Trades] ⚠️ RapidAPI /get_profile returned ${response.status}: ${errorText.substring(0, 200)}`)
      }
    } catch (error) {
      console.warn(`[Congressional Trades] ⚠️ RapidAPI /get_profile error:`, error)
    }

    // Probeer /get_latest_trades als alternatief
    try {
      const rapidApiUrl = `https://${rapidApiHost}/get_latest_trades`
      console.log(`[Congressional Trades] 🔄 Trying RapidAPI /get_latest_trades: ${rapidApiUrl}`)
      
      const response = await fetch(rapidApiUrl, {
        headers: {
          "X-RapidAPI-Key": rapidApiKey,
          "X-RapidAPI-Host": rapidApiHost,
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Accept": "application/json",
        },
        cache: "no-store",
      })

      if (response.ok) {
        const contentType = response.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json()
          
          // Transform latest trades data
          let trades: RawTradeData[] = []
          if (Array.isArray(data)) {
            trades = data
          } else if (data.trades && Array.isArray(data.trades)) {
            trades = data.trades
          } else if (data.latestTrades && Array.isArray(data.latestTrades)) {
            trades = data.latestTrades
          }
          
          // Filter op specifieke politicus
          const filteredTrades = trades
            .filter((trade) => {
              const repName = (trade.representative || trade.politician || trade.name || trade.Representative || "").toLowerCase()
              return repName.includes(politician.toLowerCase()) || politician.toLowerCase().includes(repName.split(" ")[0])
            })
            .map((trade) => ({
              representative: trade.representative || trade.politician || trade.name || trade.Representative || politician,
              party: trade.party || trade.Party || "D",
              state: trade.state || trade.State || "CA",
              district: trade.district || trade.District,
              ticker: trade.ticker || trade.symbol || trade.Ticker || trade.Symbol || trade.stock_symbol || "",
              company: trade.company || trade.stockName || trade.Company || trade.StockName || trade.stock_name || "",
              transactionType: trade.transactionType || trade.type || trade.action || trade.Transaction || trade.Type || trade.transaction_type || "Unknown",
              amount: trade.amount || trade.value || trade.amountRange || trade.Amount || trade.Value || trade.transaction_amount || "Unknown",
              transactionDate: trade.transactionDate || trade.tradedDate || trade.date || trade.TransactionDate || trade.Date || trade.transaction_date || "",
              disclosureDate: trade.disclosureDate || trade.filedDate || trade.publicationDate || trade.DisclosureDate || trade.FiledDate || trade.disclosure_date || "",
              owner: trade.owner || trade.Owner,
              assetDescription: trade.description || trade.assetDescription || trade.Description || trade.AssetDescription,
            }))
            .filter((trade: CongressionalTrade) => trade.ticker && trade.ticker !== "")

          if (filteredTrades.length > 0) {
            console.log(`[Congressional Trades] ✅ Successfully fetched ${filteredTrades.length} trades from RapidAPI /get_latest_trades`)
            cachedData = filteredTrades
            cachedDataSource = "RapidAPI Politician Trade Tracker (Latest Trades)"
            cacheTimestamp = now
            return {
              trades: filteredTrades,
              dataSource: "RapidAPI Politician Trade Tracker (Latest Trades)",
              dataTimestamp: now,
            }
          }
        }
      }
    } catch (error) {
      console.warn(`[Congressional Trades] ⚠️ RapidAPI /get_latest_trades error:`, error)
    }

    // Als laatste optie: gebruik /get_politicians voor statistieken
    try {
      const rapidApiUrl = `https://${rapidApiHost}/get_politicians`
      console.log(`[Congressional Trades] 🔄 Trying RapidAPI /get_politicians (statistieken alleen): ${rapidApiUrl}`)
      
      const response = await fetch(rapidApiUrl, {
        headers: {
          "X-RapidAPI-Key": rapidApiKey,
          "X-RapidAPI-Host": rapidApiHost,
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Accept": "application/json",
        },
        cache: "no-store",
      })

      if (response.ok) {
        const contentType = response.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json()
          
          // Zoek de specifieke politicus in de data
          const politicianKey = Object.keys(data).find(
            (key) => key.toLowerCase().includes(politician.toLowerCase()) || 
                     politician.toLowerCase().includes(key.toLowerCase().split(" ")[0])
          )
          
          if (politicianKey && data[politicianKey]) {
            const stats = data[politicianKey]
            console.log(`[Congressional Trades] ✅ Found ${politicianKey} in RapidAPI /get_politicians`)
            
            // Transform statistieken naar trades formaat
            const trades: CongressionalTrade[] = []
            
            trades.push({
              representative: politicianKey,
              party: stats.Party || "D",
              state: stats.State || "CA",
              ticker: "SUMMARY",
              company: `Samenvatting: ${stats.Trades || 0} trades, ${stats.Issuers || 0} issuers`,
              transactionType: "Summary",
              amount: stats.TradeVolume || "Unknown",
              transactionDate: stats.LastTraded || "",
              disclosureDate: stats.LastTraded || "",
              assetDescription: `Trade Volume: ${stats.TradeVolume}, Trades: ${stats.Trades}, Issuers: ${stats.Issuers}`,
            })
            
            if (trades.length > 0) {
              console.log(`[Congressional Trades] ⚠️ Using RapidAPI statistics (geen individuele trades beschikbaar)`)
              cachedData = trades
              cachedDataSource = "RapidAPI Politician Trade Tracker (Statistieken)"
              cacheTimestamp = now
              return {
                trades: trades,
                dataSource: "RapidAPI Politician Trade Tracker (Statistieken)",
                dataTimestamp: now,
              }
            }
          }
        }
      }
    } catch (error) {
      console.warn(`[Congressional Trades] ⚠️ RapidAPI /get_politicians error:`, error)
    }
  }

  // NIEUWE GRATIS BRON: Congressional Trading Data API (gratis maar onstabiel)
  const congressionalTradingDataEndpoints = [
    "https://www.congressionaltradingdata.com/api/trades",
    "https://congressionaltradingdata.com/api/trades",
    "https://www.congressionaltradingdata.com/api/v1/trades",
    `https://www.congressionaltradingdata.com/api/trades?politician=${encodedPolitician}`,
  ]

  for (const ctdUrl of congressionalTradingDataEndpoints) {
    try {
      console.log(`[Congressional Trades] 🔄 Trying Congressional Trading Data API: ${ctdUrl}`)
      
      const response = await fetch(ctdUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Accept": "application/json",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      })

      if (response.ok) {
        const contentType = response.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json()
          
          let trades: RawTradeData[] = []
          if (Array.isArray(data)) {
            trades = data
          } else if (data && data.trades && Array.isArray(data.trades)) {
            trades = data.trades
          } else if (data && data.data && Array.isArray(data.data)) {
            trades = data.data
          }
          
          if (trades.length > 0) {
            const filteredTrades = trades
              .filter((trade) => {
                const repName = (trade.representative || trade.politician || trade.name || "").toLowerCase()
                return repName.includes(politician.toLowerCase()) || politician.toLowerCase().includes(repName.split(" ")[0])
              })
              .map((trade) => ({
                representative: trade.representative || trade.politician || trade.name || politician,
                party: trade.party || "D",
                state: trade.state || "CA",
                district: trade.district,
                ticker: trade.ticker || trade.symbol || "",
                company: trade.company || trade.stockName || "",
                transactionType: trade.transactionType || trade.type || trade.action || "Unknown",
                amount: trade.amount || trade.value || trade.amountRange || "Unknown",
                transactionDate: trade.transactionDate || trade.tradedDate || trade.date || "",
                disclosureDate: trade.disclosureDate || trade.filedDate || trade.publicationDate || "",
                owner: trade.owner,
                assetDescription: trade.description || trade.assetDescription,
              }))
              .filter((trade: CongressionalTrade) => trade.ticker && trade.ticker !== "")

            if (filteredTrades.length > 0) {
              console.log(`[Congressional Trades] ✅ Successfully fetched ${filteredTrades.length} trades from Congressional Trading Data API`)
              cachedData = filteredTrades
              cachedDataSource = "Congressional Trading Data API"
              cacheTimestamp = now
              return {
                trades: filteredTrades,
                dataSource: "Congressional Trading Data API",
                dataTimestamp: now,
              }
            }
          }
        }
      }
    } catch (error) {
      console.warn(`[Congressional Trades] ⚠️ Congressional Trading Data API ${ctdUrl} error:`, error)
      continue
    }
  }

  // NIEUWE GRATIS BRON: OpenSecrets API endpoints
  const openSecretsEndpoints = [
    `https://www.opensecrets.org/api/?method=congTrades&output=json&politician=${encodedPolitician}`,
    `https://opensecrets.org/api/?method=congTrades&output=json&name=${encodedPolitician}`,
  ]

  for (const endpoint of openSecretsEndpoints) {
    try {
      console.log(`[Congressional Trades] 🔄 Trying OpenSecrets API: ${endpoint}`)
      
      const response = await fetch(endpoint, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Accept": "application/json",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      })

      if (response.ok) {
        const contentType = response.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json()
          
          let trades: RawTradeData[] = []
          if (data.response && data.response.trades && Array.isArray(data.response.trades)) {
            trades = data.response.trades
          } else if (Array.isArray(data)) {
            trades = data
          } else if (data.trades && Array.isArray(data.trades)) {
            trades = data.trades
          }
          
          if (trades.length > 0) {
            const transformedTrades = trades
              .map((trade) => ({
                representative: trade.representative || trade.politician || trade.name || politician,
                party: trade.party || "D",
                state: trade.state || "CA",
                district: trade.district,
                ticker: trade.ticker || trade.symbol || "",
                company: trade.company || trade.stockName || "",
                transactionType: trade.transactionType || trade.type || "Unknown",
                amount: trade.amount || trade.value || "Unknown",
                transactionDate: trade.transactionDate || trade.date || "",
                disclosureDate: trade.disclosureDate || trade.filedDate || "",
                owner: trade.owner,
                assetDescription: trade.description || trade.assetDescription,
              }))
              .filter((trade: CongressionalTrade) => trade.ticker && trade.ticker !== "")

            if (transformedTrades.length > 0) {
              console.log(`[Congressional Trades] ✅ Successfully fetched ${transformedTrades.length} trades from OpenSecrets`)
              cachedData = transformedTrades
              cachedDataSource = "OpenSecrets API"
              cacheTimestamp = now
              return {
                trades: transformedTrades,
                dataSource: "OpenSecrets API",
                dataTimestamp: now,
              }
            }
          }
        }
      }
    } catch (error) {
      console.warn(`[Congressional Trades] ⚠️ OpenSecrets API ${endpoint} error:`, error)
      continue
    }
  }

  // NIEUWE GRATIS BRON: GovTrack API endpoints
  const govTrackEndpoints = [
    `https://www.govtrack.us/api/v2/person?name=${encodedPolitician}`,
    `https://www.govtrack.us/api/v2/person?q=${encodedPolitician}`,
  ]

  for (const endpoint of govTrackEndpoints) {
    try {
      console.log(`[Congressional Trades] 🔄 Trying GovTrack API: ${endpoint}`)
      
      const response = await fetch(endpoint, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Accept": "application/json",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      })

      if (response.ok) {
        const contentType = response.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json()
          
          // GovTrack heeft mogelijk trades data in de response
          let trades: RawTradeData[] = []
          if (data.objects && Array.isArray(data.objects)) {
            // Probeer trades uit person object te halen
            for (const person of data.objects) {
              if (person.trades && Array.isArray(person.trades)) {
                trades.push(...person.trades)
              }
            }
          } else if (data.trades && Array.isArray(data.trades)) {
            trades = data.trades
          }
          
          if (trades.length > 0) {
            const transformedTrades = trades
              .map((trade) => ({
                representative: trade.representative || trade.politician || trade.name || politician,
                party: trade.party || "D",
                state: trade.state || "CA",
                district: trade.district,
                ticker: trade.ticker || trade.symbol || "",
                company: trade.company || trade.stockName || "",
                transactionType: trade.transactionType || trade.type || "Unknown",
                amount: trade.amount || trade.value || "Unknown",
                transactionDate: trade.transactionDate || trade.date || "",
                disclosureDate: trade.disclosureDate || trade.filedDate || "",
                owner: trade.owner,
                assetDescription: trade.description || trade.assetDescription,
              }))
              .filter((trade: CongressionalTrade) => trade.ticker && trade.ticker !== "")

            if (transformedTrades.length > 0) {
              console.log(`[Congressional Trades] ✅ Successfully fetched ${transformedTrades.length} trades from GovTrack`)
              cachedData = transformedTrades
              cachedDataSource = "GovTrack API"
              cacheTimestamp = now
              return {
                trades: transformedTrades,
                dataSource: "GovTrack API",
                dataTimestamp: now,
              }
            }
          }
        }
      }
    } catch (error) {
      console.warn(`[Congressional Trades] ⚠️ GovTrack API ${endpoint} error:`, error)
      continue
    }
  }

  // NIEUWE GRATIS BRON: Clerk of the House Public Disclosures (officiële bron)
  const clerkEndpoints = [
    "https://clerk.house.gov/public_disc/financial-pdfs",
    "https://clerk.house.gov/public_disc/index.php",
    `https://clerk.house.gov/public_disc/financial-pdfs?name=${encodedPolitician}`,
  ]

  for (const endpoint of clerkEndpoints) {
    try {
      console.log(`[Congressional Trades] 🔄 Trying Clerk of the House: ${endpoint}`)
      
      const response = await fetch(endpoint, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Accept": "application/json, text/html",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      })

      if (response.ok) {
        const contentType = response.headers.get("content-type")
        // Clerk gebruikt mogelijk HTML of JSON
        if (contentType && (contentType.includes("application/json") || contentType.includes("text/html"))) {
          // Als JSON, probeer te parsen
          if (contentType.includes("application/json")) {
            // const data = await response.json() // Voor toekomstig gebruik
            // Process JSON data if available
            // Note: Clerk website may require HTML parsing for PDF links
          }
          // HTML parsing zou hier kunnen worden toegevoegd voor PDF links
        }
      }
    } catch (error) {
      console.warn(`[Congressional Trades] ⚠️ Clerk of the House ${endpoint} error:`, error)
      continue
    }
  }

  // NIEUWE GRATIS BRON: Senate Financial Disclosures (officiële bron)
  const senateEndpoints = [
    "https://efdsearch.senate.gov/search/home/",
    `https://efdsearch.senate.gov/search/home/?name=${encodedPolitician}`,
  ]

  for (const endpoint of senateEndpoints) {
    try {
      console.log(`[Congressional Trades] 🔄 Trying Senate Financial Disclosures: ${endpoint}`)
      
      const response = await fetch(endpoint, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Accept": "application/json, text/html",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      })

      if (response.ok) {
        // Senate website gebruikt HTML, zou scraping vereisen
        // Dit is een placeholder voor toekomstige implementatie
      }
    } catch (error) {
      console.warn(`[Congressional Trades] ⚠️ Senate Financial Disclosures ${endpoint} error:`, error)
      continue
    }
  }

  // Probeer scraping van Pelosi Tracker (voor individuele trades)
  try {
    const scrapedTrades = await scrapePelosiTracker(politician)
    if (scrapedTrades.length > 0) {
      console.log(`[Congressional Trades] ✅ Scraped ${scrapedTrades.length} trades from Pelosi Tracker`)
      cachedData = scrapedTrades
      cachedDataSource = "Pelosi Tracker (Scraping)"
      cacheTimestamp = now
      return {
        trades: scrapedTrades,
        dataSource: "Pelosi Tracker (Scraping)",
        dataTimestamp: now,
      }
    }
  } catch (error) {
    console.warn(`[Congressional Trades] ⚠️ Scraping failed:`, error)
  }

  // Probeer verschillende API endpoints (betaalde API's en fallbacks)
  const endpoints: Array<{
    url: string
    name: string
    requiresAuth: boolean
    transform: (data: unknown) => CongressionalTrade[]
  }> = [
    // RapidAPI - Politician Trade Tracker
    ...(rapidApiKey ? [{
      url: rapidApiHost 
        ? `https://${rapidApiHost}/get_trades?politician=${encodedPolitician}`
        : `https://politician-trade-tracker1.p.rapidapi.com/get_trades?politician=${encodedPolitician}`,
      name: "RapidAPI Politician Trade Tracker",
      requiresAuth: true,
      transform: (data: unknown) => {
        let trades: RawTradeData[] = []
        
        // Probeer verschillende data structuren
        if (Array.isArray(data)) {
          trades = data as RawTradeData[]
        } else if (data && typeof data === 'object' && 'trades' in data && Array.isArray(data.trades)) {
          trades = data.trades as RawTradeData[]
        } else if (data && typeof data === 'object' && 'data' in data && Array.isArray(data.data)) {
          trades = data.data as RawTradeData[]
        } else if (data && typeof data === 'object' && 'results' in data && Array.isArray(data.results)) {
          trades = data.results as RawTradeData[]
        } else if (data && typeof data === 'object' && 'transactions' in data && Array.isArray(data.transactions)) {
          trades = data.transactions as RawTradeData[]
        }
        
        return trades
          .filter((trade) => {
            const repName = (trade.representative || trade.politician || trade.name || trade.Representative || trade.politician_name || "").toLowerCase()
            return repName.includes(politician.toLowerCase()) || politician.toLowerCase().includes(repName.split(" ")[0])
          })
          .map((trade) => ({
            representative: trade.representative || trade.politician || trade.name || trade.Representative || trade.politician_name || politician,
            party: trade.party || trade.Party || "D",
            state: trade.state || trade.State || "CA",
            district: trade.district || trade.District,
            ticker: trade.ticker || trade.symbol || trade.Ticker || trade.Symbol || trade.stock_symbol || "",
            company: trade.company || trade.stockName || trade.Company || trade.StockName || trade.stock_name || "",
            transactionType: trade.transactionType || trade.type || trade.action || trade.Transaction || trade.Type || trade.transaction_type || "Unknown",
            amount: trade.amount || trade.value || trade.amountRange || trade.Amount || trade.Value || trade.transaction_amount || "Unknown",
            transactionDate: trade.transactionDate || trade.tradedDate || trade.date || trade.TransactionDate || trade.Date || trade.transaction_date || "",
            disclosureDate: trade.disclosureDate || trade.filedDate || trade.publicationDate || trade.DisclosureDate || trade.FiledDate || trade.disclosure_date || "",
            owner: trade.owner || trade.Owner,
            assetDescription: trade.description || trade.assetDescription || trade.Description || trade.AssetDescription,
          }))
          .filter((trade: CongressionalTrade) => trade.ticker && trade.ticker !== "")
      },
    }] : []),
    // PoliAPI - probeer met en zonder API key
    {
      url: poliApiKey 
        ? `https://api.poliapi.com/v1/trades?politician=${encodedPolitician}`
        : `https://api.poliapi.com/api/politician/${encodedPolitician}`,
      name: poliApiKey ? "PoliAPI (Betaald)" : "PoliAPI (Gratis Tier)",
      requiresAuth: !!poliApiKey,
      transform: (data: unknown) => {
        // PoliAPI kan verschillende formats hebben
        let trades: RawTradeData[] = []
        
        if (Array.isArray(data)) {
          trades = data as RawTradeData[]
        } else if (data && typeof data === 'object' && 'trades' in data && Array.isArray(data.trades)) {
          trades = data.trades as RawTradeData[]
        } else if (data && typeof data === 'object' && 'data' in data && Array.isArray(data.data)) {
          trades = data.data as RawTradeData[]
        } else if (data && typeof data === 'object') {
          // Mogelijk een enkel object, maak array
          trades = [data as RawTradeData]
        }
        
        return trades.map((trade) => ({
          representative: trade.politician || trade.representative || trade.name || politician,
          party: trade.party || "D",
          state: trade.state || "CA",
          district: trade.district,
          ticker: trade.ticker || trade.symbol || trade.stockSymbol || "",
          company: trade.company || trade.assetDescription || trade.stockName || "",
          transactionType: trade.transactionType || trade.type || trade.transaction_type || "Unknown",
          amount: trade.amount || trade.value || trade.transactionAmount || "Unknown",
          transactionDate: trade.transactionDate || trade.date || trade.transaction_date || "",
          disclosureDate: trade.disclosureDate || trade.publicationDate || trade.disclosure_date || "",
          owner: trade.owner,
          assetDescription: trade.assetDescription || trade.description,
        })).filter((trade: CongressionalTrade) => trade.ticker && trade.ticker !== "")
      },
    },
    // House Stock Watcher endpoints (backup - waarschijnlijk niet beschikbaar)
    {
      url: "https://house-stock-watcher-data.s3-us-west-2.amazonaws.com/data/all_transactions.json",
      name: "House Stock Watcher S3",
      requiresAuth: false,
      transform: (data: unknown) => {
        if (!Array.isArray(data)) return []
        return (data as RawTradeData[]).map((trade): CongressionalTrade => ({
          representative: trade.representative || trade.politician || trade.name || trade.Representative || trade.politician_name || "",
          party: trade.party || trade.Party || "D",
          state: trade.state || trade.State || "CA",
          district: trade.district || trade.District,
          ticker: trade.ticker || trade.symbol || trade.Ticker || trade.Symbol || trade.stock_symbol || "",
          company: trade.company || trade.stockName || trade.Company || trade.StockName || trade.stock_name || trade.company_name || "",
          transactionType: trade.transactionType || trade.type || trade.action || trade.Transaction || trade.Type || trade.transaction_type || "Unknown",
          amount: trade.amount || trade.value || trade.amountRange || trade.Amount || trade.Value || trade.amount_range || trade.transaction_amount || "Unknown",
          transactionDate: trade.transactionDate || trade.tradedDate || trade.date || trade.TransactionDate || trade.Date || trade.transaction_date || "",
          disclosureDate: trade.disclosureDate || trade.filedDate || trade.publicationDate || trade.DisclosureDate || trade.FiledDate || trade.disclosure_date || trade.filed_date || trade.publication_date || "",
          owner: trade.owner || trade.Owner,
          assetDescription: trade.description || trade.assetDescription || trade.Description || trade.AssetDescription,
        }))
      },
    },
  ]

  for (const endpointConfig of endpoints) {
    try {
      const endpoint = typeof endpointConfig === "string" ? endpointConfig : endpointConfig.url
      console.log(`[Congressional Trades] Trying endpoint: ${endpoint}`)
      
      const headers: HeadersInit = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/json",
      }

      // Voeg API key toe als beschikbaar en vereist
      if (typeof endpointConfig === "object" && endpointConfig.requiresAuth) {
        const poliApiKey = process.env.POLIAPI_API_KEY
        const quiverApiKey = process.env.QUIVER_API_KEY
        const rapidApiKey = process.env.RAPIDAPI_KEY
        const rapidApiHost = process.env.RAPIDAPI_HOST
        
        // RapidAPI gebruikt X-RapidAPI-Key en X-RapidAPI-Host headers
        if (rapidApiKey && endpointConfig.url.includes("rapidapi.com")) {
          headers["X-RapidAPI-Key"] = rapidApiKey
          if (rapidApiHost) {
            headers["X-RapidAPI-Host"] = rapidApiHost
          } else {
            // Probeer host uit URL te halen
            const urlMatch = endpointConfig.url.match(/https:\/\/([^/]+)/)
            if (urlMatch) {
              headers["X-RapidAPI-Host"] = urlMatch[1]
            } else {
              // Default host voor Politician Trade Tracker
              headers["X-RapidAPI-Host"] = "politician-trade-tracker1.p.rapidapi.com"
            }
          }
        }
        
        // PoliAPI gebruikt Bearer token
        if (poliApiKey && endpointConfig.url.includes("poliapi.com")) {
          headers["Authorization"] = `Bearer ${poliApiKey}`
        }
        
        // Quiver gebruikt X-API-KEY header
        if (quiverApiKey && endpointConfig.url.includes("quiverquant.com")) {
          headers["X-API-KEY"] = quiverApiKey
        }
      }

      const response = await fetch(endpoint, {
        headers,
        cache: "no-store",
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`[Congressional Trades] ❌ HTTP ${response.status} from ${endpoint}`)
        console.error(`[Congressional Trades] Response: ${errorText.substring(0, 200)}`)
        continue // Probeer volgende endpoint
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        console.warn(`[Congressional Trades] ⚠️ Unexpected content-type: ${contentType}`)
        continue
      }

      const data = await response.json()
      
      // Transform data als er een transform functie is
      let transformedData = data
      if (typeof endpointConfig === "object" && endpointConfig.transform) {
        transformedData = endpointConfig.transform(data)
      } else if (!Array.isArray(data)) {
        console.warn(`[Congressional Trades] ⚠️ Response is not an array:`, typeof data)
        continue
      }

      // Valideer dat we een array hebben
      if (!Array.isArray(transformedData) || transformedData.length === 0) {
        console.warn(`[Congressional Trades] ⚠️ No valid trades found from ${endpoint}`)
        continue
      }

      const dataSourceName = typeof endpointConfig === "object" ? endpointConfig.name : endpoint
      console.log(`[Congressional Trades] ✅ Successfully fetched ${transformedData.length} trades from ${dataSourceName}`)
      
      // Update cache
      cachedData = transformedData
      cachedDataSource = dataSourceName
      cacheTimestamp = now

      return {
        trades: transformedData,
        dataSource: dataSourceName,
        dataTimestamp: now,
      }
    } catch (error) {
      const endpoint = typeof endpointConfig === "string" ? endpointConfig : endpointConfig.url
      console.error(`[Congressional Trades] ❌ Error fetching from ${endpoint}:`, error)
      continue // Probeer volgende endpoint
    }
  }

  // Probeer RapidAPI /get_politicians VOORDAT we naar mock data gaan
  // Dit geeft tenminste statistieken terug, zelfs als het geen individuele trades zijn
  if (rapidApiKey) {
    try {
      const rapidApiUrl = `https://${rapidApiHost}/get_politicians`
      console.log(`[Congressional Trades] 🔄 Trying RapidAPI /get_politicians as fallback: ${rapidApiUrl}`)
      
      const response = await fetch(rapidApiUrl, {
        headers: {
          "X-RapidAPI-Key": rapidApiKey,
          "X-RapidAPI-Host": rapidApiHost,
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Accept": "application/json",
        },
        cache: "no-store",
      })

      if (response.ok) {
        const contentType = response.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json()
          
          // Zoek de specifieke politicus in de data
          const politicianKey = Object.keys(data).find(
            (key) => key.toLowerCase().includes(politician.toLowerCase()) || 
                     politician.toLowerCase().includes(key.toLowerCase().split(" ")[0])
          )
          
          if (politicianKey && data[politicianKey]) {
            const stats = data[politicianKey]
            console.log(`[Congressional Trades] ✅ Found ${politicianKey} in RapidAPI /get_politicians`)
            
            // Transform statistieken naar trades formaat
            const trades: CongressionalTrade[] = []
            
            trades.push({
              representative: politicianKey,
              party: stats.Party || "D",
              state: stats.State || "CA",
              ticker: "SUMMARY",
              company: `Samenvatting: ${stats.Trades || 0} trades, ${stats.Issuers || 0} issuers`,
              transactionType: "Summary",
              amount: stats.TradeVolume || "Unknown",
              transactionDate: stats.LastTraded || "",
              disclosureDate: stats.LastTraded || "",
              assetDescription: `Trade Volume: ${stats.TradeVolume}, Trades: ${stats.Trades}, Issuers: ${stats.Issuers}`,
            })
            
            if (trades.length > 0) {
              console.log(`[Congressional Trades] ⚠️ Using RapidAPI statistics (geen individuele trades beschikbaar)`)
              cachedData = trades
              cachedDataSource = "RapidAPI Politician Trade Tracker (Statistieken)"
              cacheTimestamp = now
              return {
                trades: trades,
                dataSource: "RapidAPI Politician Trade Tracker (Statistieken)",
                dataTimestamp: now,
              }
            }
          } else {
            console.warn(`[Congressional Trades] ⚠️ Politician ${politician} not found in RapidAPI /get_politicians`)
          }
        }
      } else {
        const errorText = await response.text().catch(() => "")
        console.warn(`[Congressional Trades] ⚠️ RapidAPI /get_politicians returned ${response.status}: ${errorText.substring(0, 200)}`)
      }
    } catch (error) {
      console.warn(`[Congressional Trades] ⚠️ RapidAPI /get_politicians error:`, error)
    }
  }

  // Als laatste redmiddel: return mock data voor development
  // In productie zou je dit moeten verwijderen of alleen gebruiken als expliciet gevraagd
  if (process.env.NODE_ENV === "development") {
    console.warn(`[Congressional Trades] ⚠️ Alle API endpoints gefaald, gebruik mock data voor development`)
    console.warn(`[Congressional Trades] 💡 Tip: Voeg POLIAPI_API_KEY toe aan .env voor echte data`)
    console.warn(`[Congressional Trades] 💡 Of gebruik GitHub repositories (werkt automatisch zonder API key)`)
    const mockTrades = getMockTrades(politician)
    cachedData = mockTrades
    cachedDataSource = "Mock Data (Development - Alle API's gefaald)"
    cacheTimestamp = now
    return {
      trades: mockTrades,
      dataSource: "Mock Data (Development - Alle API's gefaald)",
      dataTimestamp: now,
    }
  }

  // Geen data beschikbaar - geef duidelijke error met instructies
  const hasApiKey = !!process.env.POLIAPI_API_KEY
  const errorMessage = hasApiKey
    ? "Failed to fetch congressional trades from all endpoints. Check je API key en probeer opnieuw."
    : "Geen API key geconfigureerd. Voeg POLIAPI_API_KEY toe aan je .env bestand. Zie CONGRESSIONAL_TRADES_API.md voor instructies."
  
  throw new Error(errorMessage)
}

// Scrape CapitolTrades website
async function scrapeCapitolTrades(politician: string): Promise<CongressionalTrade[]> {
  try {
    // Eerst proberen we de BFF API te gebruiken
    // CapitolTrades heeft een BFF API op bff.capitoltrades.com
    const politicianSlug = politician.toLowerCase().replace(/\s+/g, "-")
    
    // Probeer verschillende API endpoints
    const apiEndpoints = [
      `https://bff.capitoltrades.com/trades?politician=${encodeURIComponent(politician)}`,
      `https://bff.capitoltrades.com/politicians/${encodeURIComponent(politicianSlug)}/trades`,
      `https://bff.capitoltrades.com/politicians?search=${encodeURIComponent(politician)}`,
    ]

    for (const apiUrl of apiEndpoints) {
      try {
        console.log(`[Congressional Trades] 🔄 Trying CapitolTrades API: ${apiUrl}`)
        
        const response = await fetch(apiUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept": "application/json",
            "Referer": "https://www.capitoltrades.com/",
          },
          cache: "no-store",
        })

        if (response.ok) {
          const contentType = response.headers.get("content-type")
          if (contentType && contentType.includes("application/json")) {
            const data = await response.json()
            
            // Probeer verschillende data structuren
            let trades: RawTradeData[] = []
            
            if (Array.isArray(data)) {
              trades = data
            } else if (data.trades && Array.isArray(data.trades)) {
              trades = data.trades
            } else if (data.data && Array.isArray(data.data)) {
              trades = data.data
            } else if (data.results && Array.isArray(data.results)) {
              trades = data.results
            } else if (data.transactions && Array.isArray(data.transactions)) {
              trades = data.transactions
            }
            
            if (trades.length > 0) {
              const transformedTrades = trades
                .filter((trade) => {
                  // Filter op politicus naam
                  const repName = (
                    trade.politician || 
                    trade.politician_name || 
                    trade.representative || 
                    trade.name ||
                    trade.politicianName ||
                    ""
                  ).toLowerCase()
                  const searchName = politician.toLowerCase()
                  return repName.includes(searchName) || searchName.includes(repName.split(" ")[0])
                })
                .map((trade) => ({
                  representative: trade.politician || trade.politician_name || trade.representative || trade.name || trade.politicianName || politician,
                  party: trade.party || trade.partyName || "D",
                  state: trade.state || trade.stateName || "CA",
                  district: trade.district,
                  ticker: trade.ticker || trade.symbol || trade.stock_symbol || trade.issuer_ticker || "",
                  company: trade.company || trade.stock_name || trade.issuer_name || trade.companyName || "",
                  transactionType: trade.transaction_type || trade.transactionType || trade.type || trade.action || "Unknown",
                  amount: trade.amount || trade.value || trade.amount_range || trade.transaction_amount || "Unknown",
                  transactionDate: trade.transaction_date || trade.transactionDate || trade.date || trade.traded_date || "",
                  disclosureDate: trade.disclosure_date || trade.disclosureDate || trade.filed_date || trade.publication_date || "",
                  owner: trade.owner || trade.owner_type,
                  assetDescription: trade.description || trade.asset_description || trade.assetDescription,
                }))
                .filter((trade: CongressionalTrade) => trade.ticker && trade.ticker !== "")

              if (transformedTrades.length > 0) {
                console.log(`[Congressional Trades] ✅ Successfully fetched ${transformedTrades.length} trades from CapitolTrades API`)
                return transformedTrades
              }
            }
          }
        } else {
          console.warn(`[Congressional Trades] ⚠️ CapitolTrades API returned ${response.status} for ${apiUrl}`)
        }
      } catch (error) {
        console.warn(`[Congressional Trades] ⚠️ CapitolTrades API error for ${apiUrl}:`, error)
        continue
      }
    }

    // Als API niet werkt, probeer HTML scraping
    console.log(`[Congressional Trades] 🔄 Trying CapitolTrades HTML scraping...`)
    
    const politicianSlugForUrl = politician.toLowerCase().replace(/\s+/g, "-")
    const urls = [
      `https://www.capitoltrades.com/politicians/${politicianSlugForUrl}`,
      `https://www.capitoltrades.com/trades?politician=${encodeURIComponent(politician)}`,
    ]

    for (const url of urls) {
      try {
        const response = await fetch(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Referer": "https://www.capitoltrades.com/",
          },
          cache: "no-store",
        })

        if (!response.ok) continue

        const html = await response.text()
        
        // Probeer JSON data uit HTML te extraheren (Next.js apps hebben vaak JSON in script tags)
        const jsonMatches = [
          html.match(/<script[^>]*id=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/),
          html.match(/<script[^>]*type=["']application\/json["'][^>]*>([\s\S]*?)<\/script>/),
          html.match(/window\.__NEXT_DATA__\s*=\s*({[\s\S]*?});/),
        ]

        for (const jsonMatch of jsonMatches) {
          if (jsonMatch) {
            try {
              const jsonData = JSON.parse(jsonMatch[1] || jsonMatch[0])
              
              // Navigeer door Next.js data structuur
              let trades: RawTradeData[] = []
              
              if (jsonData.props?.pageProps?.trades) {
                trades = jsonData.props.pageProps.trades
              } else if (jsonData.props?.pageProps?.data?.trades) {
                trades = jsonData.props.pageProps.data.trades
              } else if (jsonData.props?.pageProps?.initialData?.trades) {
                trades = jsonData.props.pageProps.initialData.trades
              } else if (jsonData.trades) {
                trades = jsonData.trades
              } else if (Array.isArray(jsonData)) {
                trades = jsonData
              }
              
              if (trades.length > 0) {
                const transformedTrades = trades
                  .filter((trade) => {
                    const repName = (
                      trade.politician || 
                      trade.politician_name || 
                      trade.representative || 
                      trade.name ||
                      ""
                    ).toLowerCase()
                    const searchName = politician.toLowerCase()
                    return repName.includes(searchName) || searchName.includes(repName.split(" ")[0])
                  })
                  .map((trade) => ({
                    representative: trade.politician || trade.politician_name || trade.representative || trade.name || politician,
                    party: trade.party || trade.partyName || "D",
                    state: trade.state || trade.stateName || "CA",
                    district: trade.district,
                    ticker: trade.ticker || trade.symbol || trade.stock_symbol || trade.issuer_ticker || "",
                    company: trade.company || trade.stock_name || trade.issuer_name || trade.companyName || "",
                    transactionType: trade.transaction_type || trade.transactionType || trade.type || trade.action || "Unknown",
                    amount: trade.amount || trade.value || trade.amount_range || trade.transaction_amount || "Unknown",
                    transactionDate: trade.transaction_date || trade.transactionDate || trade.date || trade.traded_date || "",
                    disclosureDate: trade.disclosure_date || trade.disclosureDate || trade.filed_date || trade.publication_date || "",
                    owner: trade.owner || trade.owner_type,
                    assetDescription: trade.description || trade.asset_description || trade.assetDescription,
                  }))
                  .filter((trade: CongressionalTrade) => trade.ticker && trade.ticker !== "")

                if (transformedTrades.length > 0) {
                  console.log(`[Congressional Trades] ✅ Successfully scraped ${transformedTrades.length} trades from CapitolTrades HTML`)
                  return transformedTrades
                }
              }
            } catch {
              console.warn(`[Congressional Trades] Failed to parse JSON from ${url}`)
            }
          }
        }

        // Alternatief: Parse HTML direct voor trade informatie
        // Zoek naar trade patterns in de HTML
        const tradePatterns = [
          /<div[^>]*class[^>]*trade[^>]*>([\s\S]*?)<\/div>/gi,
          /<div[^>]*data-trade[^>]*>([\s\S]*?)<\/div>/gi,
          /<tr[^>]*class[^>]*trade[^>]*>([\s\S]*?)<\/tr>/gi,
        ]

        for (const pattern of tradePatterns) {
          const matches = Array.from(html.matchAll(pattern))
          if (matches.length > 0) {
            const trades: CongressionalTrade[] = []
            for (const match of matches.slice(0, 100)) { // Limiteer tot 100 trades
              const tradeHtml = match[1]
              
              // Extract ticker - alleen valide tickers (1-5 uppercase letters)
              const tickerMatch = tradeHtml.match(/\b([A-Z]{1,5})\b|Ticker[:\s]+([A-Z]{1,5})|symbol[:\s]+([A-Z]{1,5})/i)
              let ticker = tickerMatch ? (tickerMatch[1] || tickerMatch[2] || tickerMatch[3]) : ""
              // Valideer ticker: alleen uppercase letters, 1-5 karakters, geen woorden zoals "pdown", "Unknown", etc.
              if (ticker) {
                ticker = ticker.toUpperCase().trim()
                const invalidTickers = ["PDOWN", "UNKNOWN", "SUMMARY", "NONE", "NULL", "UNDEFINED"]
                if (invalidTickers.includes(ticker) || ticker.length === 0 || ticker.length > 5) {
                  ticker = ""
                }
              }
              
              // Extract company name
              const companyMatch = tradeHtml.match(/(?:Company|Stock|Name|Issuer)[:\s]+([^<\n]+)/i)
              const company = companyMatch ? companyMatch[1].trim() : ""
              
              // Extract transaction type
              const typeMatch = tradeHtml.match(/(?:Type|Action|Transaction)[:\s]+(Purchase|Sale|Buy|Sell|Exchange)/i)
              const transactionType = typeMatch ? typeMatch[1] : "Unknown"
              
              // Extract amount
              const amountMatch = tradeHtml.match(/(?:Amount|Value)[:\s]+(\$[\d,]+(?:\s*-\s*\$[\d,]+)?)/i)
              const amount = amountMatch ? amountMatch[1] : "Unknown"
              
              // Extract dates (YYYY-MM-DD format)
              const dateMatch = tradeHtml.match(/(\d{4}-\d{2}-\d{2})/g) || tradeHtml.match(/(\d{1,2}\/\d{1,2}\/\d{4})/g)
              const dates = dateMatch || []
              
              if (ticker) {
                trades.push({
                  representative: politician,
                  party: "D",
                  state: "CA",
                  ticker,
                  company: company || ticker,
                  transactionType,
                  amount,
                  transactionDate: dates[0] || "",
                  disclosureDate: dates[1] || dates[0] || "",
                })
              }
            }
            
            if (trades.length > 0) {
              console.log(`[Congressional Trades] ✅ Successfully scraped ${trades.length} trades from CapitolTrades HTML (pattern matching)`)
              return trades
            }
          }
        }
      } catch (error) {
        console.warn(`[Congressional Trades] Failed to scrape ${url}:`, error)
        continue
      }
    }
    
    return []
  } catch (error) {
    console.error(`[Congressional Trades] CapitolTrades scraping error:`, error)
    return []
  }
}

// Scrape Pelosi Tracker website
async function scrapePelosiTracker(politician: string): Promise<CongressionalTrade[]> {
  try {
    // Probeer verschillende Pelosi Tracker endpoints
    const urls = [
      `https://pelositracker.app/portfolios/nancy-pelosi`,
      `https://pelositracker.app/stocks`,
    ]

    for (const url of urls) {
      try {
        const response = await fetch(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          },
          cache: "no-store",
        })

        if (!response.ok) continue

        const html = await response.text()
        
        // Parse HTML voor trade data
        // Pelosi Tracker heeft trades in JSON format in de HTML
        const jsonMatch = html.match(/<script[^>]*type=["']application\/json["'][^>]*>([\s\S]*?)<\/script>/)
        if (jsonMatch) {
          try {
            const jsonData = JSON.parse(jsonMatch[1])
            // Extract trades from JSON structure
            if (jsonData.trades || jsonData.recentTransactions) {
              const trades = jsonData.trades || jsonData.recentTransactions || []
              return (trades as RawTradeData[]).map((trade) => ({
                representative: politician,
                party: trade.party || "D",
                state: trade.state || "CA",
                ticker: trade.ticker || trade.symbol || "",
                company: trade.company || trade.stockName || trade.description || "",
                transactionType: trade.transactionType || trade.action || trade.type || "Unknown",
                amount: trade.amount || trade.amountRange || trade.value || "Unknown",
                transactionDate: trade.transactionDate || trade.tradedDate || trade.date || "",
                disclosureDate: trade.disclosureDate || trade.filedDate || trade.publicationDate || "",
                owner: trade.owner,
                assetDescription: trade.description || trade.assetDescription,
              }))
            }
          } catch {
            console.warn(`[Congressional Trades] Failed to parse JSON from ${url}`)
          }
        }

        // Alternatief: Parse HTML direct voor trade informatie
        // Zoek naar trade patterns in de HTML
        const tradePatterns = [
          /<div[^>]*class[^>]*trade[^>]*>([\s\S]*?)<\/div>/gi,
          /<div[^>]*data-trade[^>]*>([\s\S]*?)<\/div>/gi,
        ]

        for (const pattern of tradePatterns) {
          const matches = Array.from(html.matchAll(pattern))
          if (matches.length > 0) {
            // Extract trade data from HTML
            const trades: CongressionalTrade[] = []
            for (const match of matches.slice(0, 50)) { // Limiteer tot 50 trades
              const tradeHtml = match[1]
              
              // Extract ticker
              const tickerMatch = tradeHtml.match(/([A-Z]{1,5})\s*[-–—]|Ticker[:\s]+([A-Z]{1,5})/i)
              const ticker = tickerMatch ? (tickerMatch[1] || tickerMatch[2]) : ""
              
              // Extract company name
              const companyMatch = tradeHtml.match(/(?:Company|Stock|Name)[:\s]+([^<\n]+)/i)
              const company = companyMatch ? companyMatch[1].trim() : ""
              
              // Extract transaction type
              const typeMatch = tradeHtml.match(/(?:Type|Action)[:\s]+(Purchase|Sale|Buy|Sell)/i)
              const transactionType = typeMatch ? typeMatch[1] : "Unknown"
              
              // Extract amount
              const amountMatch = tradeHtml.match(/(?:Amount|Value)[:\s]+(\$[\d,]+(?:\s*-\s*\$[\d,]+)?)/i)
              const amount = amountMatch ? amountMatch[1] : "Unknown"
              
              // Extract dates
              const dateMatch = tradeHtml.match(/(\d{1,2}\/\d{1,2}\/\d{4})/g)
              const dates = dateMatch || []
              
              if (ticker) {
                trades.push({
                  representative: politician,
                  party: "D",
                  state: "CA",
                  ticker,
                  company: company || ticker,
                  transactionType,
                  amount,
                  transactionDate: dates[0] || "",
                  disclosureDate: dates[1] || dates[0] || "",
                })
              }
            }
            
            if (trades.length > 0) {
              return trades
            }
          }
        }
      } catch (error) {
        console.warn(`[Congressional Trades] Failed to scrape ${url}:`, error)
        continue
      }
    }
    
    return []
  } catch (error) {
    console.error(`[Congressional Trades] Scraping error:`, error)
    return []
  }
}

// Mock data voor development/testing
function getMockTrades(politician: string): CongressionalTrade[] {
  return [
    {
      representative: politician,
      party: "D",
      state: "CA",
      ticker: "AAPL",
      company: "Apple Inc.",
      transactionType: "Purchase",
      amount: "$1,000,001 - $5,000,000",
      transactionDate: "2024-01-15",
      disclosureDate: "2024-01-20",
    },
    {
      representative: politician,
      party: "D",
      state: "CA",
      ticker: "MSFT",
      company: "Microsoft Corporation",
      transactionType: "Purchase",
      amount: "$500,001 - $1,000,000",
      transactionDate: "2024-02-10",
      disclosureDate: "2024-02-15",
    },
    {
      representative: politician,
      party: "D",
      state: "CA",
      ticker: "NVDA",
      company: "NVIDIA Corporation",
      transactionType: "Sale",
      amount: "$1,000,001 - $5,000,000",
      transactionDate: "2024-03-05",
      disclosureDate: "2024-03-10",
    },
  ]
}

export async function GET(_request: NextRequest) {
  // Functionaliteit uitgeschakeld - retourneer 404
  return NextResponse.json(
    {
      error: "Not found",
    },
    { status: 404 }
  )

  /* Originele code hieronder (tijdelijk uitgeschakeld)
  try {
    const searchParams = request.nextUrl.searchParams
    const politician = searchParams.get("politician") || "Nancy Pelosi"
    const limit = parseInt(searchParams.get("limit") || "100")
    const ticker = searchParams.get("ticker") // Optioneel filter op ticker
    const clearCacheParam = searchParams.get("clearCache") // Voor testing: ?clearCache=true
    
    // Leeg cache als gevraagd
    if (clearCacheParam === "true") {
      cachedData = null
      cacheTimestamp = 0
      cachedDataSource = null
      console.log("[Congressional Trades] 🗑️ Cache geleegd")
    }

    // Haal alle trades op
    let fetchResult: FetchResult
    
    try {
      fetchResult = await fetchAllTrades(politician)
    } catch (fetchError) {
      console.error("[Congressional Trades] Failed to fetch trades:", fetchError)
      
      // Return een lege array met een waarschuwing in plaats van een error
      // Dit voorkomt dat de frontend crasht
      return NextResponse.json({
        trades: [],
        count: 0,
        total: 0,
        politician: politician,
        dataSource: "Geen data beschikbaar",
        dataTimestamp: Date.now(),
        warning: "Kon geen data ophalen van House Stock Watcher API. De API is mogelijk tijdelijk niet beschikbaar.",
        error: fetchError instanceof Error ? fetchError.message : "Unknown error",
      })
    }

    const allTrades = fetchResult.trades

    // Filter op politicus (case-insensitive)
    let filteredTrades = allTrades.filter((trade) => {
      const repName = trade.representative?.toLowerCase() || ""
      const searchName = politician.toLowerCase()
      
      // Check of de naam voorkomt in de representative field
      return repName.includes(searchName) || searchName.includes(repName.split(" ")[0])
    })

    // Optioneel filter op ticker
    if (ticker) {
      filteredTrades = filteredTrades.filter((trade) =>
        trade.ticker?.toLowerCase() === ticker.toLowerCase()
      )
    }

    // Sorteer op datum (nieuwste eerst)
    filteredTrades.sort((a, b) => {
      try {
        const dateA = new Date(a.transactionDate || a.disclosureDate || 0).getTime()
        const dateB = new Date(b.transactionDate || b.disclosureDate || 0).getTime()
        return dateB - dateA
      } catch {
        return 0
      }
    })

    // Limiteer resultaten
    const limitedTrades = filteredTrades.slice(0, limit)

    return NextResponse.json({
      trades: limitedTrades,
      count: limitedTrades.length,
      total: filteredTrades.length,
      politician: politician,
      dataSource: fetchResult.dataSource,
      dataTimestamp: fetchResult.dataTimestamp,
    })
  } catch (error) {
    console.error("[Congressional Trades] Error in API route:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    const errorStack = error instanceof Error ? error.stack : undefined
    
    console.error("[Congressional Trades] Error details:", {
      message: errorMessage,
      stack: errorStack,
    })
    
    return NextResponse.json(
      {
        error: "Fout bij ophalen congressional trading data",
        details: errorMessage,
        trades: [], // Return lege array zodat frontend niet crasht
        count: 0,
        total: 0,
      },
      { status: 500 }
    )
  }
  */
}

