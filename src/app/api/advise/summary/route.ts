import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const requestSchema = z.object({
  scenario: z.string().min(1, "Scenario is verplicht"),
  profile: z.object({
    legalForm: z.string().optional(),
    revenue: z.number().optional(),
    goals: z.array(z.string()).optional(),
    riskProfile: z.string().optional()
  })
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { scenario, profile } = requestSchema.parse(body)

    // Mock RAG response
    const result = {
      summary: `Op basis van uw scenario "${scenario}" zijn de volgende punten relevant voor uw situatie. Dit is een educatieve samenvatting gebaseerd op algemene fiscale regels.`,
      attentionPoints: [
        "Controleer altijd de meest recente fiscale regels",
        "Overweeg professioneel advies voor complexe situaties",
        "Houd rekening met uw persoonlijke omstandigheden"
      ],
      sources: [
        {
          title: "Inkomstenbelasting voor ondernemers 2024",
          slug: "inkomstenbelasting-ondernemers-2024",
          effectiveFrom: new Date("2024-01-01"),
          version: "1.0"
        }
      ],
      disclaimer: "Deze informatie is uitsluitend bedoeld voor educatieve doeleinden en vormt geen persoonlijk financieel advies. Raadpleeg altijd een gekwalificeerde adviseur voor maatwerkadvies.",
      generatedAt: new Date()
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("RAG API error:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Ongeldige invoer", details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Interne server fout" },
      { status: 500 }
    )
  }
}
