export interface NewsArticle {
  title: string
  description: string
  url: string
  publishedAt: string
  source: string
  imageUrl?: string
  isFallback?: boolean // Indicator of dit fallback nieuws is
}

interface NewsAPIArticle {
  title: string
  description: string
  url: string
  urlToImage: string | null
  publishedAt: string
  source: {
    id: string | null
    name: string
  }
}

interface NewsResponse {
  articles: NewsAPIArticle[]
  totalResults: number
}

// Map pagina's naar relevante zoektermen - wereldwijde queries voor betere resultaten
export const PAGE_NEWS_KEYWORDS: Record<string, string[]> = {
  "/": ["tax", "taxation", "fiscal", "tax news", "tax policy"],
  "/dashboard": ["business tax", "corporate tax", "entrepreneurs", "small business", "taxation"],
  "/calculators": ["tax calculation", "tax optimization", "tax rates", "fiscal"],
  "/tips": ["tax information", "tax consultation", "fiscal information", "tax planning"],
  "/community": ["business news", "entrepreneurs", "small business", "taxation"],
  "/stocks": ["stock market", "stocks", "investing", "financial markets", "shares"],
  "/accounting": ["accounting", "bookkeeping", "accounting software", "finance"],
  "/audit": ["tax audit", "tax control", "fiscal audit", "tax inspection"],
  "/pricing": ["tax", "taxation", "fiscal", "tax policy"],
  "/calculators/bv-vs-emz": ["corporate tax", "income tax", "business structure", "taxation"],
  "/calculators/etf": ["ETF", "investing", "wealth tax", "portfolio"],
  "/calculators/real-estate": ["real estate tax", "property tax", "rental income", "property"],
  "/calculators/crypto": ["crypto tax", "bitcoin", "cryptocurrency", "digital currency"],
}

// Fallback keywords als pagina niet gevonden wordt - wereldwijd
const DEFAULT_KEYWORDS = ["tax", "taxation", "fiscal", "finance"]

// Wereldwijde nieuwsbronnen met RSS feeds (gratis, geen API key nodig)
const WORLD_NEWS_RSS_FEEDS = [
  {
    name: "BBC News",
    url: "https://feeds.bbci.co.uk/news/rss.xml",
    category: "world"
  },
  {
    name: "Reuters",
    url: "https://www.reutersagency.com/feed/?taxonomy=best-topics&post_type=best",
    category: "world"
  },
  {
    name: "CNN",
    url: "http://rss.cnn.com/rss/edition.rss",
    category: "world"
  },
  {
    name: "The Guardian",
    url: "https://www.theguardian.com/world/rss",
    category: "world"
  },
  {
    name: "Financial Times",
    url: "https://www.ft.com/?format=rss",
    category: "finance"
  },
  {
    name: "Bloomberg",
    url: "https://feeds.bloomberg.com/markets/news.rss",
    category: "finance"
  }
]

