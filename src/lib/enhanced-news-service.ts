/**
 * Enhanced News Service voor Deep Research
 * Gebruikt meerdere gratis nieuwsbronnen specifiek voor financiële markten:
 * - Financiële RSS feeds (MarketWatch, Seeking Alpha, Finviz, Yahoo Finance News)
 * - Sector-specifieke nieuwsbronnen
 * - Google News (al geïmplementeerd)
 */

interface NewsArticle {
  title: string
  description: string
  url: string
  publishedAt: string
  source: string
  imageUrl?: string
  category?: 'company' | 'sector' | 'market' | 'analyst'
}

/**
 * Schoon description op: decodeer HTML entities, verwijder HTML tags en vreemde tekens
 */
function cleanDescription(description: string): string {
  if (!description) return ""
  
  let cleaned = description
  
  // Verwijder complete HTML tags (zoals <a href="..."> of <p>)
  cleaned = cleaned.replace(/<[^>]*>/g, '')
  
  // Verwijder incomplete HTML tags (zoals <a... of <p zonder sluitende >)
  // Dit pakt alle strings die beginnen met < maar niet eindigen met >
  cleaned = cleaned.replace(/<[^>]*/g, '') // Verwijder alle incomplete tags
  
  // Decodeer HTML entities (zoals &lt; &gt; &amp; &quot; etc.)
  cleaned = cleaned
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&apos;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&hellip;/g, '...')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
  
  // Verwijder eventuele overgebleven incomplete tags na decodering
  cleaned = cleaned.replace(/<[^>]*/g, '')
  
  // Verwijder vreemde tekens aan het begin/einde (zoals &lt;a... of &amp;...)
  cleaned = cleaned.replace(/^&[a-z0-9#]+;/i, '').trim()
  cleaned = cleaned.replace(/&[a-z0-9#]+;$/i, '').trim()
  
  // Verwijder extra witruimte
  cleaned = cleaned.replace(/\s+/g, ' ').trim()
  
  // Verwijder lege of alleen-witruimte strings
  if (!cleaned || cleaned.length === 0) return ""
  
  // Verwijder strings die alleen HTML entities bevatten
  if (/^(&[a-z0-9#]+;)+$/i.test(cleaned)) return ""
  
  // Verwijder strings die beginnen met < of alleen incomplete HTML tags bevatten
  if (/^<[^>]*$/i.test(cleaned)) return ""
  if (cleaned.trim().startsWith('<')) return ""
  
  return cleaned
}

// Financiële nieuwsbronnen met RSS feeds (gratis)
const FINANCIAL_NEWS_RSS_FEEDS = [
  {
    name: "MarketWatch",
    url: "https://feeds.marketwatch.com/marketwatch/topstories",
    category: "market" as const
  },
  {
    name: "Seeking Alpha",
    url: "https://seekingalpha.com/feed.xml",
    category: "analyst" as const
  },
  {
    name: "Yahoo Finance News",
    url: "https://feeds.finance.yahoo.com/rss/2.0/headline",
    category: "market" as const
  },
  {
    name: "Financial Times",
    url: "https://www.ft.com/?format=rss",
    category: "market" as const
  },
  {
    name: "Bloomberg Markets",
    url: "https://feeds.bloomberg.com/markets/news.rss",
    category: "market" as const
  },
  {
    name: "Reuters Business",
    url: "https://www.reutersagency.com/feed/?taxonomy=best-topics&post_type=best",
    category: "market" as const
  },
  {
    name: "CNBC",
    url: "https://feeds.nbcnews.com/nbcnews/public/business",
    category: "market" as const
  },
  {
    name: "InvestorPlace",
    url: "https://investorplace.com/feed/",
    category: "analyst" as const
  }
]

/**
 * Parse RSS feed en haal artikelen op
 */
async function parseRSSFeed(feedUrl: string, sourceName: string, category: 'company' | 'sector' | 'market' | 'analyst'): Promise<NewsArticle[]> {
  try {
    const response = await fetch(feedUrl, {
      cache: 'no-store',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*'
      },
      redirect: 'follow'
    })

    if (!response.ok) {
      return []
    }

    const xmlText = await response.text()
    
    if (!xmlText || xmlText.length < 100) {
      return []
    }

    // Parse RSS XML
    const itemMatches = Array.from(xmlText.matchAll(/<item>([\s\S]*?)<\/item>/gi))
    const articles: NewsArticle[] = []

    for (const match of itemMatches.slice(0, 10)) { // Max 10 per feed
      const itemContent = match[1]
      
      const titleMatch = itemContent.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/i) || 
                        itemContent.match(/<title>(.*?)<\/title>/i)
      const linkMatch = itemContent.match(/<link>(.*?)<\/link>/i) ||
                       itemContent.match(/<guid[^>]*>(.*?)<\/guid>/i)
      const pubDateMatch = itemContent.match(/<pubDate>(.*?)<\/pubDate>/i) ||
                          itemContent.match(/<dc:date>(.*?)<\/dc:date>/i)
      const descriptionMatch = itemContent.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/i) ||
                              itemContent.match(/<description>(.*?)<\/description>/i)
      const imageMatch = itemContent.match(/<media:content[^>]*url="([^"]*)"[^>]*>/i) ||
                        itemContent.match(/<enclosure[^>]*url="([^"]*)"[^>]*>/i)

      if (titleMatch && linkMatch) {
        const title = titleMatch[1].replace(/<[^>]*>/g, '').trim()
        let url = linkMatch[1].trim()
        
        // Clean up Google News redirect URLs
        if (url.startsWith('https://news.google.com/')) {
          const urlMatch = url.match(/url=([^&]+)/)
          if (urlMatch) {
            url = decodeURIComponent(urlMatch[1])
          }
        }

        const rawDescription = descriptionMatch ? descriptionMatch[1] : ""
        const description = cleanDescription(rawDescription)
        const cleanedDescription = description ? description.substring(0, 300) : ""
        
        let publishedAt = new Date().toISOString()
        if (pubDateMatch) {
          try {
            publishedAt = new Date(pubDateMatch[1]).toISOString()
          } catch {
            // Use current date if parsing fails
          }
        }

        const imageUrl = imageMatch ? imageMatch[1] : undefined

        articles.push({
          title,
          description: cleanedDescription,
          url,
          publishedAt,
          source: sourceName,
          imageUrl,
          category
        })
      }
    }

    return articles
  } catch (error) {
    console.error(`[EnhancedNews] Error parsing RSS feed ${sourceName}:`, error)
    return []
  }
}

/**
 * Zoek nieuws specifiek voor een bedrijf via Google News
 */
async function searchCompanyNews(symbol: string, companyName?: string, limit: number = 15): Promise<NewsArticle[]> {
  const searchTerms = companyName 
    ? `${companyName} OR ${symbol} stock`
    : `${symbol} stock OR ${symbol} aandeel`
  
  const encodedQuery = encodeURIComponent(searchTerms)
  const googleNewsUrl = `https://news.google.com/rss/search?q=${encodedQuery}+when:7d&hl=en&gl=US&ceid=US:en`

  try {
    const response = await fetch(googleNewsUrl, {
      cache: 'no-store',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*'
      },
      redirect: 'follow'
    })

    if (!response.ok) {
      return []
    }

    const xmlText = await response.text()
    const itemMatches = Array.from(xmlText.matchAll(/<item>([\s\S]*?)<\/item>/gi))
    const articles: NewsArticle[] = []

    for (const match of itemMatches.slice(0, limit)) {
      const itemContent = match[1]
      const titleMatch = itemContent.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/i) || 
                        itemContent.match(/<title>(.*?)<\/title>/i)
      const linkMatch = itemContent.match(/<link>(.*?)<\/link>/i)
      const pubDateMatch = itemContent.match(/<pubDate>(.*?)<\/pubDate>/i)
      const descriptionMatch = itemContent.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/i) ||
                              itemContent.match(/<description>(.*?)<\/description>/i)
      const sourceMatch = itemContent.match(/<source>(.*?)<\/source>/i)

      if (titleMatch && linkMatch) {
        const title = titleMatch[1].replace(/<[^>]*>/g, '').trim()
        let url = linkMatch[1].trim()
        
        if (url.startsWith('https://news.google.com/')) {
          const urlMatch = url.match(/url=([^&]+)/)
          if (urlMatch) {
            url = decodeURIComponent(urlMatch[1])
          }
        }

        const rawDescription = descriptionMatch ? descriptionMatch[1] : ""
        const description = cleanDescription(rawDescription)
        const cleanedDescription = description ? description.substring(0, 300) : ""
        
        let publishedAt = new Date().toISOString()
        if (pubDateMatch) {
          try {
            publishedAt = new Date(pubDateMatch[1]).toISOString()
          } catch {}
        }

        articles.push({
          title,
          description: cleanedDescription,
          url,
          publishedAt,
          source: sourceMatch ? sourceMatch[1].trim() : "Google News",
          category: 'company'
        })
      }
    }

    return articles
  } catch (error) {
    console.error("[EnhancedNews] Error searching company news:", error)
    return []
  }
}

