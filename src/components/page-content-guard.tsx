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
  const [isChecking, setIsChecking] = useState(true)
  
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname)

  // Wacht even na mount om Clerk de tijd te geven om authenticatie status te updaten
  useEffect(() => {
    if (isLoaded) {
      // Korte delay om Clerk de tijd te geven om authenticatie status te updaten
      const timer = setTimeout(() => {
        setIsChecking(false)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isLoaded])

  // Als nog aan het laden of checken, toon loading state
  if (!isLoaded || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Laden...</div>
      </div>
    )
  }

  // Als niet ingelogd en niet op public route, redirect naar landingpage
  useEffect(() => {
    if (isLoaded && !isChecking && !isSignedIn && !isPublicRoute && !hasRedirected) {
      setHasRedirected(true)
      // Redirect naar landingpage met auth_required parameter
      router.replace('/?auth_required=true&redirect=' + encodeURIComponent(pathname))
    }
  }, [isLoaded, isChecking, isSignedIn, isPublicRoute, pathname, router, hasRedirected])

  // Als niet ingelogd en niet op public route, verberg content (redirect wordt afgehandeld door useEffect)
  if (!isSignedIn && !isPublicRoute) {
    return null
  }

  // Reset redirect flag als gebruiker is ingelogd
  useEffect(() => {
    if (isSignedIn && user) {
      setHasRedirected(false)
    }
  }, [isSignedIn, user])

  // Toon content als ingelogd of op public route
  return <>{children}</>
}