// Alternatieve nieuwsbronnen - gebruik directe RSS feeds (wereldwijd)
async function fetchRSSNews(keywords: string[], limit: number): Promise<NewsArticle[]> {
  const allArticles: NewsArticle[] = []
  
  try {
    console.log(`[RSSNews] 🔍 Fetching wereldwijd nieuws voor keywords: ${keywords.join(", ")}`)
    
    // Probeer eerst Google News RSS (wereldwijd)
    const query = keywords.join(" OR ")
    const encodedQuery = encodeURIComponent(query)
    
    const googleNewsUrls = [
      `https://news.google.com/rss/search?q=${encodedQuery}+when:7d&hl=en&gl=US&ceid=US:en`,
      `https://news.google.com/rss/search?q=${encodedQuery}+when:7d&hl=nl&gl=NL&ceid=NL:nl`,
    ]
    
    // Haal nieuws op van Google News
    for (const rssUrl of googleNewsUrls) {
      try {
        const response = await fetch(rssUrl, {
          cache: 'no-store',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/rss+xml, application/xml, text/xml, */*'
          },
          redirect: 'follow'
        })
        
        if (!response.ok) {
          console.warn(`[RSSNews] Google News fetch failed: ${response.status}`)
          continue
        }
        
        const xmlText = await response.text()
        
        if (!xmlText || xmlText.length < 100) {
          console.warn(`[RSSNews] Google News returned empty or invalid response`)
          continue
        }
        
        // Parse RSS XML
        const itemMatches = Array.from(xmlText.matchAll(/<item>([\s\S]*?)<\/item>/gi))
        
        console.log(`[RSSNews] Found ${itemMatches.length} items in Google News feed`)
        
        for (const match of itemMatches) {
          if (allArticles.length >= limit * 3) break
          
          const itemContent = match[1]
          const titleMatch = itemContent.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/i) || 
                            itemContent.match(/<title>(.*?)<\/title>/i)
          const linkMatch = itemContent.match(/<link>(.*?)<\/link>/i) ||
                           itemContent.match(/<guid[^>]*>(.*?)<\/guid>/i)
          const pubDateMatch = itemContent.match(/<pubDate>(.*?)<\/pubDate>/i) ||
                              itemContent.match(/<dc:date>(.*?)<\/dc:date>/i)
          const descriptionMatch = itemContent.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/i) ||
                                  itemContent.match(/<description>(.*?)<\/description>/i)
          const sourceMatch = itemContent.match(/<source>(.*?)<\/source>/i)
          
          if (titleMatch && linkMatch) {
            const title = titleMatch[1].replace(/<[^>]*>/g, '').trim()
            let url = linkMatch[1].trim()
            
            // Google News geeft soms redirect URLs, probeer de echte URL te krijgen
            if (url.startsWith('https://news.google.com/')) {
              // Extract de echte URL uit Google News redirect
              const urlMatch = url.match(/url=([^&]+)/)
              if (urlMatch) {
                url = decodeURIComponent(urlMatch[1])
              }
            }
            
            // Skip als we deze URL al hebben
            if (allArticles.some(a => a.url === url || a.title === title)) {
              continue
            }
            
            const description = descriptionMatch ? descriptionMatch[1].replace(/<[^>]*>/g, '').trim() : ""
            const source = sourceMatch ? sourceMatch[1].trim() : "Google News"
            
            // Parse pubDate
            let publishedAt = new Date().toISOString()
            if (pubDateMatch) {
              try {
                publishedAt = new Date(pubDateMatch[1]).toISOString()
              } catch {
                // Gebruik huidige datum als parsing faalt
              }
            }
            
            // Check of artikel relevant is (bevat keywords)
            const titleLower = title.toLowerCase()
            const descriptionLower = description.toLowerCase()
            const isRelevant = keywords.length === 0 || keywords.some(keyword => 
              titleLower.includes(keyword.toLowerCase()) || 
              descriptionLower.includes(keyword.toLowerCase())
            )
            
            if (!isRelevant && keywords.length > 0) {
              continue // Skip niet-relevante artikelen als we keywords hebben
            }
            
            allArticles.push({
              title,
              description: description.substring(0, 300),
              url,
              publishedAt,
              source,
              isFallback: false
            })
          }
        }
      } catch (error) {
        console.error(`[RSSNews] Error fetching Google News:`, error)
        continue
      }
    }
    
    // Als we niet genoeg artikelen hebben, probeer directe nieuwsbronnen
    if (allArticles.length < limit) {
      console.log(`[RSSNews] 🔄 Not enough articles from Google News (${allArticles.length}), trying direct news sources...`)
      
      for (const feed of WORLD_NEWS_RSS_FEEDS.slice(0, 3)) { // Probeer eerste 3 feeds
        try {
          const response = await fetch(feed.url, {
            cache: 'no-store',
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              'Accept': 'application/rss+xml, application/xml, text/xml, */*'
            },
            redirect: 'follow'
          })
          
          if (!response.ok) {
            continue
          }
          
          const xmlText = await response.text()
          const itemMatches = Array.from(xmlText.matchAll(/<item>([\s\S]*?)<\/item>/gi))
          
          for (const match of itemMatches.slice(0, 5)) { // Max 5 per feed
            if (allArticles.length >= limit * 2) break
            
            const itemContent = match[1]
            const titleMatch = itemContent.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/i) || 
                              itemContent.match(/<title>(.*?)<\/title>/i)
            const linkMatch = itemContent.match(/<link>(.*?)<\/link>/i) ||
                             itemContent.match(/<guid[^>]*>(.*?)<\/guid>/i)
            const pubDateMatch = itemContent.match(/<pubDate>(.*?)<\/pubDate>/i)
            const descriptionMatch = itemContent.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/i) ||
                                    itemContent.match(/<description>(.*?)<\/description>/i)
            
            if (titleMatch && linkMatch) {
              const title = titleMatch[1].replace(/<[^>]*>/g, '').trim()
              const url = linkMatch[1].trim()
              
              if (allArticles.some(a => a.url === url || a.title === title)) {
                continue
              }
              
              const description = descriptionMatch ? descriptionMatch[1].replace(/<[^>]*>/g, '').trim() : ""
              
              let publishedAt = new Date().toISOString()
              if (pubDateMatch) {
                try {
                  publishedAt = new Date(pubDateMatch[1]).toISOString()
                } catch {}
              }
              
              allArticles.push({
                title,
                description: description.substring(0, 300),
                url,
                publishedAt,
                source: feed.name,
                isFallback: false
              })
            }
          }
        } catch (error) {
          console.error(`[RSSNews] Error fetching ${feed.name}:`, error)
          continue
        }
      }
    }
    
    // Sorteer op datum (nieuwste eerst) en neem de beste resultaten
    const sortedArticles = allArticles
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, limit)
    
    if (sortedArticles.length > 0) {
      console.log(`[RSSNews] ✅ ${sortedArticles.length} wereldwijde artikelen gevonden via RSS`)
    } else {
      console.warn(`[RSSNews] ⚠️ Geen artikelen gevonden via RSS`)
    }
    
    return sortedArticles
  } catch (error) {
    console.error("[RSSNews] ❌ Error fetching RSS news:", error)
    return []
  }
}

