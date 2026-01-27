"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import { AuthDialog } from "./auth-dialog"
import React from "react"

// Controleer of Clerk beschikbaar is
function isClerkAvailable(): boolean {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  return !!publishableKey &&
         publishableKey !== 'pk_test_...' &&
         !publishableKey.includes('placeholder') &&
         !publishableKey.includes('dummy') &&
         publishableKey !== 'pk_test_dummy_key_for_development'
}

// Interne component die useUser gebruikt
function AuthModalHandlerContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { isLoaded, isSignedIn } = useUser()
  const [showModal, setShowModal] = useState(false)
  const [redirectPath, setRedirectPath] = useState<string | null>(null)

  useEffect(() => {
    // Als gebruiker is ingelogd en er is een redirect parameter, redirect direct
    if (isLoaded && isSignedIn && searchParams.get('redirect')) {
      const redirect = searchParams.get('redirect')
      if (redirect) {
        console.log('[AuthModalHandler] ✅ User is signed in, redirecting to:', redirect)
        // Verwijder query parameters en redirect
        router.replace(redirect)
        router.refresh()
        return
      }
    }
    
    // Alleen modal tonen als gebruiker NIET is ingelogd
    if (isLoaded && !isSignedIn && searchParams.get('auth_required') === 'true') {
      console.log('[AuthModalHandler] ❌ User not signed in, opening auth modal')
      // Sla redirect path op voordat we het verwijderen
      const redirect = searchParams.get('redirect')
      if (redirect) {
        setRedirectPath(redirect)
      }
      
      setShowModal(true)
      // Verwijder query parameters uit URL zonder reload
      const url = new URL(window.location.href)
      url.searchParams.delete('auth_required')
      url.searchParams.delete('redirect')
      router.replace(url.pathname + url.search, { scroll: false })
    } else if (isLoaded && isSignedIn && searchParams.get('auth_required') === 'true') {
      // Als gebruiker is ingelogd maar er staat nog auth_required in URL, verwijder het
      console.log('[AuthModalHandler] ✅ User is signed in but auth_required in URL, cleaning up')
      const url = new URL(window.location.href)
      url.searchParams.delete('auth_required')
      url.searchParams.delete('redirect')
      router.replace(url.pathname + url.search, { scroll: false })
    }
  }, [isLoaded, isSignedIn, searchParams, router])

  const handleSuccess = () => {
    setShowModal(false)
    // Wacht even zodat Clerk de authenticatie status kan updaten
    setTimeout(() => {
      // Gebruik opgeslagen redirect path of fallback naar dashboard
      const path = redirectPath || searchParams.get('redirect') || '/dashboard'
      router.push(path)
      router.refresh() // Refresh om ervoor te zorgen dat de pagina correct laadt
    }, 500)
  }

  const handleModalClose = (open: boolean) => {
    setShowModal(open)
    if (!open) {
      // Verwijder query parameters wanneer modal wordt gesloten
      const url = new URL(window.location.href)
      url.searchParams.delete('auth_required')
      url.searchParams.delete('redirect')
      router.replace(url.pathname + url.search, { scroll: false })
    }
  }

  if (!showModal) return null

  return (
    <AuthDialog 
      open={showModal} 
      onOpenChange={handleModalClose}
      onSuccess={handleSuccess}
      defaultMode="signin"
    />
  )
}

// Error boundary voor AuthModalHandler
class AuthModalHandlerErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }  static getDerivedStateFromError(error: Error) {
    // Check of het een Clerk error is
    if (error.message?.includes("ClerkProvider") || error.message?.includes("useUser")) {
      return { hasError: true }
    }
    // Re-throw andere errors
    throw error
  }

  componentDidCatch(error: Error) {
    console.warn("[AuthModalHandler] Clerk error caught, skipping auth modal:", error.message)
  }

  render() {
    if (this.state.hasError) {
      // Als er een error is, render niets (geen auth modal nodig)
      return null
    }
    return this.props.children
  }
}

// Hoofdcomponent
export function AuthModalHandler() {
  // Als Clerk niet beschikbaar is, render niets
  if (!isClerkAvailable()) {
    return null
  }

  // Als Clerk beschikbaar is, gebruik de content component met error boundary
  return (
    <AuthModalHandlerErrorBoundary>
      <AuthModalHandlerContent />
    </AuthModalHandlerErrorBoundary>
  )
}