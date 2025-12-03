import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getClerkUser } from "@/lib/clerk-auth"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reportId } = await params

    if (!reportId) {
      return NextResponse.json(
        { error: "Report ID is verplicht" },
        { status: 400 }
      )
    }

    // Authenticatie
    const user = await getClerkUser()
    if (!user || !user.id) {
      return NextResponse.json(
        { error: "Niet geautoriseerd" },
        { status: 401 }
      )
    }

    // Haal rapport op en controleer eigendom
    const report = await prisma.deepResearchReport.findUnique({
      where: { id: reportId },
    })

    if (!report) {
      return NextResponse.json(
        { error: "Rapport niet gevonden" },
        { status: 404 }
      )
    }

    if (report.userId !== user.id) {
      return NextResponse.json(
        { error: "Geen toegang tot dit rapport" },
        { status: 403 }
      )
    }

    // Alleen cancellen als status GENERATING is
    if (report.status !== "GENERATING") {
      return NextResponse.json(
        { error: `Rapport kan niet geannuleerd worden. Huidige status: ${report.status}` },
        { status: 400 }
      )
    }

    // Update status naar CANCELLED
    await prisma.deepResearchReport.update({
      where: { id: reportId },
      data: {
        status: "CANCELLED",
        progressMessage: "Geannuleerd door gebruiker",
      },
    })

    return NextResponse.json({
      success: true,
      message: "Rapport geannuleerd",
    })
  } catch (error) {
    console.error("Error cancelling report:", error)
    return NextResponse.json(
      { error: "Fout bij annuleren rapport" },
      { status: 500 }
    )
  }
}