export async function fetchNewsForPage(pagePath: string, limit: number = 10): Promise<NewsArticle[]> {
  const keywords = PAGE_NEWS_KEYWORDS[pagePath] || DEFAULT_KEYWORDS
  // Combineer keywords voor betere resultaten
  const query = keywords.join(" OR ")

  // Probeer EERST RSS feeds (gratis, geen API key nodig, wereldwijd nieuws)
  console.log(`[NewsService] 🔍 Fetching wereldwijd nieuws voor path: ${pagePath} via RSS...`)
  const rssNews = await fetchRSSNews(keywords, limit)
  
  if (rssNews.length >= 1) {
    // Als we artikelen hebben via RSS, gebruik die (gratis!)
    console.log(`[NewsService] ✅ Using ${rssNews.length} RSS artikelen (gratis, wereldwijd nieuws)`)
    return rssNews
  }

  // Fallback naar NewsAPI als RSS niet genoeg artikelen geeft
  try {
    // Gebruik NewsAPI.org (gratis tier: 100 requests/dag, alleen development)
    const apiKey = process.env.NEWS_API_KEY
    
    if (!apiKey || apiKey === "your-news-api-key") {
      console.warn("⚠️ NEWS_API_KEY niet geconfigureerd")
      console.log(`[NewsService] ℹ️ Gebruik RSS resultaten (${rssNews.length} artikelen)`)
      return rssNews.length > 0 ? rssNews : getFallbackNews(limit)
    }

    // NewsAPI.org endpoint - wereldwijd nieuws (geen language restrictie)
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&pageSize=${limit}&apiKey=${apiKey}`
    
    console.log(`[NewsAPI] 🔍 Fetching news for path: ${pagePath}, query: ${query}`)
    
    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'User-Agent': 'AIVermogen/1.0'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[NewsAPI] ❌ HTTP Error ${response.status}: ${response.statusText}`)
      
      // Parse error details
      try {
        const errorData = JSON.parse(errorText)
        console.error(`[NewsAPI] Error details:`, errorData)
        
        // Specifieke error handling
        if (errorData.status === "error") {
          if (errorData.code === "apiKeyInvalid") {
            console.error("🔑 API key is ongeldig. Controleer je NEWS_API_KEY in .env")
          } else if (errorData.code === "rateLimited") {
            console.error("⏱️ Rate limit bereikt. Wacht even of upgrade je plan")
          } else if (errorData.code === "sourcesTooMany") {
            console.error("📰 Te veel bronnen opgevraagd")
          } else {
            console.error(`❌ NewsAPI error: ${errorData.message || errorData.code}`)
          }
        }
      } catch {
        console.error(`[NewsAPI] Error response (niet JSON):`, errorText.substring(0, 200))
      }
      
      // Gebruik RSS resultaten als NewsAPI faalt
      console.log(`[NewsAPI] 🔄 Gebruik RSS resultaten als fallback`)
      return rssNews.length > 0 ? rssNews : getFallbackNews(limit)
    }

    const data: NewsResponse = await response.json()
    
    console.log(`[NewsAPI] 📰 Received ${data.articles?.length || 0} articles, totalResults: ${data.totalResults || 0}`)
    
    if (data.articles && data.articles.length > 0) {
      // Filter out articles zonder titel of URL
      const validArticles = data.articles.filter(article => 
        article.title && 
        article.title !== "[Removed]" && 
        article.url &&
        !article.title.toLowerCase().includes("removed")
      )
      
      if (validArticles.length === 0) {
        console.warn("[NewsAPI] ⚠️ Geen geldige artikelen gevonden na filtering")
        return rssNews.length > 0 ? rssNews : getFallbackNews(limit)
      }
      
      // Transform NewsAPI format to our format
      const transformed = validArticles.slice(0, limit).map((article) => ({
        title: article.title || "Geen titel",
        description: article.description || "",
        url: article.url || "#",
        publishedAt: article.publishedAt || new Date().toISOString(),
        source: article.source?.name || "Onbekende bron",
        imageUrl: article.urlToImage || undefined,
        isFallback: false // Echte API data
      }))
      
      console.log(`[NewsAPI] ✅ Returning ${transformed.length} REAL articles from API`)
      return transformed
    }

    console.warn("[NewsAPI] ⚠️ Geen artikelen in response, gebruik RSS fallback")
    return rssNews.length > 0 ? rssNews : getFallbackNews(limit)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Onbekende fout"
    const errorStack = error instanceof Error ? error.stack : undefined
    console.error("[NewsAPI] ❌ Error fetching news:", errorMessage)
    if (errorStack) {
      console.error("[NewsAPI] Error stack:", errorStack)
    }
    
    // Gebruik RSS resultaten als fallback
    return rssNews.length > 0 ? rssNews : getFallbackNews(limit)
  }
}

