import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { getClerkUser } from "@/lib/clerk-auth"
import { prisma } from "@/lib/prisma"
import { getOrCreateAnonymousSessionId } from "@/lib/anonymous-session"
import { taxTopics2025, type TaxTopic } from "@/lib/tax-info-2025"

const FREE_TIER_AI_CALL_LIMIT = 10
const ANONYMOUS_SESSION_DURATION_HOURS = 24 // 24 uur tijdslimiet voor anonieme gebruikers

// Functie om te zoeken in knowledge base zonder AI
async function findRelevantKnowledgeArticles(message: string) {
  try {
    // Extract zoektermen uit de vraag
    const searchTerms = extractSearchTermsFromMessage(message)
    
    if (searchTerms.length === 0) {
      return []
    }
    
    // Zoek in knowledge base
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
      take: 3
    })

    return articles
  } catch (error) {
    console.warn("Kon knowledge artikelen niet ophalen:", error)
    return []
  }
}

// Check of de vraag daadwerkelijk over belastingen gaat
function isTaxRelatedQuestion(message: string): boolean {
  const lowerMessage = message.toLowerCase()
  
  // Expliciete belastingtermen die aangeven dat het over belastingen gaat
  const explicitTaxTerms = [
    'belasting', 'fiscaal', 'aftrek', 'korting', 'inkomstenbelasting',
    'vennootschapsbelasting', 'btw', 'dividendbelasting', 'box 1', 'box 2', 'box 3',
    'hypotheekrenteaftrek', 'heffingskorting', 'arbeidskorting', 'vennootschap',
    'zelfstandigenaftrek', 'winstvrijstelling', 'eigenwoningforfait', 'vermogensrendementsheffing',
    'belastingaangifte', 'belastingdienst', 'belastingtarief', 'belastingschijf'
  ]
  
  // Check of er expliciete belastingtermen in de vraag staan
  const hasExplicitTaxTerm = explicitTaxTerms.some(term => lowerMessage.includes(term))
  
  // Als er geen expliciete belastingtermen zijn, is het waarschijnlijk geen belastingvraag
  return hasExplicitTaxTerm
}

// Functie om te zoeken in tax-info-2025
function findRelevantTaxInfo(message: string): TaxTopic[] {
  // Alleen zoeken als de vraag daadwerkelijk over belastingen gaat
  if (!isTaxRelatedQuestion(message)) {
    return []
  }
  
  const lowerMessage = message.toLowerCase()
  const relevantTopics: TaxTopic[] = []

  // Zoek op keywords
  for (const topic of taxTopics2025) {
    const topicText = (topic.title + " " + topic.shortDescription + " " + topic.category).toLowerCase()
    
    // Check of de vraag relevante termen bevat - alleen volledige woorden matchen
    const keywords = [
      topic.id,
      ...topic.title.toLowerCase().split(" ").filter(w => w.length > 3),
      ...topic.category.toLowerCase().split(" ").filter(w => w.length > 3)
    ]
    
    // Gebruik woordgrenzen voor betere matching (voorkomt false positives)
    const hasRelevantKeyword = keywords.some(keyword => {
      if (keyword.length <= 3) return false
      // Match alleen volledige woorden, niet delen van woorden
      const wordBoundaryRegex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
      return wordBoundaryRegex.test(lowerMessage)
    })
    
    // Check ook op specifieke termen in de vraag, maar alleen als het expliciete belastingtermen zijn
    const questionWords = lowerMessage.split(/\s+/).filter(w => w.length > 4)
    const hasMatchingWord = questionWords.some(word => {
      // Alleen matchen als het woord voorkomt in de titel (niet alleen in description)
      return topic.title.toLowerCase().includes(word)
    })
    
    if (hasRelevantKeyword || hasMatchingWord) {
      relevantTopics.push(topic)
    }
  }

  return relevantTopics.slice(0, 2) // Maximaal 2 relevante topics
}

