import { auth, currentUser } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import type { NextRequest } from "next/server"

/**
 * Haal de huidige gebruiker op via Clerk en sync met database
 * @param request - Optionele NextRequest om cookies/headers door te geven
 */
export async function getClerkUser(request?: NextRequest) {
  try {
    // In Clerk v6 voor Next.js 15, auth() leest automatisch uit request context
    // Maar we kunnen headers loggen voor debugging
    if (request && process.env.NODE_ENV === 'development') {
      const cookieHeader = request.headers.get('cookie')
      const authHeader = request.headers.get('authorization')
      console.log("getClerkUser: Request cookies present:", !!cookieHeader)
      console.log("getClerkUser: Request auth header present:", !!authHeader)
      if (cookieHeader) {
        // Log alleen of __clerk_db_jwt aanwezig is (niet de waarde)
        console.log("getClerkUser: __clerk_db_jwt cookie present:", cookieHeader.includes('__clerk_db_jwt'))
      }
    }
    
    // In Clerk v6, auth() werkt automatisch met de request context
    // Als we een request hebben, kunnen we proberen de headers door te geven
    let authResult
    try {
      authResult = await auth()
    } catch (authError) {
      console.error("getClerkUser: Error calling auth():", authError)
      return null
    }
    
    const { userId, sessionId } = authResult
    
    if (process.env.NODE_ENV === 'development') {
      console.log("getClerkUser: auth() result - userId:", userId, "sessionId:", sessionId)
    }
    
    if (!userId) {
      console.log("getClerkUser: No userId from auth()")
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
    const email = clerkUser.emailAddresses[0]?.emailAddress
    
    if (!email) {
      console.log("getClerkUser: No email in clerkUser")
      return null
    }

    // Zoek of maak gebruiker in database met error handling
    let user
    try {
      user = await prisma.user.findUnique({
        where: { email },
      })
    } catch (dbError) {
      console.error("getClerkUser: Database error finding user:", dbError)
      // Als database niet beschikbaar is, return null
      return null
    }

    if (!user) {
      // Maak nieuwe gebruiker aan met error handling
      try {
        user = await prisma.user.create({
          data: {
            email,
            name: clerkUser.firstName && clerkUser.lastName
              ? `${clerkUser.firstName} ${clerkUser.lastName}`
              : clerkUser.firstName || clerkUser.username || email,
          },
        })
      } catch (createError) {
        console.error("getClerkUser: Database error creating user:", createError)
        // Als we de gebruiker niet kunnen aanmaken, return null
        return null
      }
    } else {
      // Update naam als deze is veranderd met error handling
      try {
        const newName = clerkUser.firstName && clerkUser.lastName
          ? `${clerkUser.firstName} ${clerkUser.lastName}`
          : clerkUser.firstName || clerkUser.username || email
        
        if (user.name !== newName) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: { name: newName },
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

