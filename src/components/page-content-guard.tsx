"use client"

import { usePathname } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { ReactNode, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

// Routes die publiek toegankelijk zijn zonder account
const PUBLIC_ROUTES = ['/', '/pricing', '/auth/signin', '/auth/signup']

interface PageContentGuardProps {
  children: ReactNode
}

export function PageContentGuard({ children }: PageContentGuardProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { isLoaded, isSignedIn, user } = useUser()
  const [hasRedirected, setHasRedirected] = useState(false)
  
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname)

  // Debug logging (ook in productie voor troubleshooting)
  useEffect(() => {
    console.log('[PageContentGuard]', {
      pathname,
      isLoaded,
      isSignedIn,
      hasUser: !!user,
      userId: user?.id || 'null',
      isPublicRoute,
      hasRedirected
    })
  }, [pathname, isLoaded, isSignedIn, user, isPublicRoute, hasRedirected])

  // Als niet ingelogd en niet op public route, redirect naar landingpage
  useEffect(() => {
    if (isLoaded && !isSignedIn && !isPublicRoute && !hasRedirected) {
      console.log('[PageContentGuard] ❌ User not signed in, redirecting to landingpage')
      setHasRedirected(true)
      // Redirect naar landingpage met auth_required parameter
      router.replace('/?auth_required=true&redirect=' + encodeURIComponent(pathname))
    }
  }, [isLoaded, isSignedIn, isPublicRoute, pathname, router, hasRedirected])

  // Reset redirect flag als gebruiker is ingelogd
  useEffect(() => {
    if (isSignedIn && user) {
      console.log('[PageContentGuard] ✅ User is signed in, showing content', { userId: user.id })
      setHasRedirected(false)
    }
  }, [isSignedIn, user])

  // Als gebruiker is ingelogd en op landingpage met redirect parameter, redirect direct
  useEffect(() => {
    if ((user || isSignedIn) && pathname === '/' && typeof window !== 'undefined' && !hasRedirected) {
      const urlParams = new URLSearchParams(window.location.search)
      const redirect = urlParams.get('redirect')
      if (redirect) {
        setHasRedirected(true)
        // Wacht even zodat Clerk volledig is geladen voordat we redirecten
        setTimeout(() => {
          router.replace(redirect)
          router.refresh()
        }, 100)
      }
    }
  }, [user, isSignedIn, pathname, hasRedirected, router])

  // BELANGRIJK: Als Clerk nog aan het laden is, wacht even voordat we beslissingen nemen
  // Dit voorkomt race conditions waarbij we te vroeg redirecten
  if (!isLoaded) {
    // Als we op een public route zijn, toon content direct (ook tijdens loading)
    if (isPublicRoute) {
      return <>{children}</>
    }
    // Voor protected routes, toon loading state
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Laden...</div>
      </div>
    )
  }

  // Na het laden: check of gebruiker is ingelogd
  // Check user object eerst (meest betrouwbaar), dan isSignedIn
  if (user || isSignedIn) {
    console.log('[PageContentGuard] ✅ User is authenticated, showing content', { 
      hasUser: !!user, 
      isSignedIn,
      userId: user?.id || 'unknown'
    })
    return <>{children}</>
  }

  // Als niet ingelogd en niet op public route, verberg content (redirect wordt afgehandeld door useEffect)
  if (!isPublicRoute) {
    return null
  }

  // Toon content als op public route
  return <>{children}</>
}

