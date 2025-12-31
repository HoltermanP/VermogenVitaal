import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getClerkUser } from "@/lib/clerk-auth"
import { renderToBuffer } from "@react-pdf/renderer"
import { DeepResearchPDF } from "@/lib/pdf-generator"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Haal gebruiker op via getClerkUser (sync met database)
    const user = await getClerkUser(request)
    
    if (!user || !user.id) {
      return NextResponse.json(
        { error: "Niet geautoriseerd" },
        { status: 401 }
      )
    }

    const { id } = await params
    
    if (!id) {
      return NextResponse.json(
        { error: "Rapport ID ontbreekt" },
        { status: 400 }
      )
    }

    const report = await prisma.deepResearchReport.findFirst({
      where: {
        id: id,
        userId: user.id,
      },
    })

    if (!report) {
      console.error(`PDF download: Rapport niet gevonden - reportId: ${id}, userId: ${user.id}`)
      return NextResponse.json(
        { error: "Rapport niet gevonden" },
        { status: 404 }
      )
    }

    if (report.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Rapport is nog niet voltooid" },
        { status: 400 }
      )
    }

    const reportData = report.report as Record<string, unknown>

    // Genereer PDF
    const pdfDoc = DeepResearchPDF({
      title: `Deep Research: ${report.name} (${report.symbol})`,
      symbol: report.symbol,
      name: report.name,
      content: typeof reportData.content === 'string' ? reportData.content : "",
      quote: (reportData.quote && typeof reportData.quote === 'object' && !Array.isArray(reportData.quote)) ? reportData.quote as Record<string, unknown> : null,
      fundamentals: (reportData.fundamentals && typeof reportData.fundamentals === 'object' && !Array.isArray(reportData.fundamentals)) ? reportData.fundamentals as Record<string, unknown> : null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      scores: (reportData.scores && typeof reportData.scores === 'object' && !Array.isArray(reportData.scores)) ? reportData.scores as any : null,
      history: (Array.isArray(reportData.history) ? reportData.history : []),
      generatedAt: new Date(report.createdAt),
    })

    // Gebruik renderToBuffer in plaats van renderToStream voor betere compatibiliteit
    const pdfBuffer = await renderToBuffer(pdfDoc)

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="deep-research-${report.symbol}-${report.id}.pdf"`,
        'Content-Length': pdfBuffer.length.toString()
      }
    })
  } catch (error) {
    console.error("PDF download error:", error)
    return NextResponse.json(
      { error: "Interne server fout", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

