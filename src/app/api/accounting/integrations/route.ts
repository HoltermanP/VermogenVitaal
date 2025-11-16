import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { Session } from "next-auth"

export async function GET(request: NextRequest) {
  try {
    const session: Session | null = await getServerSession(authOptions)
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json(
        { error: "Niet geautoriseerd" },
        { status: 401 }
      )
    }

    const userEmail = session.user.email
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Gebruiker niet gevonden" },
        { status: 404 }
      )
    }

    const integrations = await prisma.accountingIntegration.findMany({
      where: {
        userId: user.id,
        isActive: true,
      },
      select: {
        id: true,
        provider: true,
        name: true,
        companyId: true,
        isActive: true,
        lastSyncAt: true,
        createdAt: true,
        updatedAt: true,
        // Geen tokens terugsturen
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({ integrations })
  } catch (error) {
    console.error("Get integrations error:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Fout bij ophalen integraties",
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session: Session | null = await getServerSession(authOptions)
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json(
        { error: "Niet geautoriseerd" },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const integrationId = searchParams.get("id")

    if (!integrationId) {
      return NextResponse.json(
        { error: "Integration ID is vereist" },
        { status: 400 }
      )
    }

    const userEmail = session.user.email
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Gebruiker niet gevonden" },
        { status: 404 }
      )
    }

    // Soft delete - zet isActive op false
    await prisma.accountingIntegration.updateMany({
      where: {
        id: integrationId,
        userId: user.id,
      },
      data: {
        isActive: false,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete integration error:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Fout bij verwijderen integratie",
      },
      { status: 500 }
    )
  }
}

