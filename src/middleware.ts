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

const isPublicRoute = isClerkConfigured && createRouteMatcher ? createRouteMatcher([
  "/",
  "/auth/signin(.*)",
  "/auth/signup(.*)",
  "/pricing",
  "/calculators(.*)", // Alle calculators zijn publiek om te bekijken
  "/api/webhooks(.*)",
  // Stock API routes - laat de route zelf authenticatie afhandelen
  // MAAR: deep-research routes hebben authenticatie nodig via middleware
  "/api/stocks/search(.*)",
  // /api/stocks/favorites is NIET public - vereist authenticatie
  // AI endpoints zijn publiek maar handelen zelf limieten af
  "/api/tips/chat(.*)",
  "/api/stocks/deep-research(.*)",
  "/api/audit/(.*)", // Audit endpoints zijn publiek maar handelen authenticatie zelf af
]) : null

// Export middleware - conditioneel Clerk gebruiken
export default isClerkConfigured && clerkMiddleware
  ? clerkMiddleware(async (auth, request) => {
      // Debug: log de request URL en of het een public route is
      if (process.env.NODE_ENV === 'development') {
        const cookieHeader = request.headers.get('cookie')
        console.log(`[Middleware] ${request.method} ${request.url} - Public: ${isPublicRoute ? isPublicRoute(request) : false} - Cookies: ${!!cookieHeader}`)
      }

      // Laat public routes door zonder protect
      // API routes zoals /api/stocks handelen authenticatie zelf af voor betere controle
      if (isPublicRoute && !isPublicRoute(request)) {
        await auth.protect()
      }

      // Zorg dat cookies worden doorgegeven in de response
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
