import { NextRequest, NextResponse } from "next/server"
import { auth, currentUser } from "@clerk/nextjs/server"
import { getClerkUser } from "@/lib/clerk-auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    // Probeer eerst auth() direct (werkt automatisch in API routes via middleware)
    let userId: string | null = null
    let clerkUser = null
    
    try {
      const authResult = await auth()
      userId = authResult?.userId || null
      
      if (userId) {
        try {
          clerkUser = await currentUser()
        } catch (userError) {
          console.error("Error getting currentUser:", userError)
        }
      }
    } catch (authError) {
      console.error("Error calling auth():", authError)
    }

    // Als auth() niet werkt, probeer getClerkUser als fallback
    let user = null
    if (!userId) {
      try {
        user = await getClerkUser(request)
        userId = user?.id || null
      } catch (getUserError) {
        console.error("Error calling getClerkUser:", getUserError)
      }
    } else if (clerkUser && !user) {
      // We hebben userId van auth() maar geen user object, maak een user object
      user = {
        id: userId,
        email: clerkUser.emailAddresses?.[0]?.emailAddress || clerkUser.primaryEmailAddress?.emailAddress,
        name: clerkUser.firstName && clerkUser.lastName 
          ? `${clerkUser.firstName} ${clerkUser.lastName}`
          : clerkUser.firstName || clerkUser.username || '',
      }
    }

    if (!userId) {
      return NextResponse.json(
        { error: "Niet geautoriseerd" },
        { status: 401 }
      )
    }

    // Haal uitgebreide user data op uit database
    let dbUser = await prisma.user.findUnique({
      where: { id: userId },
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

    // Als gebruiker niet in database bestaat, maak aan (sync met Clerk)
    if (!dbUser) {
      if (!clerkUser) {
        return NextResponse.json(
          { error: "Gebruiker niet gevonden" },
          { status: 404 }
        )
      }
      
      // Maak nieuwe gebruiker aan in database
      const email = clerkUser.emailAddresses?.[0]?.emailAddress || 
                   clerkUser.primaryEmailAddress?.emailAddress ||
                   clerkUser.externalAccounts?.find(ea => ea.provider === 'oauth_google')?.emailAddress
      
      if (!email) {
        return NextResponse.json(
          { error: "Geen email gevonden voor gebruiker" },
          { status: 400 }
        )
      }
      
      dbUser = await prisma.user.create({
        data: {
          id: userId,
          email,
          name: clerkUser.firstName && clerkUser.lastName
            ? `${clerkUser.firstName} ${clerkUser.lastName}`
            : clerkUser.firstName || clerkUser.username || email,
        },
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
