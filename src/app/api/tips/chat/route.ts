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
    
    // Zoek in knowledge base met verbeterde matching
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
      take: 5 // Verhoogd van 3 naar 5 voor betere coverage
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

// Extract zoektermen uit bericht - verbeterd om ook functionaliteiten te vinden
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

  // Functionaliteit gerelateerde termen
  const featureKeywords = [
    'deep research', 'deepresearch', 'onderzoek', 'research', 'rapport',
    'portfolio', 'belegging', 'tracking', 'alert',
    'calculator', 'bereken', 'reken', 'simulator',
    'audit', 'document', 'boekhouding', 'xaf',
    'aandeel', 'stock', 'beurs', 'pelosi',
    'community', 'vraag', 'antwoord', 'q&a',
    'tip', 'artikel', 'kennis', 'knowledge'
  ]

  featureKeywords.forEach(keyword => {
    if (lowerMessage.includes(keyword)) {
      terms.push(keyword)
    }
  })

  // Voeg belangrijke woorden toe (minimaal 4 karakters, maar ook kortere relevante woorden)
  const words = message.toLowerCase().split(/\s+/).filter(w => w.length >= 3)
  terms.push(...words.slice(0, 8)) // Verhoogd van 5 naar 8

  return [...new Set(terms)]
}

// Functie die alle site-functionaliteiten documenteert
function getSiteFeaturesInfo(): string {
  return `BESCHIKBARE FUNCTIONALITEITEN OP DE SITE:

1. DEEP RESEARCH RAPPORTEN
   - Locatie: /stocks/deep-research
   - Functionaliteit: AI-powered diepgaande analyses van aandelen en andere financiële instrumenten
   - Beschrijving: Genereert uitgebreide onderzoeksrapporten met fundamentele analyse, technische analyse, nieuws, sentiment en meer
   - Gebruik: Gebruikers kunnen een aandeel zoeken en een Deep Research rapport genereren dat real-time data combineert met AI-analyse
   - Vereisten: Account vereist (niet beschikbaar voor anonieme gebruikers)
   - Status tracking: Rapporten hebben status (GENERATING, COMPLETED, FAILED, CANCELLED) met progress tracking
   - PDF export: Rapporten kunnen worden gedownload als PDF

2. PORTFOLIO TRACKING
   - Locatie: /portfolio
   - Functionaliteit: Portfolio beheer en tracking van beleggingen
   - Beschrijving: Gebruikers kunnen hun portfolio bijhouden, alerts instellen en historische data bekijken
   - Features: Portfolio items toevoegen, prijs alerts, historische performance tracking

3. CALCULATORS (30+ verschillende calculators)
   - Locatie: /calculators
   - Belasting calculators: BV vs EMZ, BV vs Prive, DGA optimalisatie, Vennootschapsbelasting, Inkomstenbelasting, Box 3, BTW, Dividendbelasting, Hypotheekrenteaftrek, Eigenwoningforfait, Aftrekposten, Arbeidskorting, Zelfstandigenaftrek, Fiscale reserve, Investeringsaftrek
   - Financiële calculators: ETF groei, Crypto allocatie, Vastgoed cashflow, Compound interest, FIRE calculator, Buffer calculator, Spaarplan, Sparen voor kinderen, Huisdroom sparen
   - Pensioen calculators: Pensioen, Pensioen optimalisatie, Pensioenbehoefte, Vroegpensioen, AOW simulator
   - Andere: Inflatie impact, Vermogensmix, Successieplanning, Real estate, DBA opdrachtomschrijving

4. AUDIT / DOCUMENT ANALYSE
   - Locatie: /audit
   - Functionaliteit: AI-powered document analyse voor boekhouding en belastingdocumenten
   - Beschrijving: Gebruikers kunnen documenten uploaden (zoals XAF audit files) voor automatische analyse
   - Features: Transactie analyse, risico identificatie, aanbevelingen

5. ACCOUNTING INTEGRATIES
   - Locatie: /accounting
   - Functionaliteit: Integratie met boekhoudsoftware
   - Beschrijving: Connectie met accounting software voor automatische data synchronisatie
   - Features: API key connectie, callback handling, data sync

6. STOCKS / AANDELEN ANALYSE
   - Locatie: /stocks
   - Functionaliteit: Uitgebreide aandelen informatie en analyses
   - Features: 
     - Real-time quotes en fundamentals
     - Technische analyse met patronen
     - Nieuws en sentiment analyse
     - Congressional trades tracking (Pelosi trades)
     - Daily top 3 aandelen
     - Gainers & losers
     - Favorieten systeem
     - Historische data

7. REPORTS
   - Locatie: /reports
   - Functionaliteit: PDF rapport generatie
   - Beschrijving: Genereer professionele PDF rapporten met grafieken en analyses
   - Features: Customizable rapporten, download functionaliteit

8. COMMUNITY Q&A
   - Locatie: /community
   - Functionaliteit: Community platform voor vragen en antwoorden
   - Beschrijving: Gebruikers kunnen vragen stellen en antwoorden krijgen van experts en andere gebruikers
   - Features: Categorieën (BV/EMZ, Beleggen, Fiscaal, Vastgoed, Crypto), voting systeem

9. TIPS / KNOWLEDGE BASE
   - Locatie: /tips
   - Functionaliteit: Artikelen en tips over belastingen en financiën
   - Beschrijving: Uitgebreide kennisbank met artikelen over verschillende onderwerpen
   - Features: Categorieën, tags, effectieve datums, versiebeheer

10. DASHBOARD
    - Locatie: /dashboard
    - Functionaliteit: Overzicht van alle gebruikersdata en activiteit
    - Beschrijving: Centraal dashboard met samenvatting van portfolio, rapporten, en meer

BELANGRIJK: Als gebruikers vragen over deze functionaliteiten, verwijs dan naar de juiste locatie en leg uit wat de functionaliteit doet.`
}

