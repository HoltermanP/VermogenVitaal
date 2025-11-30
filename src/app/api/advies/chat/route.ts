import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

export async function POST(request: NextRequest) {
  try {
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
        content: `Je bent een ervaren Nederlandse belastingondersteuning assistent gespecialiseerd in belastingregels voor 2025. Je helpt gebruikers met:
- Belastingondersteuning en tips voor 2025
- Uitleg over belastingregels en wijzigingen
- Optimalisatiestrategieën voor ondernemers
- Vragen over inkomstenbelasting, vennootschapsbelasting, BTW, etc.

Belangrijke richtlijnen:
- Geef altijd accurate en actuele informatie over belastingregels 2025
- Wees duidelijk en begrijpelijk in je uitleg
- Verwijs waar mogelijk naar specifieke regels of percentages
- Geef praktische tips en voorbeelden waar relevant
- Als je iets niet zeker weet, zeg dat expliciet en raad aan om een gecertificeerd belastingadviseur te raadplegen voor professionele begeleiding
- Antwoord altijd in het Nederlands
- Houd antwoorden beknopt maar compleet`
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

    return NextResponse.json({
      message: assistantMessage,
      timestamp: new Date().toISOString()
    })
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

