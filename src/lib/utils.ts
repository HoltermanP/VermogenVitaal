import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { prisma } from "@/lib/prisma"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Check of een gebruiker toegang heeft tot premium features
 * Dit is het geval als:
 * - Gebruiker PREMIUM tier heeft (betaald abonnement)
 * - OF gebruiker een actieve trial heeft (binnen 1 maand en isTrialActive = true)
 */
export async function hasPremiumAccess(userId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { tier: true, trialEndsAt: true, isTrialActive: true }
    })

    if (!user) {
      return false
    }

    // Betaald PREMIUM abonnement (niet trial)
    if (user.tier === "PREMIUM" && !user.isTrialActive) {
      return true
    }

    // Actieve trial check
    if (user.isTrialActive && user.trialEndsAt) {
      const now = new Date()
      if (now <= user.trialEndsAt) {
        return true
      } else {
        // Trial is verlopen, update database
        await prisma.user.update({
          where: { id: userId },
          data: { isTrialActive: false }
        })
        return false
      }
    }

    return false
  } catch (error) {
    console.error("Error checking premium access:", error)
    return false
  }
}

/**
 * Check of een gebruiker nog AI calls over heeft
 * Premium gebruikers: onbeperkt
 * Trial gebruikers: max 10 calls in de trial periode
 * FREE gebruikers: max 10 calls per 30 dagen
 */
export async function canMakeAICall(userId: string, endpoint: string): Promise<{ allowed: boolean; remaining: number; limit: number }> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { tier: true, trialEndsAt: true, isTrialActive: true }
    })

    if (!user) {
      return { allowed: false, remaining: 0, limit: 0 }
    }

    const isPremium = await hasPremiumAccess(userId)
    
    // Premium gebruikers hebben onbeperkte toegang
    if (isPremium && user.tier === "PREMIUM") {
      return { allowed: true, remaining: -1, limit: -1 } // -1 betekent onbeperkt
    }

    // Voor trial en FREE gebruikers: check limiet
    const FREE_TIER_AI_CALL_LIMIT = 10
    
    // Bepaal de tijdspanne voor het tellen van calls
    let timeSpan: Date
    if (user.isTrialActive && user.trialEndsAt) {
      // Voor trial gebruikers: tel vanaf het begin van de trial
      timeSpan = user.trialEndsAt
      timeSpan.setMonth(timeSpan.getMonth() - 1) // 1 maand terug vanaf trial end
    } else {
      // Voor FREE gebruikers: laatste 30 dagen
      timeSpan = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    }

    const aiCallCount = await prisma.aiCall.count({
      where: {
        userId: userId,
        endpoint: endpoint,
        createdAt: {
          gte: timeSpan
        }
      }
    })

    const remaining = Math.max(0, FREE_TIER_AI_CALL_LIMIT - aiCallCount)
    const allowed = aiCallCount < FREE_TIER_AI_CALL_LIMIT

    return { allowed, remaining, limit: FREE_TIER_AI_CALL_LIMIT }
  } catch (error) {
    console.error("Error checking AI call limit:", error)
    return { allowed: false, remaining: 0, limit: 0 }
  }
}
