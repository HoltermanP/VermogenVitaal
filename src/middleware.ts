import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Admin routes - temporarily disabled for testing
  if (pathname.startsWith('/admin')) {
    // Allow access for testing
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/documents/:path*',
    '/community/:path*',
    '/tickets/:path*',
    '/consultation/:path*',
    '/admin/:path*',
    '/account/:path*',
    '/calculators/:path*',
    '/reports/:path*'
  ]
}
