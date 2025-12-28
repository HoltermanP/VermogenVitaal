import { getClerkUser } from "@/lib/clerk-auth"
import { hasPremiumAccess } from "@/lib/utils"
import { redirect } from "next/navigation"
import type { NextRequest } from "next/server"

/**
 * Check of een gebruiker is ingelogd en redirect naar signin als niet
 */
export async function requireAuth(request?: NextRequest) {
  const user = await getClerkUser(request)
  
  if (!user) {
    redirect("/auth/signin")
  }
  
  return user
}

/**
 * Check of een gebruiker premium toegang heeft (PREMIUM tier of actieve trial)
 * Redirect naar pricing als niet
 */
export async function requirePremium(request?: NextRequest) {
  const user = await requireAuth(request)
  
  const hasAccess = await hasPremiumAccess(user.id)
  
  if (!hasAccess) {
    redirect("/pricing?upgrade=required")
  }
  
  return user
}












