import OpenAI from "openai"
import { prisma } from "@/lib/prisma"

interface PostTopic {
  category: string
  keywords: string[]
  angle: string // Unieke invalshoek voor variatie
}

export class LinkedInContentGenerator {
  private openai: OpenAI
  private appUrl: string

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is niet geconfigureerd")
    }
    this.openai = new OpenAI({ apiKey })
    this.appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://taxwealthhub.nl"
  }

  // Genereer gevarieerde onderwerpen op basis van wat al gepost is
  private async getNextTopic(): Promise<PostTopic> {
    // Haal recent geposte topics op
    const recentPosts = await prisma.linkedInPost.findMany({
      where: { status: "POSTED" },
      orderBy: { postedAt: "desc" },
      take: 10,
      select: { topic: true }
    })

    const recentTopics = new Set(recentPosts.map(p => p.topic))

    // Alle mogelijke topics met variatie
    const allTopics: PostTopic[] = [
      {
        category: "belasting",
        keywords: ["inkomstenbelasting", "tarieven 2025", "aftrekposten"],
        angle: "Praktische tips voor ondernemers"
      },
      {
        category: "belasting",
        keywords: ["vennootschapsbelasting", "VPB", "BV optimalisatie"],
        angle: "Fiscale voordelen van een BV"
      },
      {
        category: "vermogen",
        keywords: ["box 3", "vermogensbelasting", "beleggen"],
        angle: "Vermogensopbouw strategieën"
      },
      {
        category: "vermogen",
        keywords: ["ETF", "diversificatie", "passief inkomen"],
        angle: "ETF als basis voor vermogensopbouw"
      },
      {
        category: "ondernemen",
        keywords: ["BV vs EMZ", "rechtsvorm", "fiscaal voordeel"],
        angle: "Welke rechtsvorm past bij jou?"
      },
      {
        category: "ondernemen",
        keywords: ["DGA", "salaris", "dividend"],
        angle: "DGA salaris optimalisatie"
      },
      {
        category: "vastgoed",
        keywords: ["vastgoed", "box 3", "inkomstenbelasting"],
        angle: "Vastgoed als vermogensopbouw"
      },
      {
        category: "vastgoed",
        keywords: ["cashflow", "yield", "rendement"],
        angle: "Vastgoed cashflow berekenen"
      },
      {
        category: "crypto",
        keywords: ["crypto", "digitale valuta", "box 3"],
        angle: "Crypto in je vermogensopbouw"
      },
      {
        category: "tips",
        keywords: ["belastingplanning", "optimalisatie", "deadlines"],
        angle: "Belastingplanning voor 2025"
      },
      {
        category: "tips",
        keywords: ["aftrekposten", "kosten", "ondernemersaftrek"],
        angle: "Veel vergeten aftrekposten"
      },
      {
        category: "calculator",
        keywords: ["calculator", "berekening", "scenario"],
        angle: "Bereken je fiscale voordeel"
      }
    ]

    // Filter topics die recent al gebruikt zijn
    const availableTopics = allTopics.filter(
      topic => !recentTopics.has(topic.category)
    )

    // Als alle topics gebruikt zijn, reset (gebruik alle topics)
    const topicsToChooseFrom = availableTopics.length > 0 
      ? availableTopics 
      : allTopics

    // Kies willekeurig een topic
    const randomTopic = topicsToChooseFrom[
      Math.floor(Math.random() * topicsToChooseFrom.length)
    ]

    return randomTopic
  }

  // Genereer een LinkedIn post met automatische CTA
  async generatePost(): Promise<{ title: string; content: string; topic: string }> {
    const topic = await this.getNextTopic()

    // Haal relevante kennisbank artikelen op
    const knowledgeArticles = await prisma.knowledge.findMany({
      where: {
        AND: [
          {
            OR: topic.keywords.map(keyword => ({
              OR: [
                { title: { contains: keyword, mode: "insensitive" } },
                { body: { contains: keyword, mode: "insensitive" } },
                { tags: { has: keyword } }
              ]
            }))
          },
          {
            effectiveFrom: { lte: new Date() }
          },
          {
            OR: [
              { effectiveTo: null },
              { effectiveTo: { gte: new Date() } }
            ]
          }
        ]
      },
      orderBy: { effectiveFrom: "desc" },
      take: 3
    })

    const prompt = `Je bent een LinkedIn content creator voor Tax & Wealth Hub, een platform voor belastingondersteuning en vermogensopbouw voor Nederlandse ondernemers.

ONDERWERP: ${topic.category}
INVALSHOEK: ${topic.angle}
KEYWORDS: ${topic.keywords.join(", ")}

Beschikbare kennis voor context:
${knowledgeArticles.map(a => `- ${a.title}`).join("\n")}

GENEREER EEN LINKEDIN POST MET:

1. EEN PAKKENDE TITEL (max 80 karakters) - gebruik emoji's spaarzaam (max 1)

2. EEN BOEIENDE INTRO (2-3 zinnen die de aandacht trekken)

3. 3-5 WAARDEVOLLE TIPS OF INZICHTEN:
   - Praktisch en actiegericht
   - Specifiek voor Nederlandse ondernemers
   - Verwijs naar actuele regels 2025 waar relevant
   - Gebruik concrete voorbeelden waar mogelijk

4. EEN NATUURLIJKE CALL-TO-ACTION:
   - Verwijs naar Tax & Wealth Hub
   - Noem een specifieke feature (calculator, ondersteuning, etc.)
   - Link naar: ${this.appUrl}
   - Maak het waardevol, niet te salesy

5. RELEVANTE HASHTAGS (max 5):
   #BelastingOndersteuning #Ondernemen #Vermogensopbouw #FiscaleOndersteuning #OndernemersNL

STIJL:
- Professioneel maar toegankelijk
- Praktisch en actiegericht
- Maximaal 3000 karakters totaal
- Gebruik emoji's spaarzaam (max 3-4 totaal)
- Geschikt voor LinkedIn (niet te lang, wel waardevol)
- Spreek de lezer direct aan (jij/jouw)
- Gebruik korte alinea's voor leesbaarheid

FORMAT:
Titel: [titel]
---
[content met CTA en hashtags]

Geef alleen de titel en content terug, zonder extra uitleg.`

    const response = await this.openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Je bent een expert LinkedIn content creator, gespecialiseerd in belastingondersteuning en vermogensopbouw voor Nederlandse ondernemers. Je schrijft waardevolle, praktische content die natuurlijk verwijst naar het platform."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 1500
    })

    const generated = response.choices[0]?.message?.content || ""
    
    const titleMatch = generated.match(/Titel:\s*(.+)/i)
    const title = titleMatch?.[1]?.trim() || `${topic.angle} - Belastingondersteuning`
    
    const contentMatch = generated.split("---")[1] || generated
    let content = contentMatch.trim()

    // Zorg dat de app URL altijd in de content staat
    if (!content.includes(this.appUrl)) {
      content += `\n\nOntdek meer op ${this.appUrl}`
    }

    return { title, content, topic: topic.category }
  }

  // Genereer meerdere posts
  async generatePosts(count: number): Promise<Array<{ title: string; content: string; topic: string }>> {
    const posts = []
    
    for (let i = 0; i < count; i++) {
      try {
        const post = await this.generatePost()
        posts.push(post)
        
        // Korte pauze tussen generaties om rate limits te vermijden
        if (i < count - 1) {
          await new Promise(resolve => setTimeout(resolve, 3000))
        }
      } catch (error) {
        console.error(`Error generating post ${i + 1}:`, error)
      }
    }

    return posts
  }
}

