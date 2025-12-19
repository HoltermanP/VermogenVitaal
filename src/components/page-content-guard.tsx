"use client"

import { usePathname } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { ReactNode } from "react"

// Routes die publiek toegankelijk zijn zonder account
const PUBLIC_ROUTES = ['/', '/pricing', '/auth/signin', '/auth/signup']

interface PageContentGuardProps {
  children: ReactNode
}

export function PageContentGuard({ children }: PageContentGuardProps) {
  const pathname = usePathname()
  const { isLoaded, isSignedIn } = useUser()
  
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname)

  // Als nog aan het laden, toon niets
  if (!isLoaded) {
    return null
  }

  // Als niet ingelogd en niet op public route, verberg content
  if (!isSignedIn && !isPublicRoute) {
    return null
  }

  // Toon content als ingelogd of op public route
  return <>{children}</>
}

