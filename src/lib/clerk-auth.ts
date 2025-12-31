import { auth, currentUser } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import type { NextRequest } from "next/server"

/**
 * Haal de huidige gebruiker op via Clerk en sync met database
 * @param request - Optionele NextRequest om cookies/headers door te geven
 */
export async function getClerkUser(request?: NextRequest) {
  try {
    // Check of Clerk is geconfigureerd
    const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
    const clerkSecretKey = process.env.CLERK_SECRET_KEY
    
    if (!clerkPublishableKey || !clerkSecretKey) {
      console.error("getClerkUser: Clerk environment variables niet geconfigureerd")
      return null
    }
    
    // Log voor debugging (zowel development als production voor troubleshooting)
    if (request) {
      const cookieHeader = request.headers.get('cookie')
      const hasCookies = !!cookieHeader
      const hasClerkCookie = cookieHeader ? cookieHeader.includes('__clerk') : false
      
      if (process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV === 'production') {
        console.log("getClerkUser: Request info", {
          hasCookies,
          hasClerkCookie,
          url: request.url,
          method: request.method,
        })
      }
    }
    
    // In Clerk v6 voor Next.js 15, auth() leest automatisch uit request context
    // In API routes werkt dit automatisch via de middleware
    let authResult
    try {
      authResult = await auth()
    } catch (authError) {
      const errorMessage = authError instanceof Error ? authError.message : String(authError)
      console.error("getClerkUser: Error calling auth():", errorMessage)
      
      // In productie, log meer details voor troubleshooting
      if (process.env.VERCEL_ENV === 'production') {
        console.error("getClerkUser: Auth error details", {
          error: errorMessage,
          hasRequest: !!request,
          clerkConfigured: !!clerkPublishableKey && !!clerkSecretKey,
        })
      }
      
      return null
    }
    
    const { userId, sessionId } = authResult
    
    if (!userId) {
      if (process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV === 'production') {
        console.log("getClerkUser: No userId from auth()", {
          sessionId: sessionId || 'none',
          hasRequest: !!request,
        })
      }
      return null
    }

    // currentUser() leest ook automatisch uit request context
    let clerkUser
    try {
      clerkUser = await currentUser()
    } catch (userError) {
      console.error("getClerkUser: Error calling currentUser():", userError)
      return null
    }
    
    if (!clerkUser) {
      console.log("getClerkUser: No clerkUser from currentUser()")
      return null
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log("getClerkUser: clerkUser found - email:", clerkUser.emailAddresses[0]?.emailAddress)
    }

    // Sync gebruiker met database
    // Voor OAuth providers (zoals Google), kan email op verschillende plaatsen zitten
    let email = clerkUser.emailAddresses?.[0]?.emailAddress || 
                clerkUser.primaryEmailAddress?.emailAddress ||
                clerkUser.emailAddresses?.find(e => e.id === clerkUser.primaryEmailAddressId)?.emailAddress
    
    // Fallback: probeer email uit external accounts (voor OAuth providers)
    if (!email && clerkUser.externalAccounts && clerkUser.externalAccounts.length > 0) {
      const googleAccount = clerkUser.externalAccounts.find(ea => ea.provider === 'oauth_google')
      if (googleAccount?.emailAddress) {
        email = googleAccount.emailAddress
      } else if (clerkUser.externalAccounts[0]?.emailAddress) {
        email = clerkUser.externalAccounts[0].emailAddress
      }
    }
    
    if (!email) {
      console.log("getClerkUser: No email in clerkUser", {
        hasEmailAddresses: !!clerkUser.emailAddresses,
        emailAddressesCount: clerkUser.emailAddresses?.length || 0,
        hasPrimaryEmailAddress: !!clerkUser.primaryEmailAddress,
        primaryEmailAddressId: clerkUser.primaryEmailAddressId,
        externalAccounts: clerkUser.externalAccounts?.map(ea => ({
          provider: ea.provider,
          emailAddress: ea.emailAddress,
        })),
      })
      return null
    }

    // Zoek of maak gebruiker in database met error handling
    // Gebruik select om alleen bestaande kolommen op te halen
    let user
    try {
      user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          name: true,
          tier: true,
          role: true,
          trialEndsAt: true,
          isTrialActive: true,
          whatsappNumber: true, // Probeer whatsappNumber, maar als het niet bestaat wordt het null
          createdAt: true,
          updatedAt: true,
        },
      })
    } catch (dbError) {
      // Als whatsappNumber kolom niet bestaat, probeer zonder
      const errorMessage = dbError instanceof Error ? dbError.message : String(dbError)
      if (errorMessage.includes('whatsappNumber')) {
        console.warn("getClerkUser: whatsappNumber kolom bestaat nog niet, probeer zonder")
        try {
          user = await prisma.user.findUnique({
            where: { email },
            select: {
              id: true,
              email: true,
              name: true,
              tier: true,
              role: true,
              trialEndsAt: true,
              isTrialActive: true,
              createdAt: true,
              updatedAt: true,
            },
          })
        } catch (fallbackError) {
          console.error("getClerkUser: Database error finding user (fallback):", fallbackError)
          return null
        }
      } else {
        console.error("getClerkUser: Database error finding user:", dbError)
        return null
      }
    }

    if (!user) {
      // Maak nieuwe gebruiker aan met error handling
      try {
        const userName = clerkUser.firstName && clerkUser.lastName
          ? `${clerkUser.firstName} ${clerkUser.lastName}`
          : clerkUser.firstName || clerkUser.username || email || 'Gebruiker'
        
        console.log("getClerkUser: Creating new user in database", {
          email,
          name: userName,
          clerkUserId: userId,
        })
        
        // Nieuwe gebruikers krijgen automatisch een gratis proefmaand van 30 dagen
        const trialEndsAt = new Date()
        trialEndsAt.setDate(trialEndsAt.getDate() + 30)

        user = await prisma.user.create({
          data: {
            email,
            name: userName,
            tier: 'FREE', // Trial gebruikers blijven FREE tier maar hebben extra rechten
            trialEndsAt,
            isTrialActive: true,
          },
        })
        
        console.log("getClerkUser: User created successfully", {
          userId: user.id,
          email: user.email,
        })
      } catch (createError) {
        const errorMessage = createError instanceof Error ? createError.message : String(createError)
        const errorCode = createError && typeof createError === 'object' && 'code' in createError ? String(createError.code) : undefined
        
        console.error("getClerkUser: Database error creating user:", {
          error: errorMessage,
          code: errorCode,
          email,
          clerkUserId: userId,
        })
        
        // Als het een duplicate key error is, probeer opnieuw te vinden
        if (errorCode === 'P2002') {
          console.log("getClerkUser: Duplicate key error, trying to find user again")
          try {
            user = await prisma.user.findUnique({
              where: { email },
              select: {
                id: true,
                email: true,
                name: true,
                tier: true,
                role: true,
                trialEndsAt: true,
                isTrialActive: true,
                whatsappNumber: true,
                createdAt: true,
                updatedAt: true,
              },
            })
            if (user) {
              console.log("getClerkUser: User found after duplicate error", { userId: user.id })
            }
          } catch (findError) {
            // Probeer zonder whatsappNumber als het niet bestaat
            const findErrorMessage = findError instanceof Error ? findError.message : String(findError)
            if (findErrorMessage.includes('whatsappNumber')) {
              try {
                user = await prisma.user.findUnique({
                  where: { email },
                  select: {
                    id: true,
                    email: true,
                    name: true,
                    tier: true,
                    role: true,
                    trialEndsAt: true,
                    isTrialActive: true,
                    createdAt: true,
                    updatedAt: true,
                  },
                })
              } catch (fallbackError) {
                console.error("getClerkUser: Error finding user after duplicate (fallback):", fallbackError)
              }
            } else {
              console.error("getClerkUser: Error finding user after duplicate:", findError)
            }
          }
        }
        
        // Als we de gebruiker nog steeds niet hebben, return null
        if (!user) {
          return null
        }
      }
    } else {
      // Update naam als deze is veranderd met error handling
      // En controleer of trial is verlopen
      try {
        const newName = clerkUser.firstName && clerkUser.lastName
          ? `${clerkUser.firstName} ${clerkUser.lastName}`
          : clerkUser.firstName || clerkUser.username || email
        
        // Check of trial is verlopen
        const updateData: { name?: string; isTrialActive?: boolean } = {}
        if (user.name !== newName) {
          updateData.name = newName
        }
        
        // Als trial actief is maar verlopen, zet isTrialActive op false
        if (user.isTrialActive && user.trialEndsAt) {
          const now = new Date()
          if (now > user.trialEndsAt) {
            updateData.isTrialActive = false
          }
        }
        
        if (Object.keys(updateData).length > 0) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: updateData,
          })
        }
      } catch (updateError) {
        console.error("getClerkUser: Database error updating user:", updateError)
        // Als update faalt, gebruik de bestaande user data
      }
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      tier: user.tier,
      role: user.role,
      clerkId: userId,
    }
  } catch (error) {
    console.error("Error in getClerkUser:", error)
    return null
  }
}

