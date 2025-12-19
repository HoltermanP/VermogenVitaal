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
  const { isLoaded, isSignedIn } = useUser()
  const [hasRedirected, setHasRedirected] = useState(false)
  
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname)

  // Als nog aan het laden, toon loading state
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Laden...</div>
      </div>
    )
  }

  // Als niet ingelogd en niet op public route, redirect naar landingpage
  useEffect(() => {
    if (isLoaded && !isSignedIn && !isPublicRoute && !hasRedirected) {
      setHasRedirected(true)
      // Redirect naar landingpage met auth_required parameter
      router.replace('/?auth_required=true&redirect=' + encodeURIComponent(pathname))
    }
  }, [isLoaded, isSignedIn, isPublicRoute, pathname, router, hasRedirected])

  // Als niet ingelogd en niet op public route, verberg content (redirect wordt afgehandeld door useEffect)
  if (!isSignedIn && !isPublicRoute) {
    return null
  }

  // Reset redirect flag als gebruiker is ingelogd
  useEffect(() => {
    if (isSignedIn) {
      setHasRedirected(false)
    }
  }, [isSignedIn])

  // Toon content als ingelogd of op public route
  return <>{children}</>
}

