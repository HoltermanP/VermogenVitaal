import { NextRequest, NextResponse } from "next/server"
import { getClerkUser } from "@/lib/clerk-auth"
import { prisma } from "@/lib/prisma"

// PUT - Update een portfolio item
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getClerkUser(request)
    
    if (!user || !user.id) {
      return NextResponse.json(
        { error: "Niet geautoriseerd" },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { quantity, averagePrice, alertThreshold, alertEnabled } = body

    // Check of item bestaat en van de gebruiker is
    const existing = await prisma.portfolioItem.findFirst({
      where: {
        id: id,
        userId: user.id,
      },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Portefeuille item niet gevonden" },
        { status: 404 }
      )
    }

    // Update item
    const updated = await prisma.portfolioItem.update({
      where: { id: id },
      data: {
        ...(quantity !== undefined && { quantity: parseFloat(quantity) }),
        ...(averagePrice !== undefined && { averagePrice: averagePrice ? parseFloat(averagePrice) : null }),
        ...(alertThreshold !== undefined && { alertThreshold: alertThreshold ? parseFloat(alertThreshold) : null }),
        ...(alertEnabled !== undefined && { alertEnabled: alertEnabled }),
      },
    })

    return NextResponse.json({ portfolioItem: updated })
  } catch (error) {
    console.error("Error updating portfolio item:", error)
    return NextResponse.json(
      { error: "Fout bij bijwerken portefeuille item" },
      { status: 500 }
    )
  }
}

// DELETE - Verwijder een portfolio item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getClerkUser(request)
    
    if (!user || !user.id) {
      return NextResponse.json(
        { error: "Niet geautoriseerd" },
        { status: 401 }
      )
    }

    const { id } = await params

    // Check of item bestaat en van de gebruiker is
    const existing = await prisma.portfolioItem.findFirst({
      where: {
        id: id,
        userId: user.id,
      },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Portefeuille item niet gevonden" },
        { status: 404 }
      )
    }

    await prisma.portfolioItem.delete({
      where: { id: id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting portfolio item:", error)
    return NextResponse.json(
      { error: "Fout bij verwijderen portefeuille item" },
      { status: 500 }
    )
  }
}