// Extract zoektermen uit bericht
function extractSearchTermsFromMessage(message: string): string[] {
  const lowerMessage = message.toLowerCase()
  const terms: string[] = []

  // Belasting gerelateerde termen
  const taxKeywords = [
    'belasting', 'fiscaal', 'aftrek', 'korting', 'inkomstenbelasting',
    'vennootschapsbelasting', 'btw', 'dividend', 'box 1', 'box 2', 'box 3',
    'hypotheek', 'pensioen', 'lijfrente', 'bv', 'emz', 'dga', 'mkb',
    'zelfstandigenaftrek', 'heffingskorting', 'arbeidskorting', 'vennootschap',
    'ondernemer', 'winstvrijstelling', 'eigenwoning', 'vermogen'
  ]

  taxKeywords.forEach(keyword => {
    if (lowerMessage.includes(keyword)) {
      terms.push(keyword)
    }
  })

  // Voeg belangrijke woorden toe (minimaal 4 karakters)
  const words = message.toLowerCase().split(/\s+/).filter(w => w.length > 4)
  terms.push(...words.slice(0, 5))

  return [...new Set(terms)]
}

// Genereer antwoord op basis van knowledge artikelen en tax info
function generateAnswerFromKnowledge(
  message: string,
  articles: Array<{ title: string; body: string; slug: string }>,
  taxTopics: TaxTopic[]
): string | null {
  // Als er geen relevante informatie is, return null
  if (articles.length === 0 && taxTopics.length === 0) {
    return null
  }

  let answer = ""

  // Voeg informatie toe van tax topics
  if (taxTopics.length > 0) {
    for (const topic of taxTopics) {
      answer += `**${topic.title}**\n\n`
      
      // Voeg relevante secties toe
      for (const section of topic.sections.slice(0, 2)) {
        answer += `### ${section.title}\n${section.content}\n\n`
        
        if (section.subsections) {
          for (const subsection of section.subsections.slice(0, 2)) {
            answer += `**${subsection.title}**: ${subsection.content}\n\n`
          }
        }
      }
      
      if (topic.importantNotes && topic.importantNotes.length > 0) {
        answer += `**Belangrijk**: ${topic.importantNotes[0]}\n\n`
      }
    }
  }

  // Voeg informatie toe van knowledge artikelen
  if (articles.length > 0) {
    answer += "**Aanvullende informatie:**\n\n"
    for (const article of articles) {
      const preview = article.body.length > 500 
        ? article.body.substring(0, 500) + "..." 
        : article.body
      answer += `**${article.title}**\n${preview}\n\n`
    }
  }

  // Voeg disclaimer toe
  answer += "\n\n*Let op: Dit is algemene informatie. Voor persoonlijk advies raad ik aan om een gecertificeerd belastingadviseur te raadplegen.*"

  return answer.trim()
}

