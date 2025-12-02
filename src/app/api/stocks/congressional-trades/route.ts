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
    // Alternatieve repositories kunnen hier worden toegevoegd
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
      
      const trades = data
        .filter((trade: any) => {
          const repName = (trade.representative || trade.politician || trade.name || trade.Representative || "").toLowerCase()
          const searchName = politician.toLowerCase()
          return repName.includes(searchName) || searchName.includes(repName.split(" ")[0])
        })
        .map((trade: any) => ({
          representative: trade.representative || trade.politician || trade.name || trade.Representative || politician,
          party: trade.party || trade.Party || "D",
          state: trade.state || trade.State || "CA",
          district: trade.district || trade.District,
          ticker: trade.ticker || trade.symbol || trade.Ticker || trade.Symbol || "",
          company: trade.company || trade.stockName || trade.Company || trade.StockName || "",
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
  
  console.log(`[Congressional Trades] ⚠️ Alle GitHub repositories gefaald, probeer andere bronnen...`)

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
          let trades: CongressionalTrade[] = []
          
          // Probeer verschillende data structuren
          if (data.trades && Array.isArray(data.trades)) {
            trades = data.trades
          } else if (data.transactions && Array.isArray(data.transactions)) {
            trades = data.transactions
          } else if (data.recentTrades && Array.isArray(data.recentTrades)) {
            trades = data.recentTrades
          } else if (Array.isArray(data)) {
            trades = data
          } else if (data.data && Array.isArray(data.data)) {
            trades = data.data
          }
          
          if (trades.length > 0) {
            const transformedTrades = trades
              .map((trade: any) => ({
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
          let trades: any[] = []
          if (Array.isArray(data)) {
            trades = data
          } else if (data.trades && Array.isArray(data.trades)) {
            trades = data.trades
          } else if (data.latestTrades && Array.isArray(data.latestTrades)) {
            trades = data.latestTrades
          }
          
          // Filter op specifieke politicus
          const filteredTrades = trades
            .filter((trade: any) => {
              const repName = (trade.representative || trade.politician || trade.name || trade.Representative || "").toLowerCase()
              return repName.includes(politician.toLowerCase()) || politician.toLowerCase().includes(repName.split(" ")[0])
            })
            .map((trade: any) => ({
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

  // Probeer verschillende API endpoints (als GitHub repositories falen)
  const endpoints: Array<{
    url: string
    name: string
    requiresAuth: boolean
    transform: (data: any) => CongressionalTrade[]
  }> = [
    // Congressional Trading Data API
    {
      url: "https://www.congressionaltradingdata.com/api/trades",
      name: "Congressional Trading Data API",
      requiresAuth: false,
      transform: (data: any) => {
        if (data && data.trades && Array.isArray(data.trades)) {
          return data.trades
            .filter((trade: any) => {
              const repName = (trade.representative || trade.politician || "").toLowerCase()
              return repName.includes(politician.toLowerCase())
            })
            .map((trade: any) => ({
              representative: trade.representative || trade.politician || politician,
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
        }
        return []
      },
    },
    // RapidAPI - Politician Trade Tracker
    ...(rapidApiKey ? [{
      url: rapidApiHost 
        ? `https://${rapidApiHost}/get_trades?politician=${encodedPolitician}`
        : `https://politician-trade-tracker1.p.rapidapi.com/get_trades?politician=${encodedPolitician}`,
      name: "RapidAPI Politician Trade Tracker",
      requiresAuth: true,
      transform: (data: any) => {
        let trades: any[] = []
        
        // Probeer verschillende data structuren
        if (Array.isArray(data)) {
          trades = data
        } else if (data && data.trades && Array.isArray(data.trades)) {
          trades = data.trades
        } else if (data && data.data && Array.isArray(data.data)) {
          trades = data.data
        } else if (data && data.results && Array.isArray(data.results)) {
          trades = data.results
        } else if (data && data.transactions && Array.isArray(data.transactions)) {
          trades = data.transactions
        }
        
        return trades
          .filter((trade: any) => {
            const repName = (trade.representative || trade.politician || trade.name || trade.Representative || trade.politician_name || "").toLowerCase()
            return repName.includes(politician.toLowerCase()) || politician.toLowerCase().includes(repName.split(" ")[0])
          })
          .map((trade: any) => ({
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
      transform: (data: any) => {
        // PoliAPI kan verschillende formats hebben
        let trades: any[] = []
        
        if (Array.isArray(data)) {
          trades = data
        } else if (data && data.trades && Array.isArray(data.trades)) {
          trades = data.trades
        } else if (data && data.data && Array.isArray(data.data)) {
          trades = data.data
        } else if (data && typeof data === 'object') {
          // Mogelijk een enkel object, maak array
          trades = [data]
        }
        
        return trades.map((trade: any) => ({
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
      transform: (data: any) => Array.isArray(data) ? data : [],
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
              return trades.map((trade: any) => ({
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
          } catch (parseError) {
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

export async function GET(request: NextRequest) {
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
}

