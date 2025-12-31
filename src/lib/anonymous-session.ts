import { NextRequest } from "next/server"
import { randomBytes } from "crypto"

const ANONYMOUS_SESSION_COOKIE = "anonymous_session_id"

/**
 * Haal het IP adres van de client op uit de request headers
 * Werkt met Vercel en andere proxy servers
 * @param request - NextRequest object
 * @returns IP adres of "unknown" als niet gevonden
 */
export function getClientIP(request: NextRequest): string {
  // Vercel en andere proxies gebruiken x-forwarded-for
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) {
    // x-forwarded-for kan meerdere IPs bevatten (client, proxy1, proxy2)
    // Neem de eerste (originele client IP)
    return forwarded.split(",")[0].trim()
  }

  // Fallback naar x-real-ip (gebruikt door sommige proxies)
  const realIP = request.headers.get("x-real-ip")
  if (realIP) {
    return realIP.trim()
  }

  // Geen IP gevonden
  return "unknown"
}

/**
 * Haal of maak een anonieme sessie ID op
 * @param request - NextRequest object om cookies te lezen
 * @returns Een unieke sessie ID voor anonieme gebruikers
 */
export async function getOrCreateAnonymousSessionId(request: NextRequest): Promise<string> {
  // In API routes kunnen we cookies uit de request lezen
  let sessionId = request.cookies.get(ANONYMOUS_SESSION_COOKIE)?.value

  if (!sessionId) {
    // Genereer een nieuwe sessie ID
    sessionId = `anon_${randomBytes(16).toString("hex")}`
  }

  return sessionId
}

/**
 * Haal anonieme sessie ID op uit request (zonder nieuwe aan te maken)
 * @param request - NextRequest object
 * @returns Sessie ID of undefined als niet gevonden
 */
export function getAnonymousSessionId(request: NextRequest): string | undefined {
  return request.cookies.get(ANONYMOUS_SESSION_COOKIE)?.value
}

/**
 * Genereer een tracking key voor rate limiting
 * Combineert IP adres met sessionId voor betere beveiliging
 * @param request - NextRequest object
 * @param sessionId - Optionele sessie ID
 * @returns Tracking key voor rate limiting
 */
export function getTrackingKey(request: NextRequest, sessionId?: string): string {
  const ip = getClientIP(request)
  if (sessionId) {
    // Combineer IP met sessionId voor betere tracking
    // Dit maakt het moeilijker om te omzeilen door alleen cookies te verwijderen
    return `${ip}_${sessionId}`
  }
  return ip
}

