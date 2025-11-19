interface NewsArticle {
  title: string
  description: string
  url: string
  publishedAt: string
  source: string
  imageUrl?: string
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
      return getFallbackNews(limit)
    }

    // NewsAPI.org endpoint
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=nl&sortBy=publishedAt&pageSize=${limit}&apiKey=${apiKey}`
    
    const response = await fetch(url, {
      next: { revalidate: 300 } // Cache voor 5 minuten
    })

    if (!response.ok) {
      console.error("NewsAPI error:", response.statusText)
      return getFallbackNews(limit)
    }

    const data: NewsResponse = await response.json()
    
    if (data.articles && data.articles.length > 0) {
      // Transform NewsAPI format to our format
      return data.articles.slice(0, limit).map((article) => ({
        title: article.title || "Geen titel",
        description: article.description || "",
        url: article.url || "#",
        publishedAt: article.publishedAt || new Date().toISOString(),
        source: article.source?.name || "Onbekende bron",
        imageUrl: article.urlToImage || undefined
      }))
    }

    return getFallbackNews(limit)
  } catch (error) {
    console.error("Error fetching news:", error)
    return getFallbackNews(limit)
  }
}

// Fallback nieuws als API niet beschikbaar is
function getFallbackNews(limit: number): NewsArticle[] {
  return [
    {
      title: "Nieuwe belastingregels 2025: Wat verandert er voor ondernemers?",
      description: "De Belastingdienst heeft nieuwe regels aangekondigd voor 2025 die impact hebben op ondernemers.",
      url: "#",
      publishedAt: new Date().toISOString(),
      source: "Belastingdienst",
      imageUrl: undefined
    },
    {
      title: "MKB-winstvrijstelling blijft behouden in 2025",
      description: "De MKB-winstvrijstelling blijft bestaan, wat goed nieuws is voor kleine ondernemers.",
      url: "#",
      publishedAt: new Date().toISOString(),
      source: "Financieel Nieuws"
    },
    {
      title: "Box 3 hervorming: Nieuwe regels voor vermogensbelasting",
      description: "De hervorming van box 3 heeft gevolgen voor hoe vermogen wordt belast.",
      url: "#",
      publishedAt: new Date().toISOString(),
      source: "Fiscaal Advies"
    },
    {
      title: "DGA-salaris: Nieuwe richtlijnen voor 2025",
      description: "De Belastingdienst heeft nieuwe richtlijnen gepubliceerd voor DGA-salaris.",
      url: "#",
      publishedAt: new Date().toISOString(),
      source: "Ondernemers Magazine"
    },
    {
      title: "BTW-aangifte: Digitalisering zet door",
      description: "Meer digitalisering in BTW-aangifte maakt het proces sneller en efficiënter.",
      url: "#",
      publishedAt: new Date().toISOString(),
      source: "Accountancy Nieuws"
    }
  ].slice(0, limit)
}

