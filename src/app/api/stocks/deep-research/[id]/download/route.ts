import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { renderToStream } from "@react-pdf/renderer"
import { DeepResearchPDF } from "@/lib/pdf-generator"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: "Niet geautoriseerd" },
        { status: 401 }
      )
    }

    const { id } = await params
    const report = await prisma.deepResearchReport.findFirst({
      where: {
        id: id,
        userId,
      },
    })

    if (!report) {
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

    const reportData = report.report as any

    // Genereer PDF
    const pdfDoc = DeepResearchPDF({
      title: `Deep Research: ${report.name} (${report.symbol})`,
      symbol: report.symbol,
      name: report.name,
      content: reportData.content || "",
      quote: reportData.quote || null,
      fundamentals: reportData.fundamentals || null,
      scores: reportData.scores || null,
      generatedAt: new Date(report.createdAt),
    })

    const pdfStream = await renderToStream(pdfDoc)
    
    // Converteer stream naar buffer
    const chunks: Buffer[] = []
    for await (const chunk of pdfStream) {
      chunks.push(Buffer.from(chunk))
    }
    const pdfBuffer = Buffer.concat(chunks)

    return new NextResponse(pdfBuffer, {
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
      { error: "Interne server fout" },
      { status: 500 }
    )
  }
}