/**
 * Zoek sectornieuws via Google News
 */
async function searchSectorNews(sector: string, industry?: string, limit: number = 10): Promise<NewsArticle[]> {
  const searchTerms = industry 
    ? `${sector} OR ${industry} sector`
    : `${sector} sector`
  
  const encodedQuery = encodeURIComponent(searchTerms)
  const googleNewsUrl = `https://news.google.com/rss/search?q=${encodedQuery}+when:7d&hl=en&gl=US&ceid=US:en`

  try {
    const response = await fetch(googleNewsUrl, {
      cache: 'no-store',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*'
      }
    })

    if (!response.ok) {
      return []
    }

    const xmlText = await response.text()
    const itemMatches = Array.from(xmlText.matchAll(/<item>([\s\S]*?)<\/item>/gi))
    const articles: NewsArticle[] = []

    for (const match of itemMatches.slice(0, limit)) {
      const itemContent = match[1]
      const titleMatch = itemContent.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/i) || 
                        itemContent.match(/<title>(.*?)<\/title>/i)
      const linkMatch = itemContent.match(/<link>(.*?)<\/link>/i)
      const pubDateMatch = itemContent.match(/<pubDate>(.*?)<\/pubDate>/i)
      const descriptionMatch = itemContent.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/i) ||
                              itemContent.match(/<description>(.*?)<\/description>/i)

      if (titleMatch && linkMatch) {
        const title = titleMatch[1].replace(/<[^>]*>/g, '').trim()
        let url = linkMatch[1].trim()
        
        if (url.startsWith('https://news.google.com/')) {
          const urlMatch = url.match(/url=([^&]+)/)
          if (urlMatch) {
            url = decodeURIComponent(urlMatch[1])
          }
        }

        const rawDescription = descriptionMatch ? descriptionMatch[1] : ""
        const description = cleanDescription(rawDescription)
        const cleanedDescription = description ? description.substring(0, 300) : ""
        
        articles.push({
          title,
          description: cleanedDescription,
          url,
          publishedAt: pubDateMatch ? (() => {
            try { return new Date(pubDateMatch[1]).toISOString() } catch { return new Date().toISOString() }
          })() : new Date().toISOString(),
          source: "Google News",
          category: 'sector'
        })
      }
    }

    return articles
  } catch (error) {
    console.error("[EnhancedNews] Error searching sector news:", error)
    return []
  }
}

