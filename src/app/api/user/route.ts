import { NextRequest, NextResponse } from "next/server"
import { getClerkUser } from "@/lib/clerk-auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    // Haal gebruiker op via Clerk
    const user = await getClerkUser(request)

    if (!user || !user.id) {
      return NextResponse.json(
        { error: "Niet geautoriseerd" },
        { status: 401 }
      )
    }

    // Haal uitgebreide user data op uit database
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        tier: true,
        trialEndsAt: true,
        isTrialActive: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!dbUser) {
      return NextResponse.json(
        { error: "Gebruiker niet gevonden" },
        { status: 404 }
      )
    }

    // Controleer of trial nog actief is
    let isTrialActive = dbUser.isTrialActive
    if (dbUser.isTrialActive && dbUser.trialEndsAt) {
      const now = new Date()
      if (now > dbUser.trialEndsAt) {
        // Trial is verlopen, update database
        await prisma.user.update({
          where: { id: dbUser.id },
          data: { isTrialActive: false }
        })
        isTrialActive = false
      }
    }

    return NextResponse.json({
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      tier: dbUser.tier,
      trialEndsAt: dbUser.trialEndsAt,
      isTrialActive,
      createdAt: dbUser.createdAt,
      updatedAt: dbUser.updatedAt,
    })
  } catch (error) {
    console.error("Error fetching user data:", error)
    return NextResponse.json(
      { error: "Interne server fout" },
      { status: 500 }
    )
  }
}
