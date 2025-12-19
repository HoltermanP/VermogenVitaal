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

  // Debug logging
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[PageContentGuard]', {
        pathname,
        isLoaded,
        isSignedIn,
        hasUser: !!user,
        isPublicRoute,
        hasRedirected
      })
    }
  }, [pathname, isLoaded, isSignedIn, user, isPublicRoute, hasRedirected])

  // Als niet ingelogd en niet op public route, redirect naar landingpage
  useEffect(() => {
    if (isLoaded && !isSignedIn && !isPublicRoute && !hasRedirected) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[PageContentGuard] Redirecting to landingpage - user not signed in')
      }
      setHasRedirected(true)
      // Redirect naar landingpage met auth_required parameter
      router.replace('/?auth_required=true&redirect=' + encodeURIComponent(pathname))
    }
  }, [isLoaded, isSignedIn, isPublicRoute, pathname, router, hasRedirected])

  // Reset redirect flag als gebruiker is ingelogd
  useEffect(() => {
    if (isSignedIn && user) {
      setHasRedirected(false)
      if (process.env.NODE_ENV === 'development') {
        console.log('[PageContentGuard] User is signed in, showing content')
      }
    }
  }, [isSignedIn, user])

  // Als gebruiker is ingelogd en op landingpage met redirect parameter, redirect direct
  useEffect(() => {
    if ((user || isSignedIn) && pathname === '/' && typeof window !== 'undefined' && !hasRedirected) {
      const urlParams = new URLSearchParams(window.location.search)
      const redirect = urlParams.get('redirect')
      if (redirect) {
        setHasRedirected(true)
        router.replace(redirect)
      }
    }
  }, [user, isSignedIn, pathname, hasRedirected, router])

  // Als ingelogd (user bestaat), toon altijd content direct - zelfs tijdens loading
  // Dit voorkomt dat ingelogde gebruikers geblokkeerd worden
  if (user || isSignedIn) {
    return <>{children}</>
  }

  // Als nog aan het laden, toon loading state (maar alleen als niet ingelogd)
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Laden...</div>
      </div>
    )
  }

  // Als niet ingelogd en niet op public route, verberg content (redirect wordt afgehandeld door useEffect)
  if (!isPublicRoute) {
    return null
  }

  // Toon content als op public route
  return <>{children}</>
}

