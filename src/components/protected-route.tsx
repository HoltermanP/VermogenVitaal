"use client"

import { useUser } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import { AuthDialog } from "./auth-dialog"

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { isLoaded, isSignedIn } = useUser()
  const [showAuthModal, setShowAuthModal] = useState(false)

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      setShowAuthModal(true)
    }
  }, [isLoaded, isSignedIn])

  if (!isLoaded) {
    return fallback || <div>Laden...</div>
  }

  if (!isSignedIn) {
    return (
      <>
        {fallback || <div>Je moet ingelogd zijn om deze pagina te bekijken.</div>}
        <AuthDialog open={showAuthModal} onOpenChange={setShowAuthModal} defaultMode="signin" />
      </>
    )
  }

  return <>{children}</>
}