/**
 * Haal algemeen marktnieuws op van financiële RSS feeds
 */
async function fetchMarketNews(limit: number = 15): Promise<NewsArticle[]> {
  const allArticles: NewsArticle[] = []

  // Haal nieuws op van alle financiële feeds parallel
  const feedPromises = FINANCIAL_NEWS_RSS_FEEDS.map(feed => 
    parseRSSFeed(feed.url, feed.name, feed.category)
  )

  const results = await Promise.allSettled(feedPromises)
  
  results.forEach((result, idx) => {
    if (result.status === 'fulfilled') {
      allArticles.push(...result.value)
    } else {
      console.warn(`[EnhancedNews] Feed ${FINANCIAL_NEWS_RSS_FEEDS[idx].name} failed`)
    }
  })

  // Sorteer op datum (nieuwste eerst) en verwijder duplicaten
  const uniqueArticles = Array.from(
    new Map(allArticles.map(article => [article.url, article])).values()
  )
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, limit)

  return uniqueArticles
}

/**
 * Hoofdfunctie: Haal uitgebreid nieuws op voor een aandeel
 */
export async function fetchEnhancedStockNews(
  symbol: string,
  companyName?: string,
  sector?: string,
  industry?: string,
  limit: number = 20
): Promise<{
  companyNews: NewsArticle[]
  sectorNews: NewsArticle[]
  marketNews: NewsArticle[]
  analystNews: NewsArticle[]
}> {
  console.log(`[EnhancedNews] Fetching news for ${symbol}...`)

  // Haal alle nieuwstypen parallel op
  const [companyNews, sectorNews, marketNews, analystNews] = await Promise.all([
    searchCompanyNews(symbol, companyName, limit),
    sector ? searchSectorNews(sector, industry, Math.floor(limit / 2)) : Promise.resolve([]),
    fetchMarketNews(Math.floor(limit / 2)),
    // Analyst nieuws komt uit Seeking Alpha en InvestorPlace feeds
    Promise.all([
      parseRSSFeed("https://seekingalpha.com/feed.xml", "Seeking Alpha", "analyst"),
      parseRSSFeed("https://investorplace.com/feed/", "InvestorPlace", "analyst")
    ]).then(results => {
      const combined = results.flat()
      return combined
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
        .slice(0, Math.floor(limit / 2))
    })
  ])

  console.log(`[EnhancedNews] ✅ Found ${companyNews.length} company, ${sectorNews.length} sector, ${marketNews.length} market, ${analystNews.length} analyst articles`)

  return {
    companyNews,
    sectorNews,
    marketNews,
    analystNews
  }
}

