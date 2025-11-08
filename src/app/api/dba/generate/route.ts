import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import OpenAI from "openai"

const requestSchema = z.object({
  opdrachtgever: z.string().min(1, "Opdrachtgever is verplicht"),
  opdrachtnemer: z.string().min(1, "Opdrachtnemer is verplicht"),
  werkzaamheden: z.string().min(10, "Werkzaamheden moeten minimaal 10 tekens bevatten"),
  duur: z.string().min(1, "Duur is verplicht"),
  tarief: z.string().optional(),
  startdatum: z.string().optional(),
  einddatum: z.string().optional(),
  locatie: z.string().optional(),
  specifiekeEisen: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = requestSchema.parse(body)

    const openaiApiKey = process.env.OPENAI_API_KEY
    if (!openaiApiKey) {
      return NextResponse.json(
        { error: "OpenAI API key is niet geconfigureerd. Voeg OPENAI_API_KEY toe aan je .env.local bestand." },
        { status: 500 }
      )
    }

    const openai = new OpenAI({ apiKey: openaiApiKey })

    // Bouw een gedetailleerde prompt voor DBA proof opdrachtomschrijving
    const prompt = `Je bent een expert in Nederlandse arbeidsrecht en DBA (Deregulering Beoordeling Arbeidsrelatie) wetgeving. 

Maak een professionele, DBA-proof opdrachtomschrijving op basis van de volgende gegevens:

OPDRACHTGEVER: ${data.opdrachtgever}
OPDRACHTNEMER: ${data.opdrachtnemer}
WERKZAAMHEDEN: ${data.werkzaamheden}
DUUR: ${data.duur}
${data.tarief ? `TARIEF: ${data.tarief}` : ''}
${data.startdatum ? `STARTDATUM: ${data.startdatum}` : ''}
${data.einddatum ? `EINDDATUM: ${data.einddatum}` : ''}
${data.locatie ? `LOCATIE: ${data.locatie}` : ''}
${data.specifiekeEisen ? `SPECIFIEKE EISEN: ${data.specifiekeEisen}` : ''}

Belangrijke DBA-richtlijnen om te volgen:
1. De opdrachtomschrijving moet duidelijk maken dat er sprake is van een opdracht (resultaatgericht) en niet van een arbeidsrelatie
2. Beschrijf de werkzaamheden in termen van resultaten en deliverables, niet in termen van uren of taken
3. Vermeld expliciet dat de opdrachtnemer zelfstandig werkt en eigen verantwoordelijkheid heeft
4. Maak duidelijk dat er geen gezagsverhouding is (geen directe aansturing, geen vaste werktijden)
5. Beschrijf de opdrachtnemer als expert die een specifiek resultaat levert
6. Vermeld dat de opdrachtnemer eigen gereedschap/middelen gebruikt (indien van toepassing)
7. Maak duidelijk dat er geen exclusiviteit is (opdrachtnemer kan andere opdrachten aannemen)
8. Gebruik professionele, juridisch correcte taal

Genereer een complete opdrachtomschrijving die:
- Professioneel en duidelijk geformuleerd is
- Voldoet aan DBA-vereisten
- Alle relevante details bevat
- Geschikt is voor gebruik in een overeenkomst

Formatteer de opdrachtomschrijving met duidelijke secties en gebruik professionele Nederlandse juridische terminologie.`

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Je bent een expert in Nederlandse arbeidsrecht en DBA-wetgeving. Je schrijft professionele, juridisch correcte opdrachtomschrijvingen die voldoen aan alle DBA-vereisten."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })

    const opdrachtomschrijving = response.choices[0]?.message?.content || ""

    if (!opdrachtomschrijving) {
      throw new Error("OpenAI gaf geen geldige response terug")
    }

    return NextResponse.json({
      opdrachtomschrijving,
      generatedAt: new Date().toISOString(),
      disclaimer: "Deze opdrachtomschrijving is gegenereerd met behulp van AI en dient als richtlijn. Raadpleeg altijd een juridisch adviseur voor definitieve goedkeuring en om te verzekeren dat de opdrachtomschrijving volledig voldoet aan alle DBA-vereisten en specifieke situatie."
    })
  } catch (error) {
    console.error("DBA API error:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Ongeldige invoer", details: error.issues },
        { status: 400 }
      )
    }

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