// Functie om relevante site-functionaliteiten te vinden op basis van de vraag
function findRelevantSiteFeatures(message: string): string {
  const lowerMessage = message.toLowerCase()
  const relevantFeatures: string[] = []

  // Algemene vragen over de site - detecteer deze eerst
  const generalSiteQuestions = [
    'wat kan ik', 'welke functionaliteiten', 'wat biedt', 'wat heeft', 'wat is er',
    'welke features', 'welke mogelijkheden', 'wat doet', 'hoe werkt', 'hoe gebruik ik',
    'overzicht', 'introductie', 'uitleg', 'informatie over', 'meer over',
    'help', 'hulp', 'start', 'begin', 'nieuw', 'eerste keer'
  ]
  
  const isGeneralQuestion = generalSiteQuestions.some(q => lowerMessage.includes(q))
  
  // Als het een algemene vraag is, geef een overzicht van alle functionaliteiten
  if (isGeneralQuestion && (lowerMessage.includes('site') || lowerMessage.includes('website') || 
      lowerMessage.includes('platform') || lowerMessage.includes('app') || 
      lowerMessage.length < 50)) {
    return "ALGEMEEN OVERZICHT VAN DE SITE:\n\n" +
           "Deze site biedt uitgebreide tools voor belastingen, financiën en investeringen:\n\n" +
           "• Deep Research: AI-powered analyses van aandelen (/stocks/deep-research)\n" +
           "• Portfolio Tracking: Beleggingen bijhouden (/portfolio)\n" +
           "• 30+ Calculators: Voor belastingen, financiën en pensioen (/calculators)\n" +
           "• Audit/Document Analyse: AI analyse van boekhouddocumenten (/audit)\n" +
           "• Stocks Analyse: Real-time aandelen informatie (/stocks)\n" +
           "• Reports: PDF rapporten genereren (/reports)\n" +
           "• Community: Vragen en antwoorden (/community)\n" +
           "• Tips/Knowledge Base: Artikelen over belastingen (/tips)\n" +
           "• Dashboard: Overzicht van je data (/dashboard)\n" +
           "• Accounting: Integratie met boekhoudsoftware (/accounting)\n\n" +
           "Vraag gerust naar specifieke functionaliteiten voor meer details!"
  }

  // Deep Research - uitgebreide detectie
  if (lowerMessage.includes('deep research') || lowerMessage.includes('deepresearch') || 
      lowerMessage.includes('onderzoeksrapport') || lowerMessage.includes('research rapport') ||
      lowerMessage.includes('aandeel analyse') || lowerMessage.includes('stock analyse') ||
      lowerMessage.includes('rapport genereren') || lowerMessage.includes('rapport maken')) {
    relevantFeatures.push(`DEEP RESEARCH RAPPORTEN:
- Locatie: /stocks/deep-research
- Functionaliteit: AI-powered diepgaande analyses van aandelen en andere financiële instrumenten
- Beschrijving: Genereert uitgebreide onderzoeksrapporten met fundamentele analyse, technische analyse, nieuws, sentiment en meer
- Gebruik: Zoek een aandeel en genereer een rapport dat real-time data combineert met AI-analyse
- Vereisten: Account vereist (niet beschikbaar voor anonieme gebruikers)
- Status tracking: Rapporten hebben status (GENERATING, COMPLETED, FAILED, CANCELLED) met progress tracking
- PDF export: Rapporten kunnen worden gedownload als PDF
- Wat je krijgt: Fundamentele analyse, technische patronen, nieuws analyse, sentiment, risico assessment`)
  }

  // Portfolio - uitgebreide detectie
  if (lowerMessage.includes('portfolio') || lowerMessage.includes('beleggingen') || 
      lowerMessage.includes('tracking') || lowerMessage.includes('alerts') ||
      lowerMessage.includes('mijn beleggingen') || lowerMessage.includes('mijn portfolio') ||
      lowerMessage.includes('prijs alert') || lowerMessage.includes('prijsalarm')) {
    relevantFeatures.push(`PORTFOLIO TRACKING:
- Locatie: /portfolio
- Functionaliteit: Portfolio beheer en tracking van beleggingen
- Beschrijving: Gebruikers kunnen hun portfolio bijhouden, alerts instellen en historische data bekijken
- Features: 
  * Portfolio items toevoegen en beheren
  * Prijs alerts instellen
  * Historische performance tracking
  * Overzicht van alle beleggingen`)
  }

  // Calculators - uitgebreide detectie
  if (lowerMessage.includes('calculator') || lowerMessage.includes('bereken') || 
      lowerMessage.includes('reken') || lowerMessage.includes('simulator') ||
      lowerMessage.includes('berekening') || lowerMessage.includes('tool') ||
      lowerMessage.includes('bv') || lowerMessage.includes('emz') ||
      lowerMessage.includes('box 3') || lowerMessage.includes('pensioen') ||
      lowerMessage.includes('etf') || lowerMessage.includes('crypto') ||
      lowerMessage.includes('vastgoed') || lowerMessage.includes('hypotheek')) {
    relevantFeatures.push(`CALCULATORS:
- Locatie: /calculators
- 30+ verschillende calculators beschikbaar:
  * Belastingen: BV vs EMZ, BV vs Prive, DGA optimalisatie, Vennootschapsbelasting, Inkomstenbelasting, Box 3, BTW, Dividendbelasting, Hypotheekrenteaftrek, Eigenwoningforfait, Aftrekposten, Arbeidskorting, Zelfstandigenaftrek, Fiscale reserve, Investeringsaftrek
  * Financiën: ETF groei, Crypto allocatie, Vastgoed cashflow, Compound interest, FIRE calculator, Buffer calculator, Spaarplan, Sparen voor kinderen, Huisdroom sparen
  * Pensioen: Pensioen, Pensioen optimalisatie, Pensioenbehoefte, Vroegpensioen, AOW simulator
  * Andere: Inflatie impact, Vermogensmix, Successieplanning, Real estate, DBA opdrachtomschrijving`)
  }

  // Audit - uitgebreide detectie
  if (lowerMessage.includes('audit') || lowerMessage.includes('document') || 
      lowerMessage.includes('boekhouding') || lowerMessage.includes('xaf') ||
      lowerMessage.includes('transactie') || lowerMessage.includes('analyse') ||
      lowerMessage.includes('upload') || lowerMessage.includes('bestand')) {
    relevantFeatures.push(`AUDIT / DOCUMENT ANALYSE:
- Locatie: /audit
- Functionaliteit: AI-powered document analyse voor boekhouding en belastingdocumenten
- Beschrijving: Gebruikers kunnen documenten uploaden (zoals XAF audit files) voor automatische analyse
- Features: 
  * Transactie analyse
  * Risico identificatie
  * Aanbevelingen
  * Automatische detectie van afwijkingen`)
  }

  // Stocks - uitgebreide detectie
  if (lowerMessage.includes('aandeel') || lowerMessage.includes('stock') || 
      lowerMessage.includes('beurs') || lowerMessage.includes('pelosi') ||
      lowerMessage.includes('aandelen') || lowerMessage.includes('quote') ||
      lowerMessage.includes('fundamental') || lowerMessage.includes('technisch') ||
      lowerMessage.includes('nieuws') || lowerMessage.includes('sentiment') ||
      lowerMessage.includes('congressional') || lowerMessage.includes('trade')) {
    relevantFeatures.push(`STOCKS / AANDELEN ANALYSE:
- Locatie: /stocks
- Functionaliteit: Uitgebreide aandelen informatie en analyses
- Features: 
  * Real-time quotes en fundamentals
  * Technische analyse met patronen
  * Nieuws en sentiment analyse
  * Congressional trades tracking (Pelosi trades)
  * Daily top 3 aandelen
  * Gainers & losers
  * Favorieten systeem
  * Historische data`)
  }

  // Reports - uitgebreide detectie
  if (lowerMessage.includes('rapport') || lowerMessage.includes('report') || 
      lowerMessage.includes('pdf') || lowerMessage.includes('download') ||
      lowerMessage.includes('exporteren') || lowerMessage.includes('genereren')) {
    relevantFeatures.push(`REPORTS:
- Locatie: /reports
- Functionaliteit: PDF rapport generatie
- Beschrijving: Genereer professionele PDF rapporten met grafieken en analyses
- Features: 
  * Customizable rapporten
  * Download functionaliteit
  * Grafieken en visualisaties`)
  }

  // Community - uitgebreide detectie
  if (lowerMessage.includes('community') || lowerMessage.includes('vraag') || 
      lowerMessage.includes('antwoord') || lowerMessage.includes('q&a') ||
      lowerMessage.includes('forum') || lowerMessage.includes('discussie') ||
      lowerMessage.includes('expert') || lowerMessage.includes('advies')) {
    relevantFeatures.push(`COMMUNITY Q&A:
- Locatie: /community
- Functionaliteit: Community platform voor vragen en antwoorden
- Beschrijving: Gebruikers kunnen vragen stellen en antwoorden krijgen van experts en andere gebruikers
- Features: 
  * Categorieën (BV/EMZ, Beleggen, Fiscaal, Vastgoed, Crypto)
  * Expert antwoorden
  * Voting systeem
  * Discussie mogelijkheden`)
  }

  // Tips/Knowledge Base - uitgebreide detectie
  if (lowerMessage.includes('tip') || lowerMessage.includes('artikel') || 
      lowerMessage.includes('kennis') || lowerMessage.includes('knowledge') ||
      lowerMessage.includes('uitleg') || lowerMessage.includes('informatie') ||
      lowerMessage.includes('gids') || lowerMessage.includes('handleiding')) {
    relevantFeatures.push(`TIPS / KNOWLEDGE BASE:
- Locatie: /tips
- Functionaliteit: Artikelen en tips over belastingen en financiën
- Beschrijving: Uitgebreide kennisbank met artikelen over verschillende onderwerpen
- Features: 
  * Categorieën en tags
  * Effectieve datums
  * Versiebeheer
  * Zoekfunctionaliteit`)
  }

  // Dashboard
  if (lowerMessage.includes('dashboard') || lowerMessage.includes('overzicht') ||
      lowerMessage.includes('mijn data') || lowerMessage.includes('mijn account')) {
    relevantFeatures.push(`DASHBOARD:
- Locatie: /dashboard
- Functionaliteit: Overzicht van alle gebruikersdata en activiteit
- Beschrijving: Centraal dashboard met samenvatting van portfolio, rapporten, en meer
- Features: 
  * Overzicht van alle functionaliteiten
  * Recente activiteit
  * Quick links`)
  }

  // Accounting
  if (lowerMessage.includes('accounting') || lowerMessage.includes('boekhoud') ||
      lowerMessage.includes('integratie') || lowerMessage.includes('sync')) {
    relevantFeatures.push(`ACCOUNTING INTEGRATIES:
- Locatie: /accounting
- Functionaliteit: Integratie met boekhoudsoftware
- Beschrijving: Connectie met accounting software voor automatische data synchronisatie
- Features: 
  * API key connectie
  * Callback handling
  * Data sync`)
  }

  return relevantFeatures.join('\n\n')
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

    // STAP 1: Zoek eerst op de eigen site (knowledge base, tax info, en site functionaliteiten)
    const knowledgeArticles = await findRelevantKnowledgeArticles(message)
    const taxTopics = findRelevantTaxInfo(message)
    const relevantSiteFeatures = findRelevantSiteFeatures(message)
    
    // Bouw context op van gevonden informatie - ALTIJD site functionaliteiten toevoegen
    let siteContext = "INFORMATIE OVER DE EIGEN SITE:\n\n"
    
    // Voeg altijd alle site functionaliteiten toe (gebruikers moeten weten wat beschikbaar is)
    siteContext += getSiteFeaturesInfo() + "\n\n"
    
    // Voeg relevante site functionaliteiten toe als er matches zijn
    if (relevantSiteFeatures) {
      siteContext += "RELEVANTE FUNCTIONALITEITEN VOOR DEZE VRAAG:\n\n"
      siteContext += relevantSiteFeatures + "\n\n"
    }
    
    // Voeg tax topics toe (alleen als echt relevant)
    if (taxTopics.length > 0) {
      siteContext += "RELEVANTE BELASTINGINFORMATIE:\n\n"
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
      siteContext += "RELEVANTE ARTIKELEN UIT DE KNOWLEDGE BASE:\n\n"
      for (const article of knowledgeArticles) {
        siteContext += `**${article.title}**\n${article.body}\n\n`
      }
    }
    
    siteContext += "\nBELANGRIJKE INSTRUCTIES:\n"
    siteContext += "- Gebruik ALLEEN informatie die hierboven staat of die je zeker weet\n"
    siteContext += "- Verzin GEEN informatie die niet in de context staat\n"
    siteContext += "- Als je iets niet zeker weet, zeg dat expliciet\n"
    siteContext += "- Verwijs naar specifieke functionaliteiten op de site als relevant\n"
    siteContext += "- Als de vraag over functionaliteiten gaat, leg uit wat beschikbaar is en waar deze te vinden zijn\n"
    siteContext += "- Bij algemene vragen over de site, geef een overzicht van alle beschikbare functionaliteiten\n"
    siteContext += "- Wees specifiek: noem exacte locaties (zoals /stocks/deep-research) en leg uit wat elke functionaliteit doet"

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

    // Bouw system message op met context van eigen site - ALTIJD site context toevoegen
    let systemContent = `Je bent Finn, een ervaren Nederlandse AI-assistent gespecialiseerd in financiën en belastingen voor 2025. Je bent een expert op het gebied van Nederlandse belastingwetgeving, financiële planning en investeringen.

JE EXPERTISE:
- Nederlandse belastingwetgeving en regelgeving voor 2025
- Financiële planning en vermogensopbouw
- Investeringsstrategieën en portfolio-optimalisatie
- Ondernemersbelastingen (BV, EMZ, DGA)
- Box 1, 2 en 3 belastingen
- Aftrekposten en fiscale voordelen
- Pensioenplanning en lijfrente
- Marktanalyses en beleggingsinformatie
- Alle functionaliteiten die beschikbaar zijn op deze website

KRITIEKE REGELS - LEES DIT ZORGVULDIG:
1. GEBRUIK ALLEEN ECHTE INFORMATIE:
   - Gebruik ALLEEN informatie die in de context hieronder staat
   - Verzin NOOIT informatie die niet in de context staat
   - Als je iets niet zeker weet, zeg dat EXPLICIET: "Ik weet dit niet zeker" of "Deze informatie staat niet in mijn kennisbank"
   - Maak GEEN aannames over functionaliteiten die niet in de context staan
   - Als een functionaliteit niet in de context staat, zeg dat je er geen informatie over hebt

2. SITE FUNCTIONALITEITEN:
   - Als gebruikers vragen over functionaliteiten op de site, verwijs naar de exacte locatie (bijv. /stocks/deep-research)
   - Leg uit wat de functionaliteit doet op basis van de informatie in de context
   - Als je niet zeker weet of een functionaliteit bestaat, zeg dat expliciet
   - Verzin GEEN nieuwe functionaliteiten die niet in de context staan

3. KWALITEIT EN ACCURATIE:
   - Geef altijd accurate, actuele en betrouwbare informatie
   - Verwijs naar specifieke wetten, percentages, bedragen en regels waar mogelijk
   - Gebruik concrete voorbeelden en cijfers om je uitleg te verduidelijken
   - Controleer of de informatie relevant is voor 2025
   - Baseer antwoorden op de context, niet op algemene kennis

4. STRUCTUUR EN HELDEREID:
   - Begin met een directe, beknopte beantwoording van de vraag
   - Gebruik duidelijke paragrafen en structuur
   - Maak gebruik van opsommingen waar relevant
   - Sluit af met een samenvatting of belangrijkste punten

5. CONTEXT EN RELEVANTIE:
   - Als de vraag over aandelen/beleggingen gaat, focus op financiële informatie, NIET op belastingen (tenzij expliciet gevraagd)
   - Als de vraag over belastingen gaat, gebruik de beschikbare belastinginformatie uit de context
   - Als de vraag algemeen is over de site (zoals "wat kan ik doen", "welke functionaliteiten"), geef een overzicht van alle beschikbare functionaliteiten
   - Combineer kennis waar relevant voor een compleet antwoord
   - Negeer irrelevante informatie uit de context
   - Verwijs naar relevante site functionaliteiten als die kunnen helpen
   - Bij vragen over functionaliteiten: leg uit wat het doet, waar het te vinden is (exacte URL), en wat de vereisten zijn

6. TONALITEIT:
   - Wees vriendelijk, professioneel en toegankelijk
   - Vermijd jargon waar mogelijk, of leg het uit als je het gebruikt
   - Toon empathie en begrip voor de situatie van de gebruiker
   - Wees proactief in het aanbieden van aanvullende relevante informatie uit de context

7. DISCLAIMERS EN GRENZEN:
   - Je geeft GEEN persoonlijk financieel of beleggingsadvies zoals bedoeld in de Wft
   - Je geeft algemene informatie, ideeën en educatieve content
   - Als je iets niet zeker weet, zeg dat expliciet
   - Raad aan om een gecertificeerd adviseur te raadplegen voor persoonlijk advies
   - Vermeld waar nodig dat dit geen persoonlijk advies is

8. TECHNISCHE EISEN:
   - Antwoord altijd in het Nederlands
   - Houd antwoorden compleet maar niet onnodig lang (doel: 200-400 woorden voor eenvoudige vragen, tot 800 woorden voor complexe vragen)
   - Gebruik markdown formatting voor structuur (headers, bold, lists)
   - Zorg voor goede leesbaarheid met witruimte en paragrafen

9. HERHALING VAN KRITIEKE REGEL:
   - VERZIN GEEN INFORMATIE
   - GEBRUIK ALLEEN WAT IN DE CONTEXT STAAT
   - ZEG EXPLICIET ALS JE IETS NIET WEET`

    // Voeg ALTIJD site context toe aan system message
    systemContent += `\n\n${siteContext}`

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

    // Check of streaming wordt aangevraagd
    const url = new URL(request.url)
    const stream = url.searchParams.get("stream") === "true"

    if (stream) {
      // Streaming response
      const streamResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.7,
        max_tokens: 2000,
        stream: true
      })

      // Maak een ReadableStream voor streaming
      const encoder = new TextEncoder()
      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of streamResponse) {
              const content = chunk.choices[0]?.delta?.content || ""
              if (content) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`))
              }
            }
            // Stuur einde signaal
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, timestamp: new Date().toISOString() })}\n\n`))
            controller.close()
          } catch (error) {
            console.error("Streaming error:", error)
            controller.error(error)
          }
        }
      })

      const response = new Response(readableStream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      })

      // Stel cookie in voor anonieme gebruikers
      if (sessionId && !userId) {
        response.headers.set(
          "Set-Cookie",
          `anonymous_session_id=${sessionId}; Path=/; Max-Age=${ANONYMOUS_SESSION_DURATION_HOURS * 60 * 60}; SameSite=Lax; HttpOnly`
        )
      }

      return response
    } else {
      // Non-streaming response (fallback)
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.7,
        max_tokens: 2000
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
    }
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
