import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Type definitions for dynamic Clerk imports
type ClerkAuth = {
  userId: string | null
  sessionId: string | null
  protect: () => Promise<void>
}

type ClerkMiddlewareFunction = (handler: (auth: ClerkAuth, request: NextRequest) => Promise<Response> | Response, options?: { debug?: boolean }) => (request: NextRequest) => Promise<Response> | Response
type CreateRouteMatcherFunction = (routes: string[]) => (request: NextRequest) => boolean

// Check of Clerk is geconfigureerd en heeft een geldige key
const isClerkConfigured = (() => {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  return key &&
         key !== 'pk_test_...' &&
         !key.includes('placeholder') &&
         !key.includes('dummy')
})()

// Dynamisch importeren van Clerk alleen als het geconfigureerd is
let clerkMiddleware: ClerkMiddlewareFunction | null = null
let createRouteMatcher: CreateRouteMatcherFunction | null = null

if (isClerkConfigured) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const clerkServer = require("@clerk/nextjs/server")
    clerkMiddleware = clerkServer.clerkMiddleware
    createRouteMatcher = clerkServer.createRouteMatcher
  } catch (error) {
    console.warn("Clerk import failed:", error)
  }
}

// Alleen deze routes zijn publiek toegankelijk:
// - Landingspagina (/)
// - Authenticatie routes (/auth/*)
// - Pricing pagina (/pricing)
// - Webhook endpoints (voor Stripe)
// - Stocks API routes (handelen authenticatie zelf af waar nodig)
// - User API route (handelt authenticatie zelf af)
const isPublicRoute = isClerkConfigured && createRouteMatcher ? createRouteMatcher([
  "/",
  "/auth/signin(.*)",
  "/auth/signup(.*)",
  "/pricing",
  "/api/webhooks(.*)",
  "/api/stocks(.*)",
  "/api/user", // User API route handelt authenticatie zelf af
]) : null

// Export middleware - conditioneel Clerk gebruiken
export default isClerkConfigured && clerkMiddleware
  ? clerkMiddleware(async (auth, request) => {
      const pathname = request.nextUrl.pathname
      const isPublic = isPublicRoute ? isPublicRoute(request) : false
      
      // Check cookies voor debugging
      const cookieHeader = request.headers.get('cookie') || ''
      const hasClerkCookie = cookieHeader.includes('__clerk') || cookieHeader.includes('__session')
      const clerkCookies = cookieHeader.split(';').filter(c => c.includes('__clerk') || c.includes('__session'))
      
      // Debug logging (ook in productie voor troubleshooting)
      console.log(`[Middleware] ${request.method} ${pathname} - userId: ${auth.userId || 'null'} - Public: ${isPublic} - SessionId: ${auth.sessionId || 'null'} - HasClerkCookie: ${hasClerkCookie} - ClerkCookies: ${clerkCookies.length}`)
      
      // Gebruik auth.userId direct - deze is al beschikbaar via clerkMiddleware
      const actualUserId = auth.userId

      // API routes handelen authenticatie zelf af - laat altijd door
      // Dit voorkomt dat API routes worden geblokkeerd door de middleware
      if (pathname.startsWith('/api/')) {
        return NextResponse.next()
      }

      // Laat public routes door zonder protect
      // Voor pagina routes, check authenticatie
      if (isPublicRoute && !isPublic) {
        // Check of gebruiker is ingelogd
        // Gebruik actualUserId (kan van fallback komen)
        // Als userId bestaat, laat ALTIJD door (gebruiker is ingelogd, ongeacht tier)
        if (actualUserId) {
          console.log(`[Middleware] ✅ User authenticated (userId: ${actualUserId}), allowing access to ${pathname}`)
          // Gebruiker is ingelogd - laat door (FREE, PREMIUM, etc. - alle tiers hebben toegang)
          // Verwijder eventuele auth_required parameters uit de URL als gebruiker is ingelogd
          const url = request.nextUrl.clone()
          if (url.searchParams.has('auth_required') || url.searchParams.has('redirect')) {
            console.log(`[Middleware] Removing auth_required params from URL for authenticated user`)
            url.searchParams.delete('auth_required')
            url.searchParams.delete('redirect')
            return NextResponse.redirect(url)
          }
          return NextResponse.next()
        }
        
        // Gebruiker is niet ingelogd volgens middleware
        // MAAR: als er al auth_required in de URL staat, laat door (voorkom redirect loop)
        if (request.nextUrl.searchParams.has('auth_required')) {
          console.log(`[Middleware] Already on landingpage with auth_required, allowing through`)
          // Al op landingpage met auth_required - laat door zodat modal kan openen
          return NextResponse.next()
        }
        
        // BELANGRIJK: Als er Clerk cookies zijn maar userId is null, kan het zijn dat
        // Clerk nog aan het laden is. Laat de client-side component beslissen.
        // Dit voorkomt dat we te snel redirecten voordat Clerk volledig is geladen.
        if (hasClerkCookie && !actualUserId) {
          console.log(`[Middleware] ⚠️  Clerk cookies found but userId is null - allowing through for client-side check`)
          // Laat door - PageContentGuard zal de uiteindelijke beslissing nemen
          return NextResponse.next()
        }
        
        console.log(`[Middleware] ❌ User not authenticated, redirecting to landingpage. Path: ${pathname}`)
        // Redirect naar landingpage met parameter die aangeeft welke pagina werd aangevraagd
        const requestedPath = pathname
        const landingUrl = new URL('/', request.url)
        landingUrl.searchParams.set('auth_required', 'true')
        landingUrl.searchParams.set('redirect', requestedPath)
        return NextResponse.redirect(landingUrl)
      }

      // Zorg dat cookies worden doorgegeven in the response
      const response = NextResponse.next()

      // Zorg dat cookies worden doorgegeven (voor CORS en cookie sharing)
      const origin = request.headers.get('origin')
      if (origin) {
        response.headers.set('Access-Control-Allow-Credentials', 'true')
        response.headers.set('Access-Control-Allow-Origin', origin)
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      }

      return response
    }, { debug: process.env.NODE_ENV === 'development' })
  : async function middleware() {
      // Fallback middleware wanneer Clerk niet is geconfigureerd (voor build)
      console.log(`[Middleware] Clerk not configured, using fallback middleware`)
      return NextResponse.next()
    }

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
}
