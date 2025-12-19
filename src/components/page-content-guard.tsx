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

  // Als niet ingelogd en niet op public route, redirect naar landingpage
  useEffect(() => {
    if (isLoaded && !isSignedIn && !isPublicRoute && !hasRedirected) {
      setHasRedirected(true)
      // Redirect naar landingpage met auth_required parameter
      router.replace('/?auth_required=true&redirect=' + encodeURIComponent(pathname))
    }
  }, [isLoaded, isSignedIn, isPublicRoute, pathname, router, hasRedirected])

  // Reset redirect flag als gebruiker is ingelogd
  useEffect(() => {
    if (isSignedIn && user) {
      setHasRedirected(false)
    }
  }, [isSignedIn, user])

  // Als nog aan het laden, toon loading state (maar alleen kort)
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Laden...</div>
      </div>
    )
  }

  // Als ingelogd, toon altijd content (ook tijdens check)
  if (isSignedIn) {
    return <>{children}</>
  }

  // Als niet ingelogd en niet op public route, verberg content (redirect wordt afgehandeld door useEffect)
  if (!isPublicRoute) {
    return null
  }

  // Toon content als op public route
  return <>{children}</>
}

