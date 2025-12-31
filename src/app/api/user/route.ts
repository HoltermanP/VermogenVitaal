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
        if (user?.id) {
          userId = user.id
        }
      } catch (getUserError) {
        console.error("Error calling getClerkUser:", getUserError)
      }
    }

    if (!userId) {
      return NextResponse.json(
        { error: "Niet geautoriseerd" },
        { status: 401 }
      )
    }

    // Haal email op van Clerk user - probeer verschillende bronnen
    let email: string | null = null
    
    if (clerkUser) {
      email = clerkUser.emailAddresses?.[0]?.emailAddress || 
              clerkUser.primaryEmailAddress?.emailAddress ||
              clerkUser.externalAccounts?.find(ea => ea.provider === 'oauth_google')?.emailAddress ||
              null
    }
    
    // Fallback naar user object email
    if (!email && user?.email) {
      email = user.email
    }

    if (!email) {
      console.error("No email found for user", { userId, hasClerkUser: !!clerkUser, hasUser: !!user })
      return NextResponse.json(
        { error: "Geen email gevonden voor gebruiker" },
        { status: 400 }
      )
    }

    // Zoek gebruiker op email (niet op id, want id is een CUID)
    let dbUser = null
    try {
      dbUser = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          name: true,
          tier: true,
          trialEndsAt: true,
          isTrialActive: true,
          whatsappNumber: true,
          createdAt: true,
          updatedAt: true,
        },
      })
    } catch (queryError) {
      console.error("Error querying user from database:", queryError)
      // Als de kolommen niet bestaan, probeer zonder trial kolommen
      try {
        dbUser = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            tier: true,
            whatsappNumber: true,
            createdAt: true,
            updatedAt: true,
          },
        })
        // Als gebruiker gevonden maar zonder trial kolommen, update deze
        if (dbUser) {
          const trialEndsAt = new Date()
          trialEndsAt.setDate(trialEndsAt.getDate() + 30)
          await prisma.user.update({
            where: { id: dbUser.id },
            data: {
              trialEndsAt,
              isTrialActive: true,
            },
          })
          // Haal gebruiker opnieuw op met alle kolommen
          dbUser = await prisma.user.findUnique({
            where: { email },
            select: {
              id: true,
              email: true,
              name: true,
              tier: true,
              trialEndsAt: true,
              isTrialActive: true,
              whatsappNumber: true,
              createdAt: true,
              updatedAt: true,
            },
          })
        }
      } catch (fallbackError) {
        console.error("Error in fallback query:", fallbackError)
        throw queryError // Re-throw original error
      }
    }

    // Als gebruiker niet in database bestaat, maak aan (sync met Clerk)
    if (!dbUser) {
      // Bepaal naam van gebruiker
      let userName = email // Fallback naar email
      
      if (clerkUser) {
        userName = clerkUser.firstName && clerkUser.lastName
          ? `${clerkUser.firstName} ${clerkUser.lastName}`
          : clerkUser.firstName || clerkUser.username || email
      } else if (user?.name) {
        userName = user.name
      }
      
      // Maak nieuwe gebruiker aan in database (zonder id, laat Prisma CUID genereren)
      // Nieuwe gebruikers krijgen automatisch een gratis proefmaand van 30 dagen
      const trialEndsAt = new Date()
      trialEndsAt.setDate(trialEndsAt.getDate() + 30)
      
      try {
        dbUser = await prisma.user.create({
          data: {
            email,
            name: userName,
            tier: 'FREE', // Trial gebruikers blijven FREE tier maar hebben extra rechten
            trialEndsAt,
            isTrialActive: true,
          },
          select: {
            id: true,
            email: true,
            name: true,
            tier: true,
            trialEndsAt: true,
            isTrialActive: true,
            whatsappNumber: true,
            createdAt: true,
            updatedAt: true,
          },
        })
      } catch (createError) {
        console.error("Error creating user:", createError)
        // Als gebruiker al bestaat (race condition of unique constraint), probeer opnieuw op te halen
        if (createError instanceof Error && (
          createError.message.includes('Unique constraint') ||
          createError.message.includes('P2002') // Prisma unique constraint error code
        )) {
          try {
            dbUser = await prisma.user.findUnique({
              where: { email },
              select: {
                id: true,
                email: true,
                name: true,
                tier: true,
                trialEndsAt: true,
                isTrialActive: true,
                whatsappNumber: true,
                createdAt: true,
                updatedAt: true,
              },
            })
          } catch (findError) {
            console.error("Error finding user after create error:", findError)
            throw createError // Re-throw original error
          }
        } else {
          throw createError
        }
      }
    }

    // Als dbUser nog steeds null is na alle pogingen, return error
    if (!dbUser) {
      return NextResponse.json(
        { error: "Kon gebruiker niet vinden of aanmaken" },
        { status: 500 }
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
      trialEndsAt: dbUser.trialEndsAt ? dbUser.trialEndsAt.toISOString() : null,
      isTrialActive: isTrialActive ?? false,
      whatsappNumber: dbUser.whatsappNumber || null,
      createdAt: dbUser.createdAt.toISOString(),
      updatedAt: dbUser.updatedAt.toISOString(),
    })
  } catch (error) {
    // Verbeterde error logging voor debugging
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : undefined
    
    console.error("Error fetching user data:", {
      message: errorMessage,
      stack: errorStack,
      timestamp: new Date().toISOString(),
    })
    
    // Return meer details in development, minder in production
    return NextResponse.json(
      { 
        error: "Interne server fout",
        ...(process.env.NODE_ENV === 'development' && { details: errorMessage })
      },
      { status: 500 }
    )
  }
}

// PUT - Update gebruiker instellingen (bijv. WhatsApp nummer)
export async function PUT(request: NextRequest) {
  try {
    const user = await getClerkUser(request)
    
    if (!user || !user.id) {
      return NextResponse.json(
        { error: "Niet geautoriseerd" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { whatsappNumber } = body

    // Update gebruiker
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(whatsappNumber !== undefined && { whatsappNumber: whatsappNumber || null }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        tier: true,
        whatsappNumber: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({
      id: updated.id,
      email: updated.email,
      name: updated.name,
      tier: updated.tier,
      whatsappNumber: updated.whatsappNumber || null,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json(
      { error: "Fout bij bijwerken gebruiker" },
      { status: 500 }
    )
  }
}