/**
 * Format nieuws voor gebruik in AI prompts
 */
export function formatEnhancedNews(news: {
  companyNews: NewsArticle[]
  sectorNews: NewsArticle[]
  marketNews: NewsArticle[]
  analystNews: NewsArticle[]
}): string {
  let formatted = `\n=== UITGEBREID NIEUWS ===\n`

  if (news.companyNews.length > 0) {
    formatted += `\n--- BEDRIJFSNIEUWS (${news.companyNews.length} artikelen) ---\n`
    news.companyNews.slice(0, 10).forEach((article, idx) => {
      formatted += `${idx + 1}. ${article.title}\n`
      if (article.description) {
        formatted += `   ${article.description}\n`
      }
      formatted += `   Bron: ${article.source} | Datum: ${new Date(article.publishedAt).toLocaleDateString('nl-NL')}\n\n`
    })
  }

  if (news.sectorNews.length > 0) {
    formatted += `\n--- SECTORNIEUWS (${news.sectorNews.length} artikelen) ---\n`
    news.sectorNews.slice(0, 8).forEach((article, idx) => {
      formatted += `${idx + 1}. ${article.title}\n`
      if (article.description) {
        formatted += `   ${article.description}\n`
      }
      formatted += `   Bron: ${article.source} | Datum: ${new Date(article.publishedAt).toLocaleDateString('nl-NL')}\n\n`
    })
  }

  if (news.marketNews.length > 0) {
    formatted += `\n--- MARKTONTWIKKELINGEN (${news.marketNews.length} artikelen) ---\n`
    news.marketNews.slice(0, 8).forEach((article, idx) => {
      formatted += `${idx + 1}. ${article.title}\n`
      if (article.description) {
        formatted += `   ${article.description}\n`
      }
      formatted += `   Bron: ${article.source} | Datum: ${new Date(article.publishedAt).toLocaleDateString('nl-NL')}\n\n`
    })
  }

  if (news.analystNews.length > 0) {
    formatted += `\n--- ANALYST INZICHTEN (${news.analystNews.length} artikelen) ---\n`
    news.analystNews.slice(0, 8).forEach((article, idx) => {
      formatted += `${idx + 1}. ${article.title}\n`
      if (article.description) {
        formatted += `   ${article.description}\n`
      }
      formatted += `   Bron: ${article.source} | Datum: ${new Date(article.publishedAt).toLocaleDateString('nl-NL')}\n\n`
    })
  }

  return formatted
}

