import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const isPublicRoute = createRouteMatcher([
  "/",
  "/auth/signin(.*)",
  "/api/webhooks(.*)",
  // Stock API routes - laat de route zelf authenticatie afhandelen
  "/api/stocks(.*)",
])

// Check of Clerk is geconfigureerd
const isClerkConfigured = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

// Export middleware - conditioneel Clerk gebruiken
export default isClerkConfigured
  ? clerkMiddleware(async (auth, request) => {
      // Debug: log de request URL en of het een public route is
      if (process.env.NODE_ENV === 'development') {
        const cookieHeader = request.headers.get('cookie')
        console.log(`[Middleware] ${request.method} ${request.url} - Public: ${isPublicRoute(request)} - Cookies: ${!!cookieHeader}`)
      }
      
      // Laat public routes door zonder protect
      if (!isPublicRoute(request)) {
        await auth.protect()
      }
      
      // Voor public routes (zoals /api/stocks), laat de route zelf authenticatie afhandelen
      // Zorg dat cookies worden doorgegeven in de response
      const response = NextResponse.next()
      
      // Zorg dat cookies worden doorgegeven (voor CORS en cookie sharing)
      if (request.headers.get('origin')) {
        response.headers.set('Access-Control-Allow-Credentials', 'true')
        response.headers.set('Access-Control-Allow-Origin', request.headers.get('origin') || '*')
      }
      
      return response
    }, { debug: process.env.NODE_ENV === 'development' })
  : async function middleware(_request: NextRequest) {
      // Fallback middleware wanneer Clerk niet is geconfigureerd (voor build)
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