export async function POST(request: NextRequest) {
  // Check of database beschikbaar is
  let dbAvailable = false
  try {
    await prisma.$queryRaw`SELECT 1`
    dbAvailable = true
  } catch (dbError) {
    console.warn("Database niet beschikbaar, chatbot werkt zonder rate limiting:", dbError instanceof Error ? dbError.message : "Onbekende fout")
    dbAvailable = false
  }

  try {
    // Probeer ingelogde gebruiker op te halen
    const user = await getClerkUser(request)
    let userId: string | null = null
    let sessionId: string | null = null
    let isPremium = false

    if (user) {
      // Ingelogde gebruiker
      userId = user.id

      // Haal gebruiker op uit database met tier informatie (alleen als database beschikbaar is)
      if (dbAvailable) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { tier: true, trialEndsAt: true, isTrialActive: true }
          })

          if (dbUser) {
            // Check of gebruiker PREMIUM is (of in actieve trial)
            isPremium = dbUser.tier === "PREMIUM" || dbUser.isTrialActive
          }
        } catch (dbError) {
          console.warn("Kon gebruiker niet ophalen uit database:", dbError instanceof Error ? dbError.message : "Onbekende fout")
          // Ga door zonder premium check als database niet werkt
        }
      }
    } else {
      // Anonieme gebruiker - gebruik sessie ID
      sessionId = await getOrCreateAnonymousSessionId(request)
    }

    const { message, conversationHistory = [] } = await request.json()

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json(
        { error: "Bericht is verplicht" },
        { status: 400 }
      )
    }

    // STAP 1: Zoek eerst op de eigen site (knowledge base en tax info)
    const knowledgeArticles = await findRelevantKnowledgeArticles(message)
    const taxTopics = findRelevantTaxInfo(message)
    
    // Bouw context op van gevonden informatie
    let siteContext = ""
    if (knowledgeArticles.length > 0 || taxTopics.length > 0) {
      siteContext = "Relevante informatie gevonden op de site:\n\n"
      
      // Voeg tax topics toe (alleen als echt relevant)
      if (taxTopics.length > 0) {
        for (const topic of taxTopics) {
          siteContext += `**${topic.title}**\n`
          siteContext += `${topic.shortDescription}\n\n`
          
          for (const section of topic.sections) {
            siteContext += `### ${section.title}\n${section.content}\n\n`
            
            if (section.subsections) {
              for (const subsection of section.subsections) {
                siteContext += `**${subsection.title}**: ${subsection.content}\n\n`
              }
            }
          }
          
          if (topic.importantNotes && topic.importantNotes.length > 0) {
            siteContext += `**Belangrijk**: ${topic.importantNotes.join(", ")}\n\n`
          }
        }
      }
      
      // Voeg knowledge artikelen toe
      if (knowledgeArticles.length > 0) {
        for (const article of knowledgeArticles) {
          siteContext += `**${article.title}**\n${article.body}\n\n`
        }
      }
      
      siteContext += "\nGebruik deze informatie ALLEEN als het relevant is voor de vraag. Als de vraag niet over belastingen gaat, negeer dan belastinginformatie. Beantwoord de vraag direct en accuraat."
    }

    // STAP 2: Als geen antwoord zonder AI mogelijk is, check AI limieten
    // Check limiet voor FREE tier gebruikers of anonieme gebruikers (alleen als database beschikbaar is)
    if (!isPremium && dbAvailable) {
      try {
        // Voor anonieme gebruikers: gebruik combinatie van sessionId EN IP voor betere tracking
        // Dit voorkomt misbruik door alleen cookies te verwijderen
        const whereClause = userId
          ? {
              userId: userId,
              endpoint: "chat",
              createdAt: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Laatste 30 dagen voor ingelogde gebruikers
              }
            }
          : {
              OR: [
                // Check op sessionId (cookie-based tracking)
                {
                  sessionId: sessionId,
                  endpoint: "chat",
                  createdAt: {
                    gte: new Date(Date.now() - ANONYMOUS_SESSION_DURATION_HOURS * 60 * 60 * 1000) // 24 uur voor anonieme gebruikers
                  }
                }
              ]
            }

        const aiCallCount = await prisma.aiCall.count({
          where: whereClause
        })

        // Check of limiet is bereikt
        if (aiCallCount >= FREE_TIER_AI_CALL_LIMIT) {
          const response = NextResponse.json(
            { 
              error: "AI_LIMIT_REACHED",
              message: userId 
                ? "Ik kon geen antwoord vinden in de kennisbank. Voor complexere vragen heb je een betaald abonnement nodig om AI te gebruiken. Upgrade naar Premium voor onbeperkte AI aanroepen."
                : "Ik kon geen antwoord vinden in de kennisbank. Voor complexere vragen heb je een betaald abonnement nodig om AI te gebruiken. Maak een account aan en upgrade naar Premium voor onbeperkte AI aanroepen.",
              limit: FREE_TIER_AI_CALL_LIMIT,
              used: aiCallCount
            },
            { status: 403 }
          )

          // Stel cookie in voor anonieme gebruikers
          if (sessionId && !userId) {
            response.cookies.set("anonymous_session_id", sessionId, {
              path: "/",
              maxAge: ANONYMOUS_SESSION_DURATION_HOURS * 60 * 60, // 24 uur (in plaats van 90 dagen)
              sameSite: "lax",
              httpOnly: true
            })
          }

          return response
        }

        // Registreer AI aanroep
        await prisma.aiCall.create({
          data: {
            userId: userId || undefined,
            sessionId: sessionId || undefined,
            endpoint: "chat"
          }
        })
      } catch (dbError) {
        console.warn("Kon rate limiting niet uitvoeren:", dbError instanceof Error ? dbError.message : "Onbekende fout")
        // Ga door zonder rate limiting als database niet werkt
      }
    } else if (isPremium && dbAvailable) {
      // Premium gebruikers - registreer call maar geen limiet check
      try {
        await prisma.aiCall.create({
          data: {
            userId: userId!,
            endpoint: "chat"
          }
        })
      } catch (dbError) {
        console.warn("Kon AI call niet registreren:", dbError instanceof Error ? dbError.message : "Onbekende fout")
        // Ga door zonder registratie als database niet werkt
      }
    }

    // STAP 3: Gebruik OpenAI als laatste redmiddel

    const openaiApiKey = process.env.OPENAI_API_KEY
    if (!openaiApiKey) {
      return NextResponse.json(
        { error: "OpenAI API key is niet geconfigureerd" },
        { status: 500 }
      )
    }

    const openai = new OpenAI({ apiKey: openaiApiKey })

    // Bouw system message op met context van eigen site indien beschikbaar
    let systemContent = `Je bent Finn, een ervaren Nederlandse AI-assistent gespecialiseerd in financiën en belastingen voor 2025. Je helpt gebruikers met:

FINANCIËLE INFORMATIE EN IDEEËN:
- Investeringsstrategieën en portfolio-optimalisatie (algemene informatie, geen persoonlijk advies)
- Vermogensopbouw en pensioenplanning (educatieve informatie)
- Financiële planning en budgettering (algemene tips)
- Investeringsideeën en informatie over verschillende beleggingscategorieën (aandelen, ETF's, crypto, vastgoed) - GEEN beleggingsadvies
- Risicobeheer en diversificatie (educatieve informatie)
- Marktanalyses en trends (informatief)
- Vragen over aandelen, koersen, marktprestaties, en bedrijfsinformatie

BELASTINGINFORMATIE:
- Belastingondersteuning en tips voor 2025 (algemene informatie)
- Uitleg over belastingregels en wijzigingen
- Optimalisatiestrategieën voor ondernemers (algemene ideeën)
- Vragen over inkomstenbelasting, vennootschapsbelasting, BTW, etc.
- Aftrekposten en fiscale voordelen (informatief)
- Box 3 belasting en vermogensrendementsheffing

BELANGRIJKE RICHTLIJNEN:
- Beantwoord de vraag DIRECT en ACCURAAT. Als de vraag over aandelen/beleggingen gaat, geef dan informatie over aandelen/beleggingen, NIET over belastingen (tenzij expliciet gevraagd)
- Gebruik ALLEEN belastinginformatie als de vraag expliciet over belastingen gaat
- Je geeft GEEN investeringsadvies zoals bedoeld in de Wet op het financieel toezicht (Wft)
- Je geeft algemene informatie, ideeën en educatieve content
- Gebruik actuele informatie uit internetbronnen waar mogelijk
- Geef altijd accurate en actuele informatie over financiën en belastingregels 2025
- Wees duidelijk en begrijpelijk in je uitleg
- Verwijs waar mogelijk naar specifieke regels, percentages of bronnen
- Geef praktische tips en voorbeelden waar relevant
- Als je iets niet zeker weet, zeg dat expliciet en raad aan om een gecertificeerd adviseur te raadplegen voor professionele begeleiding
- Antwoord altijd in het Nederlands
- Houd antwoorden beknopt maar compleet
- Combineer kennis van belastingen met financiële inzichten voor complete informatie
- Vermeld waar nodig dat dit geen persoonlijk financieel of beleggingsadvies is`

    // Voeg site context toe aan system message als er informatie gevonden is
    if (siteContext) {
      systemContent += `\n\n${siteContext}`
    }

    // Bouw conversation history op voor context
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: systemContent
      },
      ...conversationHistory.map((msg: { role: string; content: string }) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content
      })),
      {
        role: "user",
        content: message
      }
    ]

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.7,
      max_tokens: 1500
    })

    const assistantMessage = response.choices[0]?.message?.content || "Sorry, ik kon geen antwoord genereren."

    // Bepaal source: "ai_with_context" als er site context was, anders "ai"
    const source = siteContext ? "ai_with_context" : "ai"

    const jsonResponse = NextResponse.json({
      message: assistantMessage,
      timestamp: new Date().toISOString(),
      source: source
    })

    // Stel cookie in voor anonieme gebruikers
    if (sessionId && !userId) {
      jsonResponse.cookies.set("anonymous_session_id", sessionId, {
        path: "/",
        maxAge: ANONYMOUS_SESSION_DURATION_HOURS * 60 * 60, // 24 uur
        sameSite: "lax",
        httpOnly: true
      })
    }

    return jsonResponse
  } catch (error) {
    console.error("Chat API error:", error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: "Interne server fout" },
      { status: 500 }
    )
  }
}
