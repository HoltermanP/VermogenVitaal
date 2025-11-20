interface NewsArticle {
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

// Map pagina's naar relevante zoektermen - specifiekere queries voor betere resultaten
export const PAGE_NEWS_KEYWORDS: Record<string, string[]> = {
  "/": ["belasting Nederland 2025", "fiscaal nieuws", "belastingregels"],
  "/dashboard": ["belasting ondernemers Nederland", "MKB belasting", "ondernemers fiscaal"],
  "/calculators": ["belasting berekenen", "fiscale optimalisatie", "belastingtarieven"],
  "/advies": ["belastingadvies Nederland", "fiscaal advies", "belastingconsulent"],
  "/community": ["MKB Nederland", "ondernemers nieuws", "zelfstandigen"],
  "/stocks": ["beurs nieuws Nederland", "aandelen", "beleggen"],
  "/accounting": ["boekhouding software", "administratie software", "accounting"],
  "/audit": ["belastingcontrole", "fiscale controle", "administratie controle"],
  "/pricing": ["belastingdienst", "fiscaal nieuws", "belastingregels"],
  "/calculators/bv-vs-emz": ["BV EMZ belasting", "vennootschapsbelasting", "inkomstenbelasting"],
  "/calculators/etf": ["ETF beleggen", "box 3 belasting", "vermogensbelasting"],
  "/calculators/real-estate": ["vastgoed belasting", "box 3 vastgoed", "huurinkomsten"],
  "/calculators/crypto": ["crypto belasting", "bitcoin belasting", "digitale valuta"],
  "/calculators/dba-opdrachtomschrijving": ["DBA wetgeving", "opdrachtovereenkomst", "zelfstandigen"],
}

// Fallback keywords als pagina niet gevonden wordt
const DEFAULT_KEYWORDS = ["belasting Nederland", "fiscaal nieuws"]

export async function fetchNewsForPage(pagePath: string, limit: number = 10): Promise<NewsArticle[]> {
  const keywords = PAGE_NEWS_KEYWORDS[pagePath] || DEFAULT_KEYWORDS
  // Combineer keywords voor betere resultaten
  const query = keywords.join(" OR ")

  try {
    // Gebruik NewsAPI.org (gratis tier: 100 requests/dag)
    const apiKey = process.env.NEWS_API_KEY
    
    if (!apiKey) {
      console.warn("NEWS_API_KEY niet geconfigureerd, gebruik fallback nieuws")
      console.warn("Zorg dat NEWS_API_KEY is ingesteld in je environment variabelen")
      return getFallbackNews(limit)
    }

    // NewsAPI.org endpoint
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=nl&sortBy=publishedAt&pageSize=${limit}&apiKey=${apiKey}`
    
    console.log(`[NewsAPI] Fetching news for path: ${pagePath}, query: ${query}`)
    
    const response = await fetch(url, {
      cache: 'no-store', // Geen cache voor realtime updates
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[NewsAPI] HTTP Error ${response.status}: ${response.statusText}`)
      console.error(`[NewsAPI] Error response:`, errorText)
      
      // Probeer error details te parsen
      try {
        const errorData = JSON.parse(errorText)
        console.error(`[NewsAPI] Error details:`, errorData)
      } catch {
        // Niet JSON, gebruik de tekst
      }
      
      return getFallbackNews(limit)
    }

    const data: NewsResponse = await response.json()
    
    console.log(`[NewsAPI] Received ${data.articles?.length || 0} articles, totalResults: ${data.totalResults || 0}`)
    
    if (data.articles && data.articles.length > 0) {
      // Filter out articles zonder titel of URL
      const validArticles = data.articles.filter(article => 
        article.title && article.title !== "[Removed]" && article.url
      )
      
      if (validArticles.length === 0) {
        console.warn("[NewsAPI] Geen geldige artikelen gevonden na filtering")
        return getFallbackNews(limit)
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

    console.warn("[NewsAPI] Geen artikelen in response, gebruik fallback")
    return getFallbackNews(limit)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Onbekende fout"
    const errorStack = error instanceof Error ? error.stack : undefined
    console.error("[NewsAPI] Error fetching news:", errorMessage)
    console.error("[NewsAPI] Error stack:", errorStack)
    console.error("[NewsAPI] Full error:", error)
    return getFallbackNews(limit)
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
      source: "Fiscaal Advies",
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

