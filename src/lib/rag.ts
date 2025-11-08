import { prisma } from "@/lib/prisma"

export interface RAGInput {
  scenario: string
  profile: {
    legalForm?: string
    revenue?: number
    goals?: string[]
    riskProfile?: string
  }
}

export interface RAGResult {
  summary: string
  attentionPoints: string[]
  sources: Array<{
    title: string
    slug: string
    effectiveFrom: Date
    version: string
  }>
  disclaimer: string
  generatedAt: Date
}

export async function generateRAGSummary(input: RAGInput): Promise<RAGResult> {
  const { scenario, profile } = input

  // Zoek relevante knowledge artikelen
  const relevantArticles = await findRelevantArticles(scenario, profile)
  
  // Genereer samenvatting (vereenvoudigd - in productie zou je OpenAI gebruiken)
  const summary = generateSummary(scenario, profile, relevantArticles)
  
  // Extract aandachtspunten
  const attentionPoints = extractAttentionPoints(relevantArticles)
  
  // Bronnen
  const sources = relevantArticles.map(article => ({
    title: article.title,
    slug: article.slug,
    effectiveFrom: article.effectiveFrom,
    version: article.version
  }))

  return {
    summary,
    attentionPoints,
    sources,
    disclaimer: "Deze informatie is uitsluitend bedoeld voor educatieve doeleinden en vormt geen persoonlijk financieel advies. Raadpleeg altijd een gekwalificeerde adviseur voor maatwerkadvies.",
    generatedAt: new Date()
  }
}

async function findRelevantArticles(scenario: string, profile: any) {
  // Zoek artikelen op basis van scenario en profiel
  const searchTerms = extractSearchTerms(scenario, profile)
  
  const articles = await prisma.knowledge.findMany({
    where: {
      AND: [
        {
          OR: searchTerms.map(term => ({
            OR: [
              { title: { contains: term, mode: 'insensitive' } },
              { body: { contains: term, mode: 'insensitive' } },
              { tags: { has: term } }
            ]
          }))
        },
        {
          effectiveFrom: { lte: new Date() },
          OR: [
            { effectiveTo: null },
            { effectiveTo: { gte: new Date() } }
          ]
        }
      ]
    },
    orderBy: { effectiveFrom: 'desc' },
    take: 5
  })

  return articles
}

function extractSearchTerms(scenario: string, profile: any): string[] {
  const terms: string[] = []
  
  // Scenario-specifieke termen
  if (scenario.includes('BV') || scenario.includes('EMZ')) {
    terms.push('inkomstenbelasting', 'vennootschapsbelasting', 'DGA')
  }
  
  if (scenario.includes('ETF') || scenario.includes('beleggen')) {
    terms.push('box 3', 'vermogensbelasting', 'ETF')
  }
  
  if (scenario.includes('vastgoed') || scenario.includes('pand')) {
    terms.push('vastgoed', 'box 3', 'inkomstenbelasting')
  }
  
  if (scenario.includes('crypto') || scenario.includes('bitcoin')) {
    terms.push('crypto', 'digitale valuta', 'box 3')
  }

  // Profiel-specifieke termen
  if (profile.legalForm === 'BV') {
    terms.push('vennootschapsbelasting', 'DGA')
  }
  
  if (profile.legalForm === 'EMZ') {
    terms.push('inkomstenbelasting', 'zelfstandigenaftrek')
  }

  return [...new Set(terms)] // Remove duplicates
}

function generateSummary(scenario: string, profile: any, articles: any[]): string {
  // Vereenvoudigde samenvatting - in productie zou je OpenAI gebruiken
  let summary = `Op basis van uw scenario "${scenario}" en profiel zijn de volgende punten relevant:\n\n`
  
  if (articles.length > 0) {
    summary += `De meest actuele informatie komt uit artikelen over ${articles.map(a => a.title).join(', ')}.\n\n`
  }
  
  summary += "Belangrijke overwegingen:\n"
  summary += "- Controleer altijd de meest recente fiscale regels\n"
  summary += "- Overweeg professioneel advies voor complexe situaties\n"
  summary += "- Houd rekening met uw persoonlijke omstandigheden\n"
  
  return summary
}

function extractAttentionPoints(articles: any[]): string[] {
  const points: string[] = []
  
  articles.forEach(article => {
    // Extract key points from article content (vereenvoudigd)
    if (article.body.includes('belangrijk')) {
      points.push(`Let op: ${article.title}`)
    }
    if (article.body.includes('deadline')) {
      points.push(`Deadline: ${article.title}`)
    }
    if (article.body.includes('wijziging')) {
      points.push(`Wijziging: ${article.title}`)
    }
  })
  
  // Default aandachtspunten
  points.push("Controleer altijd de meest recente fiscale regels")
  points.push("Overweeg professioneel advies voor complexe situaties")
  
  return [...new Set(points)] // Remove duplicates
}
