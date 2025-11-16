import { auth, currentUser } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

/**
 * Haal de huidige gebruiker op via Clerk en sync met database
 */
export async function getClerkUser() {
  const { userId } = await auth()
  
  if (!userId) {
    return null
  }

  const clerkUser = await currentUser()
  
  if (!clerkUser) {
    return null
  }

  // Sync gebruiker met database
  const email = clerkUser.emailAddresses[0]?.emailAddress
  
  if (!email) {
    return null
  }

  // Zoek of maak gebruiker in database
  let user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    // Maak nieuwe gebruiker aan
    user = await prisma.user.create({
      data: {
        email,
        name: clerkUser.firstName && clerkUser.lastName
          ? `${clerkUser.firstName} ${clerkUser.lastName}`
          : clerkUser.firstName || clerkUser.username || email,
      },
    })
  } else {
    // Update naam als deze is veranderd
    const newName = clerkUser.firstName && clerkUser.lastName
      ? `${clerkUser.firstName} ${clerkUser.lastName}`
      : clerkUser.firstName || clerkUser.username || email
    
    if (user.name !== newName) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { name: newName },
      })
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
}

