import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { getClerkUser } from "@/lib/clerk-auth"
import { prisma } from "@/lib/prisma"
import { getOrCreateAnonymousSessionId } from "@/lib/anonymous-session"

const FREE_TIER_AI_CALL_LIMIT = 10
const ANONYMOUS_SESSION_DURATION_HOURS = 24 // 24 uur tijdslimiet voor anonieme gebruikers

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
                ? "Je hebt je limiet van 10 gratis AI aanroepen bereikt. Upgrade naar Premium voor onbeperkte AI aanroepen."
                : "Je hebt je limiet van 10 gratis AI aanroepen bereikt. Maak een account aan en upgrade naar Premium voor onbeperkte AI aanroepen.",
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

    const { message, conversationHistory = [] } = await request.json()

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json(
        { error: "Bericht is verplicht" },
        { status: 400 }
      )
    }

    const openaiApiKey = process.env.OPENAI_API_KEY
    if (!openaiApiKey) {
      return NextResponse.json(
        { error: "OpenAI API key is niet geconfigureerd" },
        { status: 500 }
      )
    }

    const openai = new OpenAI({ apiKey: openaiApiKey })

    // Bouw conversation history op voor context
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: `Je bent Finn, een ervaren Nederlandse AI-assistent gespecialiseerd in financiën en belastingen voor 2025. Je helpt gebruikers met:

FINANCIËLE INFORMATIE EN IDEEËN:
- Investeringsstrategieën en portfolio-optimalisatie (algemene informatie, geen persoonlijk advies)
- Vermogensopbouw en pensioenplanning (educatieve informatie)
- Financiële planning en budgettering (algemene tips)
- Investeringsideeën en informatie over verschillende beleggingscategorieën (aandelen, ETF's, crypto, vastgoed) - GEEN beleggingsadvies
- Risicobeheer en diversificatie (educatieve informatie)
- Marktanalyses en trends (informatief)

BELASTINGINFORMATIE:
- Belastingondersteuning en tips voor 2025 (algemene informatie)
- Uitleg over belastingregels en wijzigingen
- Optimalisatiestrategieën voor ondernemers (algemene ideeën)
- Vragen over inkomstenbelasting, vennootschapsbelasting, BTW, etc.
- Aftrekposten en fiscale voordelen (informatief)
- Box 3 belasting en vermogensrendementsheffing

BELANGRIJKE RICHTLIJNEN:
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
      max_tokens: 1000
    })

    const assistantMessage = response.choices[0]?.message?.content || "Sorry, ik kon geen antwoord genereren."

    const jsonResponse = NextResponse.json({
      message: assistantMessage,
      timestamp: new Date().toISOString()
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
