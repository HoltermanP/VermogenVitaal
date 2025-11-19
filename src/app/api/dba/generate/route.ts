import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import OpenAI from "openai"

const requestSchema = z.object({
  // Stap 1: Basisgegevens
  opdrachtgever: z.string().min(1, "Opdrachtgever is verplicht"),
  opdrachtgeverAdres: z.string().min(1, "Adres opdrachtgever is verplicht"),
  opdrachtgeverKvK: z.string().optional(),
  opdrachtgeverBtw: z.string().optional(),
  opdrachtnemer: z.string().min(1, "Opdrachtnemer is verplicht"),
  opdrachtnemerAdres: z.string().min(1, "Adres opdrachtnemer is verplicht"),
  opdrachtnemerKvK: z.string().optional(),
  opdrachtnemerBtw: z.string().optional(),
  
  // Stap 2: Opdracht
  werkzaamheden: z.string().min(20, "Werkzaamheden moeten minimaal 20 tekens bevatten"),
  resultaat: z.string().min(10, "Resultaat is verplicht"),
  deliverables: z.string().min(10, "Deliverables zijn verplicht"),
  startdatum: z.string().min(1, "Startdatum is verplicht"),
  einddatum: z.string().optional(),
  duur: z.string().min(1, "Duur is verplicht"),
  locatie: z.string().optional(),
  
  // Stap 3: Financieel
  tarief: z.string().min(1, "Tarief is verplicht"),
  tariefType: z.enum(["per_uur", "per_project", "vast_bedrag", "variabel"]),
  betalingsvoorwaarden: z.string().optional(),
  facturatie: z.string().optional(),
  
  // Stap 4: Zelfstandigheid indicatoren
  eigenGereedschap: z.boolean(),
  eigenMiddelen: z.boolean(),
  eigenRisico: z.boolean(),
  geenGezagsverhouding: z.boolean(),
  geenExclusiviteit: z.boolean(),
  vrijeWerktijden: z.boolean(),
  eigenVerantwoordelijkheid: z.boolean(),
  eigenKosten: z.boolean(),
  eigenWerkruimte: z.boolean().optional(),
  
  // Stap 5: Juridisch
  intellectueelEigendom: z.enum(["opdrachtgever", "opdrachtnemer", "gedeeld"]),
  aansprakelijkheid: z.string().optional(),
  verzekering: z.string().optional(),
  geheimhouding: z.boolean(),
  geheimhoudingDuur: z.string().optional(),
  beëindiging: z.string().optional(),
  opzegtermijn: z.string().optional(),
  geschillenbeslechting: z.enum(["rechter", "arbitrage", "bemiddeling"]),
  
  // Stap 6: Overig
  bijzondereVoorwaarden: z.string().optional(),
  overmacht: z.string().optional(),
  wijzigingen: z.string().optional(),
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

    // Bouw een uitgebreide prompt voor volledig DBA-proof contract
    const prompt = `Je bent een expert in Nederlandse arbeidsrecht en DBA (Deregulering Beoordeling Arbeidsrelatie) wetgeving. 

Maak een volledig, professioneel DBA-proof opdrachtovereenkomst op basis van de volgende gegevens:

PARTIJEN:
- Opdrachtgever: ${data.opdrachtgever}
- Adres opdrachtgever: ${data.opdrachtgeverAdres}
${data.opdrachtgeverKvK ? `- KvK nummer: ${data.opdrachtgeverKvK}` : ''}
${data.opdrachtgeverBtw ? `- BTW nummer: ${data.opdrachtgeverBtw}` : ''}
- Opdrachtnemer: ${data.opdrachtnemer}
- Adres opdrachtnemer: ${data.opdrachtnemerAdres}
${data.opdrachtnemerKvK ? `- KvK nummer: ${data.opdrachtnemerKvK}` : ''}
${data.opdrachtnemerBtw ? `- BTW nummer: ${data.opdrachtnemerBtw}` : ''}

OPDRACHT:
- Werkzaamheden: ${data.werkzaamheden}
- Resultaat: ${data.resultaat}
- Deliverables: ${data.deliverables}
- Startdatum: ${data.startdatum}
${data.einddatum ? `- Einddatum: ${data.einddatum}` : ''}
- Duur: ${data.duur}
${data.locatie ? `- Locatie: ${data.locatie}` : ''}

FINANCIEEL:
- Tarief: ${data.tarief}
- Tarief type: ${data.tariefType === 'per_uur' ? 'Per uur' : data.tariefType === 'per_project' ? 'Per project' : data.tariefType === 'vast_bedrag' ? 'Vast bedrag' : 'Variabel'}
${data.betalingsvoorwaarden ? `- Betalingsvoorwaarden: ${data.betalingsvoorwaarden}` : ''}
${data.facturatie ? `- Facturatie: ${data.facturatie}` : ''}

ZELFSTANDIGHEID INDICATOREN:
- Eigen gereedschap/middelen: ${data.eigenGereedschap ? 'Ja' : 'Nee'}
- Eigen middelen: ${data.eigenMiddelen ? 'Ja' : 'Nee'}
- Eigen risico: ${data.eigenRisico ? 'Ja' : 'Nee'}
- Geen gezagsverhouding: ${data.geenGezagsverhouding ? 'Ja' : 'Nee'}
- Geen exclusiviteit: ${data.geenExclusiviteit ? 'Ja' : 'Nee'}
- Vrije werktijden: ${data.vrijeWerktijden ? 'Ja' : 'Nee'}
- Eigen verantwoordelijkheid: ${data.eigenVerantwoordelijkheid ? 'Ja' : 'Nee'}
- Eigen kosten: ${data.eigenKosten ? 'Ja' : 'Nee'}
${data.eigenWerkruimte !== undefined ? `- Eigen werkruimte: ${data.eigenWerkruimte ? 'Ja' : 'Nee'}` : ''}

JURIDISCH:
- Intellectueel eigendom: ${data.intellectueelEigendom === 'opdrachtgever' ? 'Opdrachtgever' : data.intellectueelEigendom === 'opdrachtnemer' ? 'Opdrachtnemer' : 'Gedeeld'}
${data.aansprakelijkheid ? `- Aansprakelijkheid: ${data.aansprakelijkheid}` : ''}
${data.verzekering ? `- Verzekering: ${data.verzekering}` : ''}
- Geheimhouding: ${data.geheimhouding ? 'Ja' : 'Nee'}
${data.geheimhoudingDuur ? `- Geheimhouding duur: ${data.geheimhoudingDuur}` : ''}
${data.beëindiging ? `- Beëindiging: ${data.beëindiging}` : ''}
${data.opzegtermijn ? `- Opzegtermijn: ${data.opzegtermijn}` : ''}
- Geschillenbeslechting: ${data.geschillenbeslechting === 'rechter' ? 'Rechter' : data.geschillenbeslechting === 'arbitrage' ? 'Arbitrage' : 'Bemiddeling'}

OVERIG:
${data.bijzondereVoorwaarden ? `- Bijzondere voorwaarden: ${data.bijzondereVoorwaarden}` : ''}
${data.overmacht ? `- Overmacht: ${data.overmacht}` : ''}
${data.wijzigingen ? `- Wijzigingen: ${data.wijzigingen}` : ''}

BELANGRIJKE DBA-RICHTLIJNEN:
1. Het contract moet duidelijk maken dat er sprake is van een opdracht (resultaatgericht) en NIET van een arbeidsrelatie
2. Alle zelfstandigheid indicatoren moeten expliciet en duidelijk in het contract worden opgenomen
3. Beschrijf werkzaamheden in termen van resultaten en deliverables, NIET in termen van uren of taken
4. Vermeld expliciet dat de opdrachtnemer zelfstandig werkt en eigen verantwoordelijkheid heeft
5. Maak duidelijk dat er GEEN gezagsverhouding is (geen directe aansturing, geen vaste werktijden)
6. Beschrijf de opdrachtnemer als expert die een specifiek resultaat levert
7. Vermeld expliciet dat de opdrachtnemer eigen gereedschap/middelen gebruikt (indien van toepassing)
8. Maak duidelijk dat er GEEN exclusiviteit is (opdrachtnemer kan andere opdrachten aannemen)
9. Vermeld dat de opdrachtnemer eigen risico draagt
10. Gebruik professionele, juridisch correcte Nederlandse taal

GENEREER EEN VOLLEDIG CONTRACT MET DE VOLGENDE SECTIES:
1. PREAMBULE (partijen, datum, onderwerp)
2. DEFINITIES
3. ONDERWERP VAN DE OVEREENKOMST (werkzaamheden, resultaat, deliverables)
4. DUUR EN TERMIJNEN
5. VERGOEDING EN BETALING
6. ZELFSTANDIGHEID EN GEZAGSVERHOUDING (alle zelfstandigheid indicatoren expliciet)
7. INTELLECTUEEL EIGENDOM
8. GEHEIMHOUDING
9. AANSPRAKELIJKHEID EN VERZEKERING
10. BEËINDIGING
11. GESCHILLENBESLECHTING
12. OVERMACHT
13. WIJZIGINGEN
14. SLOTBEPALINGEN (toepasselijk recht, plaats van uitvoering, etc.)

Het contract moet:
- Volledig en juridisch correct zijn
- Alle DBA-vereisten expliciet adresseren
- Professioneel geformuleerd zijn
- Geschikt zijn voor ondertekening
- Alle relevante details bevatten
- Duidelijk maken dat het een opdrachtovereenkomst is en geen arbeidsrelatie

Formatteer het contract met duidelijke secties, nummering, en gebruik professionele Nederlandse juridische terminologie.`

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Je bent een expert in Nederlandse arbeidsrecht en DBA-wetgeving. Je schrijft volledige, professionele, juridisch correcte opdrachtovereenkomsten die voldoen aan alle DBA-vereisten en geschikt zijn voor ondertekening."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000
    })

    const contract = response.choices[0]?.message?.content || ""

    if (!contract) {
      throw new Error("OpenAI gaf geen geldige response terug")
    }

    return NextResponse.json({
      contract,
      generatedAt: new Date().toISOString(),
      disclaimer: "Dit contract is gegenereerd met behulp van AI en dient als richtlijn. Raadpleeg altijd een juridisch adviseur voor definitieve goedkeuring en om te verzekeren dat het contract volledig voldoet aan alle DBA-vereisten en uw specifieke situatie."
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

