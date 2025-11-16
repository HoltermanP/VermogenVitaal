import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const isPublicRoute = createRouteMatcher([
  "/",
  "/auth/signin(.*)",
  "/api/webhooks(.*)",
])

// Check of Clerk is geconfigureerd
const isClerkConfigured = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

// Export middleware - conditioneel Clerk gebruiken
export default isClerkConfigured
  ? clerkMiddleware(async (auth, request) => {
      if (!isPublicRoute(request)) {
        await auth.protect()
      }
    })
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