// Haal nieuws op voor een specifiek aandeel, inclusief bedrijfs-, sector- en marktnieuws
export async function fetchStockNews(
  symbol: string,
  companyName?: string,
  sector?: string,
  industry?: string,
  limit: number = 15
): Promise<{
  companyNews: NewsArticle[]
  sectorNews: NewsArticle[]
  marketNews: NewsArticle[]
}> {
  const apiKey = process.env.NEWS_API_KEY
  
  if (!apiKey) {
    console.warn("[StockNews] NEWS_API_KEY niet geconfigureerd")
    return {
      companyNews: [],
      sectorNews: [],
      marketNews: []
    }
  }

  try {
    // Query's voor verschillende nieuwstypen
    const queries: { type: 'company' | 'sector' | 'market', query: string }[] = []
    
    // Bedrijfsnieuws: zoek op bedrijfsnaam en/of symbol
    if (companyName) {
      queries.push({
        type: 'company',
        query: `${companyName} OR ${symbol} stock`
      })
    } else {
      queries.push({
        type: 'company',
        query: `${symbol} stock OR ${symbol} aandeel`
      })
    }
    
    // Sectornieuws: zoek op sector en industrie
    if (sector && industry) {
      queries.push({
        type: 'sector',
        query: `${sector} OR ${industry} sector`
      })
    } else if (sector) {
      queries.push({
        type: 'sector',
        query: sector
      })
    }
    
    // Algemeen marktnieuws: beurs, economie, wereldwijde ontwikkelingen
    queries.push({
      type: 'market',
      query: "stock market OR beurs OR economie OR financial markets OR wereldwijde economie"
    })

    // Haal nieuws op voor elk type
    const newsPromises = queries.map(async ({ type, query }) => {
      try {
        const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=${limit}&apiKey=${apiKey}`
        
        const response = await fetch(url, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        })

        if (!response.ok) {
          console.warn(`[StockNews] Failed to fetch ${type} news: ${response.status}`)
          return []
        }

        const data: NewsResponse = await response.json()
        
        if (data.articles && data.articles.length > 0) {
          const validArticles = data.articles.filter(article => 
            article.title && article.title !== "[Removed]" && article.url
          )
          
          return validArticles.slice(0, limit).map((article) => ({
            title: article.title || "Geen titel",
            description: article.description || "",
            url: article.url || "#",
            publishedAt: article.publishedAt || new Date().toISOString(),
            source: article.source?.name || "Onbekende bron",
            imageUrl: article.urlToImage || undefined,
            isFallback: false
          }))
        }
        
        return []
      } catch (error) {
        console.error(`[StockNews] Error fetching ${type} news:`, error)
        return []
      }
    })

    const results = await Promise.all(newsPromises)
    
    return {
      companyNews: results[0] || [],
      sectorNews: results[1] || [],
      marketNews: results[2] || []
    }
  } catch (error) {
    console.error("[StockNews] Error in fetchStockNews:", error)
    return {
      companyNews: [],
      sectorNews: [],
      marketNews: []
    }
  }
}

// Fallback nieuws als API niet beschikbaar is
function getFallbackNews(limit: number): NewsArticle[] {
  console.warn("[NewsAPI] ⚠️ Gebruik van FALLBACK nieuws - API werkt niet correct!")
  return [
    {
      title: "Nieuwe belastingregels 2025: Wat verandert er voor ondernemers?",
      description: "De Belastingdienst heeft nieuwe regels aangekondigd voor 2025 die impact hebben op ondernemers.",
      url: "#",
      publishedAt: new Date().toISOString(),
      source: "Belastingdienst",
      imageUrl: undefined,
      isFallback: true
    },
    {
      title: "MKB-winstvrijstelling blijft behouden in 2025",
      description: "De MKB-winstvrijstelling blijft bestaan, wat goed nieuws is voor kleine ondernemers.",
      url: "#",
      publishedAt: new Date().toISOString(),
      source: "Financieel Nieuws",
      isFallback: true
    },
    {
      title: "Box 3 hervorming: Nieuwe regels voor vermogensbelasting",
      description: "De hervorming van box 3 heeft gevolgen voor hoe vermogen wordt belast.",
      url: "#",
      publishedAt: new Date().toISOString(),
      source: "Fiscale Ondersteuning",
      isFallback: true
    },
    {
      title: "DGA-salaris: Nieuwe richtlijnen voor 2025",
      description: "De Belastingdienst heeft nieuwe richtlijnen gepubliceerd voor DGA-salaris.",
      url: "#",
      publishedAt: new Date().toISOString(),
      source: "Ondernemers Magazine",
      isFallback: true
    },
    {
      title: "BTW-aangifte: Digitalisering zet door",
      description: "Meer digitalisering in BTW-aangifte maakt het proces sneller en efficiënter.",
      url: "#",
      publishedAt: new Date().toISOString(),
      source: "Accountancy Nieuws",
      isFallback: true
    }
  ].slice(0, limit)
}

